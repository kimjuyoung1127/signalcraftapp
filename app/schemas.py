# app/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# 1. 회원가입 요청 (Username 필수)
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

# 2. 로그인 응답 (토큰 + 접속할 매장 ID)
class Token(BaseModel):
    access_token: str
    token_type: str
    store_id: Optional[int] = None  # 앱이 대시보드를 띄울 때 필요

# 3. 내 정보 조회 응답
class UserMe(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: Optional[str] = None
    subscription_tier: Optional[str] = "free"
    subscription_expires_at: Optional[datetime] = None

    class Config:
        from_attributes = True