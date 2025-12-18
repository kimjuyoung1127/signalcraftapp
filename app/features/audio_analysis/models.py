from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, func
from sqlalchemy.orm import relationship
from app.database import Base

class AudioFile(Base):
    __tablename__ = "audio_files"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    file_path = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    device_id = Column(String, nullable=True) # Mobile app sends this

    # 관계 설정
    user = relationship("app.models.User", backref="audio_files")
    analysis_results = relationship("AIAnalysisResult", back_populates="audio_file")


class AIAnalysisResult(Base):
    __tablename__ = "ai_analysis_results"

    id = Column(String, primary_key=True, index=True) # UUID 사용
    audio_file_id = Column(Integer, ForeignKey("audio_files.id"))
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String(20), default="PENDING") # PENDING, PROCESSING, COMPLETED, FAILED
    result_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    device_id = Column(String, nullable=True) # For direct lookup/filtering

    # 관계 설정
    audio_file = relationship("AudioFile", back_populates="analysis_results")
    user = relationship("app.models.User", backref="analysis_results")

    # [NEW] Active Learning Feedback Loop 관련 컬럼
    feedback_status = Column(String(50), nullable=True) # TRUE_POSITIVE, FALSE_POSITIVE, IGNORE
    feedback_comment = Column(String, nullable=True)
    reviewed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    is_retraining_candidate = Column(Boolean, default=False)