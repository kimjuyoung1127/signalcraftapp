# AR 오디오 진단 기능 (diagnosis)

이 모듈은 SignalCraft의 핵심 기능인 AR(증강현실) 기반 오디오 진단 시스템을 모듈화하여 포함합니다. "The Terminator HUD"라는 코드 이름으로 개발된 이 기능은, 산업 현장에서 장비를 직접 비추며 실시간 진단하는 몰입형 경험을 제공합니다.

## 📁 모듈 구조

```
src/features/diagnosis/
├── components/
│   ├── DiagnosisCamera.tsx      # 카메라 기반 AR 뷰파인더
│   ├── AROverlay.tsx           # 홀로그래픽 HUD 오버레이
│   ├── TargetReticle.tsx       # 타겟팅 조준기
│   ├── HoloTelemetry.tsx       # 홀로그래픽 원격 측정 정보
│   ├── TacticalTrigger.tsx     # 전술적 트리거 버튼
│   └── AnalysisResultCard.tsx  # 분석 결과 카드
├── screens/
│   └── DiagnosisScreen.tsx     # AR 진단 메인 화면
├── hooks/
│   └── useDiagnosisLogic.ts    # 진단 로직 Hook
└── styles/
│   └── diagnosis-styles.ts     # AR 진단용 스타일
```

## 🎯 기능 핵심 가치

### AR 진단 시스템
- **실시간 AR 디스플레이**: 카메라 기반의 현실 증강 뷰
- **맥락 기반 권한**: 진단 탭 진입 시 자연스러운 권한 요청
- **녹음-분석 파이프라인**: 녹음 → 업로드 → 분석 → 결과 표시
- **비동기 결과 폴링**: 실시간 분석 결과 추적

### Industrial Cyberpunk UX
- **Terminator HUD UI**: 미래적인 홀로그래픽 오버레이
- **맥락 기반 상태 전환**: 녹음 상태에 따른 UI 자동 전환
- **네온 액센트**: Industrial 테마와 조화하는 시각적 요소

## 📱 주요 컴포넌트 상세

### DiagnosisCamera.tsx
```typescript
// AR 진단용 카메라 컴포넌트
export default function DiagnosisCamera({ children, style }) {
  const [hasPermission, setHasPermission] = useState(null);
  const cameraRef = useRef(null);

  // 카메라 권한 자동 요청
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // 카메라 제어 로직
  const captureFrame = useCallback(() => {
    // 현재 카메라 프레임 캡처 (장비 타겟팅용)
  }, []);

  return (
    <Camera
      ref={cameraRef}
      style={[styles.camera, style]}
      type={Camera.Constants.Type.back}
      ratio="16:9"
    >
      {children}
    </Camera>
  );
}
```

**주요 기능:**
- **백 카메라 활용**: 장비 타겟팅을 위한 후면 카메라
- **권한 자동 요청**: 최초 진입 시 자연스러운 권한 획득
- **프레임 제어**: 실시간 비주얼 피드백

### AROverlay.tsx
```typescript
// 홀로그래픽 HUD 오버레이
export default function AROverlay({ uiState, isRecording }) {
  return (
    <View style={styles.overlay}>
      {/* 홀로그래픽 그리드 */}
      <View style={styles.holoGrid}>
        {/* 타겟팅 그리드 라인 */}
        <View style={styles.gridLineHorizontal} />
        <View style={styles.gridLineVertical} />
        <View style={styles.gridCrosshair} />
      </View>
      
      {/* 코너 HUD 요소 */}
      <TargetReticle />
      <HoloTelemetry uiState={uiState} />
      <TacticalTrigger uiState={uiState} />
      
      {/* 진단 표시기 */}
      <AnalysisStatusIndicator isRecording={isRecording} />
    </View>
  );
}
```

**주요 기능:**
- **HUD 그리드**: 타겟팅을 위한 홀로그래픽 그리드
- **정보 오버레이**: 실시간 상태 정보 표시
- **경계 강조**: 진단 영역 시각적 가이드

