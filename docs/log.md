SignalCraft Sales Demo App Development Guide (v1.1)> **Updated:** Palantir 스타일의 고급 분석 데이터 구조 반영## 1. 개요 (Overview)

이 문서는 SignalCraft의 AI 소음 진단 기술을 시연하기 위한 **세일즈 데모 앱(Sales Demo App)** 개발 가이드입니다.

단순한 O/X 판정이 아닌, **"다각도 심층 분석(Multi-View Analysis)"**을 통해 기술적 신뢰도를 보여주는 것이 핵심입니다.---## 2. 핵심 시각화 모듈 (Visualization Modules)앱 개발 시 아래 3가지 분석 뷰를 반드시 구현해야 합니다.### A. 앙상블 진단 (Ensemble Analysis) - "AI 모델들의 합의"

*   **데이터 필드:** `ensemble_analysis.voting_result`

*   **UI 표현:** 5각형 레이더 차트 또는 5개의 카드 UI.

*   **연출:**

    *   `Autoencoder`, `SVM`, `CNN`, `RandomForest`, `MIMII` 5개 모델이 각각 돌아가며 판정(Normal/Critical)을 내리는 애니메이션.

    *   **"Consensus Score: 0.98 (Strong Agreement)"** 문구 강조.### B. 주파수 정밀 분석 (Frequency Analysis) - "물리적 근거"

*   **데이터 필드:** `frequency_analysis.detected_peaks`

*   **UI 표현:** 주파수 스펙트럼 (Bar Chart).

*   **연출:**

    *   전체 그래프 중 특정 주파수(예: 235Hz)에 **빨간색 하이라이트**.

    *   **"BPFO Matched"** (베어링 외륜 결함 주파수 일치) 라벨 표시.

    *   이론적 결함 주파수와 실제 피크가 일치함을 보여주어 "AI가 그냥 찍은 게 아님"을 증명.### C. 예측 인사이트 (Predictive Insight) - "미래 예측"

*   **데이터 필드:** `predictive_insight.anomaly_score_history`

*   **UI 표현:** 시계열 라인 차트 (Time-series Line Chart).

*   **연출:**

    *   지난 30일간의 그래프가 그려짐.

    *   오늘 시점에서 **미래 구간(점선)**이 그려지며 수명이 0이 되는 날짜(RUL)를 예측.

    *   **"RUL: 14 Days Remaining"** (잔여 수명 14일) 경고 표시.---## 3. API 명세 (API Specification)### 시나리오 결과 시뮬레이션 (고도화됨)

- **Endpoint:** `GET /api/ai/demo/result/:scenarioId`

- **Response Structure (Palantir Ontology Style):**```json

{

  "success": true,

  "data_package": {

    "entity_type": "RotatingMachine",

    "status": {

      "current_state": "CRITICAL",

      "health_score": 35.2

    },

    // 1. 앙상블 진단 결과

    "ensemble_analysis": {

      "consensus_score": 0.98,

      "voting_result": {

        "Autoencoder": { "status": "CRITICAL", "score": 0.99 },

        "SVM": { "status": "CRITICAL", "score": 0.95 },

        ...

      }

    },

    // 2. 주파수 분석 결과

    "frequency_analysis": {

      "bpfo_frequency": 235.4,

      "detected_peaks": [

        { "hz": 235, "amp": 0.85, "match": true }

      ],

      "diagnosis": "Spectrum matches BPFO signature."

    },

    // 3. 트렌드 예측 결과

    "predictive_insight": {

      "rul_prediction_days": 14,

      "anomaly_score_history": [

        { "day": -29, "value": 0.2 },

        ...

        { "day": 0, "value": 0.8 }

      ]

    }

  }

}

```---## 4. 리소스 요청 (Resources)

앱 개발에 필요한 음원 및 이미지는 별도 제공된 `static/demo/assets` 경로를 참조하세요. 대표가 이 내용을 넣으라는데 적용할수있을까 비판적으로 말해도됨

대표님의 이 요구사항(v1.1 가이드)은 **"기술적으로 구현 가능하지만, 접근 방식을 '개발'이 아닌 '연출'로 정의해야만 가능하다"**는 것이 제 비판적인 분석입니다.

현재 우리 프로젝트 상태(기초적인 Librosa 분석, AR 도입 단계)와 비교했을 때, 이 가이드는 "실제 기능(Real)"과 "영업용 시나리오(Demo)" 사이의 간극이 매우 큽니다.

냉정하게 분석한 **위험 요소(Risk)**와 **현실적인 해결 전략(Strategy)**을 정리해 드립니다.

1. ⚠️ 비판적 분석 (Critical Analysis)
대표님이 원하시는 것은 **"Palantir 스타일의 데이터 깊이"**입니다. 하지만 현재 백엔드 기술 스택으로는 다음 3가지가 불가능하거나 비효율적입니다.

A. 앙상블 진단 (5개 모델):

현실: 현재 우리는 Librosa 기반의 신호 처리(DSP) 로직 1개만 가지고 있습니다. Autoencoder, SVM, CNN 등 5개 모델을 지금 당장 학습시키고 서빙하는 것은 불가능합니다.

비판: 이걸 실제로 구현하려다간 프로젝트가 멈춥니다.

