# 📡 API Routers

이 디렉토리는 SignalCraft Mobile 애플리케이션의 핵심 백엔드 API 라우터들을 포함하고 있습니다.
FastAPI를 기반으로 작성되었으며, 클라이언트(React Native App)와 데이터베이스 간의 통신을 담당합니다.

## 📂 파일 구조

- **`auth.py`**: 인증 관련 API
  - 로그인 (`/login`) 및 JWT 토큰 발급
  - 사용자 정보 조회 (`/me`)
  - 회원가입 (선택적 구현)
  - 토큰 검증 및 리프레시 로직

- **`devices.py`**: 장비 관리 API
  - 장비 목록 조회 (`/devices`)
  - 특정 장비 상세 정보 (`/devices/{id}`)
  - 장비 상태 업데이트 (Mock/DB 연동)

## 🔗 아키텍처 참고사항

- **기능 기반 분리 (Feature-based)**:
  오디오 분석과 같은 복잡하고 독립적인 기능은 `app/features/` 디렉토리 하위에서 별도로 관리될 수 있습니다.
  이 `routers` 디렉토리는 앱의 **공통적이고 핵심적인 엔티티(User, Device)**를 주로 다룹니다.

- **의존성**:
  모든 라우터는 `app.database`의 DB 세션과 `app.security`의 인증 유틸리티를 의존합니다.

## 📝 개발 가이드

새로운 라우터를 추가할 때는 `main.py`의 `app.include_router()`에 등록해야 합니다.
각 라우터는 명확한 `prefix`와 `tags`를 설정하여 Swagger UI 문서의 가독성을 높이는 것을 권장합니다.
