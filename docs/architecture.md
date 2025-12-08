# SignalCraft Mobile - 아키텍처 구조도

## 🏗️ 전체 아키텍처 (Updated 2025-12-07)

```mermaid
graph TB
    subgraph "Mobile App Layer"
        A[React Native App] --> B[Navigation System]
        A --> C[UI Components]
        A --> D[State Management]
        A --> E[Services Layer]
        A --> F[Hooks Layer]
    end

    subgraph "Navigation Structure"
        B --> G[RootNavigator]
        G --> H[AuthStack]
        G --> I[MainTabNavigator]
        I --> J[Monitor Tab]
        I --> K[Diagnosis Tab] // Updated (AR Based)
        I --> L[System Tab]
        H --> M[OnboardingScreen]
        H --> N[LoginScreen]
        J --> O[DashboardScreen]
        J --> P[DeviceDetailScreen]
        J --> P2[AddDeviceScreen] // Added: Admin Feature
        K --> Q[DiagnosisScreen] // Updated
    end

    subgraph "UI Components Layer"
        C --> R[ScreenLayout]
        C --> S[DeviceCard]
        C --> T[AudioVisualizer]
        C --> U[Common UI (Button, Input, Pill)]
        C --> V[AR Components] // Added
        V --> W[DiagnosisCamera]
        V --> X[AROverlay]
        V --> Y[TargetReticle]
        V --> Z[HoloTelemetry]
        V --> AA[TacticalTrigger]
        V --> AB[TargetPanel] // Added: Context Display
        V --> AC[ModelSelector] // Added: Level 1/2 Switch
    end

    subgraph "State Management"
        D --> AB_Store[useAuthStore (isAdmin)] 
        D --> AC[useDeviceStore] 
        D --> AD[useDiagnosisLogic (modelPreference)] // Updated
    end
```

## 🧠 AI Analysis Pipeline (Tiered Architecture)

새로운 **계층적 AI 파이프라인 (Tiered AI Pipeline)**은 리소스 효율성과 진단 정확도를 동시에 만족시키기 위해 설계되었습니다.

```mermaid
graph TD
    subgraph "Request Flow"
        A[Mobile App] -->|Upload Audio + Model Pref| B[FastAPI Backend]
        B -->|Queue Task| C[Celery Worker]
    end

    subgraph "Execution Engine (PipelineExecutor)"
        C --> D[PipelineExecutor]
        D --> E[DSPFilter]
        E -->|Resample 16k & Bandpass| F[Processed Audio]
        
        F --> G{Model Preference?}
        G -->|Level 1| H[AnomalyScorer.score_level1]
        G -->|Level 2| I[AnomalyScorer.score_level2]
    end

    subgraph "Level 1: Screening (CPU)"
        H --> J[Rule-based Logic]
        H --> K[Isolation Forest]
        J & K --> L[Final Score (L1)]
    end

    subgraph "Level 2: Precision (Deep Learning)"
        I --> M[ModelLoader (Singleton)]
        M --> N[Industrial Autoencoder (PyTorch)]
        N -->|Reconstruction Error| O[Final Score (L2)]
    end

    L & O --> P[DB: AIAnalysisResult]
```

### 📂 주요 모듈 구조

*   **`app/core/config_analysis.py`**: 분석 관련 상수(주파수 대역, 임계값 등) 및 경로 중앙 관리.
*   **`app/features/audio_analysis/pipeline_executor.py`**: 분석 프로세스를 총괄하는 오케스트레이터.
*   **`app/features/audio_analysis/dsp_filter.py`**: `scipy` 기반의 신호 처리 (리샘플링, 필터링, 엔벨로프 분석).
*   **`app/features/audio_analysis/anomaly_scorer.py`**: 실제 이상 점수 계산 (Level 1 & Level 2 로직 포함).
*   **`app/api/v1/endpoints/calibration.py`**: 장비별 캘리브레이션 API.

## 🏗️ 인프라 아키텍처 (Docker Compose 기반)

```mermaid
graph TB
    subgraph "Remote Server (Production Environment)"
        A[FastAPI Backend]
        B[Redis Broker]
        C[Celery Workers]
        D[PostgreSQL DB]
        R2[Cloudflare R2 Object Storage]
        
        A --> B
        C --> B
        A --> D
        C --> D
        A -- Upload/Delete --> R2
        C -- Download --> R2
    end

    subgraph "Client Side"
        E[Mobile App (Release APK)]
        F[Developer PC]
    end

    subgraph "Network & Security"
        G[Firewall (UFW)]
        H[SSH Tunnel (Optional)]
    end

    E -- HTTP/8000 --> G
    G --> A
    F -- SSH/22 --> G
    F -- Tunnel/5432 --> H
    H --> D
```
