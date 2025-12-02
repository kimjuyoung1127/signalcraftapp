# app/worker.py
import os
import time
import random
from datetime import datetime, timezone # [수정] timezone 추가
from celery import Celery
from sqlalchemy.orm import Session
from app.database import SessionLocal
import app.models # 추가: User 모델 등 기본 모델 로드 (ForeignKey 해결용)
from app.features.audio_analysis.models import AIAnalysisResult, AudioFile
from app.features.audio_analysis.analyzer import analyze_audio_file, _load_ml_model
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

# Celery worker가 초기화될 때 모델을 미리 로드
@worker_init.connect
def load_ml_models_on_worker_init(**kwargs):
    _load_ml_model() # 워커 시작 시 모델 로드 시도

@celery_app.task
def test_task(word: str):
    return f"Celery received: {word}"

@celery_app.task
def analyze_audio_task(analysis_result_id: str):
    db: Session = SessionLocal()
    audio_file_path = None

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
        
        audio_file_path = audio_file.file_path
        
        # 3. 상태 업데이트: PROCESSING
        analysis_result.status = "PROCESSING"
        db.commit()
        
        print(f"Starting real analysis for task {analysis_result_id}, file: {audio_file_path}...")

        # 4. 실제 분석 수행 (Librosa)
        # Docker 환경에서 경로는 상대경로 'uploads/...' 혹은 절대경로일 수 있음.
        # analyzer.py에서 예외 처리됨.
        if not os.path.exists(audio_file_path):
             # 혹시 경로가 절대경로가 아니라면 /app/을 붙여서 시도해볼 수도 있음 (생략)
             raise FileNotFoundError(f"File not found on disk: {audio_file_path}")

        result_data = analyze_audio_file(audio_file_path)
        
        # 5. 상태 업데이트: COMPLETED
        analysis_result.status = "COMPLETED"
        analysis_result.completed_at = datetime.now(timezone.utc) # [수정] UTC 시간 사용
        analysis_result.result_data = result_data
        db.commit()
        
        label = result_data.get("label", "UNKNOWN")
        # print(f"Analysis completed for {analysis_result_id}: {label}")
        
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
        # 분석이 성공하든 실패하든, 임시 업로드된 파일은 삭제하여 스토리지 절약
        if audio_file_path and os.path.exists(audio_file_path):
            try:
                os.remove(audio_file_path)
                print(f"Deleted temporary file: {audio_file_path}")
            except Exception as cleanup_error:
                print(f"Failed to delete file {audio_file_path}: {cleanup_error}")
        
        db.close()