### useDiagnosisLogic.ts
```typescript
// AR 진단 핵심 로직 Hook
export default function useDiagnosisLogic(deviceId: string) {
  // 상태 관리
  const [uiState, setUiState] = useState('SCAN'); // SCAN → STOP → UPLOAD → WAIT → RESULT
  const [isRecording, setIsRecording] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // 권한 관리
  const requestPermissions = async () => {
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    const audioPermission = await Audio.requestPermissionsAsync();
    
    return cameraPermission.status === 'granted' && 
           audioPermission.status === 'granted';
  };

  // 녹음 제어
  const handleTrigger = useCallback(async () => {
    switch (uiState) {
      case 'SCAN':
        await startRecording();
        break;
      case 'STOP':
        await stopRecording();
        break;
      case 'UPLOAD':
        await handleUpload(deviceId);
        break;
    }
  }, [uiState, deviceId]);

  // 비동기 결과 폴링
  const pollForResult = useCallback(async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const result = await AnalysisService.getAnalysisResult(taskId);
        
        if (result.status === 'COMPLETED') {
          clearInterval(pollInterval);
          setAnalysisResult(result.data);
          setUiState('RESULT');
        }
      } catch (error) {
        // 에러 처리
      }
    }, 2000); // 2초 간격 폴링

    return () => clearInterval(pollInterval);
  }, []);

  return {
    uiState,
    isRecording,
    analysisResult,
    uploadProgress,
    handleTrigger,
    resetDiagnosis
  };
}
```

## 🔄 상태 기반 UI 전환 시스템

### UI 상태 흐름
```
SCAN (스캔 대기)
  ↓ [사용자 트리거]
STOP (녹음 진행 중, 버튼 RED)
  ↓ [녹음 완료]
UPLOAD (업로드 대기)  
  ↓ [사용자 트리거]
WAIT (분석 진행 중, 진행 표시)
  ↓ [분석 완료]
RESULT (결과 표시, 모달)
  ↓ [NEW SCAN]
SCAN (초기 상태 복귀)
```

### 상태별 특징
- **SCAN**: 초록색 트리거, "진단 준비" 상태
- **STOP**: 붉은색 트리거, 녹음 진행 상태 강조
- **UPLOAD**: 주황색 트리거, 업로드 제안
- **WAIT**: 파란색 인디케이터, 비동기 진행 상태
- **RESULT**: 녹/적 결과 표시, 분석 데이터 모달

## 🎨 Industrial Design System

### HUD 컴포넌트 스타일링
```typescript
// diagnosis-styles.ts
export const diagnosisStyles = StyleSheet.create({
  // AR 카메라 스타일
  camera: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 16,
  },
  
  // 홀로그래픽 오버레이
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 5, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 157, 0.3)',
  },
  
  // 타겟팅 그리드
  holoGrid: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 네온 스타일
  neonBorder: {
    borderWidth: 2,
    borderColor: '#00FF9D',
    shadowColor: '#00FF9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
```

### 색상 시스템
- **Primary Neon**: `#00FF9D` (녹색) - 정상/준비 상태
- **Warning Neon**: `#FF5E00` (주황) - 경고/업로드 상태  
- **Critical Neon**: `#FF0055` (적색) - 위험/녹음 상태
- **Info Neon**: `#007BFF` (청색) - 정보/진행 상태

## 🎵 오디오 녹음 파이프라인

### 녹음 제어 로직
```typescript
// 정밀한 시간 측정 녹음
const startRecording = async () => {
  try {
    // 권한 확인
    await requestPermissions();
    
    // 오디오 모드 설정
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    // 녹음 시작
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync({
      android: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_WAV,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_WAV,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_WAV,
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    });

    // 상태 업데이트 콜백
    recording.setOnRecordingStatusUpdate((status) => {
      if (status.isRecording && status.durationMillis) {
        // 현재 녹음 시간 표시 (5초 제한)
        setRecordingTime(status.durationMillis / 1000);
      }
    });

    await recording.startAsync();
    setIsRecording(true);
    setRecording(recording);

  } catch (error) {
    console.error('녹음 시작 실패:', error);
    setUiState('SCAN');
  }
};

// 자동 정지 및 파일 반환
const stopRecording = async () => {
  if (!recording) return null;

  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    setIsRecording(false);
    setUiState('UPLOAD');
    
    return uri; // 업로드에 사용할 파일 URI
    
  } catch (error) {
    console.error('녹음 정지 실패:', error);
    setUiState('SCAN');
    return null;
  }
};
```

## 📊 분석 결과 처리

### 결과 표시 시스템
```typescript
// AnalysisResultCard.tsx - 분석 결과 모달
export default function AnalysisResultCard({ 
  visible, 
  analysisResult, 
  onClose, 
  onNewScan 
}) {
  if (!analysisResult) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        {/* 요약 탭 - 진단서 형태 */}
        <DiagnosisReportOverview diagnosis={analysisResult.diagnosis} />
        
        {/* 탭 기반 상세 정보 */}
        <DiagnosisReportView 
          diagnosis={analysisResult}
          visible={visible}
          onRequestClose={onClose}
        />
        
        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <PrimaryButton
            title="새로운 진단"
            onPress={onNewScan}
          />
        </View>
      </View>
    </Modal>
  );
}
```

