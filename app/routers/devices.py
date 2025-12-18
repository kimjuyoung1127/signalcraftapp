# app/routers/devices.py
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional # Optional 추가
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct, case, or_

from sqlalchemy.orm import selectinload # For eager loading (optional)
from pydantic import BaseModel, Field # [NEW] BaseModel, Field 임포트

from app import models, schemas
from app.database import get_db
from app.routers.auth import get_current_user
from app.features.audio_analysis.models import AIAnalysisResult # AIAnalysisResult 모델 임포트
from app.models import Device # Device 모델 임포트 (명시적으로)

# [중요] 프론트엔드가 요청하는 주소(/api/mobile/devices)에 맞춤
router = APIRouter(prefix="/api/mobile/devices", tags=["Devices"])

import logging

# Logger 설정
logger = logging.getLogger(__name__)

# --- Pydantic Models for Device Configuration ---
class DeviceConfigUpdate(BaseModel):
    # calibration_data 내부에서 업데이트 가능한 필드들을 정의합니다.
    # 예시: 임계치, 민감도 레벨 등
    threshold_multiplier: Optional[float] = Field(None, description="이상 감지 임계치 배수 (예: 3.0)")
    sensitivity_level: Optional[Literal["HIGH", "MEDIUM", "LOW"]] = Field(None, description="감지 민감도 레벨")
    # 필요한 다른 설정 값들을 여기에 추가할 수 있습니다.

@router.post("/", response_model=schemas.DeviceList)
async def create_device(
    device: schemas.DeviceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Admin Role Check
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can register devices."
        )

    # 2. Check for duplicate device_id
    existing_device = await db.execute(select(Device).filter(Device.device_id == device.device_id))
    if existing_device.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Device ID '{device.device_id}' already exists."
        )

    # 3. Determine Store ID
    target_store_id = device.store_id
    if not target_store_id:
        # Find a store owned by the admin
        store_result = await db.execute(select(models.Store).filter(models.Store.owner_id == current_user.id))
        owned_store = store_result.scalars().first()
        
        if not owned_store:
            # Create a default store if none exists
            new_store = models.Store(name=f"{current_user.username}'s Factory", owner_id=current_user.id)
            db.add(new_store)
            await db.flush() # Get ID
            target_store_id = new_store.id
        else:
            target_store_id = owned_store.id

    # 4. Create Device
    new_device = Device(
        device_id=device.device_id,
        name=device.name,
        model=device.model,
        location=device.location,
        store_id=target_store_id,
        status="NORMAL" # Default status
    )
    
    db.add(new_device)
    await db.commit()
    await db.refresh(new_device)
    
    return new_device

@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT, summary="장비 삭제 (관리자 전용)")
async def delete_device(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Admin Role Check
    if current_user.role != 'admin':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete devices."
        )

    # 2. 장비 존재 여부 확인 (device_id 컬럼으로 조회)
    query = select(Device).filter(Device.device_id == device_id)
    result = await db.execute(query)
    device_to_delete = result.scalar_one_or_none()

    if not device_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Device '{device_id}' not found."
        )

    # 3. 장비 삭제
    await db.delete(device_to_delete)
    await db.commit()
    
    return None # 204 No Content

@router.get("/", response_model=List[schemas.DeviceList])
async def read_devices(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # Step 1: Fetch devices owned by OR accessible to the current user
        query = (
            select(Device)
            .join(models.Store, Device.store_id == models.Store.id)
            .outerjoin(models.UserStoreAccess, models.Store.id == models.UserStoreAccess.store_id)
            .filter(
                or_(
                    models.Store.owner_id == current_user.id,
                    models.UserStoreAccess.user_id == current_user.id
                )
            )
            .distinct()
        )
        result = await db.execute(query)
        devices = result.scalars().all()
        
        if not devices:
            return []

        # Step 2: Extract device_ids
        device_ids = [d.device_id for d in devices]

        # Step 3: Fetch latest completed_at for these devices
        # We want the max(completed_at) for each device_id
        analysis_query = (
            select(
                AIAnalysisResult.device_id,
                func.max(AIAnalysisResult.completed_at).label("latest_completed_at")
            )
            .filter(AIAnalysisResult.device_id.in_(device_ids))
            # .filter(AIAnalysisResult.user_id == current_user.id) # Remove user filter to see all analysis for the device
            .group_by(AIAnalysisResult.device_id)
        )
        
        analysis_result = await db.execute(analysis_query)
        latest_analysis_map = {
            row.device_id: row.latest_completed_at 
            for row in analysis_result.all()
        }

        # Step 4: Map data to devices
        for device in devices:
            if device.device_id in latest_analysis_map:
                device.last_reading_at = latest_analysis_map[device.device_id]
            else:
                pass 
                
        return devices

@router.patch("/{device_id}/config", summary="장비 동적 설정 업데이트 (엔지니어/관리자 전용)")
async def update_device_config(
    device_id: str,
    config_update: DeviceConfigUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    장비의 동적 설정(예: 임계치, 민감도)을 업데이트합니다.
    엔지니어 또는 관리자 역할의 사용자만 접근 가능합니다.
    """
    # 1. 권한 확인 (엔지니어 또는 관리자)
    if current_user.role not in ['admin', 'engineer']:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only engineers or admins can update device configurations."
        )

    # 2. 장비 조회
    stmt = select(Device).filter(Device.device_id == device_id)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()

    if not device:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device '{device_id}' not found.")

    # 3. calibration_data 업데이트
    # 기존 calibration_data가 없으면 빈 dict으로 초기화
    if device.calibration_data is None:
        device.calibration_data = {}
    
    # Pydantic 모델에서 설정된 필드만 업데이트
    update_data = config_update.dict(exclude_unset=True)
    device.calibration_data.update(update_data)
    
    # 변경 사항 저장
    db.add(device) # SQLAlchemy는 JSON 필드 변경을 감지하기 위해 명시적으로 add 필요
    await db.commit()
    await db.refresh(device)

    return {
        "success": True,
        "message": f"Device '{device_id}' configuration updated successfully.",
        "calibration_data": device.calibration_data
    }
    except Exception as e:
        logger.error(f"Error in read_devices: {str(e)}", exc_info=True)
        raise e