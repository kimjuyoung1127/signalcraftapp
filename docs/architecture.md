# SignalCraft Mobile - 아키텍처 구조도

## 🏗️ 전체 아키텍처

```mermaid
graph TB
    subgraph "Mobile App Layer"
        A[React Native App] --> B[Navigation System]
        A --> C[UI Components]
        A --> D[State Management]
        A --> E[Services Layer]
    end

    subgraph "Navigation Structure"
        B --> F[RootNavigator]
        F --> G[AuthStack]
        F --> H[MainTabNavigator]
        H --> I[Monitor Tab]
        H --> J[System Tab]
        G --> K[OnboardingScreen]
        G --> L[LoginScreen]
        I --> M[DashboardScreen]
        I --> N[DeviceDetailScreen]
    end

    subgraph "UI Components Layer"
        C --> O[ScreenLayout]
        C --> P[DeviceCard]
        C --> Q[AudioVisualizer]
        C --> R[UI Components]
        R --> S[StatusPill]
        R --> T[Buttons]
        R --> U[Input]
    end

    subgraph "State Management"
        D --> V[useAuthStore]
        D --> W[useDeviceStore]
    end

    subgraph "Services Layer"
        E --> X[API Service]
        E --> Y[Auth Service]
        E --> Z[Device Service]
    end

    subgraph "External APIs"
        AA[Backend APIs]
        BB[Mock Data]
        X --> AA
        X --> BB
        Y --> AA
        Y --> BB
        Z --> AA
        Z --> BB
    end
```

## 🏗️ 인프라 아키텍처 (Docker Compose 기반)

```mermaid
graph TB
    subgraph "Docker Compose Infrastructure"
        A[FastAPI Backend]
        B[Redis Broker]
        C[Celery Workers]
        D[AWS RDS PostgreSQL]

        A --> B
        C --> B
        A --> D
        C --> D
    end

    subgraph "Communication Flow"
        E[Client Request] --> A
        A --> B["Redis Queue (Task Submission)"]
        C --> B
        C --> F[AI Analysis Result]
        A --> F
    end
```

## 🔐 인증 아키텍처 (JWT 기반)

```mermaid
graph TB
    subgraph "Authentication Flow"
        A[React Native App]
        B[Login Request]
        C[JWT Token Generation]
        D[Token Verification]
        E[Protected API Access]
        F[Database User Lookup]

        A --> B
        B --> C
        C --> A
        A --> D
        D --> E
        D --> F
    end

    subgraph "Token Lifecycle"
        G[Token Creation]
        H[Token Storage]
        I[Token Validation]
        J[Token Expiration]

        G --> H
        H --> I
        I --> J
    end
```

## 🔄 데이터 흐름도

```mermaid
sequenceDiagram
    participant U as User
    participant S as Screen
    participant ST as Store
    participant SV as Service
    participant API as Backend API
    
    Note over U,API: 로그인 프로세스
    U->>S: 로그인 요청
    S->>ST: 인증 상태 업데이트
    ST->>SV: 로그인 API 호출
    SV->>API: POST /api/login
    API-->>SV: JWT 토큰 반환
    SV-->>ST: 인증 성공
    ST-->>S: 리렌더링 트리거
    S-->>U: 메인 화면으로 이동
    
    Note over U,API: 장비 데이터 조회
    U->>S: 대시보드 접속
    S->>ST: 장비 데이터 요청
    ST->>SV: 장비 목록 조회
    SV->>API: GET /api/devices
    API-->>SV: 장비 데이터 반환
    SV-->>ST: 상태 업데이트
    ST-->>S: 데이터 리렌더링
    S-->>U: 장비 목록 표시
```

## 📱 컴포넌트 트리 구조

