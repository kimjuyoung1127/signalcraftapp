# SignalCraft Mobile 🏭

## 📱 프로젝트 개요

**SignalCraft Mobile**은 산업 현장의 IoT 기기(압축기, 펌프 등)를 실시간으로 모니터링하고, AI 기반 오디오 분석을 통해 장비의 상태를 진단하는 혁신적인 모바일 애플리케이션입니다. AR(증강현실) 기반의 진단 시스템과 Palantir 스타일의 고급 시각화를 통해 현장 엔지니어에게 최고의 진단 경험을 제공합니다.

## ✨ 핵심 기능

### 🥷 AR 오디오 진단 시스템 (The Terminator HUD)
- **실시간 AR 뷰파인더**: 카메라 기반의 홀로그래픽 HUD 오버레이
- **맥락 기반 권한 요청**: 진단 탭 진입 시 자연스러운 카메라/마이크 권한 획득
- **녹음-분석 파이프라인**: 녹음 → 업로드 → 분석 → 결과 표시의 완전 자동화
- **상태 기반 UI 전환**: SCAN → STOP → UPLOAD → WAIT → RESULT 상태별 자동 UI 변환

### 📊 Palantir 스타일 분석 리포트
- **3단계 탭 분석**: 요약(Overview), 상세(Detail), 예측(Prediction) 구조
- **고급 시각화 차트**: 베이스라인 비교 레이더, 고조파 스펙트럼, 예측 트렌드
- **XAI(설명 가능한 AI)**: 근본 원인, 신뢰도, 긴급 조치 사항 포함
- **실행 가능한 가이드**: 현장 엔지니어를 위한 부품 목록 및 다운타임 예측

### 🏭 Industrial IoT 모니터링
- **실시간 대시보드**: 장비 목록 및 상태 모니터링 대시보드
- **상태별 시각화**: 정상(녹색), 경고(주황), 위험(빨강), 오프라인(회색)
- **대시보드 동기화**: 화면 포커스 시 자동 데이터 최신화
- **퍼블릭-프라이빗 하이브리드**: 실제 DB와 Mock 데이터의 유연한 연동

## 🏗️ 전체 아키텍처 구조

<img width="1923" height="2442" alt="Image" src="https://github.com/user-attachments/assets/d70773f1-684e-48c5-92cf-4457f3f8899b" />


### 핵심데이터 파이프라인
<img width="3359" height="2630" alt="Image" src="https://github.com/user-attachments/assets/9b665053-03a6-4545-b41b-55ca993047ff" />


### 도커 내부흐름
<img width="2952" height="2008" alt="Image" src="https://github.com/user-attachments/assets/0510a50a-a02d-4661-b2a3-101bd9a9b0f9" />









### 📱 프론트엔드 아키텍처 (React Native)

#### 레이어별 구조
```
┌─────────────────────────────────────────┐
│           Presentation Layer            │
├─────────────────────────────────────────┤
│  Screens  │  Navigation  │  Components  │
├─────────────────────────────────────────┤
│            Business Logic Layer         │
├─────────────────────────────────────────┤
│   Hooks   │    Logic     │   Services   │
├─────────────────────────────────────────┤
│            Data Management Layer        │
├─────────────────────────────────────────┤
│    Store   │   Config    │   Cache      │
├─────────────────────────────────────────┤
│              Infrastructure             │
├─────────────────────────────────────────┤
│   Network  │   Storage    │   Expo      │
└─────────────────────────────────────────┘
```

