# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 데이터베이스 URL 가져오기 (환경변수에서)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://dev_user:qwas1127@host.docker.internal:5433/signalcraft_dev")

# 동기용 URL (asyncpg -> psycopg2 변환)
if "asyncpg" in DATABASE_URL:
    SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg", "postgresql")
else:
    SYNC_DATABASE_URL = DATABASE_URL

# SQLAlchemy 비동기 엔진 생성
# 주의: Celery Worker는 동기 드라이버(psycopg2)를 사용하는 URL을 받을 수 있음.
# 이 경우 create_async_engine은 에러를 발생시키므로, 조건부로 생성함.
if "asyncpg" in DATABASE_URL:
    engine = create_async_engine(DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
else:
    engine = None
    AsyncSessionLocal = None

# SQLAlchemy 동기 엔진 생성 (항상 생성)
sync_engine = create_engine(SYNC_DATABASE_URL)

# 동기 세션 로컬 클래스 생성
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

# 베이스 클래스
Base = declarative_base()

async def get_db():
    """비동기 데이터베이스 세션을 생성하고 종료하는 함수"""
    if AsyncSessionLocal is None:
        raise RuntimeError("AsyncSessionLocal is not initialized. Check DATABASE_URL.")
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()

def get_db_sync():
    """동기 데이터베이스 세션을 생성하고 종료하는 함수"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()