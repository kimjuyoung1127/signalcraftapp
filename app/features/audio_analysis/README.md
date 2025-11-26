# Audio Analysis Feature Module

SignalCraft Mobile 앱의 핵심 기능인 "오디오 분석 파이프라인"을 담당하는 백엔드 모듈입니다.

## 📁 구조

*   **`models.py`**: SQLAlchemy DB 모델 정의 (`AudioFile`, `AIAnalysisResult`).
*   **`schemas.py`**: API 요청/응답을 위한 Pydantic 스키마 정의.
*   **`router.py`**: FastAPI 라우터 (`POST /upload`, `GET /result/{task_id}`).
*   **`service.py`**: 비즈니스 로직 (파일 저장, DB 처리 등).

## 🚀 주요 기능

1.  **오디오 파일 업로드 (`POST /api/mobile/upload`)**
    *   모바일 앱에서 녹음된 오디오 파일(`m4a`, `wav`)을 수신합니다.
    *   `uploads/` 디렉토리에 파일을 저장합니다.
    *   `AudioFile` 및 `AIAnalysisResult` (PENDING 상태) 레코드를 생성합니다.
    *   Celery Task (`analyze_audio_task`)를 비동기로 호출하여 분석을 시작합니다.

2.  **분석 결과 조회 (`GET /api/mobile/result/{task_id}`)**
    *   `task_id`를 기반으로 분석 진행 상태 및 결과를 조회합니다.
    *   Polling 방식으로 클라이언트가 주기적으로 호출합니다.
    *   **보안**: 일반 사용자는 본인의 분석 결과만 조회 가능하며, 관리자(`admin`)는 모든 결과를 조회할 수 있습니다.

## ⚙️ Celery Task (`app/worker.py`)

*   **`analyze_audio_task`**:
    *   백그라운드에서 실행되는 분석 로직입니다.
    *   현재는 가상의 AI 분석 로직(5초 대기 + 랜덤 결과)이 구현되어 있습니다.
    *   향후 실제 AI 모델(TensorFlow/PyTorch) 연동 시 이 부분을 수정하면 됩니다.

## 🔒 보안 및 권한

*   **인증**: 모든 API는 JWT 토큰 인증이 필요합니다 (`get_current_user`).
*   **권한**: `dev_user` (DB 접속 계정)에게 `public` 스키마에 대한 `CREATE` 권한이 있어야 테이블을 생성할 수 있습니다.
