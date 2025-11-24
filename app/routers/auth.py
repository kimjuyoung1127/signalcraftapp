# app/routers/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from app import models, schemas, security
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# --- 회원가입 (테스트 데이터 생성용) ---
@router.post("/signup", response_model=schemas.UserMe)
async def signup(user: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    # bcrypt는 72바이트 이상의 비밀번호를 허용하지 않음
    if len(user.password.encode('utf-8')) > 72:
        raise HTTPException(
            status_code=400,
            detail="Password must be 72 bytes or less"
        )

    # 이메일 중복 체크
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    existing_user = result.scalar_one_or_none()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Username 중복 체크
    result = await db.execute(select(models.User).filter(models.User.username == user.username))
    existing_username = result.scalar_one_or_none()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    # 비밀번호 해싱 및 저장
    hashed_pw = security.get_password_hash(user.password)

    # [중요] models.User 필드명에 맞춰서 저장
    new_user = models.User(
        email=user.email,
        username=user.username,
        password_hash=hashed_pw,  # 여기가 핵심!
        full_name=user.full_name
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

# --- 로그인 (JWT 발급) ---
@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    # 1. 유저 조회 (이메일로 검색)
    # OAuth2 폼은 필드명이 'username'이지만, 실제 값은 이메일을 넣는 경우가 많음
    result = await db.execute(select(models.User).filter(models.User.email == form_data.username))
    user = result.scalar_one_or_none()

    # 2. 비밀번호 검증 (password_hash 컬럼 사용)
    if not user or not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 잘못되었습니다.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Store ID 결정 로직 (우선순위: 접근권한 > 소유권)
    target_store_id = None

    # (1) UserStoreAccess 테이블 조회 - skip for now due to missing id column in actual DB
    # access_result = await db.execute(select(models.UserStoreAccess)
    #                                 .filter(models.UserStoreAccess.user_id == user.id))
    # access_record = access_result.scalar_one_or_none()

    # if access_record:
    #     target_store_id = access_record.store_id
    # else:
    # (2) 소유한 매장이 있는지 확인
    owned_result = await db.execute(select(models.Store)
                                   .filter(models.Store.owner_id == user.id))
    owned_store = owned_result.scalar_one_or_none()
    if owned_store:
        target_store_id = owned_store.id

    # 4. 토큰 생성
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.email, "store_id": target_store_id},
        expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "store_id": target_store_id
    }

# --- 현재 사용자 확인 ---
async def get_current_user(token: str = Depends(security.oauth2_scheme), db: AsyncSession = Depends(get_db)):
    """JWT 토큰에서 현재 사용자 정보 추출"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token_data = security.verify_token(token)
        if token_data is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    # Use email to fetch user (as stored in JWT token)
    result = await db.execute(select(models.User).filter(models.User.email == token_data.email))
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    return user

# --- 현재 사용자 정보 가져오기 ---
@router.get("/me", response_model=schemas.UserMe)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user