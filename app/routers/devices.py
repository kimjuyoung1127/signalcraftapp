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

    # 실제 DB에서 모든 장비 조회

    result = await db.execute(select(models.Device))

    devices = result.scalars().all()

    

    return devices