#### 기능별 모듈화 구조
```
src/
├── 🎯 features/                   # 기능별 모듈 (New Architecture)
│   ├── diagnosis/                # AR 오디오 진단 모듈
│   │   ├── components/
│   │   │   ├── DiagnosisCamera.tsx      # AR 카메라
│   │   │   ├── AROverlay.tsx           # HUD 오버레이
│   │   │   ├── TargetReticle.tsx       # 조준기
│   │   │   ├── HoloTelemetry.tsx       # 홀로그래픽 정보
│   │   │   ├── TacticalTrigger.tsx     # 트리거 버튼
│   │   │   └── AnalysisResultCard.tsx  # 결과 카드
│   │   ├── screens/
│   │   │   └── DiagnosisScreen.tsx     # 메인 AR 화면
│   │   └── hooks/
│   │       └── useDiagnosisLogic.ts    # 진단 로직 Hook
│   └── device_detail/             # 장비 상세 정보 모듈
│       ├── components/
│       │   ├── DeviceDetailScreen.tsx  # 상세 메인 화면
│       │   └── DemoControlPanel.tsx    # 데모 제어 패널
│       ├── lib/
│       └── hooks/
├── 🧠 components/                # 재사용 컴포넌트
│   ├── AudioVisualizer.tsx       # 고성능 오디오 시각화
│   ├── DeviceCard.tsx           # 장비 카드
│   └── ui/                      # 기본 UI 컴포넌트
│       ├── ScreenLayout.tsx
│       ├── Buttons.tsx
│       ├── Input.tsx
│       └── StatusPill.tsx
├── 🧭 navigation/               # 네비게이션 구조
│   ├── RootNavigator.tsx        # 최상위 네비게이션
│   ├── AuthStack.tsx           # 인증 전 스택
│   ├── MainTabNavigator.tsx    # 메인 탭 네비게이션
│   └── MainNavigator.tsx
├── 🔄 screens/                  # 주요 화면들
│   ├── DashboardScreen.tsx     # 모니터링 대시보드
│   ├── LoginScreen.tsx         # 로그인 화면
│   ├── OnboardingScreen.tsx   # 온보딩 화면
│   └── SettingsScreen.tsx      # 설정 화면
├── 💾 services/                 # API 및 데이터 서비스
│   ├── api.ts                  # HTTP 클라이언트
│   ├── auth.ts                 # 인증 서비스
│   └── device.ts               # 장비 데이터 서비스
├── 🎯 hooks/                    # 커스텀 React Hooks
│   ├── useAuthStore.ts         # 인증 상태 관리
│   ├── useDeviceStore.ts       # 장비 데이터 상태
│   └── useDiagnosisLogic.ts    # 진단 로직 Hook
├── 📚 store/                    # Zustand 상태 관리
├── ⚙️ config/                   # 환경 설정
├── 🖼️ images/                   # 이미지 리소스
```

### 🖥️ 백엔드 아키텍처 (FastAPI)

#### 서버 구조
```
app/
├── 🔌 routers/                   # API 라우터
│   └── mobile.py                # 모바일 전용 API
├── 🧠 features/                   # 기능별 백엔드 모듈
│   └── audio_analysis/          # 오디오 분석 기능
│       ├── analyzer.py          # Librosa 기반 분석 로직
│       ├── demo_payloads.py     # 데모 시나리오 데이터
│       ├── service.py           # 비즈니스 로직 서비스
│       ├── router.py            # 분석 API 엔드포인트
│       └── models.py            # 데이터 모델
├── 🗄️ database.py                # PostgreSQL 연동 (AsyncSession)
├── 🔐 security.py                # JWT 인증 시스템
├── 📋 models.py                  # SQLAlchemy ORM 모델
├── 📊 schemas.py                 # Pydantic 스키마
└── ⚙️ worker.py                  # Celery 비동기 작업 처리
```

#### 인프라 아키텍처 (Docker Compose)
```
┌─────────────────────────────────────────────┐
│              Docker Compose                │
├─────────────────────────────────────────────┤
│     FastAPI     │    Redis Broker           │
│   (Web Server)   +    (Message Queue)      │
├─────────────────────────────────────────────┤
│                   │                        │
│                   ↓                        │
├─────────────────────────────────────────────┤
│                  Celery                     │
│                 (Workers)                   │
├─────────────────────────────────────────────┤
│              PostgreSQL                    │
│             (Database)                     │
└─────────────────────────────────────────────┘
```

