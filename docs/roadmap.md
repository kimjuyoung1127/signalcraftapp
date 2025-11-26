# SignalCraft Mobile Roadmap

## 🗺️ 통합 개발 로드맵 (Backend & Frontend)
나중에 뜯어고치는 일을 막기 위해, **"백엔드는 API화", "프론트엔드는 모듈화"**에 집중하는 로드맵입니다.

## 📅 진행 상황 (2025-11-26 기준)

### ✅ 완료된 작업
- [✓] 기본 네비게이션 구조: AuthStack + MainTab 완료
- [✓] Industrial Cyberpunk 디자인 시스템: 다크 테마 및 네온 컬러 구현
- [✓] 오디오 비주얼라이저: Reanimated 기반 원형 파동 애니메이션 (60fps)
- [✓] 장비 상태 관리: Zustand Store 기반 상태 저장 및 갱신
- [✓] 데모 컨트롤: 테스트용 상태 강제 변경 기능 (심사위원용)
- [✓] 설정 화면: 전체 설정 페이지 및 톱니바퀴 버튼 내비게이션
- [✓] 동적 상태 대시보드: 오디오 전용 지표 및 고조파 분석 차트
- [✓] 실시간 데이터 연동: 상태별 동적 지표 변화 구현
- [✓] 스크롤 가능한 레이아웃: 새로운 콘텐츠 추가에 따른 UI 최적화
- [✓] 한글화 적용: 전체 UI 한국어 번역 완료
- [✓] 백엔드 연동 기초: JWT 로그인, 회원가입, 자동 로그인, 토큰 관리
- [✓] 오디오 녹음 및 업로드 파이프라인 구축 (Phase C)
- [✓] **Phase C+: AR 오디오 진단 시스템 (The Terminator HUD)**

### 🔄 현재 진행 중
- (없음)

### 🔌 Backend Roadmap (FastAPI API Expansion)

#### ✅ 완료된 백엔드 준비
- [✓] Mock Service 구조: 데모 모드를 위한 가상 데이터 서비스
- [✓] API Layer 설계: 백엔드 연동을 위한 서비스 레이어 준비
- [✓] Phase 0: Docker Compose 인프라 구축 (필수)
- [✓] Phase 1: 보안 및 인증 (FastAPI 기반)
- [✓] Phase 3: AI 분석 파이프라인 연동 (FastAPI + Celery)
    - [✓] `POST /api/mobile/upload`: multipart/form-data로 모바일 녹음 파일 수신 로직.
    - [✓] Celery 연동: 업로드 즉시 Task ID 반환 (Non-blocking).
    - [✓] `GET /api/mobile/result/{task_id}`: 폴링용 상태 확인 API.
    - [✓] Feature-Based Backend 오디오 분석 모듈 구현 (`app/features/audio_analysis/`)
    - [✓] **실제 오디오 분석 로직 (`Librosa` 기반) 및 파일 자동 삭제 구현.**

- [ ] Phase 2: 데이터 조회 API 최적화 (FastAPI)
    - [ ] `GET /api/mobile/devices`: 모바일 대시보드용 경량화된 장비 리스트 반환 (상태, 모델명만).
    - [ ] `GET /api/mobile/audio-stats/{device_id}`: 오디오 분석용 최근 데이터 반환
    - [ ] `GET /api/mobile/realtime/{device_id}`: 실시간 장비 상태 스트리밍 (Polling 기반으로 시작, 필요 시 WebSocket으로 확장)
    - [ ] `GET /api/mobile/harmonics/{device_id}`: 고조파 분석 데이터 API
    - [ ] 오디오 분석 모델 통합: SignalCraft AI 모델을 Celery 작업으로 구현

### 📱 Frontend Roadmap (React Native App)

#### ✅ 완료된 프론트엔드 기능
- [✓] Phase 1: 뼈대 및 디자인 시스템 (MVP 핵심)
- [✓] Phase 2: 대시보드 & 시각화
- [✓] Phase 2.5: 백엔드 API 연동 (Auth & Devices)
- [✓] Phase C: 오디오 분석 파이프라인 (Audio Pipeline)
- [✓] Phase C+: AR 오디오 진단 시스템 (Terminator HUD)

#### ✅ 완료된 Phase C+: AR Audio Diagnosis System (Terminator HUD)
기존 오디오 분석 화면을 AR 기반 진단 시스템으로 업그레이드하여, 산업 현장에서 장비를 직접 비추며 진단하는 몰입형 경험을 제공합니다.

##### Step 0: 폴더 구조 재편 (Refactoring Prep) [✓]
*   [✓] `src/features/diagnosis` 폴더 생성
*   [✓] 하위 폴더 구조 생성

##### Step 1: AR 인프라 구축 (Infrastructure) [✓]
*   [✓] 패키지 설치: `expo-camera`, `expo-haptics`
*   [✓] 권한 설정: `app.json`에 카메라/마이크 권한 추가
*   [✓] `DiagnosisCamera.tsx` 컴포넌트

##### Step 2: AR HUD 컴포넌트 개발 (UI Components) [✓]
*   [✓] `AROverlay.tsx`
*   [✓] `TargetReticle.tsx`
*   [✓] `HoloTelemetry.tsx`
*   [✓] `TacticalTrigger.tsx`

##### Step 3: 기능 통합 & 로직 (Integration) [✓]
*   [✓] `useDiagnosisLogic.ts` 훅 생성
*   [✓] `DiagnosisScreen.tsx` (메인 화면)
*   [✓] `MainTabNavigator` 수정

##### Step 4: 결과 표시 & 마무리 (Polishing) [✓]
*   [✓] `AnalysisResultCard.tsx` 이동 및 개선
*   [✓] 최종 테스트

#### 🎨 UI/UX 향상사항
- [ ] Micro-interactions: 부드러운 터치 피드백 및 트랜지션
- [ ] 네트워크 상태 표시: 연결/연결 끊김 상태 UI 피드백
- [ ] 애니메이션 최적화: 120fps 지원 및 저사양 기기 대응
- [ ] Dark Mode 응답성: 시스템 설정 기반 자동 전환
- [ ] 접근성: VoiceOver 및 TalkBack 지원

---

**마지막 업데이트**: 2025-11-26
**다음 업데이트 예정**: 백엔드 데이터 조회 API 최적화
**담당자**: SignalCraft Mobile Development Team