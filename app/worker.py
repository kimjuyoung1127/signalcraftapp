# app/worker.py
import os
import time
import random
from celery import Celery
from sqlalchemy.orm import Session
from app.database import SessionLocal
import app.models # 추가: User 모델 등 기본 모델 로드 (ForeignKey 해결용)
from app.features.audio_analysis.models import AIAnalysisResult

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

@celery_app.task
def test_task(word: str):
    return f"Celery received: {word}"

@celery_app.task
def analyze_audio_task(analysis_result_id: str):
    db: Session = SessionLocal()
    try:
        # 1. 분석 작업 조회
        analysis_result = db.query(AIAnalysisResult).filter(AIAnalysisResult.id == analysis_result_id).first()
        if not analysis_result:
            print(f"Analysis Result ID {analysis_result_id} not found.")
            return "Not Found"

        # 2. 상태 업데이트: PROCESSING
        analysis_result.status = "PROCESSING"
        db.commit()
        
        print(f"Starting analysis for {analysis_result_id}...")

        # 3. 가짜 분석 로직 (5초 소요)
        time.sleep(5)
        
        # 4. 랜덤 결과 생성
        is_risk = random.random() > 0.7 # 30% 확률로 위험
        label = "NORMAL"
        if is_risk:
            label = "CRITICAL" if random.random() > 0.5 else "WARNING"
            
        score = 0.85 if is_risk else 0.12
        summary = "비정상적인 진동 패턴이 감지되었습니다. 점검이 필요합니다." if is_risk else "장비가 정상 작동 중입니다."
        
        result_data = {
            "label": label,
            "score": score,
            "summary": summary,
            "details": {
                "noise_level": random.randint(60, 100),
                "vibration": round(random.uniform(0, 5), 2),
                "frequency": random.randint(50, 1000)
            }
        }

        # 5. 상태 업데이트: COMPLETED
        analysis_result.status = "COMPLETED"
        analysis_result.result_data = result_data
        db.commit()
        
        print(f"Analysis completed for {analysis_result_id}: {label}")
        return f"Analysis Completed: {label}"

    except Exception as e:
        print(f"Analysis failed: {e}")
        # DB 세션이 유효하다면 상태를 FAILED로 업데이트
        try:
            if 'analysis_result' in locals() and analysis_result:
                analysis_result.status = "FAILED"
                db.commit()
        except:
            pass
        return f"Failed: {e}"
    finally:
        db.close()