```mermaid
graph TD
    A[App] --> B[SafeAreaProvider]
    B --> C[StatusBar]
    B --> D[RootNavigator]
    
    subgraph "인증 전 (Auth Stack)"
        D --> E[AuthStack]
        E --> F[OnboardingScreen]
        E --> G[LoginScreen]
        
        F --> H[ScreenLayout]
        F --> I[PrimaryButton]
        
        G --> J[ScreenLayout]
        G --> K[Input]
        G --> L[PrimaryButton]
    end
    
    subgraph "인증 후 (Main Tab)"
        D --> M[MainTabNavigator]
        M --> N[Monitor Tab]
        M --> O[System Tab]
        
        subgraph "모니터 탭"
            N --> P[DashboardScreen]
            N --> Q[DeviceDetailScreen]
            
            P --> R[ScreenLayout]
            P --> S[DeviceCard]
            P --> T[StatusPill]
            
            Q --> U[ScreenLayout]
            Q --> V[AudioVisualizer]
            Q --> W[StatusPill]
        end
    end
```

## 🗄️ 상태 관리 구조

```mermaid
graph LR
    subgraph "Auth Store"
        A1[isAuthenticated]
        A2[user]
        A3[token]
        A4[demoMode]
    end
    
    subgraph "Device Store"
        B1[devices]
        B2[currentDevice]
        B3[loading]
        B4[error]
    end
    
    subgraph "Actions"
        C1[login/logout]
        C2[fetchDevices]
        C3[setCurrentDevice]
        C4[toggleDemoMode]
    end
    
    A1 --> C1
    A4 --> C1
    B1 --> C2
    B2 --> C3
```

## 🎨 UI 컴포넌트 계층

```mermaid
graph TD
    A[Base Components] --> B[ScreenLayout]
    A --> C[StatusBar]
    
    D[Input Components] --> E[Input]
    D --> F[Buttons]
    
    G[Display Components] --> H[StatusPill]
    G --> I[DeviceCard]
    G --> J[AudioVisualizer]
    
    K[Layout Components] --> L[SafeAreaView]
    K --> M[View]
    K --> N[Text]
    
    B --> L
    B --> C
    E --> N
    E --> M
    F --> M
    H --> N
    I --> H
    J --> M
```

## 📱 SafeArea 처리 아키텍처 (v2.0)

```mermaid
graph TB
    subgraph "SafeArea 처리 계층"
        A[useSafeAreaInsets Hook] --> B[Tab Navigator]
        A --> C[Modal Components]
        A --> D[ScrollView Padding]
        
        B --> E[Bottom Tab Height]
        E --> F[paddingBottom: Math.max(12, bottom)]
        E --> G[height: Math.max(100, bottom + 80)]
        
        D --> H[contentContainerStyle]
        H --> I[paddingBottom: Math.max(16, bottom)]
        
        B --> J[sceneContainerStyle]
        J --> K[backgroundColor + paddingBottom]
    end
    
    subgraph "ScreenLayout 컴포넌트"
        L[SafeAreaView] --> M[StatusBar]
        L --> N[Child Components]
        L --> O[Dynamic SafeArea 처리]
        
        O --> P[paddingTop: insets.top]
        O --> Q[paddingBottom: Math.max(16, insets.bottom)]
        O --> R[paddingHorizontal: 16px]
    end
    
    subgraph "최적화된 네비게이션 흐름"
        S[MainTabNavigator] --> T[useSafeAreaInsets 적용]
        T --> U[동적 높이 계산]
        U --> V[콘텐츠 여백 최적화]
        V --> W[기기별 SafeArea 대응]
    end
```

## 🔌 API 통신 구조

```mermaid
graph TB
    subgraph "Client Side"
        A[React Native App] --> B[Services Layer]
        B --> C[Auth Service]
        B --> D[Device Service]
        B --> E[API Service]
    end

    subgraph "API Endpoints"
        F[Authentication]
        G[Device Management]
        H[Audio Analysis]
    end

    subgraph "Mock Mode"
        I[Mock Auth Data]
        J[Mock Device Data]
        K[Mock Analysis]
    end

    C --> F
    D --> G
    E --> F
    E --> G
    E --> H

    C -.-> I
    D -.-> J
    E -.-> K

    subgraph "Backend Services (Docker Compose)"
        L[FastAPI Server]
        M[Celery Workers]
        N[Redis Broker]
        O[AWS RDS PostgreSQL]
    end

    F --> L
    G --> L
    H --> M
    L --> N
    M --> N
    L --> O
    M --> O
```

