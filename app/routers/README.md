# API 라우터 (routers)

이 디렉토리는 SignalCraft 백엔드의 API 라우터들을 포함합니다. FastAPI 기반의 RESTful API 엔드포인트들을 모듈별로 구성하며, 인증, 데이터 조회, 파일 처리 등의 서버 측 로직을 제공합니다.

## 📁 라우터 구조

```
app/routers/
├── mobile.py             # 모바일 앱 전용 API 라우터
└── [향후 확장 예정 라우터들]
```

## 🎯 라우터 시스템 개요

### API 아키텍처
- **의존성 주입**: FastAPI 의존성 주입 시스템 활용
- **인증 미들웨어**: JWT 기반 인증 자동 처리
- **비동기 처리**: 비동기 데이터베이스 작업 지원
- **자동 문서화**: OpenAPI/Swagger 자동 생성

### 라우터 등록 시스템
```python
# main.py에서 라우터 등록
from app.routers import mobile

app.include_router(
    mobile.router,
    prefix="/api/mobile",
    tags=["mobile"],
    dependencies=[Depends(get_current_user)]
)
```

## 📋 핵심 라우터: mobile.py

### 주요 기능
- **오디오 파일 업로드**: 모바일에서 전송된 오디오 분석 요청 처리
- **분석 결과 조회**: Celery 비동기 작업 결과 폴링
- **장비 데이터 반환**: 모바일 대시보드용 경량 데이터 제공
- **상세 리포트 생성**: Palantir 스타일 통합 분석 보고서

### 엔드포인트 구조
```python
@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    device_id: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    오디오 파일 업로드 및 비동기 분석 요청
    - Multipart/form-data 처리
    - Celery 태스크 생성 및 Task ID 반환
    - 파일 자동 삭제 처리
    """
    pass

@router.get("/result/{task_id}")
async def get_analysis_result(
    task_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    비동기 분석 결과 조회
    - Task 상태 폴링 지원
    - PENDING/COMPLETED 상태 반환
    - 완료 시 분석 결과 데이터 포함
    """
    pass

@router.get("/report/{device_id}")
async def get_detailed_report(
    device_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    장비별 상세 분석 리포트
    - 하이브리드 데이터 시스템 (Mock + 실제 DB)
    - Palantir 스타일 통합 데이터 반환
    - XAI 및 Actionable Intelligence 포함
    """
    pass
```

## 🔐 인증 및 보안

### JWT 기반 인증
```python
# 보안 의존성
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    현재 사용자 조회
    - 토큰 검증 및 만료 확인
    - 데이터베이스 사용자 정보 조회
    - 인증 실패 시 예외 처리
    """
    return security.get_current_user(token, db)

# 라우터에 인증 적용
@router.post("/upload")
async def upload_audio(
    current_user: User = Depends(get_current_user)
):
    # 인증된 사용자만 접근 가능
    pass
```

### 보안 기능
- **토큰 자동 검증**: API 호출 시 JWT 토큰 자동 처리
- **권한 확인**: 사용자 역할 기반 접근 제어
- **입력 검증**: Pydantic 스키마 기반 데이터 유효성 검사
- **SQL 인jection 방지**: SQLAlchemy ORM 사용

## 📱 모바일 전용 설계

### 경량 데이터 설계
- **필수 필드만**: 모바 화면 표시에 필요한 데이터만 반환
- **지연 로딩**: 상세 데이터는 별도 API 호출 지원
- **오프라인 고려**: 인터넷 끊김 상태 대비 데이터 구조

### 성능 최적화
```python
# 데이터베이스 쿼리 최적화
devices = await db.execute(
    select(Device)
    .where(Device.user_id == current_user.id)
    .options(selectinload(Device.recent_status))
    .limit(50)
)
```

### 캐싱 전략
- **메모리 캐싱**: 자주 조회되는 데이터 캐싱
- **ETag 지원**: HTTP 캐싱 헤더 활용
- **조건부 요청**: 마지막 수정 시간 기반 요청

## 🧠 분석 기능 연동

### Celery 비동기 처리
```python
# Celery 태스크 생성
task = analyze_audio_file.delay(
    file_path=tmp_file.name,
    device_id=device_id,
    user_id=current_user.id
)

# 결과 모델 생성
analysis_result = AIAnalysisResult(
    id=task.id,
    audio_file_id=audio_file.id,
    user_id=current_user.id,
    device_id=device_id,
    status='PENDING'
)

await db.add(analysis_result)
await db.commit()
```