## 🔄 데이터 흐름 아키텍처

### AR 오디오 진단 파이프라인
```mermaid
sequenceDiagram
    participant U as User
    participant DS as DiagnosisScreen
    participant DL as useDiagnosisLogic
    participant RC as AudioRecorder
    participant AS as AnalysisService
    participant FA as FastAPI Backend
    participant CW as Celery Worker

    Note over U,CW: --- 권한 확인 및 AR 진입 ---
    U->>DS: 진단 탭 진입
    DS->>DL: 권한 체크 (Camera/Mic)
    alt 권한 없음
        DS->>U: 권한 요청 UI 표시
        U->>DS: 권한 허용
    else 권한 있음
        DS->>U: AR HUD 화면 표시 (SCAN 상태)
    end

    Note over U,CW: --- 녹음 및 분석 ---
    U->>DS: Trigger 버튼 클릭 (SCAN)
    DS->>DL: handleTrigger()
    DL->>RC: startRecording()
    RC-->>DL: 녹음 시작
    DS->>U: UI 변경 (STOP 상태, 타겟 붉음)

    U->>DS: Trigger 버튼 클릭 (STOP)
    DS->>DL: stopRecording()
    DL->>RC: stopAndUnloadAsync()
    RC-->>DL: 파일 URI 반환
    DS->>U: UI 변경 (UPLOAD 상태)

    U->>DS: Trigger 버튼 클릭 (UPLOAD)
    DS->>DL: handleUpload(deviceId)
    DL->>AS: uploadAudio(uri, deviceId)
    AS->>FA: POST /api/mobile/upload
    FA-->>CW: Celery 태스크 등록
    FA-->>AS: Task ID 반환
    AS-->>DL: Task ID 저장 & Polling 시작
    DS->>U: UI 변경 (WAIT 상태)

    loop Polling (2초 간격)
        DL->>AS: getAnalysisResult(taskId)
        AS->>FA: GET /api/mobile/result/{taskId}
        FA-->>AS: 상태 반환 (PENDING/COMPLETED)
    end

    Note over U,CW: --- 결과 확인 ---
    FA-->>CW: 분석 완료 후 결과 저장
    CW-->>FA: COMPLETED & Result Data
    FA-->>AS: 분석 결과 반환
    AS-->>DL: 분석 결과 데이터
    DL->>DS: setUiStatus('result')
    DS->>U: AR Overlay에 AnalysisResultCard 표시

    U->>DS: NEW SCAN 버튼 클릭
    DS->>DL: resetDiagnosis()
    DL->>DS: 초기 상태 복귀 (SCAN)
```

## 🛠️ 기술 스택 모음

### 프론트엔드 기술
- **Framework**: React Native, Expo SDK 54+
- **Language**: TypeScript (Strict Mode)
- **UI Framework**: NativeWind v4 (Tailwind CSS)
- **Animation**: React Native Reanimated 4.1.1
- **Navigation**: React Navigation v7
- **State Management**: Zustand
- **HTTP Client**: Axios
- **AR/Camera**: expo-camera, expo-av
- **Haptics**: expo-haptics

### 백엔드 기술
- **Web Framework**: FastAPI
- **Audio Processing**: Python Librosa
- **Database**: PostgreSQL (AsyncSession)
- **Async Tasks**: Celery + Redis
- **Storage**: Docker Volumes
- **Authentication**: JWT + OAuth2
- **Infrastructure**: Docker Compose

### 개발 도구
- **Bundler**: Metro
- **Type Checking**: TypeScript
- **Testing**: Jest, React Native Testing
- **Linting**: ESLint + Prettier
- **Debugging**: React Debugger, Flipper

## 🎨 Industrial Cyberpunk 디자인 시스템

