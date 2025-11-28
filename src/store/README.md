# 상태 관리 Store (store)

이 디렉토리는 SignalCraft Mobile 애플리케이션의 전역 상태 관리를 담당합니다. Zustand 기반의 경량 상태 관리 시스템으로, 앱의 핵심 데이터 및 비즈니스 로직을 중앙에서 관리합니다.

## 📁 Store 구조

```
src/store/
├── useAuthStore.ts        # 인증 상태 관리
├── useDeviceStore.ts      # 장비 데이터 상태 관리
└── [향후 확장 예정 Stores]
```

## 🎯 Zustand 기반 아키텍처

### Zustand 선택 이유
- **경량성**: Redux 대비 복잡성 없는 간결한 API
- ** 타입 강화**: TypeScript와의 완벽한 호환성
- **성능**: 불필요한 리렌더링 최소화
- **Boilerplate 없이**: 설정 코드 최소화

### 상태 관리 원칙
- **빠름**: 구독 컴포넌트만 리렌더링
- **단순함**: 보일러플레이트 없이 직관적 코딩
- **유연함**: 미들웨어, 임시 상태, 선택적 구독 지원

## 📋 핵심 Store 상세

### useAuthStore.ts
```typescript
interface AuthState {
  // 상태
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // 액션
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  autoLogin: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>(
  devtools(
    persist(
      (set, get) => ({
        // 초기 상태 및 액션 구현
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => AsyncStorage)
      }
    )
  )
);
```

**주요 기능:**
- **JWT 토큰 관리**: 안전한 토큰 저장 및 자동 갱신
- **자동 로그인**: 앱 재시작 시 인증 상태 유지
- **에러 처리**: 인증 실패 시 정교한 에러 핸들링
- **영속성**: AsyncStorage로 인증 상태 영구 저장

### useDeviceStore.ts
```typescript
interface DeviceState {
  // 상태
  devices: Device[];
  selectedDevice: Device | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // 액션  
  fetchDevices: () => Promise<void>;
  selectDevice: (deviceId: string) => void;
  updateDeviceStatus: (deviceId: string, status: DeviceStatus) => void;
  refreshDevices: () => Promise<void>;
}

export const useDeviceStore = create<DeviceState>(set => ({
  // 초기 상태 및 액션 구현
}));
```

**주요 기능:**
- **실시간 동기화**: 서버 데이터와 실시간 연동
- **상태 관리**: 장비 온라인/오프라인 상태 추적
- **오류 복구**: 네트워크 오류 시 자동 재시도
- **캐싱**: 데이터 캐싱으로 성능 최적화

## 🔄 상태 흐름 관리

### 비동기 액션 처리
```typescript
// Store 내 비동기 액션 패턴
fetchDevices: async () => {
  set({ isLoading: true, error: null });
  
  try {
    const devices = await deviceService.getDevices();
    set({ 
      devices, 
      isLoading: false, 
      lastUpdated: new Date() 
    });
  } catch (error) {
    set({ 
      error: error.message, 
      isLoading: false 
    });
  }
}
```

### 상태 구독 및 선택
```typescript
// 특정 상태만 구독하여 불필요한 리렌더링 방지  
const devices = useDeviceStore(state => state.devices);
const isLoading = useDeviceStore(state => state.isLoading);

// 상태 변경 감지
useEffect(() => {
  if (error) {
    showErrorToast(error);
  }
}, [useDeviceStore(state => state.error)]);
```

## 📊 성능 최적화 전략

### 선택적 구독
```typescript
// 필요한 상태만 구독
const selectedDevice = useDeviceStore(
  state => state.selectedDevice,
  shallow  // 얕은 비교로 리렌더링 최적화
);
```

### 상태 정규화
- **정규화된 데이터**: ID 기반의 데이터 정규화
- **메모이제이션**: 반복 계산 예방
- **비동기 데이터 프로세싱**: 큐 기반의 순차 처리

## 🛠 개발 도구 및 디버깅

### DevTools 연동
```typescript
// 개발 중 상태 변화 시각화
export const useDeviceStore = create<DeviceState>(
  devtools(
    persist(set => ({
      // store 구현
    }), {
      name: 'device-storage'
    })
  )
);
```