## 🔐 인증 처리 구조

```mermaid
sequenceDiagram
    participant RN as React Native App
    participant FP as FastAPI
    participant DB as AWS RDS
    participant JWT as JWT Token

    RN->>FP: 로그인 요청 (이메일/비번)
    FP->>DB: 사용자 정보 조회
    DB-->>FP: 사용자 데이터 반환
    FP->>FP: 비밀번호 검증
    FP->>JWT: JWT 토큰 생성
    JWT-->>RN: 액세스 토큰 반환

    RN->>FP: 인증 API 요청 (토큰 포함)
    FP->>JWT: 토큰 검증
    JWT-->>FP: 사용자 정보 반환
    FP-->>RN: 요청한 데이터 반환
```

## 🔌 비동기 작업 처리 구조

```mermaid
sequenceDiagram
    participant RN as React Native App
    participant FP as FastAPI
    participant RD as Redis
    participant CL as Celery Worker
    participant DB as AWS RDS

    RN->>FP: API 요청 (오디오 분석 등)
    FP->>RD: 작업 큐에 비동기 작업 추가
    FP-->>RN: Task ID 반환 (즉시 응답)
    CL->>RD: 작업 큐에서 작업 가져옴
    CL->>DB: 데이터베이스 작업
    CL->>CL: AI 분석 실행
    CL->>DB: 결과 저장
```

## 🔄 리액트 네비게이션 흐름

```mermaid
stateDiagram-v2
    [*] --> App_Start
    
    App_Start --> Check_Auth
    Check_Auth --> Not_Authenticated: No Token
    Check_Auth --> Authenticated: Has Token
    
    Not_Authenticated --> Onboarding
    Onboarding --> Login
    Login --> Authenticating
    
    Authenticating --> Authenticated: Success
    Authenticating --> Login: Failed
    
    Authenticated --> Main_Tab
    Main_Tab --> Dashboard
    Main_Tab --> Settings
    
    Dashboard --> Device_Detail
    Device_Detail --> Dashboard
    
    Dashboard --> Settings: Tab Switch
    Settings --> Dashboard: Tab Switch
    
    Authenticated --> Login: Logout
    Login --> Check_Auth: Logout Complete
```

## 📊 데이터 모델

```mermaid
erDiagram
    User {
        string id PK
        string email
        string name
        string token
        datetime created_at
    }
    
    Device {
        string id PK
        string model
        string name
        enum status
        float audio_level
        datetime last_seen
        string user_id FK
    }
    
    SensorReading {
        string id PK
        float value
        datetime timestamp
        string device_id FK
    }
    
    AnalysisResult {
        string id PK
        enum result
        float confidence
        audio_file_path
        datetime created_at
        string device_id FK
        string user_id FK
    }
    
    User ||--o{ Device: owns
    Device ||--o{ SensorReading: generates
    Device ||--o{ AnalysisResult: analyzed_by
    User ||--o{ AnalysisResult: requests
```

## 🎯 기능별 모듈 분할

```mermaid
mindmap
  root((SignalCraft Mobile))
    Core Features
      Authentication
        Login Screen
        Onboarding
        Token Management
      Device Monitoring
        Dashboard
        Device List
        Real-time Data
      Audio Analysis
        Recording
        Visualization
        AI Diagnosis
      Navigation Enhancement
        SafeArea Optimizer
        Dynamic Tab Height
        Responsive Layout
    Technical Stack
      Frontend
        React Native
        TypeScript
        NativeWind
      State Management
        Zustand
        Store Architecture
      Navigation
        React Navigation v7
        Tab Navigation
        SafeArea-aware Design
    Infrastructure
      Containerization
        Docker
        Docker Compose
      Backend Services
        FastAPI
        Celery
        Redis
      Database
        PostgreSQL
        AWS RDS
        SQLAlchemy
        asyncpg
      Security & Authentication
        JWT Tokens
        Password Hashing (bcrypt)
        OAuth2
        Token Validation
      API Integration
        RESTful APIs
        Authentication
        Device Data
      Mock System
        Demo Mode
        Test Data
    UI/UX Design
      Design System
        Dark Theme
        Neon Colors
        Cyberpunk Style
      SafeArea Adaptation
        Device-specific Insets
        Dynamic Calculations
        Cross-platform Support
      Components
        Reusable UI
        Custom Components
        Advanced Layout System
```

