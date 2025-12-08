# SignalCraft 모바일 개발 플랜 (Revised 2025-12-07 v5)

---

### 🚀 개발 우선순위 (Development Priority)

| 순위 | 목표 | 핵심 전략 | 이유 |
| :--- | :--- | :--- | :--- |
| **1 (즉시)** | **구조적 안전성 및 효율화** | **Refactoring & DSP** | 절대 경로 제거, 설정 중앙화, 경량 DSP 필터 도입, 역할별 모듈 분리로 엔터프라이즈급 기반 마련. |
| **2 (필수)** | **현장 적응력 확보** | **Few-shot Calibration** | 장비마다 다른 정상 소음 레벨을 학습하여 오탐지(False Alarm) 방지. |
| **3 (고도화)** | **정밀도 향상 (Deep Learning)** | **Cascading AI Pipeline** | 1차 스크리닝(통계)과 2차 정밀진단(딥러닝)을 분리하여 리소스 효율화 및 정확도 극대화. |
| **4 (배포)** | **운영 서버 적용** | **Remote Deployment** | 검증된 코드를 실제 원격 서버에 배포하고 Docker 컨테이너를 재빌드하여 서비스 갱신. |

---

### 📅 상세 구현 플랜 (Implementation Plan)

#### ✅ 1. [Phase J] 아키텍처 리팩토링 & DSP 최적화 (Architecture & Signal Processing)
*   **목표**: 환경 독립성 확보, 무거운 라이브러리 제거, 경량 DSP 전환, 설정 중앙화, 역할별 모듈 분리.
*   **핵심 변경 사항**:
    1.  **설정 중앙화**: 경로 및 물리 상수(Threshold, Frequency 등)를 `config.py`로 통합 관리.
    2.  **DSP 최적화**: `noisereduce` 제거 → `scipy` 기반 Bandpass Filter + **강제 리샘플링 (16kHz)**.
    3.  **책임 분리**: `pipeline_executor.py` (조율) / `dsp_filter.py` (전처리) / `anomaly_scorer.py` (점수).

    - [x] **중앙 설정 관리**: `app/core/config_analysis.py` 생성.
        *   `pathlib` 기반 상대 경로 (`BASE_DIR`, `MODEL_DIR`).
        *   분석 상수 (`SAMPLE_RATE=16000`, `BP_LOW=2000`, `BP_HIGH=10000`).
        *   임계값 기본값 (`RMS_WARN=0.5`, `RMS_CRIT=0.8`).
    - [x] **DSP 모듈 생성**: `app/features/audio_analysis/dsp_filter.py` 생성.
        *   `noisereduce` 제거.
        *   **Resampling**: 입력 오디오를 무조건 `config.SAMPLE_RATE`(16kHz)로 변환.
        *   **Bandpass Filter**: `scipy.signal.butter` 활용하여 관심 대역만 추출.
    - [x] **Scorer 모듈 생성**: `app/features/audio_analysis/anomaly_scorer.py` 생성.
        *   ML 모델 추론 및 Rule-based 점수 계산 로직 이동.
        *   향후 앙상블 확장을 고려한 클래스 구조 설계.
    - [x] **Executor 재정의**: `app/features/audio_analysis/pipeline_executor.py` (구 analyzer.py 대체).
        *   `dsp_filter` -> `ml_model` -> `anomaly_scorer` 순차 실행.
        *   `async def analyze(...)` 구조로 비동기 실행 지원.

#### ✅ 2. [Phase K] 장비별 캘리브레이션 (Adaptive Thresholds)

*   **목표**: 장비별 고유한 '정상 범위'를 설정하여 정밀도를 높입니다.
*   **핵심 변경 사항**: API 버전 관리(`v1`) 도입 및 동적 임계값 적용.

    - [x] **API Versioning**: `app/main.py` 및 라우터 구조 변경.
        *   `/api/mobile/...` → `/api/v1/mobile/...`.
    - [x] **DB 스키마**: `devices` 테이블에 `calibration_data` (JSON) 컬럼 추가.
    - [x] **Calibration API**: `app/api/v1/endpoints/calibration.py` 생성.
    - [x] **Logic Integration**: `anomaly_scorer.py` 수정.
        *   DB의 캘리브레이션 값을 읽어 `config.py`의 기본값 대신 사용 (Override).

