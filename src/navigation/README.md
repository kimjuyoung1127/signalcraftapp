# 네비게이션 시스템 (navigation)

이 디렉토리는 SignalCraft Mobile 애플리케이션의 전체 내비게이션 구조를 관리합니다. React Navigation v7을 기반으로 탭 네비게이션, 스택 네비게이션 등 복합적인 내비게이션 시스템을 구현합니다.

## 📁 핵심 네비게이션 파일

```
src/navigation/
├── RootNavigator.tsx        # 최상위 네비게이션 컨테이너
├── AuthStack.tsx           # 인증 전 화면 스택
├── MainTabNavigator.tsx    # 메인 탭 네비게이션
├── MainNavigator.tsx       # 메인 내비게이션 구성
└── 타입 정의 파일들         # 네비게이션 타입들
```

## 🎯 네비게이션 구조 Overview

### 전체 네비게이션 트리
```
RootNavigator
├── AuthStack (인증 전)
│   ├── OnboardingScreen    # 앱 소개 화면
│   └── LoginScreen         # 로그인 화면
└── MainTabNavigator (인증 후)
    ├── 모니터 탭
    │   ├── DashboardScreen    # 대시보드
    │   └── DeviceDetailScreen # 장비 상세
    ├── 진단 탭
    │   └── DiagnosisScreen    # AR 진단
    └── 시스템 탭
        └── SettingsScreen     # 설정 화면
```

## 🔐 인증 기반 네비게이션

### 상태 기반 화면 전환
```typescript
// AuthStack.tsx
const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Onboarding" 
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
```

### 인증 상태 감지
```typescript
// RootNavigator.tsx
const { isAuthenticated, isLoading } = useAuthStore();

useEffect(() => {
  // 인증 상태에 따른 자동 네비게이션
  if (isAuthenticated) {
    // 메인 탭으로 이동
  } else {
    // 인증 스택으로 이동
  }
}, [isAuthenticated]);
```

## 📱 메인 탭 네비게이션

### 탭 구성
```typescript
// MainTabNavigator.tsx
const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          // 탭 아이콘 렌더링
        ),
        tabBarStyle: { backgroundColor: '#050505' },
        tabBarActiveTintColor: '#00FF9D',
        tabBarInactiveTintColor: '#666666'
      })}
    >
      <Tab.Screen name="Monitor" component={MonitorStack} />
      <Tab.Screen name="Diagnosis" component={DiagnosisScreen} />
      <Tab.Screen name="System" component={SystemStack} />
    </Tab.Navigator>
  );
}
```

### 탭 스타일 시스템
- **다크 테마**: `#050505` 배경색 적용
- **네온 액센트**: 활성 탭에 네온 색상 적용
- **상태 아이콘**: 탭 아이콘에서 상태 정보 표시

## 🔗 화면 간 파라미터 전달

### 장비 상세 화면 연동
```typescript
// DashboardScreen.tsx
const navigateToDevice = (deviceId) => {
  navigation.navigate('DeviceDetail', { deviceId });
};

// DeviceDetailScreen.tsx
export default function DeviceDetailScreen({ route }) {
  const { deviceId } = route.params;
  // deviceId를 통한 데이터 로드
}
```

### AR 진단 화면 연동
```typescript
// 진단 화면으로 deviceId 전달
navigation.navigate('Diagnosis', { 
  deviceId: selectedDevice?.id 
});
```

## 🎨 네비게이션 디자인 시스템

### Industrial Cyberpunk 적용
- **헤더 제거**: 상단 헤더 없는 몰입형 경험
- **탭 스타일**: 어두운 테마 기반의 네온 컬러
- **전환 효과**: 부드러운 슬라이드 애니메이션

### 상태 시각화
- **장비 상태**: 탭 아이콘에 상태 색상 표시
- **네트워크 상태**: 오프라인 시 표시 기능
- **새로운 알림**: 탭 배지 시스템

## 📊 네비게이션 성능 최적화

### 스크렌 최적화
```typescript
// 화면 메모이제이션 설정
const DashboardScreenMemoized = React.memo(DashboardScreen);

<Stack.Screen
  name="Dashboard"
  component={DashboardScreenMemoized}
  options={{
    title: '모니터링',
    headerShown: false
  }}
/>
```

### 프리페칭 전략
- **스크린 프리페치**: 자주 사용하는 화면 미리 로드
- **데이터 캐싱**: 화면 전환 시 데이터 미리 로드
- **로딩 스켈레톤**: 화면 전환 부드러움 개선

## ⚡ 네비게이션 이벤트

### 포커스 이벤트 처리
```typescript
// 화면 포커스 시 데이터 새로고침
useFocusEffect(
  React.useCallback(() => {
    devices.fetchDevices();
  }, [])
);
```

### 상태 변경 감지
```typescript
// 인증 상태 변경에 따른 네비게이션
useEffect(() => {
  if (isAuthenticated) {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  }
}, [isAuthenticated, navigation]);
```

## 🔄 딥 링킹 및 라우팅

### 딥 링크 지원
```typescript
// 특정 장비 직접 접근
const linking = {
  prefixes: ['signalcraft://'],
  config: {
    screens: {
      Main: {
        screens: {
          DeviceDetail: 'device/:id',
        },
      },
    },
  },
};
```

### 라우팅 정의
- **정적 라우팅**: 미리 정의된 화면 경로
- **동적 라우팅**: 파라미터 기반의 화면 접근
- **보호된 라우트**: 인증 필요 페이지

## 🛠 네비게이션 설정

### 기본 설정
```typescript
// NavigationContainer 설정
<NavigationContainer
  ref={navigationRef}
  linking={linking}
  fallback={<Text>Loading...</Text>}
>
  <RootNavigator />
</NavigationContainer>
```

### 테마 스타일링
```typescript
const theme = {
  colors: {
    background: '#050505',
    card: '#0a0a0a',
    text: '#ffffff',
    border: '#1a1a1a',
    primary: '#00FF9D',
    notification: '#FF5E00',
  },
  dark: true,
};
```

## 📱 모바일 특화 기능

### 제스처 지원
- **스와이프 제스처**: 탭 간 스와이프 이동
- **백 제스처**: Android 백 버튼 지원
- **탭 긴누름**: 컨텍스트 메뉴 지원

### 네이티브 연동
- **상태표시줄**: 네이게이션 맞춤 상태표시줄
- **안전영역**: 기기 노치 및 홈 버튼 고려
- **화면 방향**: 특정 화면의 가로모드 지원

## 🔍 디버깅 및 테스트

### 네비게이션 디버깅
```typescript
// 네비게이션 로깅
useEffect(() => {
  const unsubscribe = navigation.addListener('state', (state) => {
    console.log('Navigation state changed:', state.data.state);
  });
  return unsubscribe;
}, [navigation]);
```

### 테스트 전략
- **단위 테스트**: 각 네비게이션 컴포넌트 테스트
- **통합 테스트**: 전체 네비게이션 플로우 테스트
- **E2E 테스트**: 실제 사용자 시나리오 테스트

## 🚀 향후 확장 계획

### 모듈화 네비게이션
- **피처 기반**: 기능별 네비게이션 모듈화
- **동적 라우팅**: 런타임 라우트 생성 지원
- **네스트드 네비게이션**: 복잡한 화면 구조 지원

### 차세대 기능
- **웹 네비게이션**: 웹 플랫폼 네비게이션 통합
- **상태 정렬**: 네비게이션 상태 동기화 개선
- **성능 분석**: 네비게이션 성능 모니터링
