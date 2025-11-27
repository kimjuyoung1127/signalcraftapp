from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.security import get_current_user
from app.features.audio_analysis.models import AIAnalysisResult, AudioFile
from app.features.audio_analysis.analyzer import analyze_audio_file
from app.models import User # User 모델 필요
from uuid import uuid4
import os
import shutil
from datetime import datetime
from sqlalchemy import select # select 임포트 추가

router = APIRouter()

# 업로드 폴더 설정 (main.py의 UPLOAD_FOLDER와 동일하게 유지)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload", summary="모바일 오디오 파일 업로드 및 분석 요청")
async def upload_audio_for_analysis(
    file: UploadFile = File(...),
    device_id: str = Form(...), # 프론트엔드에서 device_id를 받음
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    모바일 앱에서 녹음된 오디오 파일을 업로드하고 AI 분석을 요청합니다.
    분석은 비동기적으로 Celery 워커에 의해 처리됩니다.
    """
    # 순환 참조 해결을 위해 함수 내부에서 analyze_audio_task 임포트
    from app.worker import analyze_audio_task

    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="Only audio files are allowed")

    # 파일 저장 경로 설정
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4()}{file_extension}"
    file_location = os.path.join(UPLOAD_FOLDER, unique_filename)

    try:
        # 파일 저장
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # AudioFile DB 레코드 생성
        audio_file = AudioFile(
            user_id=current_user.id,
            file_path=file_location,
            filename=file.filename,
            file_size=file.size,
            mime_type=file.content_type,
            device_id=device_id # device_id 저장
        )
        db.add(audio_file)
        await db.flush() # audio_file.id를 얻기 위해 flush

        # AIAnalysisResult DB 레코드 생성 (초기 상태 PENDING)
        analysis_result = AIAnalysisResult(
            id=str(uuid4()), # 작업 ID로 사용할 UUID
            audio_file_id=audio_file.id,
            user_id=current_user.id,
            device_id=device_id, # device_id 저장
            status="PENDING",
            created_at=datetime.now()
        )
        db.add(analysis_result)
        await db.commit()
        await db.refresh(analysis_result)

        # Celery 워커에 분석 작업 요청
        analyze_audio_task.delay(analysis_result.id)

        return {"success": True, "task_id": analysis_result.id}

    except Exception as e:
        await db.rollback()
        print(f"Upload Error: {e}") # 에러 로그 추가
        raise HTTPException(status_code=500, detail=f"Failed to upload or schedule analysis: {e}")

@router.get("/result/{task_id}", summary="오디오 분석 결과 조회")
async def get_analysis_result(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    특정 작업 ID에 대한 AI 오디오 분석 결과를 조회합니다.
    """
    result = await db.execute(select(AIAnalysisResult).filter(AIAnalysisResult.id == task_id))
    analysis_result = result.scalar_one_or_none()

    if not analysis_result:
        raise HTTPException(status_code=404, detail="Analysis task not found")
    
    # 요청한 유저가 해당 분석 결과에 접근 권한이 있는지 확인
    if analysis_result.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this analysis result")

    return {
        "success": True,
        "task_id": analysis_result.id,
        "status": analysis_result.status,
        "result": analysis_result.result_data,
        "created_at": analysis_result.created_at,
        "completed_at": analysis_result.completed_at
    }