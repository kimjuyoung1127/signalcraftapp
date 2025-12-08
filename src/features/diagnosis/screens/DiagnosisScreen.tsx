import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { DiagnosisCamera } from '../components/DiagnosisCamera';
import { AROverlay } from '../components/AROverlay';
import { TargetReticle } from '../components/TargetReticle';
import { HoloTelemetry } from '../components/HoloTelemetry';
import { TargetPanel } from '../components/TargetPanel';
import { TacticalTrigger } from '../components/TacticalTrigger';
import { DiagnosisReportView, DetailedAnalysisReport } from '../components/report/DiagnosisReportView';
import { ModelSelector, AIModel } from '../components/ModelSelector';
import { useDiagnosisLogic } from '../hooks/useDiagnosisLogic';
import { useDeviceStore } from '../../../store/useDeviceStore';
import { Cpu } from 'lucide-react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';

type DiagnosisScreenRouteProp = RouteProp<{ Diagnosis: { deviceId: string } }, 'Diagnosis'>;

export const DiagnosisScreen = () => {
  const route = useRoute<DiagnosisScreenRouteProp>();
  const navigation = useNavigation();
  const { selectedDevice } = useDeviceStore();

  // 우선순위: route params -> selectedDevice.device_id -> selectedDevice.id -> 'dev_unknown'
  const deviceId = route.params?.deviceId || selectedDevice?.device_id || selectedDevice?.id || 'dev_unknown';

  const [modelSelectorVisible, setModelSelectorVisible] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('level1'); // [수정] 기본값 변경 'level1'

  const {
    recordingStatus,
    uiStatus,
    durationMillis,
    analysisTask,
    detailedReport,
    isDemoMode,
    handleTrigger,
    resetDiagnosis,
    cameraPermissionGranted,
    micPermissionGranted
  } = useDiagnosisLogic(deviceId, selectedModelId); // [수정] selectedModelId 전달

  const allPermissionsGranted = cameraPermissionGranted && micPermissionGranted;

  const showRealReport = uiStatus === 'result' && detailedReport !== null;

  const handleReportClose = () => {
    resetDiagnosis();
    navigation.goBack();
  };

  // Helper to get model name
  const getModelName = (id: string) => {
    switch (id) {
      case 'level1': return 'Level 1 (Hybrid ML)';
      case 'level2': return 'Level 2 (Autoencoder)';
      default: return '모델 선택';
    }
  };

  // Helper to translate status for HoloTelemetry
  const getTranslatedStatus = (status: string) => {
    switch (status) {
      case 'RECORDING': return '녹음 중';
      case 'ANALYZING...': return '분석 중...';
      case 'IDLE': return '대기';
      case 'STOPPED': return '정지됨';
      case 'SUCCESS': return '완료';
      case 'ERROR': return '오류';
      case 'INITIALIZING': return '초기화 중';
      case 'FETCHING_REPORT': return '리포트 로드 중';
      default: return status;
    }
  };

  const currentHoloStatus = uiStatus === 'recording'
    ? 'RECORDING'
    : (uiStatus === 'analyzing' || uiStatus === 'fetching_report'
      ? 'ANALYZING...'
      : recordingStatus.toUpperCase());


  return (
    <View style={styles.container}>
      <DiagnosisCamera />

      {allPermissionsGranted && (
        <>
          <AROverlay />

          <TargetPanel
            deviceName={selectedDevice?.name || '알 수 없는 장비'}
            model={selectedDevice?.model}
            deviceId={deviceId}
          />

          {/* --- AI 모델 선택 Chip (오른쪽 상단) --- */}
          <TouchableOpacity
            style={styles.modelChip}
            onPress={() => setModelSelectorVisible(true)}
          >
            <Cpu size={14} color="#00E5FF" />
            <Text style={styles.modelChipText}>
              {getModelName(selectedModelId)}
            </Text>
          </TouchableOpacity>

          <TargetReticle status={uiStatus === 'fetching_report' ? 'analyzing' : uiStatus} />
          <HoloTelemetry
            status={getTranslatedStatus(currentHoloStatus)}
            durationMillis={durationMillis}
            taskId={analysisTask?.task_id}
          />

          <View style={styles.controlsLayer}>
            <TacticalTrigger
              status={recordingStatus === 'stopped' ? 'stopped' : (uiStatus === 'fetching_report' ? 'analyzing' : uiStatus)}
              onPress={handleTrigger}
            />
          </View>

          {/* 실제 분석 리포트 모달 */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={showRealReport}
            onRequestClose={handleReportClose}
          >
            {detailedReport && (
              <DiagnosisReportView
                reportData={detailedReport}
                onClose={handleReportClose}
                isDemoMode={isDemoMode}
              />
            )}
          </Modal>

          {/* 모델 선택 모달 */}
          <ModelSelector
            visible={modelSelectorVisible}
            currentModelId={selectedModelId}
            onSelect={setSelectedModelId}
            onClose={() => setModelSelectorVisible(false)}
          />
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
  controlsLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  modelChip: {
    position: 'absolute',
    top: 60,
    right: 20, // 오른쪽 상단
    zIndex: 10,
    backgroundColor: 'rgba(0, 16, 20, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00E5FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modelChipText: {
    color: '#00E5FF',
    fontSize: 14,
    fontWeight: 'bold',
  }
});