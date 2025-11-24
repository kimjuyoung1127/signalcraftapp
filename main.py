# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.worker import test_task  # worker.py에 있는 함수 가져오기
from app.routers import auth, devices  # 인증 및 장비 라우터 추가
from app.database import engine, Base
from app import models  # 모델 임포트

app = FastAPI()

# CORS 미들웨어 추가 - 모바일 앱에서 API 호출 가능하게
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 실제 운영 시에는 특정 도명만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(devices.router)

@app.get("/")
def read_root():
    return {"message": "SignalCraft API is running!"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/test-celery")
def trigger_task():
    # 1. Celery에게 비동기 작업 요청 (.delay 사용)
    task = test_task.delay("SignalCraft AI Analysis Start!")

    # 2. 사용자는 기다리지 않고 바로 응답을 받음 (Task ID 반환)
    return {
        "message": "작업이 백그라운드 큐에 등록되었습니다.",
        "task_id": task.id
    }

# 애플리케이션 시작 시 데이터베이스 테이블 생성
@app.on_event("startup")
async def startup_event():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)