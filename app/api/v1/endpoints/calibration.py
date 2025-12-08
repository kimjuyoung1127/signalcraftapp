import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Dict, Any
from datetime import datetime

from app.database import get_db
from app.models import Device, User
from app.security import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)

# --- Pydantic Models ---
class CalibrationDataPoint(BaseModel):
    rms: float
    # Future extension: frequency_peaks, etc.

class CalibrationRequest(BaseModel):
    samples: List[CalibrationDataPoint]

class CalibrationResponse(BaseModel):
    device_id: str
    status: str
    calibration_data: Dict[str, Any]

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
