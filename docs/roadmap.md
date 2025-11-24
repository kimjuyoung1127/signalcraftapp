# SignalCraft Mobile Roadmap

## 🗺️ 통합 개발 로드맵 (Backend & Frontend)
나중에 뜯어고치는 일을 막기 위해, **"백엔드는 API화", "프론트엔드는 모듈화"**에 집중하는 로드맵입니다.

## 📅 진행 상황 (2025-11-24 기준)

### ✅ 완료된 작업
- **[✓] 기본 네비게이션 구조**: AuthStack + MainTab 완료
- **[✓] Industrial Cyberpunk 디자인 시스템**: 다크 테마 및 네온 컬러 구현
- **[✓] 오디오 비주얼라이저**: Reanimated 기반 원형 파동 애니메이션 (60fps)
- **[✓] 장비 상태 관리**: Zustand Store 기반 상태 저장 및 갱신
- **[✓] 데모 컨트롤**: 테스트용 상태 강제 변경 기능 (심사위원용)
- **[✓] 설정 화면**: 전체 설정 페이지 및 톱니바퀴 버튼 내비게이션
- **[✓] 동적 상태 대시보드**: 오디오 전용 지표 및 고조파 분석 차트
- **[✓] 실시간 데이터 연동**: 상태별 동적 지표 변화 구현
- **[✓] 스크롤 가능한 레이아웃**: 새로운 콘텐츠 추가에 따른 UI 최적화
- **[✓] 한글화 적용**: 전체 UI 한국어 번역 완료

### 🔄 현재 진행 중
- **[!] 실제 백엔드 API 연동 준비**: Mock 데이터를 실제 API로 전환 준비 중

### 🔌 Backend Roadmap (FastAPI API Expansion)

#### ✅ 완료된 백엔드 준비
- **[✓] Mock Service 구조**: 데모 모드를 위한 가상 데이터 서비스
- **[✓] API Layer 설계**: 백엔드 연동을 위한 서비스 레이어 준비

#### ✅ 완료된 단계
- [x] **Phase 0: Docker Compose 인프라 구축 (필수)**
    - [x] `docker-compose.yml` 작성: FastAPI, Redis, Celery 서비스 정의
    - [x] AWS RDS 연결 설정: `host.docker.internal`로 SSH 터널링 연결
    - [x] 환경변수 설정: `.env` 파일 생성 및 `DATABASE_URL`, `CELERY_BROKER_URL` 등 정의
    - [x] 인프라 테스트: 모든 서비스가 올바르게 연결되는지 확인
    - [x] SSH 터널링 지속성 유지: `ServerAliveInterval` 설정으로 연결 안정화
    - [x] 라이브러리 의존성 추가: `requirements.txt`에 `fastapi`, `uvicorn`, `sqlalchemy`, `psycopg2-binary`, `asyncpg`, `celery`, `redis` 포함
    - [x] `host.docker.internal` 설정 확인: 윈도우 환경에서의 Docker 연결 문제 해결
    - [x] FastAPI-Redis-Celery 통신 테스트 완료: `/test-celery` 엔드포인트로 비동기 작업 확인

- [x] **Phase 1: 보안 및 인증 (FastAPI 기반)**
    - [x] 라이브러리 추가: JWT 생성/검증(`python-jose`) 및 비밀번호 해싱(`passlib`) 설치
    - [x] DB 모델 연동: 기존 `users` 테이블을 SQLAlchemy 모델로 매핑 (subscription 필드 포함)
    - [x] `POST /api/auth/login`: 이메일/비번 검증 → JWT Access Token 발급
    - [x] `POST /api/auth/signup`: 사용자 등록 기능 구현
    - [x] `GET /api/auth/me`: 현재 사용자 정보 반환 엔드포인트 추가
    - [x] 보안 설정: `.env` 파일에 JWT 설정 추가 (SECRET_KEY, ALGORITHM 등)
    - [x] 폴더 구조 정리: `app/routers/auth.py`, `app/models.py`, `app/schemas.py`, `app/security.py`, `app/database.py` 파일 생성
    - [x] 데이터베이스 테이블 자동 생성: 애플리케이션 시작 시 테이블 생성 설정
    - [x] MissingGreenlet 오류 해결: SQLAlchemy 비동기 엔진으로 전환
    - [x] Email validator 설치: 이메일 필드 검증을 위한 패키지 추가

- [ ] **Phase 2: 데이터 조회 API 최적화 (FastAPI)**
    - [ ] `GET /api/mobile/devices`: 모바일 대시보드용 경량화된 장비 리스트 반환 (상태, 모델명만).
    - [ ] `GET /api/mobile/audio-stats/{device_id}`: 오디오 분석용 최근 데이터 반환
    - [ ] `GET /api/mobile/realtime/{device_id}`: 실시간 장비 상태 스트리밍 (Polling 기반으로 시작, 필요 시 WebSocket으로 확장)