## 🔧 빌드 및 배포 아키텍처

```mermaid
graph TB
    subgraph "Development Environment"
        A[Source Code] --> B[TypeScript]
        B --> C[Babel Transpilation]
        C --> D[Metro Bundler]
        D --> E[Development Build]
    end
    
    subgraph "Expo Workflow"
        E --> F[Expo Development Server]
        F --> G[Hot Reloading]
        F --> H[Debugging Tools]
    end
    
    subgraph "Production Build"
        I[Source Code] --> J[Production Build]
        J --> K[App Bundle Generation]
        K --> L[App Store Distribution]
        K --> M[Google Play Distribution]
    end
    
    subgraph "Testing Pipeline"
        N[Unit Tests]
        O[Integration Tests]
        P[E2E Testing]
        N --> Q[Test Reports]
        O --> Q
        P --> Q
    end
```

## 🚀 최신 업데이트 사항 (v2.0)

### 📱 SafeArea 처리 시스템 완전 개편 (2025-11-23)
- **scanner-project 기반 패턴 적용**: 검증된 SafeArea 처리 방식 도입
- **동적 SafeArea 계산**: `useSafeAreaInsets` 훅을 통한 실시간 인셋값 계산
- **반응형 네비게이션**: 기기별 하단 SafeArea에 맞춘 자동 높이 조절
- **콘텐츠 여백 최적화**: `Math.max(16, bottom)`을 통한 하단 가림 현상 완전 해결

### 🔧 네비게이션 아키텍처 개선
- **Tab Navigator 강화**: `Math.max(100, bottom + 80)` 동적 높이 계산
- **sceneContainerStyle 추가**: 콘텐츠와 탭 사이 안전한 여백 확보
- **ScreenLayout 최적화**: SafeAreaView 기반 안정적 레이아웃 시스템
- **크로스플랫폼 호환성**: iOS/Android 기기별 최적화

### 🎨 UI/UX 향상
- **데모운영자 → 설정 버튼**: 톱니바퀴 아이콘으로 교체 및 기능 구현
- **오디오 분석 대시보드**: 동적 지표 시스템 및 고조파 분석 차트
- **Industrial Cyberpunk 유지**: 기존 디자인 시스템 그대로 보존
- **애니메이션 성능**: 심장 비주얼라이저 그대로 유지

### 📊 기술적 성과
- **SafeAreaView 경고 완전 해결**: react-native-safe-area-context 정확한 사용법 적용
- **메모리 최적화**: 불필요한 뷰 중첩 제거 및 렌더링 성능 향상
- **타입 안정성**: TypeScript strict 모드 적용 계획
- **테스트 준비**: 통합 테스트 환경 구축 완료

### 🔄 개발 플로우 개선
- **기준 프로젝트 참조**: scanner-project에서 성공적인 패턴 학습 및 적용
- **점진적 업데이트**: 기존 기능 유지하며 안전한 업그레이드 진행
- **문화 제도화**: 성공적인 패턴 문서화 및 재사용 가능한 아키텍처 확립
- **품질 관리**: 지속적인 리팩토링 및 최적화 프로세스 수립

---

**문서 버전**: 2.0  
**작성일**: 2025-11-23  
**마지막 수정**: 2025-11-23  
**담당팀**: SignalCraft Mobile Development Team  
**참고 프로젝트**: scanner-project (성공적인 SafeArea 패턴)
