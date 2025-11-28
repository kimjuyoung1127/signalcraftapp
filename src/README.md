# 소스 코드 (src)

이 디렉토리는 SignalCraft Mobile 애플리케이션의 핵심 소스 코드를 포함합니다. React Native 기반의 프론트엔드 코드로 구성되어 있으며, 기능별로 체계적으로 분리되어 있습니다.

## 📁 디렉토리 구조

```
src/
├── components/          # 재사용 가능한 UI 컴포넌트
├── config/             # 환경 설정 및 설정 파일
├── features/           # 기능별 모듈화된 코드
├── hooks/              # 커스텀 React Hooks
├── images/             # 이미지 리소스
├── navigation/         # 네비게이션 구조
├── screens/            # 메인 화면 컴포넌트
├── services/           # API 및 데이터 서비스
└── store/              # 상태 관리 (Zustand)
```

## 🎯 각 디렉토리 역할

### components/
- **AudioVisualizer.tsx**: 실시간 오디오 레벨 시각화 컴포넌트 (60fps 성능)
- **DeviceCard.tsx**: 장비 정보 표시용 카드 컴포넌트
- **ui/**: 기본 UI 컴포넌트 (버튼, 입력 필드, 상태 표시 등)

### config/
- **env.ts**: 환경 변수 관리 (API URL, 설정값 등)
- 앱의 전역 설정을 중앙에서 관리

### features/
- **diagnosis/**: AR 오디오 진단 기능 모듈
- **device_detail/**: 장비 상세 정보 모듈
- 기능별로 관련 컴포넌트, 로직, UI 요소를 응집도 높게 구성

### hooks/
- **useAuthStore.ts**: 인증 상태 관리
- **useDeviceStore.ts**: 장비 데이터 상태 관리
- **useDiagnosisLogic.ts**: AR 진단 로직 hook

### navigation/
- **RootNavigator.tsx**: 전체 네비게이션 구조
- **AuthStack.tsx**: 인증 전 화면 스택
- **MainTabNavigator.tsx**: 메인 탭 네비게이션

### screens/
- **DashboardScreen.tsx**: 장비 모니터링 대시보드
- **LoginScreen.tsx**: 사용자 인증 화면
- **OnboardingScreen.tsx**: 앱 소개 화면
- **SettingsScreen.tsx**: 설정 화면

### services/
- **api.ts**: HTTP 클라이언트 (Axios 기반)
- **auth.ts**: 인증 관련 서비스
- **device.ts**: 장비 데이터 서비스

### store/
- **Zustand** 기반의 상태 관리
- 글로벌 상태와 로직을 중앙에서 관리

## 🛠 기술 스택

- **React Native**: 모바일 애플리케이션 프레임워크
- **TypeScript**: 타입 안정성 확보
- **NativeWind (Tailwind CSS)**: 스타일링 시스템
- **React Navigation**: 화면 전환 및 네비게이션
- **Zustand**: 경량 상태 관리
- **Reanimated**: 고성능 애니메이션

## 🏗 아키텍처 원칙

1. **Feature-based 구조**: 관련 기능들을 하나의 모듈로 묶어 관리
2. **Concern Separation**: UI, 로직, 데이터 분리
3. **Reusability**: 컴포넌트와 Hooks 재사용성 극대화
4. **Type Safety**: TypeScript 엄격 모드로 타입 안정성 확보

## 🔄 데이터 흐름

```
Services API → Store State → Screens → Components
                ↓
            Navigation ← State Update
```

## 📱 주요 기능 연결

- **인증**: LoginScreen → authService → authStore
- **장비 모니터링**: DashboardScreen → deviceService → deviceStore
- **AR 진단**: DiagnosisScreen → useDiagnosisLogic → AnalysisService

## 🎨 디자인 통합

- Industrial Cyberpunk 테마 일관성 유지
- 다크 테마 (`#050505`) 및 네온 컬러 시스템
- NativeWind를 통한 일관된 스타일링

## 🚀 개발 팁

- 모든 API 호출은 services 계층을 통해 이루어짐
- 상태 변경은 Zustand store를 통해서만 이루어짐
- 새로운 기능 개발 시 features/ 디렉토리에 모듈로 생성
- 컴포넌트는 재사용성을 고려하여 설계