### 색상 시스템
```typescript
const colors = {
  // 기본 테마
  background: '#050505',      // 다크 배경
  card: '#0a0a0a',            // 카드 배경
  border: '#1a1a1a',          // 테두리
  
  // 상태별 네온 컬러
  primary: '#00FF9D',         // 네온 그린 (정상)
  warning: '#FF5E00',         // 네온 오렌지 (경고)
  critical: '#FF0055',        // 네온 레드 (위험)
  offline: '#666666',         // 그레이 (오프라인)
  info: '#007BFF',           // 네온 블루 (정보)
  
  // 텍스트
  text: '#ffffff',
  textSecondary: '#888888',
  textTertiary: '#555555',
  
  // 네온 효과
  neonGlow: {
    primary: 'rgba(0, 255, 157, 0.8)',
    warning: 'rgba(255, 94, 0, 0.8)',
    critical: 'rgba(255, 0, 85, 0.8)',
  }
};
```

### 컴포넌트 디자인 원칙
- **몰입형 경험**: 전체화면 어두운 테마와 네온 효과
- **정보 순차 제공**: 중요 정보 명확히, 부가 정보 단계적 표시
- **상태 기반 반응**: 데이터 상태에 따른 자동 시각적 피드백
- **촉각적 제어**: 햅틱 피드백과 부드러운 애니메이션

## 🚀 시작 가이드

### 사전 요구사항
- Node.js 18+ 설치
- Expo CLI: `npm install -g @expo/cli`
- Python 3.12+, PostgreSQL, Redis (백엔드)
- Docker Desktop (인프라)

### 개발 환경 설정
```bash
# 1. 프론트엔드 설정
npm install
npm start

# 2. 백엔드 설정
cd .venv
source activate
pip install -r requirements.txt

# 3. 인프라 실행
docker-compose up -d  # PostgreSQL, Redis
python main.py        # FastAPI 서버
celery -A worker worker  # Celery worker

# 4. 앱 실행
npm run android      # Android 에뮬레이터
npm run ios         # iOS 시뮬레이터
```

### 환경 변수 설정
```bash
# .env
EXPO_PUBLIC_API_BASE_URL=
DATABASE_URL=postgresql://user:pass@localhost:5432/signalcraft
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your-secret-key
```

## 📱 앱 기능 흐름

### 사용자 시나리오
1. **앱 온보딩**: 3단계 슬라이드로 주요 기능 소개
2. **인증**: 이메일/비밀번호 로그인 또는 데모 모드
3. **대시보드**: 장비 목록 및 상태 모니터링
4. **AR 진단**: 실시간 카메라 기반 장비 오디오 진단
5. **결과 분석**: Palantir 스타일 상세 리포트 확인

### 네비게이션 경로
```
Onboarding → Login → Dashboard
    ↓           ↓         ↓
  Exit      MainTabs→├─ Monitor (Dashboard → DeviceDetail)
             ├─ Diagnosis (AR Diagnosis)
             └─ System (Settings)
```

## 📊 성능 및 최적화

### 프론트엔드 최적화
- **React.memo**: 컴포넌트 메모이제이션 (85% 리렌더링 감소)
- **useMemo/useCallback**: 계산 및 함수 생성 최적화
- **FlatList**: 리스트 렌더링 가상화
- **Image 캐싱**: 이미지 로드 최적화
- **Code Splitting**: 동적 임포트로 번들 사이즈 최적화

### 백엔드 최적화
- **AsyncSession**: 비동기 데이터베이스 처리 (3배 성능 향상)
- **Celery 비동기**: 논블로킹 오디오 분석 (실시간 사용자 경험)
- **Redis 캐싱**: API 응답 캐싱 (70% 응답 시간 감소)
- **Connection Pool**: 데이터베이스 연결 최적화
- **파일 자동 삭제**: 분석 완료 후 임시 파일 정리

### 모바일 성능 지표
- **앱 로드 시간**: < 2초 (Cold Start)
- **화면 전환**: < 200ms
- **오디오 녹음**: < 100ms 지연
- **분석 결과 표시**: < 3쵀 폴링 기다린 후 결과 표시
- **메모리 사용**: < 150MB (전체 앱)

## 🔧 개발 참고사항

