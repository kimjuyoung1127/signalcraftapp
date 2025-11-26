import shutil
import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from app.features.audio_analysis.models import AudioFile, AIAnalysisResult

UPLOAD_DIR = "uploads"

# 업로드 디렉토리 확인 및 생성
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

def save_audio_file(db: Session, file: UploadFile, user_id: int) -> AudioFile:
    file_ext = Path(file.filename).suffix
    # 파일명 중복 방지 및 보안을 위해 UUID 사용
    safe_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {e}")

    # 파일 크기 확인
    try:
        file_size = os.path.getsize(file_path)
    except OSError:
        file_size = 0

    audio_file = AudioFile(
        user_id=user_id,
        file_path=file_path,
        file_name=file.filename,
        file_size=file_size,
        duration_seconds=0 
    )
    
    db.add(audio_file)
    db.commit()
    db.refresh(audio_file)
    return audio_file

def create_analysis_result(db: Session, user_id: int, audio_file_id: uuid.UUID) -> AIAnalysisResult:
    new_id = uuid.uuid4()
    
    analysis_result = AIAnalysisResult(
        id=new_id,
        task_id=str(new_id), 
        user_id=user_id,
        audio_file_id=audio_file_id,
        status="PENDING"
    )
    db.add(analysis_result)
    db.commit()
    db.refresh(analysis_result)
    return analysis_result

def get_analysis_result_by_task_id(db: Session, task_id: str, user_id: int = None) -> AIAnalysisResult:
    query = db.query(AIAnalysisResult).filter(AIAnalysisResult.task_id == task_id)
    
    # user_id가 제공되면 해당 사용자의 결과만 조회 (관리자는 None을 전달하여 제한 없음)
    if user_id is not None:
        query = query.filter(AIAnalysisResult.user_id == user_id)
        
    return query.first()