### 실시간 폴링 지원
```python
# 작업 상태 폴링
task_status = celery_app.AsyncResult(task_id)

if task_status.ready():
    result_data = task_status.get()
    return {"status": "COMPLETED", "data": result_data}
else:
    return {"status": "PENDING"}
```

## 🔄 데이터 파이프라인

### 오디오 처리 흐름
1. **파일 업로드**: 모바일에서 오디오 파일 수신
2. **임시 저장**: 서버 임시 디렉토리에 파일 저장
3. **분석 큐 등록**: Celery에 분석 작업 등록
4. **Task ID 반환**: 모바일이 결과 확인할 수 있는 ID 제공
5. **비동기 분석**: Librosa 기반 오디오 스펙트럼 분석
6. **결과 저장**: PostgreSQL에 분석 결과 기록
7. **결과 조회**: 모바일에서 Task ID로 결과 확인

### 데이터 정제 처리
```python
# Librosa 기반 오디오 분석
def analyze_audio_spectrum(file_path: str, device_id: str):
    y, sr = librosa.load(file_path)
    
    # 주파수 스펙트럼 분석
    stft = librosa.stft(y)
    magnitude = np.abs(stft)
    
    # 고조파 분석
    harmonics = detect_harmonics(magnitude, sr)
    
    # 장비별 고장 주파수 매칭
    fault_frequencies = match_frequencies(harmonics, device_id)
    
    return {
        "spectrum": magnitude.tolist(),
        "harmonics": fault_frequencies,
        "diagnosis": generate_diagnosis(fault_frequencies)
    }
```

## 📊 하이브리드 데이터 시스템

### Mock 데이터 연동
```python
# 장치 ID 기반 데이터 분기
if device_id.startswith("MOCK-"):
    # 데모 시나리오 데이터 반환
    scenario = get_demo_scenario(device_id)
    return scenario.detailed_report
else:
    # 실제 데이터베이스 조회
    real_data = await fetch_real_data(db, device_id)
    return analyze_real_data(real_data)
```

### 데이터 통합 아키텍처
- **Demo payload**: 다양한 시나리오 데이터셋
- **Fallback 시스템**: 실제 데이터 부족 시 안전한 기본값
- **유연한 확장**: 신규 시나리오 추가 용이

## 🔧 개발 환경 설정

### 라우터 개발 가이드
```python
# 새 라우터 생성 템플릿
from fastapi import APIRouter, Depends
from app.database import get_db
from app.security import get_current_user

router = APIRouter()

@router.post("/endpoint")
async def new_endpoint(
    data: RequestSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # 엔드포인트 로직 구현
    pass

# main.py에 등록
app.include_router(router, prefix="/api/new", tags=["new"])
```

### 테스트 환경
```python
# 의존성 Mocking
def mock_get_current_user():
    return User(id=1, email="test@example.com")

def test_upload_audio():
    app.dependency_overrides[get_current_user] = mock_get_current_user
    
    # 테스트 로직
    
    app.dependency_overrides.clear()
```

## 📈 성능 모니터링

### API 성능 지표
- **응답 시간**: 엔드포인트별 평균 응답 시간
- **처리량**: 초당 API 요청 처리량
- **에러율**: 4xx/5xx 에러 비율
- **DB 쿼리**: 데이터베이스 쿼리 성능

### 모니터링 도구
- **Prometheus**: 메트릭 수집 및 스토리지
- **Grafana**: 성능 대시보드 시각화
- **Sentry**: 에러 추적 및 알림

## 🚀 확장 방향

### 추가 예정 라우터
```
app/routers/
├── admin.py              # 관리자 기능
├── analytics.py           # 분석 데이터 API
├── notifications.py       # 푸시/알림 관리
├── users.py              # 사용자 관리
└── websocket.py           # 실시간 통신
```

### 기능 확장 계획
- **WebSocket 지원**: 실시간 데이터 스트리밍
- **GraphQL**: 복잡한 쿼리 최적화
- **API 버전관리**: v1, v2 등 버전별 라우트 지원

## 📚 라우터 개발 참고 자료

### 권장 패턴
- **의존성 주입**: 재사용 가능한 컴포넌트 구성
- **에러 핸들링`: 일관된 에러 응답 형식
- **테스트 용이성`: Mocking 및 테스트 지원

### 성능 가이드라인
- **응답 시간**: 대부분 API 200ms 미만
- **데이터 크기**: 응답 페이로드 1MB 미만
- **동시성**: 100+ 요청 동시 처리 지원
