# 장비 상세 정보 모듈 (device_detail)

이 모듈은 기존 DeviceDetailScreen을 기능적 모듈로 재구성한 것으로, 개별 장비의 상세 정보, AR 진단 결과, 예측 분석 데이터 등을 통합적으로 표시하는 고도화된 장비 관리 기능을 제공합니다.

## 📁 모듈 구조

```
src/features/device_detail/
├── components/
│   ├── DeviceDetailScreen.tsx    # 장비 상세 메인 화면
│   └── DemoControlPanel.tsx      # 데모 컨트롤 패널 (토글 가능)
├── lib/
│   └── [데이터 처리 로직 파일들]
└── [향후 확장 예정 파일들]
```

## 🎯 모듈 개요

### 기능 통합
- **상세 정보 관리**: 장비의 실시간 상태 및 히스토리 데이터
- **AR 진단 결과 통합**: DiagnosisReportView 재활용한 Palantir 스타일 리포트
- **데모 컨트롤**: 개발 및 데모를 위한 상태 제어 방식의 바텀 시트

### 아키텍처 개선
- **수직적 모듈화**: 기능 집약도 높은 모듈 구조
- **데이터 소스 통합**: Mock 데이터 제거 및 실제 API 연동
- **재사용성 강화**: UI 컴포넌트 재사용성 극대화

## 📋 핵심 컴포넌트 상세

### DeviceDetailScreen.tsx
```typescript
// 장비 상세 메인 화면
export default function DeviceDetailScreen({ route }: DeviceDetailScreenProps) {
  const { deviceId } = route.params;    // 네비게이션 파라미터
  const [demoPanelVisible, setDemoPanelVisible] = useState(false);
  
  // 실제 데이터 API 연동
  const { detailedReport, isLoading, error, fetchReport } = useDeviceDetail(deviceId);
  
  // 화면 포커스 시 데이터 리프래시
  useFocusEffect(
    useCallback(() => {
      fetchReport();
    }, [fetchReport])
  );

  return (
    <ScreenLayout>
      {/* 장비 기본 정보 */}
      <DeviceInfoCard deviceId={deviceId} />
      
      {/* Palantir 스타일 통합 리포트 */}
      {detailedReport && (
        <DiagnosisReportView
          diagnosis={detailedReport}
          visible={true}
          embedded={true}  // 모달 아닌 내장 형태
        />
      )}
      
      {/* 데모 컨트롤 토글 버튼 */}
      <TouchableOpacity
        style={styles.demoToggle}
        onPress={() => setDemoPanelVisible(!demoPanelVisible)}
      >
        <Icon name="settings" size={24} color="#00FF9D" />
      </TouchableOpacity>

      {/* 데모 컨트롤 패널 */}
      <DemoControlPanel
        visible={demoPanelVisible}
       deviceId={deviceId}
        onClose={() => setDemoPanelVisible(false)}
      />

      {/* Loading 및 Error 상태 처리 */}
      <DataStatusOverlay 
        isLoading={isLoading} 
        error={error} 
      />
    </ScreenLayout>
  );
}

// 데이터 페칭 Hook
const useDeviceDetail = (deviceId: string) => {
  const [detailedReport, setDetailedReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 실제 API 호출 (AnalysisService 사용)
      const report = await AnalysisService.getDetailedAnalysisReport(deviceId);
      
      setDetailedReport(report);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  return { detailedReport, isLoading, error, fetchReport };
};
```

### DemoControlPanel.tsx
```typescript
// 데모 제어 바텀 시트 패널
export default function DemoControlPanel({ 
  visible, 
  deviceId, 
  onClose 
}) {
  const { updateDeviceState } = useDeviceStore();

  const demoStates = [
    { label: '정상', color: '#00FF9D', value: 'normal' },
    { label: '경고', color: '#FF5E00', value: 'warning' },
    { label: '위험', color: '#FF0055', value: 'critical' },
    { label: '오프라인', color: '#666666', value: 'offline' },
  ];

  const handleStatusChange = (status: string) => {
    updateDeviceState(deviceId, status);
    
    // 햅틱 피드백
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <BottomSheet
      modalProps={{
        visible,
        onDismiss: onClose,
        presentationStyle: 'pageSheet',
      }}
    >
      <View style={styles.panelContainer}>
        {/* 패널 헤더 */}
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>데모 컨트롤</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="x" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* 상태 제어 버튼 그리드 */}
        <View style={styles.statusGrid}>
          {demoStates.map((state) => (
            <TouchableOpacity
              key={state.value}
              style={[
                styles.statusButton,
                { borderColor: state.color }
              ]}
              onPress={() => handleStatusChange(state.value)}
            >
              <Text style={[
                styles.statusLabel,
                { color: state.color }
              ]}>
                {state.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 추가 제어 옵션 */}
        <View style={styles.additionalControls}>
          <TouchableOpacity style={styles.controlOption}>
            <Text style={styles.controlLabel}>실시간 데이터 시뮬레이션</Text>
            <Switch value={true} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlOption}>
            <Text style={styles.controlLabel}>알림 테스트</Text>
            <Icon name="bell" size={20} color="#00FF9D" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
}
```