- [ ] **Phase 3: AI 분석 파이프라인 연동 (FastAPI + Celery)**
    - [ ] `POST /api/mobile/upload`: multipart/form-data로 모바일 녹음 파일 수신 로직.
    - [ ] Celery 연동: 업로드 즉시 Task ID 반환 (Non-blocking).
    - [ ] `GET /api/mobile/result/{task_id}`: 폴링용 상태 확인 API.
    - [ ] `GET /api/mobile/harmonics/{device_id}`: 고조파 분석 데이터 API
    - [ ] 오디오 분석 모델 통합: SignalCraft AI 모델을 Celery 작업으로 구현

### 📱 Frontend Roadmap (React Native App)

#### ✅ 완료된 프론트엔드 기능
- **[✓] Phase 1: 뼈대 및 디자인 시스템 (MVP 핵심)**
    - [✓] Onboarding: 앱의 가치를 설명하는 3단계 슬라이드.
    - [✓] Hybrid Login: 데모 모드 + 실제 JWT 로그인 폼 UI.
    - [✓] Navigation: AuthStack (로그인 전) + MainTab (로그인 후) 구조 분리.

- **[✓] Phase 2: 대시보드 & 시각화**
    - [✓] Device Selector: 상단 가로 스크롤로 기기 전환 UI.
    - [✓] Cyberpunk Visualizer: Reanimated를 사용하여 오디오 데이터를 화려한 파동으로 표현.
    - [✓] 상태 연동: Zustand Store에 `selectedDevice`를 두고, 변경 시 모든 컴포넌트가 반응하도록 구현.
    - [✓] 동적 상태 대시보드: 오디오 전용 지표 (소음 레벨, 진폭, 주파수, 신호 품질)
    - [✓] 고조파 분석 차트: 5단계 고조파 시각화 (H1-H5)
    - [✓] 설정 화면: 톱니바퀴 버튼 및 전체 설정 기능

#### 🚧 다음 단계 (핵심 진단 기능)
- [x] **Phase 0: 네트워크 환경 설정 (Critical - 반드시 선행)**
    - [x] **PC IP 주소 확인**: 윈도우에서 `ipconfig`로 IPv4 주소 확인 (예: `192.168.0.x`)
    - [x] **CORS 설정**: FastAPI 서버에 CORS 미들웨어 추가 (모든 origin 허용 - 개발용)
    - [x] **API URL 업데이트**: `.env` 파일에 `EXPO_PUBLIC_API_URL=http://[PC_IP]:8000` 설정
    - [x] **Mock/Real 스위칭 구조**: `ENV.IS_DEMO_MODE` 설정으로 Mock/Real 데이터 전환 기능 유지
    - [x] **네트워크 테스트**: 모바일 장비에서 PC IP로 API 연결 테스트

- [x] **Phase 2.5: 백엔드 API 연동**
    - [x] `POST /api/auth/login`: FastAPI OAuth2PasswordRequestForm 방식으로 로그인 구현
    - [x] `POST /api/auth/signup`: 회원가입 기능 완성
    - [x] JWT 토큰 저장/관리: `expo-secure-store`에 토큰 안전하게 저장
    - [x] 인증 헤더 자동 주입: Axios Interceptor로 모든 요청에 토큰 자동 추가
    - [x] 자동 로그인: 저장된 토큰 검증 후 자동 인증 유지
    - [x] **[테스트 완료]**: 실제 서버와 연동하여 작동 확인
    - [x] **Token Expiration**: JWT 만료 시간 확인 및 자동 갱신 로직 구현
    - [x] **User Info Retrieval**: `/api/auth/me` 엔드포인트를 통한 사용자 정보 가져오기
    - [x] **Secure Logout**: 토큰 만료 시 자동 로그아웃 처리

- [x] **Phase 2.5: 실시성 및 데이터 최적화**
    - [x] `/api/mobile/devices` 엔드포인트 구현: 목업 3개 + DB 연동 1개 데이터 제공
    - [ ] Polling 연동 준비: 실시간 장비 상태 스트리밍 (초기에는 2초마다 서버 확인)
    - [ ] 데이터 캐싱: 오프라인 모드 지원
    - [ ] 푸시 알림: 위험 상태 자동 알림
    - [x] **[테스트 완료]**: 실제 장비 데이터 연동 테스트 완료

