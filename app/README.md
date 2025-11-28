# 백엔드 애플리케이션 (app)

이 디렉토리는 SignalCraft의 FastAPI 기반 백엔드 서버를 포함합니다. REST API, 인증, 오디오 분석, 데이터베이스 연동 등 모든 서버 측 로직이 구현되어 있습니다.

## 📁 디렉토리 구조

```
app/
├── __init__.py
├── database.py          # 데이터베이스 연결 설정
├── models.py            # SQLAlchemy 데이터 모델
├── schemas.py           # Pydantic 스키마 정의
├── security.py          # 인증 및 보안 기능
├── worker.py            # Celery 워커 설정
├── features/            # 기능별 모듈화 코드
└── routers/             # API 라우터
```

## 🎯 핵심 파일 역할

### database.py
- **PostgreSQL** 데이터베이스 연결 설정
- SQLAlchemy AsyncSession 관리
- 데이터베이스 풀링 및 세션 관리

### models.py
- **SQLAlchemy ORM** 모델 정의
- 주요 모델: Users, AudioFiles, AIAnalysisResults
- 테이블 관계 및 제약 조건 설정

### schemas.py
- **Pydantic** 스키마 정의 (요청/응답 모델)
- 데이터 직렬화 및 유효성 검사
- API 문서화 자동화 지원

### security.py
- **JWT 토큰** 생성 및 검증
- OAuth2PasswordRequestForm 지원
- get_current_user 함수 (현재 사용자 조회)

### worker.py
- **Celery** 비동기 작업 처리 설정
- 오디오 분석 작업 큐 관리
- Redis 브로커 연동

## 🔄 주요 기능 모듈

### features/audio_analysis/
- **librosa** 기반 오디오 분석 로직
- 실시간 주파수 분석 및 고조파 탐지
- 결과 데이터 생성 및 저장

### routers/
- **mobile.py**: 모바일 앱 전용 API 엔드포인트
- 인증된 사용자만 접근 가능한 라우트
- 파일 업로드 및 분석 결과 조회

## 🔐 인증 시스템

### JWT 기반 인증 흐름
1. 사용자 로그인 → 토큰 생성
2. 토큰 저장 → API 요청 시 자동 포함
3. 토큰 검증 → 보호된 리소스 접근

### 보안 레이어
- **비밀번호 해싱**: bcrypt 알고리즘 사용
- **토큰 만료**: 유한한 수명의 JWT 토큰
- **권한 확인**: 사용자 역할 기반 접근 제어

## 🧠 오디오 분석 파이프라인

### 분석 프로세스
1. 오디오 파일 업로드 → Celery 태스크 생성
2. 비동기 분석 실행 → librosa 프로세싱
3. 결과 저장 → PostgreSQL에 기록
4. 폴링 기반 결과 조회

### 기술 스택
- **librosa**: 오디오 신호 처리 라이브러리
- **NumPy**: 수치 계산
- **Celery**: 비동기 작업 큐
- **Redis**: 메시지 브로커

## 🗄 데이터베이스 스키마

### 주요 테이블 구조

**Users Table**
- 사용자 계정 정보 저장
- 인증 및 권한 관리

**AudioFiles Table**
- 업로드된 오디오 파일 정보
- 장치 ID 및 메타데이터

**AIAnalysisResults Table**
- 분석 결과 데이터
- 진단 정보 및 신뢰도 점수

### 관계 설정
- User → AudioFiles (1:N)
- User → AIAnalysisResults (1:N)
- AudioFile → AIAnalysisResult (1:1)

## 🚀 API 엔드포인트

### 인증 API
- `POST /auth/login`: 사용자 로그인
- `POST /auth/register`: 회원가입

### 모바일 전용 API
- `POST /api/mobile/upload`: 오디오 파일 업로드
- `GET /api/mobile/result/{task_id}`: 분석 결과 조회
- `GET /api/mobile/report/{device_id}`: 상세 리포트

## 🐳 Docker 기반 배포

### 서비스 구성
- **FastAPI**: 웹 서버
- **PostgreSQL**: 데이터베이스
- **Redis**: 메시지 브로커
- **Celery Workers**: 비동기 작업 처리

### 환경 설정
- `.env` 파일로 데이터베이스 및 Redis 설정
- 컨테이너 간 네트워크 연동
- 볼륨 마운트로 데이터 영속화

## 🔧 개발 환경 설정

### 필요 라이브러리
```
fastapi>=0.104.1
sqlalchemy>=2.0.23
alembic>=1.12.1
celery>=5.3.4
redis>=5.0.1
librosa>=0.10.1
```

### 실행 명령어
```bash
# 개발 서버 실행
uvicorn main:app --reload

# 데이터베이스 초기화
python reset_db_schema.py

# Celery 워커 실행
celery -A worker worker --loglevel=info
```

## 📊 성능 최적화

- **비동기 처리**: Celery를 통한 오디오 분석 병렬화
- **데이터베이스 최적화**: 인덱스 추가 및 쿼리 튜닝
- **파일 관리**: 분석 완료 후 임시 파일 자동 삭제
- **캐싱**: Redis를 통한 결과 데이터 캐시

## 🔍 디버깅 및 모니터링

- **로깅**: 구조화된 로그 기록
- **에러 핸들링**: HTTP 상태 코드별 처리
- **API 문서**: Swagger/OpenUI 자동 생성
- **Celery 모니터링**: Flower 대시보드 연동