## 🔄 데이터 아키텍처 리뉴얼

### 데이터 소스 변경 전후 비교

#### 기존 방식 (Mock 중심)
```typescript
// 이전 DeviceDetailScreen.tsx
const DeviceDetailScreen = ({ route }) => {
  const { deviceId } = route.params;
  
  // Mock 데이터로 고정
  const mockData = {
    status: 'normal',
    vibrations: [0.2, 0.3, 0.1, 0.4, 0.2],
    // ... 기타 Mock 데이터
  };

  return (
    <ScreenLayout>
      {/* Mock 기반 UI 렌더링 */}
      <View style={styles.mockDataContainer}>
        <Text>예시 데이터입니다</Text>
      </View>
    </ScreenLayout>
  );
};
```

#### 새로운 방식 (API 연동)
```typescript
// 새로운 DeviceDetailScreen.tsx
const DeviceDetailScreen = ({ route }) => {
  const { deviceId } = route.params;
  
  // 실제 데이터 API 연동
  const { detailedReport, isLoading, error } = useDeviceDetail(deviceId);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <ScreenLayout>
      {/* 실제 데이터 기반 렌더링 */}
      {detailedReport && (
        <DiagnosisReportView diagnosis={detailedReport} />
      )}
    </ScreenLayout>
  );
};
```

### API 데이터 흐름
```
DeviceDetailScreen
    ↓ (deviceId)
AnalysisService.getDetailedAnalysisReport()
    ↓
/api/mobile/report/{deviceId}
    ↓
백엔드 AudioAnalysisService
    ↓
데모/실제 데이터 통합 반환
    ↓
DiagnosisReportView (재사용)    
    ↓
종합 리포트 시각화
```

## 📊 UI 구성 요소

### 메인 구조
1. **헤더 정보**: 장비명, 모델, 위치 정보
2. **실시간 상태**: 현재 상태 및 간단한 측정 지표
3. **통합 리포트**: DiagnosisReportView 컴포넌트로 통합 표시
4. **데모 컨트롤**: 토글 가능한 바텀 시패널

### DiagnosisReportView 통합
```typescript
// 진단 리포트 뷰 재사용
<DiagnosisReportView
  diagnosis={detailedReport}
  visible={true}
  embedded={true}  // 모달이 아닌 내장 모드
  style={{
    flex: 1,
    marginTop: 16,
    borderRadius: 0, // 전체 화면에 맞게 스타일 조절
  }}
/>
```

### 레이아웃 구조
```typescript
// DeviceDetailScreen 레이아웃
<ScreenLayout>
  {/* 고정 헤더 */}
  <View style={styles.header}>
    <DeviceInfoHeader deviceId={deviceId} />
    <StatusIndicator status={detailedReport?.diagnosis?.status} />
  </View>
  
  {/* 스크롤 가능 콘텐츠 */}
  <ScrollView style={styles.content}>
    {/* 실시간 데이터 카드 */}
    <RealtimeDataCard data={detailedReport?.realtime} />
    
    {/* 통합 리포트 (탭 기반) */}
    <DiagnosisReportView 
      diagnosis={detailedReport}
      embedded={true}
    />
    
    {/* 장비 상세 정보 */}
    <DeviceInfoDetails device={detailedReport?.device_info} />
  </ScrollView>
  
  {/* 플로팅 액션 버튼 */}
  <FloatingActionButton
    icon="settings"
    onPress={() => setDemoPanelVisible(true)}
  />

</ScreenLayout>
```

## 🎨 디자인 시스템

### Industrial Cyberpunk 적용
- **다크 배경**: 전체적으로 어두운 테마 유지
- **네온 강조**: 중요 정보에 네온 컬러 강조
- **홀로그래픽 요소**: 미래감 있는 UI 요소 적용

### 색상 시스템
```typescript
const styles = StyleSheet.create({
  // 화면 기반 스타일
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  
  // 상태별 카드 스타일
  statusCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  
  // 네온 강조 효과
  neonAccent: {
    color: '#00FF9D',
    textShadowColor: '#00FF9D',
    textShadowRadius: 8,
  },
  
  // 바텀 시트 스타일
  panelContainer: {
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    height: '60%',
  },
});
```

## 🚀 성능 최적화

