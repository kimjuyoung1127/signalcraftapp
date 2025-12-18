import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XCircle, AlertTriangle, Wrench, Clock, Activity } from 'lucide-react-native'; // 아이콘 추가

// 차트 컴포넌트 임포트
import { AudioVisualizer } from '../../../../components/AudioVisualizer';
import { EnsembleRadar } from '../charts/EnsembleRadar';
import { FrequencySpectrum } from '../charts/FrequencySpectrum';
import { PredictiveTrendChart } from '../charts/PredictiveTrendChart';

// --- Interfaces ---
export interface AnalysisDetails {
  method?: string;
  ml_anomaly_score?: number;
  peak_frequencies?: number[];
  noise_level?: number;
  frequency?: number;
  resonance_energy_ratio?: number;
  high_freq_energy_ratio?: number;
  duration?: number;
}

interface StatusData {
  current_state: 'NORMAL' | 'WARNING' | 'CRITICAL';
  health_score: number;
  label: 'NORMAL' | 'WARNING' | 'CRITICAL';
  summary: string;
}

interface DiagnosisData {
  root_cause: string;
  confidence: number; // 0.0 ~ 1.0
  severity_score: number; // 0 ~ 10
}

interface MaintenanceGuideData {
  immediate_action: string;
  recommended_parts: string[];
  estimated_downtime: string;
}

interface VotingResult {
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  score: number;
}

interface EnsembleAnalysisData {
  consensus_score: number; // 0.0 ~ 1.0
  voting_result: {
    [modelName: string]: VotingResult;
  };
}

interface DetectedPeak {
  hz: number;
  amp: number;
  match: boolean;
  label?: string;
}

interface FrequencyAnalysisData {
  bpfo_frequency: number;
  detected_peaks: DetectedPeak[];
  diagnosis: string;
}

interface AnomalyScoreHistory {
  date: string;
  value: number;
}

interface PredictiveInsightData {
  rul_prediction_days: number;
  anomaly_score_history: AnomalyScoreHistory[];
}

export interface DetailedAnalysisReport {
  entity_type: string;
  status: StatusData;
  diagnosis: DiagnosisData;
  maintenance_guide: MaintenanceGuideData;
  ensemble_analysis: EnsembleAnalysisData;
  frequency_analysis: FrequencyAnalysisData;
  predictive_insight: PredictiveInsightData;
  original_analysis_result?: any;
  analysis_details?: AnalysisDetails;
}

interface DiagnosisReportViewProps {
  reportData: DetailedAnalysisReport;
  onClose: () => void;
  isDemoMode: boolean;
  analysisId: string; // [NEW] 분석 결과 ID
  onFeedbackSubmit: (status: 'TRUE_POSITIVE' | 'FALSE_POSITIVE', comment?: string) => Promise<void>; // [NEW] 피드백 제출 콜백
}

const { width } = Dimensions.get('window');
const VISUALIZER_SIZE_SMALL = width * 0.5;

// --- Utility Function ---
const getStatusColor = (status: StatusData['current_state']) => {
  switch (status) {
    case 'NORMAL': return '#00E5FF'; // accentPrimary
    case 'WARNING': return '#FFC800'; // accentWarning
    case 'CRITICAL': return '#FF3366'; // accentDanger
    default: return '#A0A0A0'; // textSecondary
  }
};

