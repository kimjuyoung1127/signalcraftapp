# 🚀 Phase Q: Active Learning & Feedback Loop Implementation Plan

이 문서는 사용자의 피드백을 시스템 학습에 반영하는 **Human-in-the-Loop** 아키텍처와, 앱 내에서 전문가가 직접 AI 판단 기준(Rule)을 제어할 수 있는 기능을 구현하기 위한 로드맵입니다.

## 🎯 목표
1.  **선순환 구조(Feedback Loop):** 알람 발생 -> 사용자 확인(정답/오답) -> 데이터 라벨링 -> 재학습 후보군 등록.
2.  **동적 제어(Dynamic Control):** 코드를 배포하지 않고도, 앱 내 **'엔지니어 모드'**를 통해 AI 감지 민감도(임계치)를 실시간 조정.

---

## 📅 상세 실행 계획

### 🛠 Phase Q-1: Data Foundation (DB & Backend)
> **핵심:** "사용자의 한 마디"와 "설정값"을 저장할 공간을 마련합니다.

1.  **DB 스키마 확장 (`ai_analysis_results` & `devices`)**
    *   **Feedback Columns**: `ai_analysis_results` 테이블에 필드 추가.
        - [x] `feedback_status`: `NULL` | `TRUE_POSITIVE` (실제 고장) | `FALSE_POSITIVE` (오탐지/노이즈) | `IGNORE`
        - [x] `feedback_comment`: 사용자가 남긴 텍스트 메모 (Optional).
        - [x] `reviewed_by`: 피드백을 남긴 User ID.
        - [x] `reviewed_at`: 타임스탬프.
    *   **Dynamic Config**: `devices` 테이블의 `calibration_data` JSON 컬럼 활용 고도화.
        - [x] 기존: 단순 `mean_rms` 저장.
        - [x] 변경: `threshold_multiplier` (기본 3.0), `sensitivity_level` (High/Medium/Low) 등 설정값 포함.
    *   **[DATABASE MIGRATION SUCCESS]**: PostgreSQL `smartcompressor_ai` 데이터베이스에 새로운 컬럼 및 FK 제약조건 성공적으로 적용.

2.  **Backend API 구현**
    - [x] `POST /api/v1/analysis/{id}/feedback`: 분석 결과에 라벨을 붙이는 엔드포인트.
    - [x] `PATCH /api/v1/devices/{id}/config`: 특정 장비의 민감도 설정을 변경하는 엔드포인트.

### 📱 Phase Q-2: Operator Feedback Loop (Mobile UX)
> **핵심:** 현장 작업자가 가장 쉽고 빠르게 AI를 가르칠 수 있도록 합니다.

1.  **Push Notification & Deep Linking**
    - [x] 푸시 알람 클릭 시 `DiagnosisDetailScreen`으로 직행.
2.  **Feedback Interaction UI**
    - [x] 분석 결과 화면 하단에 **[🚨 실제 이상]** vs **[✅ 정상(오탐지)]** 버튼 배치.
    - [x] **[정상]** 선택 시:
        - [x] "이 소음은 어떤 종류인가요?" (선택: 주변 소음, 작업 소음, 알 수 없음) 팝업.
        - [x] 제출 시 "AI가 똑똑해졌습니다!" 토스트 메시지 및 Lottie 폭죽 효과 (Gamification).

### 👷 Phase Q-3: Mobile Engineer Mode (Expert UX)
> **핵심:** 별도 웹 어드민 없이, 앱 안에서 전문가가 그래프를 보며 임계치를 조정합니다.

1.  **엔지니어 전용 접근 권한**
    - [x] `UserRole`이 `admin` 또는 `engineer`인 경우에만 보이는 탭 또는 진입 버튼 생성.
2.  **Interactive Threshold Tuning UI**
    - [x] 최근 24시간/7일간의 오디오 RMS/Anomaly Score 그래프 시각화.
    - [x] 그래프 위에 **가로선(Threshold Line)**을 드래그하여 임계치 조정.
    - [x] "저장" 버튼 클릭 시 `PATCH /api/v1/devices/{id}/config` 호출 -> 즉시 서버 반영.

### 🔄 Phase Q-4: Retraining Pipeline (Backend Automation) - Future
> **핵심:** 쌓인 데이터로 모델을 실제로 업데이트합니다. (추후 구현)

1.  **재학습 트리거**: `FALSE_POSITIVE` 데이터가 일정량(예: 100건) 쌓이면 알림.
2.  **Auto-Retrain**: 서버 스크립트가 해당 데이터를 `Normal` 데이터셋에 포함시켜 Isolation Forest 모델 업데이트.

---

## ✅ 예상 결과
- 현장 작업자가 "오탐지" 버튼을 누를 때마다 시스템의 신뢰도가 데이터로 축적됨.
- 엔지니어가 현장에서 "이 장비는 너무 예민하네" 싶으면, 앱에서 바로 슬라이더를 내려 민감도를 낮출 수 있음.
