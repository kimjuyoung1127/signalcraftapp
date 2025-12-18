# SignalCraft Mobile Roadmap

## 🗺️ 통합 개발 로드맵 (Backend & Frontend)
나중에 뜯어고치는 일을 막기 위해, **"백엔드는 API화", "프론트엔드는 모듈화"**에 집중하는 로드맵입니다.

## 📅 진행 상황 (2025-12-09 기준)

### ✅ 완료된 작업 (Phase A ~ N) + Multi-Model Upgrade

#### 1. Core & Infrastructure
- [✓] **Phase 0 ~ 1**: Docker Compose 인프라, FastAPI 인증(JWT), 기본 CRUD.
- [✓] **Phase H**: Remote Server Deployment (AWS/Cloud) & PostgreSQL 외부 접속 설정.
- [✓] **Phase H-2**: Cloud Storage (Cloudflare R2) 연동 및 대용량 파일 처리.
- [✓] **Phase N: Production Deployment & Stabilization**
    - [✓] **Optimized Docker Build**: CPU-only PyTorch 설치로 이미지 용량 축소.
    - [✓] **Dependency Optimization**: `pandas` 의존성을 로컬 학습 환경으로 격리하여 서버 이미지 경량화 및 실행 오류 해결.
    - [✓] **Code Transfer**: SCP를 통한 코드 및 학습된 모델 파일(`.pth`, `.pkl`) 원격 서버 전송 자동화.
    - [✓] **Remote Rebuild**: `docker system prune`을 통한 디스크 공간 확보 및 클린 빌드/배포 프로세스 확립.

#### 2. Frontend (React Native)
- [✓] **Phase 1 ~ 2**: Industrial Cyberpunk 디자인, 오디오 비주얼라이저, 대시보드.
- [✓] **Phase C+**: AR 오디오 진단 시스템 (Terminator HUD).
- [✓] **Phase D ~ G**: 백엔드 API 연동, 하이브리드 데모 모드, 상세 리포트 UI.
- [✓] **Phase M: Frontend Integration (Model Selector)**
    - [✓] `ModelSelector.tsx` UI 업데이트: 동적 모델 리스트 렌더링.
    - [✓] `DiagnosisScreen.tsx`: `deviceId` 기반 장비 타입 자동 추론 및 적합한 모델 자동 선택 UX 구현.
- [✓] **Phase 4: Dynamic Frontend UI (Multi-Model)**
    - [✓] **Dynamic Model List**: `AnalysisService.getAvailableModels(deviceType)` 구현.
    - [✓] **API Integration**: 백엔드 `GET /api/v1/models` 연동 및 `target_model_id` 전달 로직 구현.
    - [✓] **Compatibility Fixes**: `expo-file-system` legacy import 문제 및 스타일 참조 에러 수정.

#### 3. AI & Audio Analysis (Deep-Dive)
- [✓] **Phase C ~ D**: Librosa 기반 기초 분석, WAV 변환 파이프라인.
- [✓] **Phase D-3**: MIMII 데이터셋 검증 & Isolation Forest 학습.
- [✓] **Phase J: Architecture Refactoring & DSP Optimization**
    - [✓] **설정 중앙화**: `app/core/config_analysis.py` 도입.
    - [✓] **모듈 분리**: `pipeline_executor.py`, `dsp_filter.py`, `anomaly_scorer.py` 구조 확립.
- [✓] **Phase K: Per-Device Calibration (Adaptive Thresholds)**
    - [✓] **DB 스키마**: `devices` 테이블에 `calibration_data` (JSONB) 컬럼 추가.
    - [✓] **Calibration API**: `POST /api/v1/devices/{id}/calibrate` 엔드포인트 구현.
- [✓] **Phase L: Tiered AI Pipeline (Cascading Architecture)**
    - [✓] **Level 1 (Screening)**: Rule-based + Isolation Forest (CPU 기반 고속 판정).
    - [✓] **Level 2 (Precision)**: PyTorch 기반 `Industrial Autoencoder` 모델 학습 및 추론 구현.
    - [✓] **Model Loader**: `app/core/model_loader.py` 확장 - `target_model_id` 기반 동적 로딩 및 `device_type` 필터링 지원.
    - [✓] **Inference Logic**: `AnomalyScorer`가 `target_model_id`를 받아 특정 모델 파일(`.pkl`, `.pth`)을 로드하여 추론하도록 수정.
- [✓] **Phase 1 & 1+: Training Flexibility & Versioning**
    - [✓] **Script Update**: `train.py`, `train_autoencoder.py` - CSV/WAV 지원, 메타데이터 생성, 인코딩 오류(`utf-8`) 수정.
    - [✓] **Model Registry**: `registry.json` 기반 모델 관리 및 자동 등록 시스템 구축.

### 🔄 향후 계획 (Future Roadmap)

- [ ] **Phase O: Real-time Streaming Analysis**
    - [ ] WebSocket 기반 실시간 오디오 스트리밍 및 분석 (River 라이브러리 활용).
- [ ] **Phase P: Edge AI Optimization**
    - [ ] 모바일 기기 내(On-device) 추론을 위한 TFLite/ONNX 변환.
- [ ] **Phase Q: Feedback Loop & Active Learning**
    - [ ] 사용자 피드백(정탐/오탐) 수집 UI 및 모델 재학습 파이프라인.

---

### 📝 주요 변경 파일 (Last Update)

**Frontend:**
- `src/features/diagnosis/screens/DiagnosisScreen.tsx`: 장비 타입 추론 및 모델 선택 로직.
- `src/features/diagnosis/components/ModelSelector.tsx`: 동적 모델 리스트 UI.
- `src/features/diagnosis/services/analysisService.ts`: 모델 목록 API 호출 및 `ENV` import 수정.

**Backend:**
- `app/api/v1/endpoints/calibration.py`: `GET /models` API (`device_type` 필터링 추가).
- `app/core/model_loader.py`: `target_model_id` 로딩 및 레지스트리 필터링 로직.
- `app/features/audio_analysis/anomaly_scorer.py`: 동적 모델 로딩을 위한 추론 로직 변경.
- `app/features/audio_analysis/train.py` & `train_autoencoder.py`: 학습 스크립트 인코딩 및 `pandas` 의존성 격리.

**Configuration:**
- `app/models/registry.json`: Valve, Pump 등 장비별 모델 등록 정보.

---

**마지막 업데이트**: 2025-12-09
**담당자**: SignalCraft Mobile Development Team