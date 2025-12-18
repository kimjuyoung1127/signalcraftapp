import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal, Alert } from 'react-native';
import { DiagnosisCamera } from '../components/DiagnosisCamera';
import { AROverlay } from '../components/AROverlay';
import { TargetReticle } from '../components/TargetReticle';
import { HoloTelemetry } from '../components/HoloTelemetry';
import { TargetPanel } from '../components/TargetPanel';
import { TacticalTrigger } from '../components/TacticalTrigger';
import { DiagnosisReportView } from '../components/report/DiagnosisReportView';
import { ModelSelector } from '../components/ModelSelector';
import { useDiagnosisLogic } from '../hooks/useDiagnosisLogic';
import { useDeviceStore } from '../../../store/useDeviceStore';
import { Cpu } from 'lucide-react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import AnalysisService, { ModelInfo } from '../services/analysisService';

type DiagnosisScreenRouteProp = RouteProp<{ Diagnosis: { deviceId: string } }, 'Diagnosis'>;

export const DiagnosisScreen = () => {
  const route = useRoute<DiagnosisScreenRouteProp>();
  const navigation = useNavigation();
  const { selectedDevice } = useDeviceStore();

  const deviceId = route.params?.deviceId || selectedDevice?.device_id || selectedDevice?.id || 'dev_unknown';

  // deviceId에서 장비 타입 추론 (예: "MOCK-VALVE-001" -> "valve")
  const deviceType = useMemo(() => {
    const idLower = deviceId.toLowerCase();
    if (idLower.includes('valve')) return 'valve';
    if (idLower.includes('fan')) return 'fan';
    if (idLower.includes('pump')) return 'pump';
    return undefined; // 특정 장비 타입이 없는 경우
  }, [deviceId]);

  const [modelSelectorVisible, setModelSelectorVisible] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string>(''); // 초기값 비워둠
  const [selectedModelType, setSelectedModelType] = useState<string>(''); // 초기값 비워둠
  const [selectedModelName, setSelectedModelName] = useState<string>(''); // 초기값 비워둠

  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]); // [NEW] 사용 가능한 모델 목록 상태


  // [NEW] ModelSelector에 전달할 onSelect 함수
  const handleModelSelect = (modelId: string, modelType: string, modelName: string) => {
    setSelectedModelId(modelId);
    setSelectedModelType(modelType);
    setSelectedModelName(modelName);
    setModelSelectorVisible(false);
  };

  useEffect(() => {
    const loadModels = async () => {
      try {
        // deviceType을 기반으로 필터링된 모델 목록 요청
        const models = await AnalysisService.getAvailableModels(deviceType);
        setAvailableModels(models); // 모델 목록 업데이트

        // 기본 모델 선택 로직
        // 1. 해당 장비 타입의 기본 Level 1 모델 (is_default && type.startsWith('level1'))
        // 2. 해당 장비 타입의 첫 번째 Level 1 모델
        // 3. 해당 장비 타입의 첫 번째 모델
        // 4. 그냥 첫 번째 모델 (장비 타입 무관)
        const defaultModel = models.find(m => m.is_default && m.type.startsWith('level1')) ||
          models.find(m => m.type.startsWith('level1')) ||
          (models.length > 0 ? models[0] : undefined);

        if (defaultModel) {
          setSelectedModelId(defaultModel.id);
          setSelectedModelType(defaultModel.type);
          setSelectedModelName(defaultModel.name);
        } else {
          // 일치하는 모델이 없는 경우 기본값 설정 또는 에러 처리
          setSelectedModelId('no_model');
          setSelectedModelType('unknown');
          setSelectedModelName('사용 가능한 모델 없음');
          Alert.alert("알림", "선택된 장비 타입에 맞는 AI 모델을 찾을 수 없습니다.");
        }
      } catch (error) {
        console.error("Failed to load AI models:", error);
        Alert.alert("에러", "AI 모델 목록을 불러오는 데 실패했습니다.");
        setSelectedModelId('error');
        setSelectedModelType('unknown');
        setSelectedModelName('모델 로드 실패');
      }
    };
    loadModels();
  }, [deviceType]); // deviceType이 변경될 때마다 모델을 다시 로드

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
  } = useDiagnosisLogic(deviceId, selectedModelId, selectedModelType); // [수정] selectedModelId, selectedModelType 전달

  const allPermissionsGranted = cameraPermissionGranted && micPermissionGranted;

  const showRealReport = uiStatus === 'result' && detailedReport !== null;

  const handleReportClose = () => {
    resetDiagnosis();
    navigation.goBack();
  };

  // [NEW] 피드백 제출 핸들러
  const handleFeedbackSubmit = async (feedbackStatus: 'TRUE_POSITIVE' | 'FALSE_POSITIVE' | 'IGNORE', feedbackComment?: string) => {
    if (!analysisTask?.task_id) {
      Alert.alert("오류", "분석 작업 ID를 찾을 수 없습니다. 피드백을 제출할 수 없습니다.");
      return;
    }
    try {
      await AnalysisService.submitFeedback(analysisTask.task_id, feedbackStatus, feedbackComment);
      // 성공 시 추가 로직 (예: UI 업데이트, 토스트 메시지)
      console.log(`Feedback submitted for task ${analysisTask.task_id}: ${feedbackStatus}`);
      Alert.alert("피드백 제출 완료", "제출하신 정보는 AI 모델 개선에 활용됩니다. 감사합니다!");
    } catch (error) {
      console.error("피드백 제출 실패:", error);
      Alert.alert("피드백 제출 실패", "오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // [삭제] Helper to get model name - 이제 selectedModelName 상태 변수 사용
  // const getModelName = (id: string) => { ... };

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
              {selectedModelName} {/* [수정] 상태 변수 사용 */}
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
                analysisId={analysisTask?.task_id || ''} // analysisTask가 null일 수 있으므로 빈 문자열 전달
                onFeedbackSubmit={handleFeedbackSubmit}
              />
            )}
          </Modal>

          {/* 모델 선택 모달 */}
          <ModelSelector
            visible={modelSelectorVisible}
            currentModelId={selectedModelId}
            models={availableModels}
            onSelect={handleModelSelect}
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
    backgroundColor: '#000',
  },
  modelChip: {
    position: 'absolute',
    top: 100, // Adjust based on header height or safe area
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#00E5FF',
    zIndex: 10,
  },
  modelChipText: {
    color: '#00E5FF',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  controlsLayer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
});