### 진단 데이터 구조
```typescript
// 분석 결과 데이터 타입
interface DiagnosisResultData {
  // 기본 진단 정보
  diagnosis: {
    status: 'CRITICAL' | 'WARNING' | 'NORMAL';
    message: string;
    severity_score: number;
  };
  
  // XAI (설명 가능한 AI) 데이터
  explanation: {
    root_cause: string;
    confidence: number;
    key_findings: string[];
  };
  
  // 실행 가능한 가이드
  maintenance_guide: {
    immediate_action: string;
    recommended_parts: string[];
    estimated_downtime: string;
  };
  
  // 시각화 데이터
  radar_data: RadarChartProps;
  spectrum_data: SpectrumChartProps;
  trend_data: TrendChartProps;
}
```

## 🚀 성능 최적화

### 카메라 성능
```typescript
// 카메라 성능 최적화 설정
const optimizedCameraProps = {
  // 해상도 최적화
  ratio: "16:9",        // 고화질 비율
  quality: 0.7,         // 품질과 성능 밸런스
  
  // 자동 포커스 최적화
  autoFocus: 'on',
  focusDepth: 1.0,
  
  // 프레임레이트 최적화
  fps: 30,             // 30fps로 안정성 확보
  
  // 노출 설정
  whiteBalance: 'auto',
  exposureMode: 'auto',
};
```

### 메모리 관리
```typescript
// 컴포넌트 언마운트 시 정리
useEffect(() => {
  return () => {
    if (recording) {
      recording.stopAndUnloadAsync();
    }
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };
}, []);

// 이미지 및 오버레이 최적화
const memoizedOverlay = React.memo(AROverlay, (prevProps, nextProps) => {
  // UI 상태 변경 시에만 리렌더링
  return prevProps.uiState === nextProps.uiState &&
         prevProps.isRecording === nextProps.isRecording;
});
```

## 🔄 프론트엔드-백엔드 연동

### 오디오 업로드 API
```typescript
// AnalysisService.ts 업로드 함수
export const uploadAudio = async (audioUri: string, deviceId: string) => {
  try {
    // FormData 생성
    const formData = new FormData();
    formData.append('file', {
      uri: audioUri,
      type: 'audio/wav',
      name: `recording_${Date.now()}.wav`,
    });
    formData.append('device_id', deviceId);

    // API 호출
    const response = await apiClient.post('/api/mobile/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progress) => {
        const uploadPercentage = Math.round(
          (progress.loaded * 100) / progress.total
        );
        setUploadProgress(uploadPercentage);
      },
    });

    return response.data.task_id; // 폴링에 사용할 Task ID

  } catch (error) {
    throw new Error('오디오 업로드 실패: ' + error.message);
  }
};
```

## 📱 사용자 경험 최적화

### 맥락 기반 권한 요청
```typescript
// 진단 탭 진입 시 자연스러운 권한 요청
const handleTabNavigation = useCallback(async () => {
  // 미리 권한 확인 후 요청
  const hasPermissions = await permissionsCheck();
  
  if (!hasPermissions) {
    // 권한 요청 UI 자연스럽게 표시
    showPermissionModal(() => {
      requestPermissions();
    });
  }
  
  // AR HUD 활성화
  setUiState('SCAN');
}, []);

// 권한 거부 처리
const handlePermissionDenied = () => {
  Alert.alert(
    '권한 필요',
    'AR 진단 기능은 카메라 및 마이크 권한이 필요합니다.',
    [
      { text: '취소', style: 'cancel' },
      { text: '설정으로 이동', onPress: () => Linking.openSettings() }
    ]
  );
};
```

### 상태 기반 피드백
```typescript
// 진행 상태를 사용자에게 알리는 촉각 효과
const triggerHapticFeedback = (state: string) => {
  switch (state) {
    case 'SCAN':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'STOP':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'RESULT':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
  }
};

// 상태 변경 시 효과 적용
useEffect(() => {
  triggerHapticFeedback(uiState);
}, [uiState]);
```

## 📋 개발 가이드라인

### 새로운 HUD 컴포넌트 추가
1. **컴포넌트 생성**: `src/features/diagnosis/components/`에 생성
2. **상태 연동**: `useDiagnosisLogic` 훅으로 상태 전달
3. **스타일링**: Industrial Cyberpunk 스타일 적용
4. **애니메이션**: Reanimated로 부드러운 전환 효과
5. **테스트**: 다양한 상태에서 동작 확인

### 성능 원칙
- **렌더링 최적화**: React.memo로 불필요 렌더링 방지
- **메모리 관리**: 컴포넌트 언마운트 시 리소스 정리
- **비동기 처리**: 로딩 상태와 에러 처리 철저

상세 코드 및 전체 아키텍처는 `useDiagnosisLogic.ts`와 `DiagnosisScreen.tsx`에서 확인할 수 있습니다.
