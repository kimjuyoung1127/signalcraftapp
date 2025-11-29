# SignalCraft Mobile Roadmap

## 🗺️ 통합 개발 로드맵 (Backend & Frontend)
나중에 뜯어고치는 일을 막기 위해, **"백엔드는 API화", "프론트엔드는 모듈화"**에 집중하는 로드맵입니다.

## 📅 진행 상황 (2025-11-29 기준)

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
- [✓] **Phase D: 데이터 동기화 및 대시보드 연동**
- [✓] **Phase D-2: WAV Audio Pipeline & Platform Optimization**
    - [✓] **Platform-Specific Recording Config**: 
        - [✓] Android: M4A (AAC) + 44.1kHz (High Frequency Capture)
        - [✓] iOS: WAV (PCM) + 44.1kHz (Lossless)
    - [✓] **Backend Audio Conversion**:
        - [✓] `AudioConverter` 모듈 구현: M4A/MP4 -> WAV (22050Hz -> 44100Hz Updated) 자동 변환
        - [✓] Docker 인프라: `ffmpeg` 설치 및 `pydub` 라이브러리 추가
        - [✓] Temp File Cleanup: 변환 후 임시 파일 자동 정리 로직

### 🔄 현재 진행 중
- **Phase D-3: Kaggle Dataset Verification & Logic Tuning**
    - [ ] Kaggle 데이터셋(`SUBF v2.0`) 분석 및 테스트 스크립트 작성
    - [ ] `Librosa` 분석 로직 검증 (2k-10k 공진음 및 10k+ 고주파 패턴)
    - [ ] Demo "Golden Sample" 선정

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
    - [✓] 오디오 분석 모듈 구현 
    - [✓] **실제 오디오 분석 로직 (`Librosa` 기반) 및 파일 자동 삭제 구현.**
- [✓] **Phase D 백엔드 연동:**
    - [✓] `app/features/audio_analysis` 백엔드 모듈 및 API 라우터 구현 (`models.py`, `analyzer.py`, `router.py`, `__init__.py`).
    - [✓] `AsyncSession`에 맞는 비동기 쿼리 (`db.execute(select(...))`) 및 트랜잭션 처리(`await db.flush()`, `await db.commit()`, `await db.rollback()`) 적용.
    - [✓] `app/security.py`에 `get_current_user` 함수 구현 및 JWT 토큰 기반 사용자 인증.
    - [✓] `main.py` 라우터 등록 Prefix 설정 오류 및 `router.py` API 경로 중복 문제 해결.
    - [✓] `audio_files` 및 `ai_analysis_results` 테이블 스키마 정의 및 DB 생성 연동.

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
- [✓] **Phase D 프론트엔드 연동:**
    - [✓] `DiagnosisScreen`에서 `deviceId`를 `useDiagnosisLogic` 훅으로 전달.
    - [✓] `useDiagnosisLogic`에서 `deviceId`를 `analysisService.uploadAudio`로 전달하여 파일 업로드 요청 시 포함.
    - [✓] `analysisService.uploadAudio` 함수 수정 (`deviceId` 파라미터 추가 및 `FormData`에 포함).
    - [✓] `useDeviceStore`에 `fetchDevices` 액션 구현 및 `isLoading`, `error` 상태 관리.
    - [✓] `DashboardScreen`에 `useFocusEffect`를 적용하여 화면 포커스 시 최신 장비 데이터 조회.
    - [✓] `AnalysisResultCard.tsx`에서 백엔드 `analyzer.py` 반환 데이터에 맞춰 `vibration` 필드 제거 및 `noise_level`, `duration`에 `toFixed(2)` 적용.
    - [✓] `.env` 및 `src/config/env.ts`의 `EXPO_PUBLIC_API_BASE_URL`을 최신 PC IP로 업데이트.

