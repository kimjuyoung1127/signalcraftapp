# SignalCraft Mobile - 아키텍처 구조도

## 🏗️ 전체 아키텍처 (Updated 2025-12-09)

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
        I --> K[Diagnosis Tab] // AR Based
        I --> L[System Tab]
        K --> Q[DiagnosisScreen] // Updated: Dynamic Model Selection
    end

    subgraph "UI Components Layer"
        C --> R[ScreenLayout]
        C --> S[DeviceCard]
        C --> T[AudioVisualizer]
        C --> V[AR Components]
        V --> AB[TargetPanel]
        V --> AC[ModelSelector] // Updated: Dynamic List from API
    end

    subgraph "State Management"
        D --> AB_Store[useAuthStore] 
        D --> AC_Store[useDeviceStore] 
        D --> AD_Store[useDiagnosisLogic] // Manages recording & upload
    end
```

## 🧠 AI Analysis Pipeline (Tiered & Multi-Model Architecture)

**장비별 맞춤형 모델 로딩 시스템**이 구축되었습니다. 프론트엔드는 장비 타입을 인식하여 적합한 모델 목록을 요청하고, 백엔드는 해당 모델 ID를 기반으로 추론을 수행합니다.

```mermaid
graph TD
    subgraph "Frontend Flow"
        A[DiagnosisScreen] -->|Detect Device Type| B{Device Type?}
        B -->|Valve/Fan/Pump| C[GET /api/v1/models?device_type=...]
        C -->|List of Models| D[ModelSelector]
        D -->|Select Model| E[Upload Audio + target_model_id]
    end

    subgraph "Backend Execution (PipelineExecutor)"
        E --> F[FastAPI Backend]
        F -->|Queue Task| G[Celery Worker]
        G --> H[PipelineExecutor]
        H --> I[DSPFilter]
        I -->|Processed Audio| J{Model Preference?}
        
        J -->|Level 1| K[AnomalyScorer.score_level1]
        J -->|Level 2| L[AnomalyScorer.score_level2]
    end

    subgraph "Dynamic Model Loading"
        K & L -->|target_model_id| M[ModelLoader]
        M --> N[registry.json]
        N -->|Metadata Lookup| O{File Exists?}
        O -->|Yes| P[Load Specific Model (.pkl/.pth)]
        O -->|No| Q[Load Default Model]
    end

    subgraph "Inference"
        P & Q --> R[Inference Result]
    end

    R --> S[DB: AIAnalysisResult]
```

### 📂 주요 모듈 및 파일 구조 (Updated)

*   **`app/core/config_analysis.py`**: 분석 관련 상수 및 경로 설정.
*   **`app/core/model_loader.py`**: 
    *   `registry.json`을 참조하여 모델 메타데이터 로드.
    *   `get_available_models(device_type)`: 장비 타입별 모델 필터링.
    *   `load_model(target_model_id)`: 요청된 ID의 모델 파일을 동적으로 로드 및 캐싱.
*   **`app/models/registry.json`**: 모델 ID, 파일 경로, 장비 타입 등 메타데이터 저장소.
*   **`app/features/audio_analysis/pipeline_executor.py`**: `target_model_id`를 `AnomalyScorer`로 전달하는 오케스트레이터.
*   **`app/features/audio_analysis/anomaly_scorer.py`**: 
    *   `score_level1` / `score_level2`: `target_model_id`를 인자로 받아 `ModelLoader`를 통해 특정 모델로 추론 수행.
    *   `scikit-learn` (Isolation Forest) 및 `PyTorch` (Autoencoder) 추론 로직 통합.
*   **`app/features/audio_analysis/train.py` & `train_autoencoder.py`**: 
    *   로컬 학습 전용 스크립트. `pandas` 의존성을 함수 내부로 격리하여 서버 배포 시 에러 방지.
    *   학습 완료 시 `registry.json` 자동 업데이트.
*   **`app/api/v1/endpoints/calibration.py`**: `GET /models` 엔드포인트 제공.

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
        E[Mobile App (Expo/React Native)]
        F[Developer PC (Training Environment)]
    end

    E -- HTTP/8000 (API) --> A
    F -- SSH/SCP (Deploy) --> A
```

### 🔄 배포 프로세스 (Deployment)
1.  **Local Training**: 개발자 PC에서 `train.py` 실행 -> 모델 파일 생성 -> `registry.json` 업데이트.
2.  **SCP Transfer**: 코드 및 `app/models` 폴더를 원격 서버로 전송.
3.  **Docker Rebuild**: `docker-compose up -d --build` (필요시 `--no-cache`)로 서비스 갱신.
4.  **Client Update**: 모바일 앱은 API를 통해 최신 모델 목록을 동적으로 받아옴 (앱 업데이트 불필요).