#### ✅ 3. [Phase L] 계층적 딥러닝 파이프라인 (Tiered AI Architecture)

*   **목표**: 모든 데이터에 무거운 모델을 돌리는 비효율을 막고, 통계 모델의 '콜드 스타트' 강점과 딥러닝의 '정밀 진단' 강점을 결합합니다.
*   **핵심 전략**: **Level 1 (Screening)** + **Level 2 (Precision)** 단계별 실행.

    - [x] **Level 1 (Base Model)**: `Isolation Forest` + `Rule-based`
        *   항상 실행. CPU 기반 초고속 판정.
        *   역할: "정상" vs "의심". 명확한 정상 데이터는 여기서 종료하여 리소스 절약.
    - [x] **Level 2 (Advanced Model)**: `Industrial Autoencoder` (PyTorch)
        *   **조건부 실행**: Level 1에서 'WARNING' 이상이거나 점수가 애매한 경우에만 트리거.
        *   역할: 정밀 진단, 미세 패턴(내륜/외륜 마모 등) 분류, 오탐지(False Alarm) 필터링.
    - [x] **Implementation**:
        *   `pipeline_executor.py`에 조건부 분기 로직(Cascading Logic) 구현.
        *   Level 1 결과가 'NORMAL'이고 신뢰도가 높으면 Level 2 생략.

#### ✅ 4. [Phase M] Frontend Integration (Model Selector)

*   **목표**: 사용자가 진단 시 모델(레벨)을 직접 선택하거나, 현재 작동 중인 AI 엔진을 시각적으로 확인할 수 있게 합니다.

    - [x] **UI Update**: `src/features/diagnosis/components/ModelSelector.tsx` 옵션 갱신.
        *   `Hybrid ML (Level 1)`: 기본값 (빠른 진단).
        *   `Deep Autoencoder (Level 2)`: 정밀 진단 (강제 실행 옵션).
    - [x] **Logic Integration**: `useDiagnosisLogic.ts` 수정.
        *   `uploadAudio` 호출 시 `selectedModel` 정보(`level1` or `level2`)를 파라미터로 전달.
    - [x] **API Payload**: 백엔드 업로드 API가 `model_preference` 필드를 수신하도록 변경 및 `pipeline_executor`에 전달.

#### ✅ 5. [Phase N] Production Deployment (Remote Server)

*   **목표**: 수정된 백엔드 코드를 원격 서버(`3.39.x.x`)에 안전하게 배포하고, Docker 환경을 재빌드하여 변경 사항을 적용합니다.
*   **참고**: `docs/docker_commands.md`

    - [ ] **Dependency Update**: `requirements.txt` 정리 (Remove `noisereduce`, Add `torch`, `scipy`).
    - [ ] **Code Transfer (SCP)**: 로컬 코드를 원격 서버로 전송.
        ```powershell
        # PowerShell
        scp -r -i "C:\Users\gmdqn\pem\signalcraft.pem" C:\Users\gmdqn\singalcraftapp\app ubuntu@3.39.124.0:/home/ubuntu/singalcraftapp/
        scp -i "C:\Users\gmdqn\pem\signalcraft.pem" C:\Users\gmdqn\singalcraftapp\requirements.txt ubuntu@3.39.124.0:/home/ubuntu/singalcraftapp/
        ```
    - [ ] **Remote Rebuild**: SSH 접속 후 컨테이너 재빌드 (새 라이브러리 설치).
        ```bash
        ssh -i "C:\Users\gmdqn\pem\signalcraft.pem" ubuntu@3.39.124.0
        cd /home/ubuntu/singalcraftapp
        docker-compose down
        docker-compose up -d --build  # Rebuild is mandatory for requirements changes
        docker system prune -f        # Cleanup old images
        ```
    - [ ] **Health Check**: 로그 확인 및 API 테스트.
        ```bash
        docker-compose logs -f --tail 100 backend
        ```

---
**Note**: `requirements.txt`에서 `noisereduce` 제거, `scipy`, `numpy`, `torch` 등 필수 라이브러리 최적화.