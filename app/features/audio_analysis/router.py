from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db_sync
from app.routers.auth import get_current_user
from app.models import User
from app.worker import analyze_audio_task
from app.features.audio_analysis import schemas, service

router = APIRouter()

@router.post("/upload", response_model=schemas.AnalysisTaskResponse)
def upload_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db_sync),
    current_user: User = Depends(get_current_user)
):
    # 1. 오디오 파일 저장 및 DB 기록
    audio_file = service.save_audio_file(db, file, current_user.id)
    
    # 2. 분석 결과 레코드 생성 (Pending)
    analysis_result = service.create_analysis_result(db, current_user.id, audio_file.id)
    
    # 3. Celery Task 호출 (비동기)
    # task_id를 분석 결과 ID와 동일하게 사용함
    analyze_audio_task.delay(str(analysis_result.id))
    
    # 4. 응답 반환
    return schemas.AnalysisTaskResponse(
        task_id=analysis_result.task_id,
        status=analysis_result.status,
        created_at=analysis_result.created_at
    )

@router.get("/result/{task_id}", response_model=schemas.AnalysisTaskResponse)
def get_analysis_result(
    task_id: str,
    db: Session = Depends(get_db_sync),
    current_user: User = Depends(get_current_user)
):
    # 관리자 권한 체크 ('admin' 역할)
    # 관리자는 모든 사용자의 결과를 조회할 수 있어야 함
    is_admin = current_user.role == 'admin'
    
    # 관리자는 전체 조회(None), 일반 유저는 본인 ID로 필터링
    filter_user_id = None if is_admin else current_user.id

    result = service.get_analysis_result_by_task_id(db, task_id, user_id=filter_user_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Pydantic 모델로 변환하여 반환
    # DB의 JSONB 필드(result_data)를 Pydantic의 result 필드에 매핑
    
    response_data = {
        "task_id": result.task_id,
        "status": result.status,
        "created_at": result.created_at,
        "updated_at": result.updated_at,
        "result": None
    }
    
    if result.result_data:
        response_data["result"] = result.result_data
        
    return response_data