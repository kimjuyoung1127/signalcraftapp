# SignalCraft 다중 모델 시스템 업그레이드 플랜 (Multi-Model MLOps)

## 🎯 목표 (Objective)
1.  **학습 유연성**: 데이터셋 경로와 출력 파일명만 지정하면 원하는 모델(`.pth`, `.pkl`)을 생성하여 `app/models`에 저장.
2.  **동적 선택**: 프론트엔드(`ModelSelector`)에서 고정된 목록이 아닌, 서버에 저장된 다양한 맞춤형 모델(펌프용, 팬용 등)을 동적으로 불러와 선택 가능하게 함.

---

## 📅 실행 플랜 (Action Plan)

### ✅ Phase 1: 학습 스크립트 유연화 (Flexible Training Scripts)
현재 하드코딩된 경로(`config_analysis.py` 의존)를 CLI 인자 기반으로 변경하여, 다양한 데이터셋으로 여러 모델을 쉽게 학습할 수 있게 만듭니다.

- [x] **`train_autoencoder.py` 수정**: `argparse` 도입.
    - 입력: `--data_dir` (학습 데이터 경로, 기본값: `data_backup/normal`)
    - 출력: `--output_name` (저장될 파일명, 예: `fan_autoencoder_v1.pth`)
    - 실행 예시: `python -m app.features.audio_analysis.train_autoencoder --data_dir "C:\Users\gmdqn\singalcraftapp\data_backup\normal" --output_name "pump_autoencoder_v1.pth"`
- [x] **`train.py` (Isolation Forest) 수정**: 동일하게 `argparse` 도입.
    - 입력: `--data_dir`, `--output_if_name`, `--output_scaler_name`
    - 실행 예시: `python -m app.features.audio_analysis.train --data_dir "C:\Users\gmdqn\singalcraftapp\data_backup\normal" --output_if_name "pump_if_v1.pkl" --output_scaler_name "pump_scaler_v1.pkl"`

### ✅ Phase 1+: 모델 버전 관리 (Metadata & Versioning)
단순히 모델 파일만 저장하는 것이 아니라, 학습 당시의 정보(데이터셋, 파라미터, 성능)를 함께 기록하여 추적 가능성을 확보합니다.

- [x] **학습 스크립트 업데이트**: `train_autoencoder.py` 및 `train.py` 수정.
    - 학습 완료 시, 모델 파일명과 동일한 이름의 JSON 파일 생성 (예: `fan_v1.pth` -> `fan_v1_meta.json`).
    - **저장 내용**:
        - `created_at`: 학습 일시
        - `dataset_path`: 사용된 데이터셋 경로
        - `sample_count`: 학습에 사용된 샘플 수
        - `parameters`: Epochs, Learning Rate, Batch Size 등
        - `metrics`: Final Loss, Validation Score 등

### ✅ Phase 2: 모델 레지스트리 구축 (Model Registry)
생성된 모델 파일들을 체계적으로 관리하기 위해 메타데이터 파일을 도입합니다.

- [x] **`app/models/registry.json` 생성**:
    ```json
    {
      "models": [
        {
          "id": "pump_autoencoder_default",
          "name": "펌프용 Autoencoder (기본)",
          "type": "level2_autoencoder",
          "file_name": "autoencoder.pth",
          "meta_file": "autoencoder_meta.json",
          "description": "기본 펌프 데이터셋 기반 표준 모델"
        },
        {
          "id": "pump_isolation_forest_default",
          "name": "펌프용 Isolation Forest (기본)",
          "type": "level1_isolation_forest",
          "file_name": "isolation_forest_model.pkl",
          "meta_file": "isolation_forest_model_meta.json",
          "description": "기본 펌프 데이터셋으로 학습된 Isolation Forest 모델",
          "is_default": true
        }
      ]
    }
    ```
- [x] **학습 스크립트 연동**: 학습 완료 시 `registry.json`에 자동으로 새 모델 정보를 등록하는 로직 추가.

### ✅ Phase 3: 백엔드 동적 로딩 (Dynamic Loading)
클라이언트 요청에 따라 적절한 모델을 메모리에 로드하거나 스위칭합니다.

- [x] **`ModelLoader` (app/core/model_loader.py) 개선**:
    - 단일 `_autoencoder_model` 변수 대신 `_loaded_models = {}` 딕셔너리 사용.
    - `load_model(model_id)` 메서드: `registry.json`을 참조하여 해당 `file`을 로드하고 캐싱.
- [x] **`PipelineExecutor` 수정**:
    - `analyze_audio_file`에서 `model_preference` (예: `level2`) 뿐만 아니라 `target_model_id` (예: `fan_v1`)를 인자로 수신.
- [x] **API 업데이트**:
    - `GET /api/v1/models`: 프론트엔드가 선택 가능한 모델 목록(`registry.json` 내용)을 조회하는 엔드포인트 추가.

### ✅ Phase 4: 프론트엔드 동적 UI (Dynamic Frontend)
하드코딩된 `AVAILABLE_MODELS`를 제거하고 서버 데이터로 대체합니다.

- [x] **API Service 추가**: `AnalysisService.getAvailableModels()` 구현.
- [x] **`ModelSelector.tsx` 수정**:
    - `useEffect`로 컴포넌트 마운트 시 모델 목록을 Fetch.
    - 받아온 목록으로 `FlatList` 렌더링.
- [x] **`DiagnosisScreen` & `useDiagnosisLogic` 연결**:
    - 선택된 모델의 `id`를 업로드 API 호출 시 함께 전송 (`model_id` 필드 추가).

---

## 🚀 기대 효과
*   **확장성**: 코드를 수정하지 않고도 새로운 장비(압축기, 모터, 벨트 등) 모델을 추가할 수 있습니다.
*   **운영 효율성**: 현장 상황에 맞춰 엔지니어가 앱에서 즉시 최적의 모델을 선택할 수 있습니다.