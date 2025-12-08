# SignalCraft Hybrid ML Engine Documentation

## 1. 개요 (Overview)
**Hybrid ML Engine**은 산업용 회전 기계(펌프, 모터 등)의 고장을 조기에 진단하기 위해 설계된 SignalCraft의 핵심 분석 엔진입니다. 
단일 모델에 의존하지 않고, **신호 처리 기반의 물리적 규칙(Rule-based)**과 **비지도 학습(Unsupervised Learning)**을 결합하여 진단의 신뢰성을 극대화했습니다.

### 🎯 핵심 철학
> "물리학(Physics)은 거짓말을 하지 않으며, 머신러닝(ML)은 우리가 모르는 패턴을 찾아낸다."

이 하이브리드 접근 방식을 통해 명확한 기계적 결함(베어링 파손, 축 정렬 불량)은 규칙 기반으로 즉시 잡아내고, 초기 단계의 미세한 이상 징후는 ML 모델이 탐지합니다.

---

## 2. 아키텍처 (Architecture)

분석 파이프라인은 두 개의 병렬 레이어로 구성됩니다.

```mermaid
graph TD
    A[Audio Input (WAV)] --> B[Signal Processing Layer]
    A --> C[ML Inference Layer]
    
    subgraph "Layer 1: Rule-Based Logic"
        B --> B1[RMS (Noise Level)]
        B --> B2[Band Energy Ratio]
        B --> B3[Envelope Analysis (Hilbert)]
    end
    
    subgraph "Layer 2: AI Model"
        C --> C1[Feature Extraction (Librosa)]
        C1 --> C2[Standard Scaler]
        C2 --> C3[Isolation Forest]
    end
    
    B1 & B2 & B3 --> D[Decision Engine]
    C3 --> D
    
    D --> E[Final Status (Normal/Warning/Critical)]
    D --> F[Diagnostic Insight (Root Cause)]
```

---

## 3. 데이터셋 및 학습 (Dataset & Training)

### 📚 데이터 소스
- **데이터셋 명**: MIMII (Sound Dataset for Malfunctioning Industrial Machine Investigation and Inspection)
- **타겟 장비**: 산업용 펌프 (Industrial Pump, `id_00`)
- **학습 데이터**: **정상(Normal)** 상태의 오디오 데이터만 사용
    - *이유*: 산업 현장에서는 고장 데이터보다 정상 데이터가 압도적으로 많습니다. 정상 범주를 학습하여 이에서 벗어나는 것을 '이상'으로 간주하는 **이상 탐지(Anomaly Detection)** 기법을 사용합니다.

### 🧠 ML 모델 상세
- **알고리즘**: `sklearn.ensemble.IsolationForest`
- **전처리**: `StandardScaler` (평균 0, 분산 1로 정규화)
- **하이퍼파라미터**:
    - `contamination`: 0.01 (학습 데이터 내 이상치 비율을 매우 낮게 설정)
    - `random_state`: 42
    - `n_estimators`: 100 (기본값)

---

## 4. 분석 로직 상세 (Analysis Logic)

### 🔹 Layer 1: Rule-Based Logic (물리적 규칙)
오디오 신호 자체의 물리적 특성을 분석하여 이미 알려진 고장 유형을 탐지합니다.

| 지표 (Metric) | 설명 | 임계값 (Thresholds) | 연관 결함 |
| :--- | :--- | :--- | :--- |
| **RMS (Root Mean Square)** | 전체적인 소음/진동 레벨 | > 0.8 (Critical)<br>> 0.5 (Warning) | 기계적 이완, 심각한 손상 |
| **Resonance Ratio** | 2kHz ~ 10kHz 대역의 에너지 비율 | > 0.39 (Critical)<br>> 0.33 (Warning) | 공명(Resonance), 캐비테이션 |
| **High Freq Ratio** | 10kHz 이상 초고주파 에너지 비율 | > 0.6 (Critical) | 베어링 초기 마모, 윤활 부족 |
| **Envelope Analysis** | 포락선 분석 (Bandpass 2k-10k -> Hilbert) | Peak Frequencies 발견 시 | 베어링 결함 (BPFO, BPFI 등) |

### 🔹 Layer 2: Machine Learning Logic (이상 탐지)
인간이 정의하기 힘든 복합적인 패턴의 변화를 감지합니다.

1. **특징 추출 (Feature Extraction)**: `librosa`를 사용하여 10초 오디오에서 고차원 특징 벡터 추출
    - **MFCC (13 coeffs)**: 음색(Timbre) 특성 (Mean/Std)
    - **Spectral Centroid**: 소리의 '밝기' 중심 (Mean/Std)
    - **Spectral Bandwidth**: 주파수 대역폭 (Mean/Std)
    - **Zero Crossing Rate**: 신호 교차율 (Mean/Std)
    - **Spectral Rolloff**: 고주파 에너지 분포 (Mean/Std)
2. **추론 (Inference)**: `IsolationForest` 모델이 `anomaly_score` 산출
3. **정규화**: Raw Score를 0.0(정상) ~ 1.0(비정상) 범위로 매핑

---

## 5. 의사결정 엔진 (Decision Engine)

두 레이어의 결과를 종합하여 최종 상태를 판정합니다.

### 🚨 판정 로직 (Priority Logic)
1. **CRITICAL (위험)**
    - ML Score > 0.7 **또는**
    - Envelope Analysis에서 베어링 결함 주파수 피크 검출 **또는**
    - RMS > 0.8 **또는** High Freq Ratio > 0.6
2. **WARNING (경고)**
    - ML Score > 0.4 **또는**
    - RMS > 0.5 **또는** Resonance Ratio > 0.33
3. **NORMAL (정상)**
    - 위 조건에 해당하지 않을 경우

### 💡 인사이트 생성 (Diagnostic Insight)
단순 상태뿐만 아니라, `service.py`를 통해 구체적인 원인과 조치 사항을 제안합니다.

- **원인 추론 예시**:
    - `Peak Frequencies` 존재 → "베어링 결함 (주파수 시그니처 감지됨)"
    - `Resonance Ratio` 높음 → "기계적 이완 / 공명 발생"
    - `High Freq Ratio` 높음 → "초기 베어링 마모"
- **조치 사항 예시**:
    - "즉시 가동 중지 및 정밀 점검 요망"
    - "베어링 유닛 (SKF-6205) 교체 권장"

---

## 6. 파일 및 경로 정보

- **분석 로직**: `app/features/audio_analysis/analyzer.py`
- **학습 스크립트**: `app/features/audio_analysis/train.py`
- **모델 파일**: 
    - `models/isolation_forest_model.pkl`
    - `models/scaler.pkl`
- **인사이트 로직**: `app/features/audio_analysis/service.py`

## 7. 향후 발전 계획 (Roadmap)
- **CNN Ensemble**: 스펙트로그램 이미지를 활용한 딥러닝 모델 추가 (현재 UI상 Beta)
- **스마트폰 도메인 적응**: MIMII 데이터 외에 실제 스마트폰 녹음 데이터를 추가 학습하여 노이즈 강건성 확보
