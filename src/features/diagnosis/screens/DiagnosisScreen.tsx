import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { DiagnosisCamera } from '../components/DiagnosisCamera';
import { AROverlay } from '../components/AROverlay';
import { TargetReticle } from '../components/TargetReticle';
import { HoloTelemetry } from '../components/HoloTelemetry';
import { TacticalTrigger } from '../components/TacticalTrigger';
import { DiagnosisReportView, DetailedAnalysisReport } from '../components/report/DiagnosisReportView'; // 타입 임포트 추가
import { useDiagnosisLogic } from '../hooks/useDiagnosisLogic';
import { useDeviceStore } from '../../../store/useDeviceStore'; // [추가] 스토어 임포트
import { RefreshCcw, Bug } from 'lucide-react-native'; // Bug 아이콘 추가
import { useRoute, RouteProp } from '@react-navigation/native';

type DiagnosisScreenRouteProp = RouteProp<{ Diagnosis: { deviceId: string } }, 'Diagnosis'>;

// --- DEBUG MOCK DATA ---
const DEBUG_MOCK_REPORT: DetailedAnalysisReport = {
  entity_type: "RotatingMachine",
  status: {
    current_state: "CRITICAL",
    health_score: 35.2,
    label: "CRITICAL",
    summary: "Critical failure detected. Immediate action required."
  },
  diagnosis: {
    root_cause: "Inner Race Bearing Fault (내륜 베어링 손상)",
    confidence: 0.98,
    severity_score: 9
  },
  maintenance_guide: {
    immediate_action: "즉시 가동 중지 및 베어링 교체 요망",
    recommended_parts: ["Bearing Unit (SKF-6205)", "Seal Kit"],
    estimated_downtime: "4~6 Hours"
  },
  ensemble_analysis: {
    consensus_score: 0.98,
    voting_result: {
      "Autoencoder": { "status": "CRITICAL", "score": 0.99 },
      "SVM": { "status": "CRITICAL", "score": 0.95 },
      "CNN": { "status": "CRITICAL", "score": 0.98 },
      "RandomForest": { "status": "WARNING", "score": 0.75 },
      "MIMII": { "status": "CRITICAL", "score": 0.92 }
    }
  },
  frequency_analysis: {
    bpfo_frequency: 235.4,
    detected_peaks: [
      { "hz": 60, "amp": 0.2, "match": false, "label": "Power" },
      { "hz": 120, "amp": 0.1, "match": false, "label": "Harmonic" },
      { "hz": 235, "amp": 0.85, "match": true, "label": "BPFO (Fault)" }
    ],
    diagnosis: "Spectrum peak at 235Hz matches BPFO signature."
  },
  predictive_insight: {
    rul_prediction_days: 14,
    anomaly_score_history: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 86400000).toISOString(),
      value: 0.2 + (0.7 * ((i / 29) ** 2))
    }))
  }
};

export const DiagnosisScreen = () => {
  const route = useRoute<DiagnosisScreenRouteProp>();
  const { selectedDevice } = useDeviceStore(); // [추가] selectedDevice 가져오기

  // 우선순위: route params -> selectedDevice.device_id -> selectedDevice.id -> 'dev_unknown'
  const deviceId = route.params?.deviceId || selectedDevice?.device_id || selectedDevice?.id || 'dev_unknown';

  // 훅에서 상태와 setter를 가져오면 좋겠지만, useDiagnosisLogic이 setter를 노출하지 않음.
  // 따라서 로컬 상태를 하나 더 두거나, 훅을 수정해야 함.
  // 여기서는 간편하게 로컬 상태로 디버그 모달 제어.
  const [debugModalVisible, setDebugModalVisible] = useState(false);

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
  } = useDiagnosisLogic(deviceId);

  const allPermissionsGranted = cameraPermissionGranted && micPermissionGranted;

  // 실제 로직에 의한 리포트 표시 여부
  const showRealReport = uiStatus === 'result' && detailedReport !== null;

  const handleDebugPress = () => {
    setDebugModalVisible(true);
  };

  const closeDebugModal = () => {
    setDebugModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <DiagnosisCamera />

      {allPermissionsGranted && (
        <>
          <AROverlay />
          <TargetReticle status={uiStatus === 'fetching_report' ? 'analyzing' : uiStatus} />
          <HoloTelemetry
            status={uiStatus === 'recording' ? 'RECORDING' : uiStatus === 'analyzing' || uiStatus === 'fetching_report' ? 'ANALYZING...' : recordingStatus.toUpperCase()}
            durationMillis={durationMillis}
            taskId={analysisTask?.task_id}
          />

          <View style={styles.controlsLayer}>
            <TacticalTrigger
              status={recordingStatus === 'stopped' ? 'stopped' : (uiStatus === 'fetching_report' ? 'analyzing' : uiStatus)}
              onPress={handleTrigger}
            />

            {/* --- DEBUG BUTTON --- */}
            <TouchableOpacity onPress={handleDebugPress} style={styles.debugButton}>
              <Bug color="#FFC800" size={20} />
              <Text style={styles.debugText}>DEBUG UI</Text>
            </TouchableOpacity>
          </View>

          {/* Real Report Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={showRealReport}
            onRequestClose={resetDiagnosis}
          >
            {detailedReport && (
              <DiagnosisReportView
                reportData={detailedReport}
                onClose={resetDiagnosis}
                isDemoMode={isDemoMode}
              />
            )}
          </Modal>

          {/* Debug Report Modal */}
          <Modal
            animationType="slide"
            transparent={false}
            visible={debugModalVisible}
            onRequestClose={closeDebugModal}
          >
            <DiagnosisReportView
              reportData={DEBUG_MOCK_REPORT}
              onClose={closeDebugModal}
              isDemoMode={true}
            />
          </Modal>
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
  // ... 기존 스타일 ...
  controlsLayer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  debugButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFC800',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  debugText: {
    color: '#FFC800',
    fontSize: 10,
    fontWeight: 'bold',
  }
});

