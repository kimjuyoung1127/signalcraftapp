# app/models.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)  # 필수
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)  # [중요] 컬럼명 수정됨
    full_name = Column(String(100), nullable=True)
    role = Column(String(20), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    subscription_tier = Column(String(20), default="free")
    subscription_expires_at = Column(DateTime(timezone=True), nullable=True)

    # 관계 설정 1: 내가 소유한 매장 (Direct Ownership)
    owned_stores = relationship("Store", back_populates="owner")

    # 관계 설정 2: 접근 권한이 있는 매장 (Access Rights)
    store_access = relationship("UserStoreAccess", back_populates="user")


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))  # 소유자 연결

    owner = relationship("User", back_populates="owned_stores")
    access_logs = relationship("UserStoreAccess", back_populates="store")
    devices = relationship("Device", back_populates="store")


class UserStoreAccess(Base):
    __tablename__ = "user_store_access"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    store_id = Column(Integer, ForeignKey("stores.id"))

    user = relationship("User", back_populates="store_access")
    store = relationship("Store", back_populates="access_logs")


class Device(Base):
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    location = Column(String, nullable=True)
    status = Column(String, default="normal")  # normal, warning, danger
    store_id = Column(Integer, ForeignKey("stores.id"))
    last_reading_at = Column(DateTime(timezone=True), nullable=True)
    
    # [NEW] Phase K: 장비별 캘리브레이션 데이터 (평균 RMS, 표준편차 등)
    # [UPDATE] Phase Q: 동적 Rule 설정 및 임계치 정보도 이 JSON 컬럼에 저장
    calibration_data = Column(JSON, nullable=True)

    store = relationship("Store", back_populates="devices")