// --- Tab Components ---
export const OverviewTab: React.FC<{ reportData: DetailedAnalysisReport; isDemo: boolean }> = ({ reportData, isDemo }) => {
  const status = reportData.status.current_state || 'NORMAL';
  const statusColor = getStatusColor(status);
  const rootCause = reportData.diagnosis?.root_cause || '분석 중...';
  const confidence = reportData.diagnosis?.confidence ? (reportData.diagnosis.confidence * 100).toFixed(1) : '0.0';
  const maintenance = reportData.maintenance_guide;

  return (
    <ScrollView className="flex-1 bg-bg px-2" contentContainerStyle={localStyles.tabContentContainer}>

      {/* 1. Visualizer & Status Card */}
      <View className="bg-bgElevated rounded-xl border border-borderSubtle my-2 p-0 items-center overflow-hidden">
        <View style={localStyles.visualizerContainerSmall}>
          <AudioVisualizer status={status} size={VISUALIZER_SIZE_SMALL} />
        </View>

        <View className="w-full px-4 py-3 border-t border-borderSubtle bg-bg/50">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-textSecondary text-xs font-bold">근본 원인 </Text>
            <View className="flex-row items-center gap-1">
              <Activity size={12} color={statusColor} />
              <Text style={{ color: statusColor, fontSize: 12, fontWeight: 'bold' }}>{confidence}% 신뢰도</Text>
            </View>
          </View>
          <Text className="text-white text-lg font-bold leading-snug">{rootCause}</Text>
        </View>
      </View>

      {/* 2. Maintenance Guide Card (Action Item) */}
      {maintenance && (
        <View className="bg-bgElevated rounded-xl border border-borderSubtle my-2 p-4">
          <View className="flex-row items-center mb-3 gap-2">
            <Wrench size={18} color="#FFC800" />
            <Text className="text-white text-base font-bold">유지보수 가이드</Text>
          </View>

          <View className="mb-4">
            <Text className="text-textSecondary text-xs font-bold mb-1">권장 조치</Text>
            <View className="bg-bg/50 p-3 rounded-lg border border-borderSubtle">
              <Text className="text-white text-sm">{maintenance.immediate_action}</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-2">
              <Text className="text-textSecondary text-xs font-bold mb-1">필요 부품</Text>
              {maintenance.recommended_parts.length > 0 ? (
                maintenance.recommended_parts.map((part, i) => (
                  <Text key={i} className="text-accentPrimary text-xs mb-0.5">• {part}</Text>
                ))
              ) : (
                <Text className="text-textSecondary text-xs">- 없음</Text>
              )}
            </View>
            <View className="flex-1 ml-2">
              <Text className="text-textSecondary text-xs font-bold mb-1">예상 다운타임</Text>
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#FF3366" />
                <Text className="text-white text-sm font-bold">{maintenance.estimated_downtime}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 3. Key Metrics */}
      <View className="flex-row flex-wrap justify-between my-2">
        <View className="bg-bgElevated rounded-xl border border-borderSubtle p-4 my-1 w-[48%]">
          <Text className="text-textSecondary text-sm font-bold mb-1">건강 점수</Text>
          <Text className="text-2xl font-bold" style={{ color: getStatusColor(status) }}>{reportData.status.health_score.toFixed(1)} <Text className="text-sm">/ 100</Text></Text>
        </View>

        <View className="bg-bgElevated rounded-xl border border-borderSubtle p-4 my-1 w-[48%]">
          <Text className="text-textSecondary text-sm font-bold mb-1">예측 잔여 수명</Text>
          <Text className="text-xl font-bold" style={{ color: getStatusColor(status) }}>
            {reportData.predictive_insight.rul_prediction_days <= 0 ? '수명 종료' : `${reportData.predictive_insight.rul_prediction_days}일`}
          </Text>
        </View>
      </View>

    </ScrollView>
  );
};

export const DetailAnalysisTab: React.FC<{ reportData: DetailedAnalysisReport }> = ({ reportData }) => {

  // [Mapping Logic] analysis_details(실제 분석) -> FrequencySpectrum 데이터 변환
  let frequencyData = reportData.frequency_analysis;

  if (reportData.analysis_details?.peak_frequencies && reportData.analysis_details.peak_frequencies.length > 0) {
    // 실제 ML 분석 결과가 있으면 덮어쓰기
    const rawPeaks = reportData.analysis_details.peak_frequencies;
    frequencyData = {
      ...frequencyData,
      detected_peaks: rawPeaks.map(hz => ({
        hz: hz,
        amp: 0.8, // 백엔드에서 진폭을 안 주므로 시각화용 고정값 사용 (추후 개선 가능)
        match: hz > 0,
        label: `${hz.toFixed(0)}Hz`
      })),
      diagnosis: rawPeaks.length > 0
        ? `${rawPeaks.length}개의 주요 주파수 피크가 감지되었습니다.`
        : '특이 주파수 없음.'
    };
  }

  return (
    <ScrollView className="flex-1 bg-bg px-2" contentContainerStyle={localStyles.tabContentContainer}>
      <View className="bg-bgElevated rounded-xl border border-borderSubtle my-2">
        <EnsembleRadar data={reportData.ensemble_analysis} />
      </View>
      <View className="bg-bgElevated rounded-xl border border-borderSubtle my-2">
        <FrequencySpectrum data={frequencyData} />
      </View>
    </ScrollView>
  );
};

export const PredictionTab: React.FC<{ reportData: DetailedAnalysisReport }> = ({ reportData }) => {
  return (
    <ScrollView className="flex-1 bg-bg px-2" contentContainerStyle={localStyles.tabContentContainer}>
      <View className="bg-bgElevated rounded-xl border border-borderSubtle my-2">
        <PredictiveTrendChart data={reportData.predictive_insight} />
      </View>
    </ScrollView>
  );
};

export const DiagnosisReportView: React.FC<DiagnosisReportViewProps> = ({ reportData, onClose, isDemoMode, analysisId, onFeedbackSubmit }) => {
  const theme = useTheme();
  const { colors } = theme;
  const [activeTab, setActiveTab] = useState<'Overview' | 'Detail' | 'Prediction'>('Overview');

  // [NEW] Feedback related states
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [selectedFeedbackStatus, setSelectedFeedbackStatus] = useState<'TRUE_POSITIVE' | 'FALSE_POSITIVE'>();

  const handleFeedbackConfirm = async () => {
    if (!selectedFeedbackStatus) return; // Should not happen

    try {
      await onFeedbackSubmit(selectedFeedbackStatus, feedbackComment);
      setFeedbackModalVisible(false);
      setFeedbackComment('');
      // Optionally, show a success toast or alert
      Alert.alert("피드백 제출 완료", "제출하신 정보는 AI 모델 개선에 활용됩니다. 감사합니다!");
      onClose(); // Close the report view after feedback
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      Alert.alert("피드백 제출 실패", "오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewTab reportData={reportData} isDemo={isDemoMode} />;
      case 'Detail':
        return <DetailAnalysisTab reportData={reportData} />;
      case 'Prediction':
        return <PredictionTab reportData={reportData} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row items-center justify-center py-4 border-b border-borderSubtle bg-bg">
        <Text className="text-textPrimary text-lg font-bold">AI 분석 리포트</Text>
        <TouchableOpacity onPress={onClose} className="absolute right-4 p-1">
          <XCircle size={24} color="#A0A0A0" />
        </TouchableOpacity>
      </View>

      {/* Custom Tab Bar */}
      <View className="flex-row h-12 bg-bgElevated border-b border-borderSubtle">
        {['Overview', 'Detail', 'Prediction'].map((tab) => {
          const isActive = activeTab === tab;
          const label = tab === 'Overview' ? '요약' : tab === 'Detail' ? '상세 분석' : '미래 예측';
          return (
            <TouchableOpacity
              key={tab}
              className={`flex-1 items-center justify-center border-b-2 ${isActive ? 'border-accentPrimary' : 'border-transparent'}`}
              onPress={() => setActiveTab(tab as any)}
            >
              <Text className={`text-sm font-bold ${isActive ? 'text-accentPrimary' : 'text-textSecondary'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab Content */}
      <View className="flex-1">
        {renderTabContent()}
      </View>

      {/* 피드백 버튼 섹션 */}
      {!isDemoMode && ( // 데모 모드에서는 피드백 버튼 숨기기
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackPrompt}>이 진단 결과가 정확한가요?</Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={[styles.feedbackButton, styles.truePositiveButton]}
              onPress={() => {
                setSelectedFeedbackStatus('TRUE_POSITIVE');
                setFeedbackModalVisible(true);
              }}
            >
              <AlertTriangle size={18} color="#FFF" />
              <Text style={styles.feedbackButtonText}>실제 이상</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.feedbackButton, styles.falsePositiveButton]}
              onPress={() => {
                setSelectedFeedbackStatus('FALSE_POSITIVE');
                setFeedbackModalVisible(true);
              }}
            >
              <XCircle size={18} color="#FFF" />
              <Text style={styles.feedbackButtonText}>정상 (오탐지)</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 피드백 확인 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={feedbackModalVisible}
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>진단 결과 피드백</Text>
            <Text style={styles.modalText}>
              이 분석 결과에 대한 피드백을 제출하시겠습니까?
              제출하신 정보는 AI 모델 개선에 활용됩니다.
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="추가 코멘트 (선택 사항)"
              placeholderTextColor="#A0A0A0"
              multiline
              value={feedbackComment}
              onChangeText={setFeedbackComment}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.textStyle}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonConfirm]}
                onPress={handleFeedbackConfirm}
              >
                <Text style={styles.textStyle}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({ // Tailwind 클래스로 대체하기 어려운 스타일만 남김
  tabContentContainer: {
    paddingBottom: 50, // ScrollView bottom padding
  },
  visualizerContainerSmall: { // 작아진 비주얼라이저 컨테이너
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: VISUALIZER_SIZE_SMALL,
    height: VISUALIZER_SIZE_SMALL * 1.1,
    marginBottom: 10,
  },
  visualizerOverlaySmall: { // 이 스타일은 더 이상 사용되지 않지만, 혹시 몰라 유지 (제거 가능)
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  // Feedback specific styles
  feedbackContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#050505', // bg
    borderTopWidth: 1,
    borderColor: '#262626', // borderSubtle
  },
  feedbackPrompt: {
    color: '#F5F5F5', // textPrimary
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 10,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    minWidth: '45%',
  },
  truePositiveButton: {
    backgroundColor: '#FF3366', // accentDanger
  },
  falsePositiveButton: {
    backgroundColor: '#00E5FF', // accentPrimary
  },
  feedbackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalView: {
    margin: 20,
    backgroundColor: '#101010', // bgElevated
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#F5F5F5', // textPrimary
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#A0A0A0', // textSecondary
    fontSize: 14,
  },
  textInput: {
    width: '100%',
    height: 80,
    borderColor: '#262626', // borderSubtle
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    color: '#F5F5F5', // textPrimary
    backgroundColor: '#050505', // bg
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    minWidth: '45%',
    alignItems: 'center',
  },
  buttonClose: {
    backgroundColor: '#262626', // borderSubtle
  },
  buttonConfirm: {
    backgroundColor: '#00E5FF', // accentPrimary
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});