### 상태 디버깅 팁
- **React DevTools**: Zustand DevTools 확장 활용
- **콘솔 로깅**: 상태 변경 로그 기록
- **Time Travel**: 상태 변경 기록 추적

## 🔐 영속성 및 보안

### 데이터 영속화
```typescript
// AsyncStorage 기반 영속성
persist({
  name: 'auth-storage',
  storage: createJSONStorage(() => AsyncStorage),
  whitelist: ['user', 'isAuthenticated']  // 영속화 대상 선택
})
```

### 보안 고려사항
- **보안 저장**: 민감 데이터는 SecureStore 사용
- **데이터 암호화**: 옵션으로 데이터 암호화 지원
- **접근 제한**: 필요한 데이터만 노출

## 🚀 Store 테스트 전략

### 단위 테스트
```typescript
// Store 테스트 예시
describe('useAuthStore', () => {
  let store;

  beforeEach(() => {
    store = useAuthStore.getState();
  });

  it('should login successfully', async () => {
    await store.login('test@email.com', 'password');
    
    expect(store.isAuthenticated).toBe(true);
    expect(store.user).toBeTruthy();
  });
});
```

### 테스트 유틸리티
- **mock store**: 테스트용 store 상태 모의
- **action 테스트**: 액션 호출 결과 검증
- **상태 검증**: 상태 변경 예측 및 검증

## 📈 확장성 고려

### 모듈화 Store
```typescript
// 향후 확장 예상 Store들
├── useNotificationStore    # 알림/푸시 관리
├── useSettingsStore      # 앱 설정 관리  
├── useAnalysisStore      # 분석 결과 관리
├── useNetworkStore       # 네트워크 상태 관리
└── useOfflineStore       # 오프라인 데이터 관리
```

### 통합 관리
- **Store 통합**: 관련 Store 간 데이터 통합
- **이벤트 버스**: Store 간 통신 이벤트 시스템
- **상태 조합**: 여러 Store 상태 조합 가능

## 🔮 고급 기능 확장

### 미들웨어 시스템
```typescript
// 커스텀 미들웨어 구현
const loggerMiddleware = (set, get, api) => (args, argTypes) => {
  console.log('State changed:', args);
  set(args, argTypes);
};

export const useDeviceStore = create<DeviceState>(
  devtools(
    persist(
      loggerMiddleware((set) => ({
        // store 구현
      }))
    )
  )
);
```

### 실시간 연동
- **WebSocket 연동**: 실시간 데이터 상태 반영  
- **오프라인 지원**: 오프라인 상태 관리 도입
- **동기화 충돌**: 데이터 동기화 충돌 해결

## 📋 Store 생성 가이드라인

### 신규 Store 생성 체크리스트
- [ ] **단일 책임**: 하나의 명확한 도메인에 집중
- [ ] **최소 상태**: 필요한 상태만 포함
- [ ] **타입 정의**: 명확한 인터페이스 정의
- [ ] **테스트 계획**: 테스트 시나리오 고려
- [ ] **영속성 고려**: 데이터 지속 필요성 판단

### 구조 원칙
- **상태 vs 데이터**: UI 상태와 도메인 데이터 분리
- **도메인 경계**: 비즈니스 도메인 기반 Store 분리
- **의존성 최소화**: Store 간 직접 의존성 최소화

## 📊 Store 성능 기준

### 목표 성능 지표
- **상태 업데이트**: 10ms 이내 완료
- **구독자 리렌더링**: 불필요한 리렌더링 없음
- **메모리 사용량**: 전체 메모리 50MB 미만

### 최적화 방법
- **선택적 구독**: 필요한 상태만 구독
- **얕은 비교**: `shallow` 비교로 객체 비교 최적화
- **상태 병합**: 불필요한 상태 객체 생성 방지

## 🔍 문제 해결

### 일반적인 문제들
- **무한 렌더링**: 상태 구독 및 업데이트 순환 참조
- **메모리 누수**: useEffect cleanup 부재
- **상태 불일치**: 비동기 상태 업데이트 문제

### 디버깅 방법
- **상태 로그**: 상태 변경 시점 로그 기록
- **리렌더링 추적**: 컴포넌트 리렌더링 원인 분석
- **네트워크 탭**: API 호출 및 응답 확인
