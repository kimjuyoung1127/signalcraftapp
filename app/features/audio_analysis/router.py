from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession # Session 대신 AsyncSession 임포트
from app.features.audio_analysis.models import AIAnalysisResult, AudioFile
from app.features.audio_analysis.analyzer import analyze_audio_file
from app.models import User # User 모델 필요
from app.features.audio_analysis import service # 새 서비스 모듈 임포트
from app.features.audio_analysis.converter import AudioConverter # [추가] 오디오 변환기 임포트
from app.security import get_current_user # [추가] get_current_user 임포트
from app.database import get_db # [추가] get_db 임포트
from uuid import uuid4
import os
import shutil
from datetime import datetime
from sqlalchemy import select # select 임포트 추가
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# 업로드 폴더 설정 (main.py의 UPLOAD_FOLDER와 동일하게 유지)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@router.post("/upload", summary="모바일 오디오 파일 업로드 및 분석 요청")
async def upload_audio_for_analysis(
    file: UploadFile = File(...),
    device_id: str = Form(...),
    audio_format: str = Form(None), # [추가] 오디오 포맷 정보
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    모바일 앱에서 녹음된 오디오 파일을 업로드하고 AI 분석을 요청합니다.
    - iOS: WAV 무손실 → 바로 분석
    - Android: M4A → WAV 변환 후 분석
    분석은 비동기적으로 Celery 워커에 의해 처리됩니다.
    """
    # 순환 참조 해결을 위해 함수 내부에서 analyze_audio_task 임포트
    from app.worker import analyze_audio_task

    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="Only audio files are allowed")
    
    # 파일 크기 제한 (5MB)
    if file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Audio file too large (max 5MB)")

    # 파일 확장자 및 타입 확인
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    # 지원 포맷 확인
    supported_formats = ['.wav', '.m4a', '.mp4']
    if file_extension not in supported_formats:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported format. Supported: {', '.join(supported_formats)}"
        )

    # 파일 저장
    unique_filename = f"{uuid4()}{file_extension}"
    file_location = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    try:
        # 원본 파일 저장
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"📁 Original file saved: {file_location} ({file.size/1024/1024:.1f}MB)")
        
        # [핵심] 오디오 포맷 통일 (WAV)
        try:
            wav_file_path = AudioConverter.ensure_wav_format(file_location)
            logger.info(f"🎵 WAV conversion completed: {wav_file_path}")
        except Exception as e:
            # 변환 실패 시 원본 삭제 후 에러
            os.unlink(file_location, missing_ok=True)
            logger.error(f"❌ Audio conversion failed: {e}")
            raise HTTPException(status_code=400, detail=f"Audio processing failed: {str(e)}")
        
        # 최종 WAV 파일 정보 조회
        audio_info = AudioConverter.get_audio_info(wav_file_path)
        logger.info(f"📊 Audio info: {audio_info}")
        
        # AudioFile DB 레코드 생성
        audio_file = AudioFile(
            user_id=current_user.id,
            file_path=wav_file_path,
            filename=f"{unique_filename}_converted.wav",
            file_size=int(audio_info.get('size_mb', 0) * 1024 * 1024),
            mime_type='audio/wav',
            device_id=device_id
        )
        db.add(audio_file)
        await db.flush()

        # AIAnalysisResult DB 레코드 생성
        analysis_result = AIAnalysisResult(
            id=str(uuid4()),
            audio_file_id=audio_file.id,
            user_id=current_user.id,
            device_id=device_id,
            status="PENDING",
            created_at=datetime.now()
        )
        db.add(analysis_result)
        await db.commit()
        await db.refresh(analysis_result)

        # Celery 워커에 분석 작업 요청
        try:
            analyze_audio_task.delay(analysis_result.id)
            logger.info(f"🚀 Analysis task queued: {analysis_result.id}")
        except Exception as e:
            logger.error(f"❌ Task submission failed: {e}")
            await db.rollback()
            raise HTTPException(status_code=500, detail="Failed to queue analysis task")

        return {
            "success": True,
            "task_id": analysis_result.id,
            "file_type": "wav",
            "conversion_applied": file_location != wav_file_path
        }

    except Exception as e:
        await db.rollback()
        # 임시 파일 정리
        if os.path.exists(file_location):
            os.unlink(file_location)
        
        logger.error(f"❌ Upload Error: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to upload or schedule analysis: {str(e)}"
        )

@router.get("/result/{task_id}", summary="오디오 분석 결과 조회")
async def get_analysis_result(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db) # Session 대신 AsyncSession 사용
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

@router.get("/report/{device_id}", summary="데모용 또는 실제 상세 분석 리포트 조회")
async def get_detailed_analysis_report(
    device_id: str,
    current_user: User = Depends(get_current_user), # [임시 비활성화 해제] 테스트 완료
    db: AsyncSession = Depends(get_db) # Session 대신 AsyncSession 사용
):
    """
    데모용 시나리오 데이터 또는 DB에 저장된 실제 분석 결과를 기반으로
    상세 분석 리포트 데이터를 반환합니다.
    """
    report_data = await service.get_analysis_report(db, device_id)
    
    if not report_data:
        raise HTTPException(status_code=404, detail="Analysis report not found for this device")
        
    return {
        "success": True,
        "data_package": report_data
    }