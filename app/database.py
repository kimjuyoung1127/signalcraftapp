# app/database.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 데이터베이스 URL 가져오기 (환경변수에서)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://dev_user:qwas1127@host.docker.internal:5433/signalcraft_dev")

# SQLAlchemy 비동기 엔진 생성
engine = create_async_engine(DATABASE_URL)

# 비동기 세션 로컬 클래스 생성
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# 베이스 클래스
Base = declarative_base()

async def get_db():
    """비동기 데이터베이스 세션을 생성하고 종료하는 함수"""
    async with AsyncSessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()