### 데이터 로딩 최적화
```typescript
// 데이터 캐싱 전략
const useDeviceDetail = (deviceId: string) => {
  const [cache, setCache] = useState(new Map());

  const fetchReport = useCallback(async () => {
    // 캐시된 데이터가 있으면 재사용
    if (cache.has(deviceId)) {
      return cache.get(deviceId);
    }

    try {
      setIsLoading(true);
      const report = await AnalysisService.getDetailedAnalysisReport(deviceId);
      
      // 캐시에 저장
      cache.set(deviceId, report);
      setDetailedReport(report);
      
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, cache]);

  return { detailedReport, isLoading, error, fetchReport };
};
```

### 컴포넌트 메모이제이션
```typescript
// DiagnosisReportView 메모이제이션
const MemoizedDiagnosisReportView = React.memo(DiagnosisReportView, 
  (prevProps, nextProps) => {
    // diagnosis 데이터가 변경될 때만 리렌더링
    return JSON.stringify(prevProps.diagnosis) === 
           JSON.stringify(nextProps.diagnosis);
  }
);

// 데모 패널도 메모이제이션
const MemoizedDemoPanel = React.memo(DemoControlPanel);
```

## 🔧 개발 도구 및 디버깅

### 데모 제어 기능
- **상태 제어**: 4단계 장비 상태 시뮬레이션
- **데이터 생성**: 가상의 분석 결과 생성
- **오류 시뮬레이션**: 네트워크 오류 및 데이터 부족 현상 테스트

### 디버깅 도구
```typescript
// 개발용 디버그 패널
const DebugPanel = ({ deviceId }) => {
  if (__DEV__ && Platform.OS === 'android') {
    return (
      <View style={styles.debugPanel}>
        <Text style={styles.debugText}>
          Device ID: {deviceId}
        </Text>
        <Button
          title="Force Error"
          onPress={() => {
            throw new Error('Debug error');
          }}
        />
      </View>
    );
  }
  return null;
};
```

## 📱 네비게이션 연동

### 라우팅 업데이트
```typescript
// MainNavigator.tsx 라우팅 변경
<Stack.Screen
  name="DeviceDetail"
  component={DeviceDetailScreen}  // 모듈화된 컴포넌트로 변경
  options={({ route }) => ({
    title: route.params.deviceName || '장비 상세',
    headerShown: false,  // 커스텀 헤더 적용
  })}
/>

// 대시보드 화면에서 네비게이션 호출
const navigateToDeviceDetail = (device) => {
  navigation.navigate('DeviceDetail', {
    deviceId: device.id,
    deviceName: device.name,  // 헤더 제목 전달
  });
};
```

## 🔄 향후 확장 방향

### 추가 예정 컴포넌트
```
src/features/device_detail/
├── components/
│   ├── DeviceDetailScreen.tsx      # ✅ 메인 화면
│   ├── DemoControlPanel.tsx        # ✅ 데모 컨트롤
│   ├── DeviceInfoHeader.tsx        # 장비 정보 헤더
│   ├── RealtimeChart.tsx           # 실시간 차트
│   └── MaintenanceHistory.tsx      # 유지보수 이력
├── lib/
│   ├── data-processor.ts           # 데이터 처리 로직
│   ├── chart-calculations.ts       # 차트 데이터 계산
│   └── device-analytics.ts         # 장비 분석 로직
└── hooks/
    ├── useRealtimeData.ts          # 실시간 데이터 후크
    └── useDeviceHistory.ts         # 장비 이력 후크
```

### 고급 기능 계획
- **실시간 웹소켓**: 실시간 데이터 스트리밍
- **다중 장비 비교**: 여러 장비 데이터 비교 기능  
- **예측 유지보수**: AI 기반 유지보수 추천 시스템
- **AR 오버레이**: 장비에 직접 정보 오버레이

## 📋 개발 가이드라인

### 새로운 기능 추가 절차
1. **데이터 계층**: API 서비스 레이어 구현
2. **상태 관리**: 로컬 상태와 글로벌 상태 분리
3. **UI 컴포넌트**: 모듈화된 컴포넌트 생성
4. **네비게이션**: 라우팅 파라미터 및 네비게이션 연동
5. **테스트**: 단위/통합 테스트 수행

### 코드 품질 원칙
- **관심사 분리**: 데이터, 로직, UI 명확히 분리
- **재사용성**: 컴포넌트와 로직 재사용 극대화  
- **타입 안정성**: TypeScript 엄격 모드로 안정성 확보
- **성능 최적화**: 불필요 리렌더링 및 메모리 누수 방지

기존 Mock를 모두 제거하고 실제 API 연동으로 전환한 점이 가장 큰 개선 사항이며, 이를 통해 진정한 의미의 서비스 통합이 완료되었습니다.
