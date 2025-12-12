import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.database import get_db
from app.models import Device, User
from app.security import get_current_user
from app.core.model_loader import model_loader # [NEW]

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Pydantic Models ---
class CalibrationDataPoint(BaseModel):
    rms: float

class CalibrationRequest(BaseModel):
    samples: List[CalibrationDataPoint]

class CalibrationResponse(BaseModel):
    device_id: str
    status: str
    calibration_data: Dict[str, Any]

# [NEW] Model Info Pydantic Model for /models endpoint
class ModelInfo(BaseModel):
    id: str
    name: str
    type: str
    description: str
    is_default: bool
    # file, meta_file 등은 내부 정보이므로 제외하거나 필요시 추가

# --- Endpoints ---

@router.post("/devices/{device_id}/calibrate", response_model=CalibrationResponse)
async def calibrate_device(
    device_id: str,
    payload: CalibrationRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Receives a list of sample data (rms, etc.) for a device,
    calculates calibration metrics (mean, std), and updates the DB.
    """
    
    # 1. Fetch Device
    stmt = select(Device).where(Device.device_id == device_id)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()
    
    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"Device not found: {device_id}"
        )

    # 2. Process Data
    if not payload.samples:
        raise HTTPException(status_code=400, detail="No samples provided")
        
    rms_values = [d.rms for d in payload.samples]
    
    import numpy as np
    mean_rms = float(np.mean(rms_values))
    std_rms = float(np.std(rms_values))
    
    # Calibration Data Structure
    calibration_data = {
        "mean_rms": mean_rms,
        "std_rms": std_rms,
        "sample_count": len(rms_values),
        "calibrated_at": datetime.utcnow().isoformat(),
        "version": 1
    }
    
    # 3. Update DB
    device.calibration_data = calibration_data
    # device.status = "calibrated" # Optional: Update status if needed
    
    await db.commit()
    await db.refresh(device)
    
    logger.info(f"Device {device_id} calibrated. Mean RMS: {mean_rms:.4f}, Std RMS: {std_rms:.4f}")

    return {
        "device_id": device.device_id,
        "status": "CALIBRATED",
        "calibration_data": calibration_data
    }

@router.get("/devices/{device_id}/calibration", response_model=CalibrationResponse)
async def get_device_calibration(
    device_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieves the current calibration data for a device.
    """
    stmt = select(Device).where(Device.device_id == device_id)
    result = await db.execute(stmt)
    device = result.scalar_one_or_none()
    
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
        
    if not device.calibration_data:
        return {
            "device_id": device.device_id,
            "status": "NOT_CALIBRATED",
            "calibration_data": {}
        }
        
    return {
        "device_id": device.device_id,
        "status": "CALIBRATED",
        "calibration_data": device.calibration_data
    }

@router.get("/models", response_model=Dict[str, List[ModelInfo]], summary="사용 가능한 AI 모델 목록 조회")
async def get_available_models(
    device_type: Optional[str] = None, # [NEW] device_type 쿼리 파라미터 추가
    current_user: User = Depends(get_current_user) # 인증 필요
):
    """
    Registry에 등록된 사용 가능한 AI 모델들의 목록을 반환합니다.
    device_type 파라미터를 통해 특정 장비 타입에 맞는 모델만 필터링할 수 있습니다.
    """
    models_list = model_loader.get_available_models(device_type=device_type) # 필터링된 모델 목록 가져오기
    
    # ModelInfo Pydantic 모델에 맞춰 데이터 필터링/변환
    response_models = []
    for m in models_list:
        # Pydantic ModelInfo에 name 필드를 추가했으므로, 모델 정보에 name이 없으면 id를 name으로 사용
        model_name = m.get("name") if m.get("name") else m.get("id", "Unknown Model")
        
        try:
            response_models.append(ModelInfo(
                id=m["id"],
                name=model_name,
                type=m["type"],
                description=m.get("description", "No description available."),
                is_default=m.get("is_default", False)
            ))
        except Exception as e:
            logger.error(f"Error converting model registry entry to ModelInfo: {m} - {e}")
            # Pydantic 모델에 맞지 않는 필드는 제외하고 전달
            response_models.append(ModelInfo(
                id=m.get("id", "unknown"),
                name=model_name,
                type=m.get("type", "unknown"),
                description=m.get("description", "No description available."),
                is_default=m.get("is_default", False)
            ))
            
    return {"models": response_models}
