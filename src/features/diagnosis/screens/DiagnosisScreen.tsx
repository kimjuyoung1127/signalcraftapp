import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { DiagnosisCamera } from '../components/DiagnosisCamera';
import { AROverlay } from '../components/AROverlay';
import { TargetReticle } from '../components/TargetReticle';
import { HoloTelemetry } from '../components/HoloTelemetry';
import { TacticalTrigger } from '../components/TacticalTrigger';
import { AnalysisResultCard } from '../components/AnalysisResultCard';
import { useDiagnosisLogic } from '../hooks/useDiagnosisLogic';
import { RefreshCcw } from 'lucide-react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

type DiagnosisScreenRouteProp = RouteProp<{ Diagnosis: { deviceId: string } }, 'Diagnosis'>;

export const DiagnosisScreen = () => {
  const route = useRoute<DiagnosisScreenRouteProp>();
  // deviceId가 없으면 기본값을 사용하거나 에러 처리를 해야 하지만, 여기서는 안전하게 문자열로 처리
  const deviceId = route.params?.deviceId || 'dev_unknown';

  const {
    recordingStatus,
    uiStatus,
    durationMillis,
    analysisTask,
    handleTrigger,
    resetDiagnosis,
    cameraPermissionGranted, // 카메라 권한 상태 추가
    micPermissionGranted // 마이크 권한 상태 추가
  } = useDiagnosisLogic(deviceId);

  const allPermissionsGranted = cameraPermissionGranted && micPermissionGranted;

  return (
    <View style={styles.container}>
      {/* Layer 0: Background Camera or Permission Request UI */}
      <DiagnosisCamera />

      {allPermissionsGranted && (
        <>
          {/* Layer 1: HUD Overlay (Static) */}
          <AROverlay />

          {/* Layer 2: Dynamic Visualizers */}
          <TargetReticle status={uiStatus} />
          
          <HoloTelemetry 
            status={uiStatus === 'recording' ? 'RECORDING' : uiStatus === 'analyzing' ? 'ANALYZING...' : recordingStatus.toUpperCase()} 
            durationMillis={durationMillis}
            taskId={analysisTask?.task_id}
          />

          {/* Layer 3: Controls & Results */}
          <View style={styles.controlsLayer}>
            {uiStatus === 'result' && analysisTask?.result ? (
                <View style={styles.resultContainer}>
                    <AnalysisResultCard result={analysisTask.result} />
                    <TouchableOpacity onPress={resetDiagnosis} style={styles.resetButton}>
                        <RefreshCcw color="#00E5FF" size={24} />
                        <Text style={styles.resetText}>NEW SCAN</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TacticalTrigger 
                    status={recordingStatus === 'stopped' ? 'stopped' : uiStatus} 
                    onPress={handleTrigger} 
                />
            )}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // 반투명 오버레이
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1, // 카메라 위에 표시
  },
  permissionOverlayText: {
    color: '#FFC800', // Warning Color
    fontSize: 18,
    textAlign: 'center',
    marginHorizontal: 30,
    lineHeight: 25,
  },
  controlsLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', // Dim background for result
    padding: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
  },
  resetText: {
    color: '#00E5FF',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

