=== SignalCraft Development Context Analysis ===

## 📚 Documentation Structure

### docs/doc/architecture.md
- 전체 시스템 아키텍처 및 데이터 흐름
- Multi-Model AI Architecture 상세 설명
- Docker 인프라 아키텍처
- 주요 모듈 및 파일 구조

### docs/doc/roadmap.md
- 상세 개발 로드맵 및 완료 작업 목록
- Phase A-N 완료: Core Infrastructure, Frontend, AI Analysis
- Multi-Model Upgrade 완료
- 향후 계획: Real-time Streaming, Edge AI, Feedback Loop

### docs/doc/docker_commands.md
- Docker 운영 명령어 모음
- 컨테이너 상태 확인, 로그 조회
- 서비스 관리 (실행/중지/재배포)
- 컨테이너 내부 접속 및 명령 실행
- 유지보수 및 정리
- 로컬-원격 파일 전송 (SCP)

### docs/doc/schema.md
- 데이터베이스 스키마 및 테이블 구조
- users, devices, user_store_access, audio_files, ai_analysis_results
- 인덱스, 외래키 제약조건, 기본값 설정

### docs/refactoring_log.md
- 최신 리팩토링 작업 로그 (2025-12-12)
- Settings 모듈화 및 아키텍처 개선
- 의존성 문제 해결 및 환경 구성
- 런타임 에러 수정 및 상태 지속성 개선

## 🚀 Recent Development Updates

### 1. Multi-Model AI Architecture
- 장비별 맞춤형 모델 로딩 시스템 구축
- ModelLoader 기반 동적 모델 로딩
- registry.json 기반 모델 메타데이터 관리
- target_model_id 기반 추론 수행

### 2. Docker Production Deployment
- AWS 원격 서버 성공적 배포
- FastAPI 백엔드, Redis 브로커, Celery 워커
- PostgreSQL 데이터베이스, Cloudflare R2 스토리지
- Docker Compose 기반 마이크로서비스 아키텍처

### 3. Settings Refactoring
- 모듈화된 설정 시스템 구현
- src/features/settings/ 디렉토리 구조
- useSettingsStore, useSettings hooks
- AsyncStorage 기반 상태 관리
- NetworkStatus, AudioConfig, VisualTheme 모듈

### 4. Cloudflare R2 Integration
- 대용량 파일 스토리지 최적화
- 오디오 파일 업로드/다운로드 최적화
- 비용 효율적 클라우드 스토리지

## 🏗️ Technical Architecture

### Frontend
- React Native + Expo
- TypeScript 엄격 모드
- Feature-based 모듈화
- AR 인테그레이션 (Expo Camera/AV)
- Tailwind CSS 스타일링

### Backend
- FastAPI + Celery
- AsyncSession 비동기 처리
- Librosa AI 분석
- Multi-Model Architecture
- PostgreSQL 데이터베이스

### AI/ML
- Scikit-learn Isolation Forest
- PyTorch Autoencoder
- TensorFlow Lite 변환 준비
- Dynamic Model Loading

### DevOps
- Docker + Docker Compose
- AWS 원격 서버
- Cloudflare R2 스토리지
- CI/CD 파이프라인

## 📈 Development Roadmap

### Completed (v3.0)
- ✅ Multi-Model AI Architecture
- ✅ Docker Production Deployment
- ✅ Settings Refactoring
- ✅ Cloudflare R2 Integration
- ✅ AR Diagnostic System
- ✅ Palantir-style AI Reports

### Upcoming (2025 Q1)
- 🚀 Real-time WebSocket Streaming
- 📱 Offline Synchronization
- 🌍 Multilingual Support
- 🤖 Edge AI Optimization

### Future (2025 Q2)
- 🎯 TensorFlow Lite On-Device AI
- 🔧 Device-Specific Custom Models
- 📊 Predictive Maintenance
- 🔄 Feedback Loop & Active Learning

## 📋 Key Files and Directories

### Documentation
- docs/doc/architecture.md
- docs/doc/roadmap.md
- docs/doc/docker_commands.md
- docs/doc/schema.md
- docs/refactoring_log.md

### Frontend
- src/features/settings/
- src/features/diagnosis/
- src/features/device_detail/
- src/features/admin/

### Backend
- app/core/model_loader.py
- app/core/config_analysis.py
- app/features/audio_analysis/
- app/api/v1/endpoints/
- app/models/registry.json

### Infrastructure
- docker-compose.yml
- Dockerfile
- .env
- requirements.txt
