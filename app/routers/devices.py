# app/routers/devices.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app import models, schemas
from app.database import get_db
from app.routers.auth import get_current_user  # import from auth router

# [중요] 프론트엔드가 요청하는 주소(/api/mobile/devices)에 맞춤
router = APIRouter(prefix="/api/mobile/devices", tags=["Devices"])

@router.get("/", response_model=List[schemas.DeviceList])
async def read_devices(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # --- 1. 목업 데이터 (데모용 고정 데이터 3개) ---
    mock_devices = [
        schemas.DeviceList(
            id=9901,  # DB ID와 겹치지 않게 큰 숫자로 설정
            device_id="MOCK-001",
            name="JBF-2000 압축기 (Demo)",
            model="JBF-Series X",
            status="normal",
            store_id=0  # 가상의 스토어
        ),
        schemas.DeviceList(
            id=9902,
            device_id="MOCK-002",
            name="Main Pump A (Demo)",
            model="Super-Pump v2",
            status="warning",
            store_id=0
        ),
        schemas.DeviceList(
            id=9903,
            device_id="MOCK-003",
            name="Sub Generator (Demo)",
            model="Elec-Gen 500",
            status="danger",
            store_id=0
        )
    ]

    # --- 2. 데이터베이스 연동 시뮬레이션 (DB에서 가져온 데이터 1개) ---
    # 실제 DB 통신 없이 마치 DB에서 가져온 것처럼 보이는 데이터
    simulated_db_device = [
        schemas.DeviceList(
            id=1001,  # 실제 DB에서 온 것처럼 보이도록 일반적인 ID 사용
            device_id="DB-001",
            name="압축기 A-1 (DB)",
            model="SC-900X",
            status="normal",
            store_id=current_user.id  # 현재 로그인한 사용자의 스토어 ID 사용
        )
    ]

    # --- 3. 리스트 합치기 (Mock 3개 + DB 시뮬레이션 1개) ---
    return mock_devices + simulated_db_device