# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.worker import test_task
from app.security import get_password_hash
from sqlalchemy import select, text, inspect # Added select and inspect
from app import models # Added models import for seed data
from app.database import engine, Base, AsyncSessionLocal # Added Base for create_all

# --- Router Imports ---
from app.routers import auth, devices # Import auth and devices routers
from app.features.audio_analysis.router import router as audio_analysis_router # Import audio_analysis_router
from app.api.v1.endpoints import calibration # Import new calibration router
# ----------------------

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
app.include_router(audio_analysis_router, prefix="/api/mobile", tags=["Mobile Analysis"])

# [NEW] V1 API 라우터 등록
app.include_router(calibration.router, prefix="/api/v1", tags=["Calibration"])

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

# 애플리케이션 시작 시 데이터베이스 테이블 생성 및 스키마 검증
@app.on_event("startup")
async def startup_event():
    # from app.database import engine, Base, AsyncSessionLocal # Already imported above

    # 1. 모든 테이블 생성 (location 컬럼 포함)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all) # 모든 테이블 생성 (location 포함)
    
    # --- Data Seeding (초기 데이터 주입) ---
    async with AsyncSessionLocal() as db:
        print("🚀 [Startup] Checking seed data...")
        
        # 1. Ensure Default User exists (ID 1 or email)
        # Try to find the user from the logs
        result = await db.execute(select(models.User).filter(models.User.email == "gmdqn2tp@gmail.com"))
        user = result.scalars().first()
        
        if not user:
            # Fallback: check ID 1
            result = await db.execute(select(models.User).filter(models.User.id == 1))
            user = result.scalars().first()
            
        if not user:
            print("🚀 [Startup] Creating default user...")
            # Define a default plain-text password for development convenience
            default_password = "1"
            hashed_default_password = get_password_hash(default_password) # Hash the password

            user = models.User(
                email="gmdqn2tp@gmail.com",
                username="김주영",
                full_name="김주영",
                password_hash=hashed_default_password, # Use the actual hashed password
                role="admin" # Changed to admin for easy management
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            
        # 2. Ensure Default Store exists
        result = await db.execute(select(models.Store).filter(models.Store.owner_id == user.id))
        store = result.scalars().first()
        
        if not store:
            print("🚀 [Startup] Creating default store...")
            store = models.Store(
                name="SignalCraft Demo Site",
                owner_id=user.id
            )
            db.add(store)
            await db.commit()
            await db.refresh(store)
            
        # 3. Seed/Update Devices
        device_configs = []
        
        for config in device_configs:
            result = await db.execute(select(models.Device).filter(models.Device.device_id == config["device_id"]))
            device = result.scalars().first()
            
            if not device:
                print(f"🚀 [Startup] Creating device {config['device_id']}...")
                device = models.Device(
                    device_id=config["device_id"],
                    name=config["name"],
                    model=config["model"],
                    status=config["status"],
                    location=config["location"], # Added location here
                    store_id=store.id
                )
                db.add(device)
            elif device.store_id is None:
                print(f"🚀 [Startup] Updating store for device {config['device_id']}...")
                device.store_id = store.id
                db.add(device)
                
        await db.commit()
        print("✅ [Startup] Seeding check complete.")