import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XCircle, AlertTriangle, Wrench, Clock, CheckCircle, Activity } from 'lucide-react-native'; // 아이콘 추가

// 차트 컴포넌트 임포트
import { AudioVisualizer } from '../../../../components/AudioVisualizer';
import { EnsembleRadar } from '../charts/EnsembleRadar';
import { FrequencySpectrum } from '../charts/FrequencySpectrum';
import { PredictiveTrendChart } from '../charts/PredictiveTrendChart';

// --- Interfaces ---
interface StatusData {
  current_state: 'NORMAL' | 'WARNING' | 'CRITICAL';
  health_score: number;
  label: 'NORMAL' | 'WARNING' | 'CRITICAL';
  summary: string;
}

interface DiagnosisData {
  root_cause: string;
  confidence: number;
  severity_score: number;
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
  consensus_score: number;
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
  diagnosis?: DiagnosisData; // Optional for safety
  maintenance_guide?: MaintenanceGuideData; // Optional for safety
  ensemble_analysis: EnsembleAnalysisData;
  frequency_analysis: FrequencyAnalysisData;
  predictive_insight: PredictiveInsightData;
  original_analysis_result?: any;
}

interface DiagnosisReportViewProps {
  reportData: DetailedAnalysisReport;
  onClose: () => void;
  isDemoMode: boolean;
}

const { width } = Dimensions.get('window');
const VISUALIZER_SIZE_SMALL = width * 0.5;

// --- Tab Components ---
const OverviewTab: React.FC<{ reportData: DetailedAnalysisReport; isDemo: boolean }> = ({ reportData, isDemo }) => {
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
        <View className="flex-row gap-2 mb-2">
            {isDemo && (
              <Text className="px-2 py-1 rounded-md border border-accentPrimary text-accentPrimary text-xs font-bold">DEMO MODE</Text>
            )}
            {!isDemo && (
              <Text className="px-2 py-1 rounded-md border border-accentPrimary text-accentPrimary text-xs font-bold">REAL DATA</Text>
            )}
        </View>
        
        <View className="w-full px-4 py-3 border-t border-borderSubtle bg-bg/50">
            <View className="flex-row items-center justify-between mb-1">
                <Text className="text-textSecondary text-xs font-bold">ROOT CAUSE (근본 원인)</Text>
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
                <Text className="text-textSecondary text-xs font-bold mb-1">권장 조치 (IMMEDIATE ACTION)</Text>
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

const DetailAnalysisTab: React.FC<{ reportData: DetailedAnalysisReport }> = ({ reportData }) => {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <ScrollView className="flex-1 bg-bg px-2" contentContainerStyle={localStyles.tabContentContainer}>
      {/* <Text className="text-textPrimary text-base font-bold mt-5 mb-4 text-center">상세 분석</Text> */}
      <View className="bg-bgElevated rounded-xl border border-borderSubtle my-2">
        <EnsembleRadar data={reportData.ensemble_analysis} />
      </View>
      <View className="bg-bgElevated rounded-xl border border-borderSubtle my-2">
        <FrequencySpectrum data={reportData.frequency_analysis} />
      </View>
    </ScrollView>
  );
};

const PredictionTab: React.FC<{ reportData: DetailedAnalysisReport }> = ({ reportData }) => {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <ScrollView className="flex-1 bg-bg px-2" contentContainerStyle={localStyles.tabContentContainer}>
      {/* <Text className="text-textPrimary text-base font-bold mt-5 mb-4 text-center">미래 예측</Text> */}
      <View className="bg-bgElevated rounded-xl border border-borderSubtle my-2">
        <PredictiveTrendChart data={reportData.predictive_insight} />
      </View>
    </ScrollView>
  );
};
// --- Utility Function ---
const getStatusColor = (status: StatusData['current_state']) => {
  switch (status) {
    case 'NORMAL': return '#00E5FF'; // accentPrimary
    case 'WARNING': return '#FFC800'; // accentWarning
    case 'CRITICAL': return '#FF3366'; // accentDanger
    default: return '#A0A0A0'; // textSecondary
  }
};

export const DiagnosisReportView: React.FC<DiagnosisReportViewProps> = ({ reportData, onClose, isDemoMode }) => {
  const theme = useTheme();
  const { colors } = theme;
  const [activeTab, setActiveTab] = useState<'Overview' | 'Detail' | 'Prediction'>('Overview');

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
  visualizerOverlaySmall: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});