# app/worker.py
import os
from celery import Celery

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
    broker_connection_retry_on_startup=True,  # <--- 이 줄을 추가하세요!
)

@celery_app.task
def test_task(word: str):
    return f"Celery received: {word}"