# SignalCraft Mobile - 프로젝트 개발 요약

## 1. 프로젝트 개요
**SignalCraft Mobile**은 산업 현장의 IoT 기기(압축기, 펌프 등)를 실시간으로 모니터링하고, AI 기반 오디오 분석을 통해 장비의 상태를 진단하는 모바일 애플리케이션입니다.

## 2. 기술 스택
- **Framework**: React Native (Expo SDK 50+)
- **Language**: TypeScript
- **Styling**: NativeWind v4 (Tailwind CSS), Global CSS
- **Animation**: React Native Reanimated 3
- **State Management**: Zustand
- **Navigation**: React Navigation v7 (Native Stack + Bottom Tabs)
- **Icons**: Lucide React Native

## 3. 주요 기능 구현 현황

### 3.1 인증 및 온보딩 (Phase 1)
- **온보딩 스크린**: 앱의 주요 기능(모니터링, 진단 등)을 소개하는 3단계 슬라이드.
- **로그인 화면**:
  - 이메일/비밀번호 입력 (유효성 검사 포함).
  - **데모 모드**: 서버 연결 없이 앱을 체험할 수 있는 '데모 모드' 지원.
  - 하이브리드 인증 구조 (실제 API + Mock 서비스).

### 3.2 대시보드 및 모니터링 (Phase 2)
- **대시보드 (Dashboard)**:
  - 연결된 장비 목록 실시간 표시.
  - 장비 상태(정상, 경고, 위험, 오프라인)에 따른 시각적 구분.
  - '당겨서 새로고침(Pull-to-Refresh)' 기능 구현.
- **장비 상세 (Device Detail)**:
  - 선택한 장비의 상세 정보 및 실시간 오디오 레벨 표시.
  - **오디오 비주얼라이저**: Reanimated를 사용한 고성능 원형 파동 애니메이션 (60fps).
  - 상태 제어 패널: 데모 목적으로 장비 상태를 강제 변경하여 UI 반응 테스트 가능.

### 3.3 UI/UX 및 네비게이션 (Phase 2.5)
- **네비게이션 구조**:
  - **AuthStack**: 로그인/온보딩 흐름.
  - **MainTab**: 하단 탭바 (모니터 / 시스템)를 통한 주요 기능 접근.
  - **MainStack**: 대시보드 -> 상세 화면 간의 전환.
- **디자인 시스템 (Industrial Cyberpunk)**:
  - **다크 테마**: `#050505` 배경의 몰입감 있는 어두운 테마.
  - **네온 액센트**: 상태별 컬러 시스템 (정상: `#00FF9D`, 경고: `#FF5E00`, 위험: `#FF0055`).
  - **커스텀 컴포넌트**: `StatusPill`, `DeviceCard`, `PrimaryButton` 등 재사용 가능한 UI 라이브러리 구축.

## 4. 최근 변경 사항 (Localization & Fixes)
- **한글화 적용**: 앱 내 모든 텍스트(메뉴, 버튼, 상태 메시지 등)를 한국어로 번역 완료.
- **안정성 개선**: `react-native-reanimated` 버전 불일치로 인한 크래시 문제 해결 (`WorkletsError` 수정).
- **UI 개선**: 대시보드 상단에 'SIGNALCRAFT' 로고 및 사용자 환영 메시지 디자인 개선.

## 5. 향후 계획 (Roadmap)
- 실제 백엔드 API 연동 (현재 Mock 데이터 사용 중).
- 설정(Settings) 화면 기능 구현.
- 오디오 녹음 및 AI 분석 요청 기능 추가.
