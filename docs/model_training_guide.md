# SignalCraft AI 모델 학습 가이드

이 문서는 SignalCraft 백엔드 시스템에서 사용할 Autoencoder 및 Isolation Forest 모델을 학습하고 관리하는 방법을 설명합니다. 학습 스크립트는 WAV 또는 CSV 형식의 정상 데이터를 사용하여 모델을 생성하고, 모델 메타데이터를 자동으로 기록하며, 시스템의 `registry.json` 파일에 등록합니다.

---

## 1. 로컬 환경 설정 (Pandas 설치)

학습 스크립트가 CSV 형식의 데이터셋을 처리하기 위해 `pandas` 라이브러리가 필요합니다. 로컬 개발 환경의 가상환경에 `pandas`를 설치해주세요.

```powershell
# 1. 프로젝트 폴더로 이동 (이미 이동해 있다면 건너뛰기)
# cd C:\Users\gmdqn\singalcraftapp

# 2. 가상환경 활성화 (PowerShell 기준)
.\.venv\Scripts\Activate.ps1

# 3. pandas 설치
pip install pandas
```
(Windows CMD나 Git Bash/WSL에서는 가상환경 활성화 명령어가 다를 수 있습니다. `source ./.venv/bin/activate` 등을 사용하세요.)

---

## 2. 데이터셋 준비

학습 스크립트는 `--data_dir` 인자를 통해 학습 데이터셋이 있는 폴더를 지정합니다. 각 데이터셋은 별도의 폴더에 보관하는 것이 좋습니다.

**권장되는 데이터셋 폴더 구조:**

```
C:\Users\gmdqn\singalcraftapp\
├── data_backup\
│   ├── pump_normal_v1\           # 펌프용 정상 데이터셋 (WAV 또는 CSV)
│   │   ├── data_001.wav/csv
│   │   └── ...
│   ├── fan_normal_v1\            # 팬용 정상 데이터셋 (WAV 또는 CSV)
│   │   ├── data_fan_001.wav/csv
│   │   └── ...
│   └── valve_normal_v1\          # 밸브용 정상 데이터셋 (WAV 또는 CSV)
│       ├── S_N(1).csv           # 밸브 데이터셋은 CSV로 추정됨
│       └── ...
└── app\
    └── models\                   # 학습된 모델 및 메타데이터 저장 경로
        ├── autoencoder.pth
        ├── autoencoder_meta.json
        ├── isolation_forest_model.pkl
        ├── isolation_forest_model_meta.json
        ├── registry.json
        └── ...
```

---

## 3. AI 모델 학습 명령어

프로젝트 루트 디렉토리(`C:\Users\gmdqn\singalcraftapp`)에서 가상환경을 활성화한 후 다음 명령어를 실행합니다.

### 3.1. Autoencoder 모델 학습

`train_autoencoder.py` 스크립트는 `level2_autoencoder` 타입의 모델을 학습합니다.

```powershell
python -m app.features.audio_analysis.train_autoencoder ^
--data_dir "C:\Users\gmdqn\singalcraftapp\data_backup\valve_normal_v1" ^
--output_name "valve_autoencoder_v1.pth"
```

*   **`--data_dir`**: 학습에 사용할 정상 데이터 파일(WAV 또는 CSV)이 있는 폴더의 경로입니다.
*   **`--output_name`**: 저장될 Autoencoder 모델 파일의 이름 (확장자 `.pth` 포함). 이 이름이 `registry.json`에 `file_name`으로 등록되며, `id`는 이 파일명에서 확장자를 제외한 부분이 됩니다.

### 3.2. Isolation Forest 모델 학습

`train.py` 스크립트는 `level1_isolation_forest` 타입의 모델과 해당 Scaler를 학습합니다.

```powershell
python -m app.features.audio_analysis.train ^
--data_dir "C:\Users\gmdqn\singalcraftapp\data_backup\valve_normal_v1" ^
--output_if_name "valve_if_v1.pkl" ^
--output_scaler_name "valve_scaler_v1.pkl"
```

*   **`--data_dir`**: 학습에 사용할 정상 데이터 파일(WAV 또는 CSV)이 있는 폴더의 경로입니다.
*   **`--output_if_name`**: 저장될 Isolation Forest 모델 파일의 이름 (확장자 `.pkl` 포함).
*   **`--output_scaler_name`**: 저장될 `StandardScaler` 파일의 이름 (확장자 `.pkl` 포함). 이 이름들은 `registry.json`에 등록됩니다. `id`는 `--output_if_name`에서 확장자를 제외한 부분이 됩니다.

---

## 4. 생성되는 파일 및 결과 확인

학습 스크립트를 실행하면 `C:\Users\gmdqn\singalcraftapp\app\models` 폴더에 다음 파일들이 생성/업데이트됩니다.

*   **모델 파일**:
    *   `valve_autoencoder_v1.pth` (Autoencoder 모델)
    *   `valve_if_v1.pkl` (Isolation Forest 모델)
    *   `valve_scaler_v1.pkl` (Isolation Forest에 사용된 StandardScaler)
*   **메타데이터 파일**:
    *   `valve_autoencoder_v1_meta.json` (Autoencoder 학습 상세 정보)
    *   `valve_if_v1_meta.json` (Isolation Forest 학습 상세 정보)
*   **모델 레지스트리**:
    *   `registry.json` 파일이 자동으로 업데이트되어 새로 생성된 `valve_autoencoder_v1` 및 `valve_if_v1` 모델 정보가 추가됩니다. 이 파일은 백엔드에서 모델을 동적으로 로드하고 프론트엔드에 목록을 제공하는 데 사용됩니다.

---

## 5. 중요 사항

*   학습 데이터는 반드시 **정상(Normal)** 상태의 데이터만 포함해야 합니다. Autoencoder와 Isolation Forest는 비지도 학습 기반의 이상 탐지 모델이므로, 정상 패턴을 학습하는 것이 중요합니다.
*   `--data_dir`에 지정된 폴더에 WAV 또는 CSV 파일이 없으면, 스크립트가 경고 메시지를 표시하고 더미 데이터를 생성하여 학습을 시도합니다. 실제 데이터를 사용해주세요.
*   `--output_name`, `--output_if_name` 등으로 지정하는 모델 ID는 `registry.json` 및 프론트엔드(`ModelSelector`)에서 모델을 식별하는 데 사용되므로, **가독성 있고 고유한 이름**을 사용하는 것이 좋습니다.

---
