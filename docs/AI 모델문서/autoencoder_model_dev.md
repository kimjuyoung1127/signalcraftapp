# SignalCraft Level 2: Industrial Autoencoder 모델 개발 보고서

## 1. 개요 (Overview)

SignalCraft의 **Level 2 정밀 진단 모델**인 `Industrial Autoencoder`는 **비지도 학습(Unsupervised Learning)** 기반의 이상 탐지 모델입니다.

기존의 `Level 1 (Hybrid ML)`이 통계적 방법(Isolation Forest)과 규칙(Rule-based)을 사용하여 빠르고 가벼운 1차 스크리닝을 담당한다면, `Level 2 (Autoencoder)`는 딥러닝 신경망을 통해 오디오 신호의 **미세하고 비선형적인 패턴 변화**를 감지하여 정밀한 진단을 수행합니다.

---

## 2. 데이터셋 및 전처리 (Dataset & Preprocessing)

### 📚 데이터 소스
- **데이터셋**: MIMII (Sound Dataset for Malfunctioning Industrial Machine Investigation and Inspection)
- **타겟 장비**: 산업용 펌프 (Industrial Pump), 팬 (Fan), 슬라이더 (Slider) 등 회전 기계.
- **학습 데이터**: **정상(Normal)** 상태의 오디오 데이터만 사용 (`data_backup/normal`).
    - *핵심 전략*: 정상 데이터의 패턴만 완벽하게 학습하여, 고장 데이터가 들어왔을 때 이를 제대로 복원하지 못하는(높은 재구성 오류) 원리를 이용합니다.

### 🛠️ 전처리 (Preprocessing)
`app/features/audio_analysis/dsp_filter.py` 및 `train_autoencoder.py`에서 수행됩니다.

1.  **Resampling**: 모든 오디오를 **16,000Hz**로 강제 변환하여 입력 차원을 통일합니다.
2.  **Mel Spectrogram**:
    - `n_mels=64`: 주파수 대역을 64개의 멜 필터 뱅크로 변환.
    - `log_scale`: 데시벨(dB) 스케일로 변환하여 인간의 청각 특성 반영.
3.  **Normalization**: 0.0 ~ 1.0 범위로 정규화 (Min-Max Scaling).
4.  **Feature Vectorization**: 시간 축(Time axis)에 대해 평균을 취하여 `(64,)` 크기의 고정된 특징 벡터를 생성합니다. (Timbre 중심 분석)

---

## 3. 모델 아키텍처 (Model Architecture)

가볍고 빠른 추론을 위해 설계된 **Fully Connected Autoencoder**입니다.

```mermaid
graph LR
    Input[Input: 64 Dim (Mel Spec)] --> Enc1[Linear 128 + ReLU]
    Enc1 --> Enc2[Linear 64 + ReLU]
    Enc2 --> Latent[Latent Space: 16 Dim]
    Latent --> Dec1[Linear 64 + ReLU]
    Dec1 --> Dec2[Linear 128 + ReLU]
    Dec2 --> Output[Output: 64 Dim (Reconstructed)]
```

*   **Input Layer**: 64 차원 (Mel Spectrogram Features)
*   **Encoder**: 128 -> 64 -> 16 (정보 압축)
*   **Bottleneck (Latent Space)**: 16 차원. 정상 데이터의 핵심 특징(Feature)만 남깁니다.
*   **Decoder**: 16 -> 64 -> 128 -> 64 (정보 복원)
*   **Output Layer**: 64 차원 (복원된 Mel Spectrogram)

---

## 4. 학습 및 추론 프로세스 (Training & Inference)

### 🎓 학습 (Training)
- **목표 함수 (Loss Function)**: MSE (Mean Squared Error)
    - 입력($x$)과 복원된 출력($x'$) 간의 차이를 최소화합니다.
    - $Loss = ||x - x'||^2$
- **Optimizer**: Adam (Learning Rate: 0.001)
- **Epochs**: 50
- **결과물**: `models/autoencoder.pth` (PyTorch State Dict)

### 🔍 추론 (Inference)
`app/features/audio_analysis/anomaly_scorer.py`의 `score_level2` 메서드에서 수행됩니다.

1.  새로운 오디오 데이터 입력.
2.  전처리 (Resampling -> Mel Spec -> Norm -> Mean).
3.  모델 통과 (Encoder -> Decoder).
4.  **재구성 오류(Reconstruction Error) 계산**:
    - $Error = MSE(Input, Output)$
5.  **이상 점수(Anomaly Score) 산출**:
    - 오류가 클수록 모델이 본 적 없는(비정상) 패턴임을 의미합니다.
    - 점수를 0~100점으로 환산하여 최종 등급(NORMAL/WARNING/CRITICAL)을 판정합니다.

---

## 5. 앱 통합 및 활용 (Integration)

### 📱 사용자 경험 (UX)
1.  사용자가 앱의 **진단 화면(DiagnosisScreen)**에서 `Level 2 (Autoencoder)` 모델을 선택합니다.
2.  오디오를 녹음하고 업로드합니다.
3.  앱은 `model_preference="level2"` 파라미터와 함께 API를 호출합니다.

### ⚙️ 백엔드 처리
1.  **`router.py`**: 업로드 요청을 받고 `analyze_audio_task`를 Celery 큐에 등록합니다.
2.  **`worker.py`**: `PipelineExecutor`를 실행합니다.
3.  **`pipeline_executor.py`**: `model_preference`가 "level2"임을 확인하고 `AnomalyScorer.score_level2()`를 호출합니다.
4.  **`model_loader.py`**: `autoencoder.pth` 모델이 메모리에 없으면 로드합니다 (싱글톤 패턴).
5.  **결과 반환**: 딥러닝 분석 결과가 포함된 JSON 응답을 프론트엔드로 전송합니다.

### 📊 기대 효과
- **오탐지 감소**: 단순 소음(RMS)이 높아도, 패턴이 정상이라면 "정상"으로 판독 가능.
- **초기 결함 탐지**: 사람이 듣기 힘든 미세한 주파수 변화를 Latent Space 상의 거리로 감지.