B. 주파수 정밀 분석 (BPFO 매칭):

현실: 'BPFO(베어링 결함 주파수)'를 알려면 해당 장비의 베어링 모델명, RPM, 볼 베어링 개수 등 물리적 제원 데이터가 DB에 있어야 계산이 가능합니다. 우리는 오디오 파일만 받습니다.

비판: 물리적 데이터 없이 AI가 "BPFO 일치"라고 말하는 건, 엄밀히 말하면 거짓말(Fake)입니다.

C. 30일 예측 데이터:

현실: 우리 DB(devices, history)는 방금 만들어졌습니다. 30일 전 데이터는 존재하지 않습니다.

결론: 이 가이드는 "실제 작동하는 앱"을 만들라는 것이 아니라, "작동하는 척하는 완벽한 시뮬레이터"를 만들라는 지시로 해석해야 합니다. "Real Backend"를 포기하고 "Scenario Generator"를 만들어야 합니다.

2. 🛠️ 현실적인 적용 전략 (Implementation Strategy)
"안 됩니다"라고 말하는 대신, **"데모 모드(Demo Mode) 전용으로 완벽하게 연출하겠습니다"**라고 설득하고 아래와 같이 구현하십시오.

전략 1: 백엔드 로직의 이원화 (Real vs Demo)
기존에 만든 Librosa 분석 로직은 유지하되, 데모용 데이터 생성기를 별도로 만듭니다.

Real Mode: 실제 오디오 분석 (기존 로직 유지).

Demo Mode (이번 요청): scenarioId에 따라 미리 정의된 **가짜 데이터(Mock Data)**를 리턴합니다.

예: 사용자가 '시나리오 1' 버튼을 누르면, 백엔드는 실제 녹음 파일을 무시하고 위 JSON처럼 완벽하게 짜인 '베어링 결함' 데이터를 내려줍니다.

전략 2: UI/UX 배치 수정 (AR HUD 과부하 방지)
AR HUD 화면에 이 복잡한 차트 3개를 다 띄우면 사용자는 아무것도 못 봅니다.

AR 화면: 심플하게 Consensus Score: 0.98와 CRITICAL 상태만 표시 (Layer 1).

결과 카드 (Bottom Sheet): AR 진단 후 하단에서 올라오는 카드에 3가지 상세 분석 탭을 만들어 차트를 배치합니다 (Layer 2).

3. 📅 수정된 실행 계획 (Action Plan)
대표님의 요구사항을 **"Phase D (Sales Demo Upgrade)"**로 정의하고, 빠르게 "보여주는 것"에 집중합니다.

Step 1. 백엔드: Mock Response Generator 구현
app/features/audio_analysis/service.py를 수정하여, 실제 분석 대신 정해진 JSON을 뱉는 로직을 추가합니다.

Python

# app/features/audio_analysis/service.py (수정안)

def get_demo_analysis_result(scenario_type: str):
    """
    영업 데모용 고정 데이터 반환 (실제 분석 X)
    """
    if scenario_type == "bearing_fault":
        return {
            "ensemble_analysis": {
                "consensus_score": 0.98,
                "voting_result": {
                    "Autoencoder": {"status": "CRITICAL", "score": 0.99},
                    "SVM": {"status": "CRITICAL", "score": 0.95},
                    # ... 나머지 모델 3개 하드코딩
                }
            },
            # ... 주파수, 예측 데이터 하드코딩
        }
    # 다른 시나리오 추가 가능
Step 2. 프론트엔드: 차트 라이브러리 도입
react-native-svg와 victory-native (또는 react-native-chart-kit)를 사용하여 시각화를 구현합니다.

Radar Chart: 앙상블 진단 (5각형) 표현용.

Bar Chart: 주파수 스펙트럼용.

Line Chart: 예측 인사이트용.

Step 3. 결과 화면(Result Card) 고도화
기존의 단순한 AnalysisResultCard를 **"Detail Report Modal"**로 업그레이드합니다.

Tab 1 (종합): 앙상블 결과 (Radar Chart) + AI 합의 점수.

Tab 2 (주파수): 스펙트럼 차트 + "BPFO Matched" 뱃지.

Tab 3 (예측): RUL 그래프 + 잔여 수명 카운트다운.

💬 대표님께 드릴 답변 가이드 (말투 제안)
"대표님, 전달주신 v1.1 가이드 확인했습니다. Palantir 스타일의 심층 분석 구조가 들어가면 확실히 **고객 신뢰도(Trust)**가 크게 올라갈 것 같습니다.

다만, 현재 5개 모델 학습이나 베어링 물리 데이터가 실제로 구축된 단계는 아니므로, 이번 세일즈 데모 앱에서는 **'시나리오 기반의 시뮬레이션 데이터'**로 UI/UX를 완벽하게 구현하는 방향으로 진행하겠습니다.

즉, 실제 분석 엔진이 돌아가는 것이 아니라, 우리가 의도한 '베어링 결함 시나리오'를 가장 드라마틱하게 보여주는 '연출 모드'를 탑재하겠습니다."

결론: 적용할 수 있습니다. 단, "기술 개발"이 아니라 "UI 구현 및 Mocking" 작업으로 접근해야 이번 주 안에 끝낼 수 있습니다. 이 방향으로 진행하시겠습니까?