- [ ] **Phase C: 오디오 분석 파이프라인 (Audio Pipeline) - 🚧 핵심 차기 과제**
    - [ ] Audio Recorder: `expo-av`를 사용하여 마이크 권한 획득 및 녹음 구현.
    - [ ] File Upload: 녹음된 `.m4a` 또는 `.wav` 파일을 `multipart/form-data`로 변환.
    - [ ] Upload & Poll: 녹음 후 백엔드로 전송하고, Task ID 수신 후 2초마다 결과 폴링.
    - [ ] Result Card: 분석 결과(정상/위험)를 직관적인 UI 카드로 표시.
    - [ ] 진단 히스토리: 과거 진단 결과 조회 및 비교

### 🎨 UI/UX 향상사항
- [ ] **Micro-interactions**: 부드러운 터치 피드백 및 트랜지션
- [ ] **네트워크 상태 표시**: 연결/연결 끊김 상태 UI 피드백
- [ ] **애니메이션 최적화**: 120fps 지원 및 저사양 기기 대응
- [ ] **Dark Mode 응답성**: 시스템 설정 기반 자동 전환
- [ ] **접근성**: VoiceOver 및 TalkBack 지원

### 🔧 기술 개선사항
- [ ] **네트워크 오류 처리**: 타임아웃, 연결 실패 등에 대한 UI 표시
- [ ] **Mock/Real 전환 테스트**: 토글 가능한 개발/운영 모드 구현
- [ ] **성능 최적화**: 번들 크기 감소 및 렌더링 최적화
- [ ] **테스트 커버리지**: 유닛 테스트 및 E2E 테스트 추가
- [ ] **타입 안정성**: TypeScript strict 모드 적용
- [ ] **오류 처리**: 네트워크 에러 및 예외 상황 UI 개선
- [ ] **[테스트 필요]**: 실제 네트워크 환경에서 전체 기능 검증

## 🚀 중요 업데이트 사항

### 📊 오디오 진단 시스템 강화 (2025-11-24)
- **심장 애니메이션 유지**: 기존 컨셉 그대로 유지하며 오디오 비주얼라이저는 변경 없음
- **오디오 전용 지표 추가**:
  - 소음 레벨 (Noise Level)
  - 진폭 (Vibration Amplitude)
  - 주파수 (Frequency)
  - 신호 품질 (Signal Quality)
- **고조파 분석 구현**: 5단계 고조파 시각화 (H1-H5)
- **동적 데이터 시스템**: 상태별 자동 데이터 변화 (정상/경고/위험)
- **데모 컨트롤 명확화**: "심사위원용" 명확한 라벨링 및 실제 운영 안내

### 🏗️ 아키텍처 개선
- **설정 화면 완성**: 톱니바퀴 버튼 및 전체 설정 기능 구현
- **스크롤 가능한 레이아웃**: 새로운 대시보드 콘텐츠에 최적화된 UI 구조
- **실시간 상태 연동**: 상태 변경 시 모든 지표 자동 업데이트

### 🎨 디자인 시스템 확장
- **Industrial Cyberpunk**: 다크 테마 및 네온 컬러 시스템 유지
- **상태별 시각화**: 컬러 코드 기반 직관적인 상태 표시
- **Micro-interactions**: 부드러운 애니메이션 효과 추가

---

## 📋 다음 우선순위

### ✅ 완료된 작업 (Network Setup 완료!)
1. **PC IP 주소 확인 및 API URL 설정**: `ipconfig`로 확인한 IP를 `.env` 파일에 설정
2. **FastAPI CORS 설정**: 모든 origin 허용 미들웨어 추가 (개발용)
3. **Mock ↔ Real 스위칭 구조 구현**: 개발 중에도 UI 테스트 가능하도록
4. **네트워크 연결 테스트**: 모바일에서 PC IP로 API 호출 확인

### 🎯 단기 목표 (2주 내)
1. **오디오 녹음 기능**: expo-av를 통한 마이크 녹음
2. **Phase C (오디오 분석) 구현**: 서버로 파일 전송 및 결과 폴링 로직
3. **인증 유지 기능**: 앱을 껐다 켜도 로그인 유지되게 (자동 로그인)

### 🚀 중기 목표 (1개월 내)
1. **AI 분석 파이프라인**: FastAPI 백엔드와 연동
2. **데이터 캐싱**: 오프라인 모드 지원
3. **푸시 알림 시스템**: 위험 상태 자동 알림

### 🌟 장기 목표 (2개월 내)
1. **진단 히스토리**: 과거 진단 결과 및 비교 분석
2. **다중 장비 지원**: 여러 장비 동시 모니터링
3. **데이터 분석 리포트**: 주간/월간 장비 상태 보고서

---

**마지막 업데이트**: 2025-11-24
**다음 업데이트 예정**: 주간 진행 상황에 따라 업데이트
**담당자**: SignalCraft Mobile Development Team