- [✓] **Phase D+: Sales Demo Upgrade (Palantir Style Analysis)**
    - [✓] **하이브리드 백엔드 구현:**
        - [✓] `app/features/audio_analysis/demo_payloads.py`: CRITICAL, WARNING, NORMAL 시나리오 데이터셋 구축.
        - [✓] `app/features/audio_analysis/service.py`: `MOCK-` 장비와 실제 DB 데이터를 구분하는 하이브리드 로직 구현.
        - [✓] `GET /api/mobile/report/{device_id}`: 통합 상세 리포트 API 엔드포인트 추가.
    - [✓] **고급 시각화 차트 (Frontend):**
        - [✓] `EnsembleRadar.tsx`: 5각형 레이더 차트 (SVG 기반 직접 구현).
        - [✓] `FrequencySpectrum.tsx`: 주파수 스펙트럼 바 차트 (SVG 기반).
        - [✓] `PredictiveTrendChart.tsx`: 30일 예측 라인 차트 (SVG 기반).
    - [✓] **통합 리포트 뷰 (UI/UX):**
        - [✓] `DiagnosisReportView.tsx`: 탭 기반(요약/상세/예측) 모달 화면 구현.
        - [✓] `AudioVisualizer.tsx`: Reanimated 기반 성능 최적화 및 사이즈 조절 기능 추가.
        - [✓] **UI 리파인:** NativeWind 기반 다크 테마(`#050505`) 적용 및 카드 스타일 통일.
        - [✓] **Debug Mode:** `DiagnosisScreen`에 UI 즉시 확인용 디버그 버튼 추가.

- [✓] **Phase E: Deep Insight & Action (Diagnostic Intelligence)**
    - [✓] **진단 데이터 고도화 (Backend):**
        - [✓] `demo_payloads.py` 확장: `diagnosis` (Root Cause, Confidence) 및 `maintenance_guide` (Action Item, Parts) 필드 추가.
    - [✓] **전문가용 리포트 UI (Frontend):**
        - [✓] `OverviewTab` 개편: 근본 원인, 신뢰도, 긴급 조치 사항, 필요 부품 등을 보여주는 "진단서" 형태의 대시보드 구현.

- [✓] **Phase E-2: Visualization Deep-Dive (Custom SVG Charts)**
    - [✓] **Ensemble Radar Chart 고도화:** 정상 범주(Baseline) Polygon 오버레이 및 5각형 그리드 구현.
    - [✓] **Frequency Spectrum 고도화:** 주요 고조파(Harmonic Cursors) 표시 및 그라데이션 효과 적용.
    - [✓] **Predictive Trend Chart 고도화:** 신뢰 구간(Confidence Interval) 영역 표시, 고장 임계치(Threshold) 라인 및 RUL 포인트 시각화.

- [✓] **Phase F: Dashboard & Detail Modernization**
    - [✓] **모듈화:** `src/features/device_detail` 폴더 구조 기반으로 `DeviceDetailScreen` 재구성.
    - [✓] **`DeviceDetailScreen` 현대화:**
        - [✓] 기존 Mock 데이터 및 UI 완전히 제거.
        - [✓] `AnalysisService.getDetailedAnalysisReport`를 통한 데이터 페칭 로직 도입.
        - [✓] `DiagnosisReportView`의 탭 컴포넌트들을 재사용하여 Palantir 스타일 리포트 UI 적용.
    - [✓] **`DemoControlPanel` 분리 및 개선:**
        - [✓] `src/features/device_detail/components/DemoControlPanel.tsx`로 분리.
        - [✓] `DeviceDetailScreen` 하단에 토글 가능한 바텀 시트 형태로 구현.
    - [✓] **라우팅 업데이트:** `MainNavigator`에서 `DeviceDetailScreen` 경로 변경 및 연결.

- [✓] **Phase G: Stability & Optimization (Bug Fixes)**
    - [✓] **데이터 정합성 확보:**
        - [✓] `DiagnosisScreen`에서 `useDeviceStore`의 `selectedDevice`를 사용하여 분석 대상 장비 ID(`device_id`)를 정확히 매핑.
        - [✓] 백엔드 `AIAnalysisResult` 모델의 `completed_at` 필드가 `datetime.now(timezone.utc)`를 사용하여 정확한 분석 시점을 기록하도록 수정.
        - [✓] `GET /api/mobile/devices` 엔드포인트에서 각 장비별 최신 분석 시간(`latest_completed_at`)을 조회하여 `last_reading_at` 필드에 매핑.
    - [✓] **디버깅 환경 개선:**
        - [✓] 프론트엔드 콘솔 로그 필터링: `DeviceCard` 등에서 불필요한 로그를 제거하고 타겟 장비("DB-001") 로그만 출력하도록 최적화.
        - [✓] 백엔드 로그 정리: `read_devices` 및 `analyze_audio_task`의 과도한 로그 제거.
    - [✓] **Docker 환경 대응:**
        - [✓] Windows Docker 환경에서의 시간 편차(Clock Drift) 문제 원인 파악 및 사용자 가이드 제공.

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

**마지막 업데이트**: 2025-11-29
**다음 업데이트 예정**: Kaggle 데이터셋 검증 및 AI 로직 튜닝
**담당자**: SignalCraft Mobile Development Team