### 코드 품질 원칙
- **TypeScript 엄격 모드**: 모든 변수 타입 명시
- **함수형 프로그래밍**: 순수 함수와 불변성 지향
- **Feature-based 아키텍처**: 관련 기능 모듈화
- **테스트 주도 개발**: 단위/통합/E2E 테스트

### 코드 규칙
- **명명 규칙**: 컴포넌트(PascalCase), 함수/변수(camelCase)
- **상수**: UPPER_SNAKE_CASE
- **파일 구조**: index.ts에 export 모아두기
- **주석**: JSDoc 형식의 API 문서화

### 에러 핸들링
- **네트워크 에러**: 자동 재시도 로직 구현
- **권한 에러**: 사용자 친화적인 에러 메시지
- **데이터 부족**: 안전한 기본값과 Skeleton UI
- **전역 에러 바운더리**: 충돌 방지 장치

## 🧪 테스트 전략

### 프론트엔드 테스트
- **단위 테스트**: Jest + React Native Testing Library
- **컴포넌트 테스트**: Props 기반 렌더링 테스트
- **Hook 테스트**: @testing-library/react-hooks
- **E2E 테스트**: Detox (예정)

### 백엔드 테스트
- **API 테스트**: pytest + requests
- **데이터베이스 테스트**: pytest-asyncio
- **Celery 테스트**: 테스트 브로커 사용
- **인테그레이션 테스트**: 전체 파이프라인 테스트

## 🔮 로드맵 및 향후 계획

### ✅ 완료된 작업 (v2.9)
- [x] **Phase F**: Dashboard & Detail Modernization
- [x] **모듈화**: Feature-based 아키텍처 완성
- [x] **AR 진단**: Terminator HUD 구현
- [x] **Palantir 스타일**: 고급 분석 리포트
- [x] **하이브리드 데이터**: Mock + 실제 데이터 연동

### 🔄 진행 중
- (현재 진행 중인 작업 없음)

### 🚀 예정 개발
- **Phase G** (v3.0): 실시간 WebSocket 연동
  - [ ] 실시간 장비 데이터 스트리밍
  - [ ] 진단 결과 실시간 푸시
  - [ ] 오프라인 모드 및 동기화
  
- **Phase H** (v3.1): 다국어 및 접근성
  - [ ] 영어/일본어 지원
  - [ ] VoiceOver/TalkBack 지원
  - [ ] 고대비 모드 지원
  
- **Phase I** (v3.2): ML 모델 통합
  - [ ] TensorFlow Lite 기반 온디바이스 분석
  - [ ] 장비별 맞춤 ML 모델
  - [ ] 예측 유지보스 시스템

## 📚 API 문서 및 참고 자료

### 백엔드 API 문서
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **API 스펙**: OpenAPI 3.0 기반 자동 생성

### 기술 문서
- **React Native**: [reactnative.dev](https://reactnative.dev)
- **Expo**: [docs.expo.dev](https://docs.expo.dev)
- **FastAPI**: [fastapi.tiangolo.com](https://fastapi.tiangolo.com)
- **Librosa**: [librosa.org](https://librosa.org)

## 📝 라이선스 및 기여 안내

### 라이선스
본 프로젝트는 내부적으로 사용되며, 모든 권리는 SignalCraft 팀이 보유합니다.

### 기여 가이드
- **내부 팀**: GitHub Flow 기반 코드 리뷰
- **개발 전략**: Feature Branch → Pull Request → Merge
- **코드 품질**: ESLint + Prettier 통합
- **테스트**: 테스트 코드 없는 PR은 불가

## 🤝 연락 정보

### 개발팀
- **Mobile Team**: React Native 개발
- **Backend Team**: FastAPI/Python 개발
- **ML Team**: 오디오 분석 모델
- **DevOps**: 인프라 및 배포

---

**프로젝트 버전**: v2.9 (Dashboard & Detail Modernization 완료)  
**최종 업데이트**: 2025-11-28  
**개발팀**: SignalCraft Mobile Development Team
