# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.worker import test_task
from app.routers import auth, devices
from app.database import engine, Base
from app import models
from app.features.audio_analysis import router as audio_analysis_router
from app.features.audio_analysis import models as audio_models # 추가: Audio analysis 모델 임포트

app = FastAPI()

# CORS 미들웨어 추가 - 모바일 앱에서 API 호출 가능하게
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(auth.router)
app.include_router(devices.router)
# 오디오 분석 라우터 등록 (prefix: /api/mobile)
app.include_router(audio_analysis_router.router, prefix="/api/mobile", tags=["Mobile Analysis"])

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