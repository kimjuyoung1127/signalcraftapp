from pydantic import BaseModel, Field
from typing import Optional
import datetime
import uuid

# 요청/응답 공통 데이터 구조
class AnalysisResultDetail(BaseModel):
    noise_level: Optional[float] = Field(None, description="소음 레벨 (dB)")
    vibration: Optional[float] = Field(None, description="진동 강도")
    frequency: Optional[float] = Field(None, description="주요 주파수 (Hz)")

class AnalysisResult(BaseModel):
    label: str = Field(..., description="분석 결과 라벨 (NORMAL, WARNING, CRITICAL)")
    score: float = Field(..., description="분석 점수 (0.0 ~ 1.0)")
    summary: str = Field(..., description="분석 요약")
    details: Optional[AnalysisResultDetail] = Field(None, description="분석 상세 데이터")

class AnalysisTaskResponse(BaseModel):
    task_id: str = Field(..., description="분석 작업 ID")
    status: str = Field(..., description="분석 작업 상태 (PENDING, PROCESSING, COMPLETED, FAILED)")
    result: Optional[AnalysisResult] = Field(None, description="최종 분석 결과 데이터")
    created_at: datetime.datetime = Field(..., description="작업 생성 시간")
    updated_at: Optional[datetime.datetime] = Field(None, description="작업 마지막 업데이트 시간")

    class Config:
        from_attributes = True # Pydantic v2
