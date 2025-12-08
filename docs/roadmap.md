# SignalCraft Mobile Roadmap

## 🗺️ 통합 개발 로드맵 (Backend & Frontend)
나중에 뜯어고치는 일을 막기 위해, **"백엔드는 API화", "프론트엔드는 모듈화"**에 집중하는 로드맵입니다.

## 📅 진행 상황 (2025-12-07 기준)

### ✅ 완료된 작업 (Phase A ~ N)

#### 1. Core & Infrastructure
- [✓] **Phase 0 ~ 1**: Docker Compose 인프라, FastAPI 인증(JWT), 기본 CRUD.
- [✓] **Phase H**: Remote Server Deployment (AWS/Cloud) & PostgreSQL 외부 접속 설정.
- [✓] **Phase H-2**: Cloud Storage (Cloudflare R2) 연동 및 대용량 파일 처리.

#### 2. Frontend (React Native)
- [✓] **Phase 1 ~ 2**: Industrial Cyberpunk 디자인, 오디오 비주얼라이저, 대시보드.
- [✓] **Phase C+**: AR 오디오 진단 시스템 (Terminator HUD).
- [✓] **Phase D ~ G**: 백엔드 API 연동, 하이브리드 데모 모드, 상세 리포트 UI.
- [✓] **Phase M: Frontend Integration (Model Selector)**
    - [✓] `ModelSelector.tsx` UI 업데이트: Level 1 (Hybrid ML) vs Level 2 (Autoencoder) 선택 기능.
    - [✓] `useDiagnosisLogic.ts`: 선택된 모델 ID(`level1`, `level2`)를 API 호출 시 전달.

#### 3. AI & Audio Analysis (Deep-Dive)
- [✓] **Phase C ~ D**: Librosa 기반 기초 분석, WAV 변환 파이프라인.
- [✓] **Phase D-3**: MIMII 데이터셋 검증 & Isolation Forest 학습.
- [✓] **Phase J: Architecture Refactoring & DSP Optimization**
    - [✓] **설정 중앙화**: `app/core/config_analysis.py` 도입 (절대 경로 제거, 환경 독립성 확보).
    - [✓] **모듈 분리**: `analyzer.py` 제거 → `pipeline_executor.py` (Orchestrator), `dsp_filter.py` (Preprocessing), `anomaly_scorer.py` (Inference)로 분리.
    - [✓] **DSP 강화**: `noisereduce` 제거, `scipy` 기반 Bandpass Filter 및 강제 리샘플링(16kHz) 적용.
- [✓] **Phase K: Per-Device Calibration (Adaptive Thresholds)**
    - [✓] **DB 스키마**: `devices` 테이블에 `calibration_data` (JSONB) 컬럼 추가.
    - [✓] **Calibration API**: `POST /api/v1/devices/{id}/calibrate` 엔드포인트 구현.
    - [✓] **Dynamic Logic**: `anomaly_scorer.py`에서 장비별 평균/표준편차를 기반으로 임계값(Threshold) 동적 계산.
- [✓] **Phase L: Tiered AI Pipeline (Cascading Architecture)**
    - [✓] **Level 1 (Screening)**: Rule-based + Isolation Forest (CPU 기반 고속 판정).
    - [✓] **Level 2 (Precision)**: PyTorch 기반 `Industrial Autoencoder` 모델 학습 및 추론 구현.
    - [✓] **Model Loader**: `app/core/model_loader.py` 싱글톤 패턴으로 모델 메모리 관리.
    - [✓] **Inference Logic**: `score_level2` 메서드 구현 (Reconstruction Error 기반 이상 탐지).

#### 4. Deployment & Operations
- [✓] **Phase N: Production Deployment**
    - [✓] **Optimized Docker Build**: CPU-only PyTorch 설치로 이미지 용량 1/10 축소.
    - [✓] **Code Transfer**: SCP를 통한 코드 및 학습된 모델 파일(`.pth`) 원격 서버 전송.
    - [✓] **Remote Rebuild**: 원격 서버 Docker 컨테이너 재빌드 및 서비스 갱신 완료.

---

### 🔄 향후 계획 (Future Roadmap)

- [ ] **Phase O: Real-time Streaming Analysis**
    - [ ] WebSocket 기반 실시간 오디오 스트리밍 및 분석 (River 라이브러리 활용).
- [ ] **Phase P: Edge AI Optimization**
    - [ ] 모바일 기기 내(On-device) 추론을 위한 TFLite/ONNX 변환.
- [ ] **Phase Q: Feedback Loop & Active Learning**
    - [ ] 사용자 피드백(정탐/오탐) 수집 UI 및 모델 재학습 파이프라인.

---

**마지막 업데이트**: 2025-12-07
**담당자**: SignalCraft Mobile Development Team