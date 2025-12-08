# app/worker.py
import os
import time
import random
import tempfile # [추가] 임시 파일용
import asyncio # [추가] 비동기 실행용
from pathlib import Path # [추가] Path 객체용
from datetime import datetime, timezone # [수정] timezone 추가
from celery import Celery
from sqlalchemy.orm import Session
from app.database import SessionLocal
import app.models # 추가: User 모델 등 기본 모델 로드 (ForeignKey 해결용)
from app.models import Device # [추가] Device 모델 임포트
from app.features.audio_analysis.models import AIAnalysisResult, AudioFile
# from app.features.audio_analysis.analyzer import analyze_audio_file, _load_ml_model # Removed
from app.features.audio_analysis.pipeline_executor import PipelineExecutor # [추가] PipelineExecutor
from app.storage import S3Storage # [추가] Cloudflare R2 스토리지
from celery.signals import worker_init

# 환경 변수 가져오기
BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://redis:6379/0")
BACKEND_URL = os.getenv("CELERY_RESULT_BACKEND", "redis://redis:6379/0")

# Celery 앱 설정
celery_app = Celery(
    "signalcraft_worker",
    broker=BROKER_URL,
    backend=BACKEND_URL
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Seoul",
    enable_utc=True,
    broker_connection_retry_on_startup=True,
)

# Global PipelineExecutor instance
pipeline_executor = None

# Celery worker가 초기화될 때 파이프라인 초기화
@worker_init.connect
def initialize_pipeline(**kwargs):
    global pipeline_executor
    pipeline_executor = PipelineExecutor()
    print("PipelineExecutor initialized on worker startup.")

@celery_app.task
def test_task(word: str):
    return f"Celery received: {word}"

@celery_app.task
def analyze_audio_task(analysis_result_id: str, model_preference: str = "level1"): # [수정] model_preference 인자 추가
    db: Session = SessionLocal()
    local_audio_path = None
    
    # Ensure pipeline executor is initialized
    global pipeline_executor
    if pipeline_executor is None:
        pipeline_executor = PipelineExecutor()
    
    try:
        # 1. 분석 작업 조회
        analysis_result = db.query(AIAnalysisResult).filter(AIAnalysisResult.id == analysis_result_id).first()
        if not analysis_result:
            print(f"Analysis Result ID {analysis_result_id} not found.")
            return "Not Found"

        # 2. 오디오 파일 정보 조회
        audio_file = db.query(AudioFile).filter(AudioFile.id == analysis_result.audio_file_id).first()
        if not audio_file:
             print(f"Audio File for Result ID {analysis_result_id} not found.")
             analysis_result.status = "FAILED"
             analysis_result.result_data = {"error": "Audio file record not found"}
             db.commit()
             return "Audio File Not Found"
        
        # 파일 경로 확인 (R2 키인지 로컬 경로인지)
        r2_object_key = audio_file.file_path
        
        # 3. 상태 업데이트: PROCESSING
        analysis_result.status = "PROCESSING"
        db.commit()
        
        print(f"Preparing analysis for task {analysis_result_id}, source: {r2_object_key}...")

        # R2에서 다운로드 준비
        s3_storage = S3Storage()
        
        # 임시 파일 생성 (확장자는 원본 유지)
        file_ext = os.path.splitext(r2_object_key)[1] if os.path.splitext(r2_object_key)[1] else ".wav"
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=file_ext)
        local_audio_path = temp_file.name
        temp_file.close() # 윈도우 호환성을 위해 닫음

        # 다운로드 시도
        if s3_storage.download_file(r2_object_key, local_audio_path):
            print(f"✅ Downloaded from R2: {r2_object_key} -> {local_audio_path}")
        elif os.path.exists(r2_object_key):
            # 혹시 로컬 경로로 남아있는 경우 (마이그레이션 과도기)
            print(f"⚠️ R2 download failed, but found local file: {r2_object_key}")
            import shutil
            shutil.copy(r2_object_key, local_audio_path)
        else:
             raise FileNotFoundError(f"File not found in R2 or disk: {r2_object_key}")

        # [NEW] Fetch Device Calibration Data
        device = db.query(Device).filter(Device.device_id == analysis_result.device_id).first()
        calibration_data = device.calibration_data if device else None
        
        if calibration_data:
            print(f"Applying calibration data for device {analysis_result.device_id}: {calibration_data}")

        # 4. 실제 분석 수행 (Using PipelineExecutor)
        # model_preference는 함수 인자로 받은 값을 사용
        result_data = asyncio.run(pipeline_executor.analyze_audio_file(
            Path(local_audio_path), 
            model_preference=model_preference, # [수정] 인자로 받은 model_preference 전달
            calibration_data=calibration_data
        ))
        
        # 5. 상태 업데이트: COMPLETED
        analysis_result.status = "COMPLETED"
        analysis_result.completed_at = datetime.now(timezone.utc) # [수정] UTC 시간 사용
        analysis_result.result_data = result_data
        db.commit()
        
        label = result_data.get("label", "UNKNOWN")
        return f"Analysis Completed: {label}"

    except Exception as e:
        print(f"Analysis failed: {e}")
        # DB 세션이 유효하다면 상태를 FAILED로 업데이트
        try:
            if 'analysis_result' in locals() and analysis_result:
                analysis_result.status = "FAILED"
                analysis_result.result_data = {"error": str(e)}
                db.commit()
        except:
            pass
        return f"Failed: {e}"
    finally:
        # 6. 파일 청소 (Cleanup)
        if local_audio_path and os.path.exists(local_audio_path):
            try:
                os.remove(local_audio_path)
                print(f"Deleted temporary file: {local_audio_path}")
            except Exception as cleanup_error:
                print(f"Failed to delete file {local_audio_path}: {cleanup_error}")
        
        db.close()