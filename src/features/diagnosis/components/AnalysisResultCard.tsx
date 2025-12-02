import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { AnalysisResult as AnalysisResultType } from '../services/analysisService';
import { formatScoreToText, formatMethodName, formatConfidence, debugAnalysisData } from '../utils/formatAnalysis';

export const AnalysisResultCard: React.FC<{ result: AnalysisResultType }> = ({ result }) => {
  
  useEffect(() => {
    debugAnalysisData(result);
  }, [result]);

  let bgColor = 'bg-gray-700';
  let borderColor = 'border-gray-600';
  let textColor = 'text-gray-200';
  let accentColor = '';

  switch (result.label) {
    case 'NORMAL':
      bgColor = 'bg-green-900/40';
      borderColor = 'border-green-500'; 
      textColor = 'text-green-300';
      accentColor = 'text-green-400';
      break;
    case 'WARNING':
      bgColor = 'bg-yellow-900/40';
      borderColor = 'border-yellow-500';
      textColor = 'text-yellow-300';
      accentColor = 'text-yellow-400';
      break;
    case 'CRITICAL':
      bgColor = 'bg-red-900/40';
      borderColor = 'border-red-500';
      textColor = 'text-red-300';
      accentColor = 'text-red-400';
      break;
  }

  const statusText = formatScoreToText(result.score);
  // @ts-ignore: method might be missing
  const methodName = formatMethodName(result.details?.method || '');

  return (
    <View className={`w-full max-w-sm p-4 rounded-lg border-2 ${bgColor} ${borderColor} mb-8`}>
      <Text className={`text-xl font-bold mb-2 ${textColor}`}>{result.label}</Text>
      
      <View className="flex-row justify-between mb-1">
        <Text className="text-gray-300">상태 진단:</Text>
        <Text className={`font-bold ${accentColor}`}>{statusText}</Text>
      </View>
      
      <Text className="text-gray-400 text-xs mb-3">{result.summary}</Text>
      
      {result.details && (
        <View className="border-t border-gray-600 pt-3 mt-3">
          <Text className="text-gray-400 text-sm font-bold mb-2">상세 분석 지표:</Text>
          
          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-400 text-xs">분석 엔진:</Text>
            <Text className="text-blue-400 text-xs font-bold">{methodName}</Text>
          </View>

          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-400 text-xs">소음 레벨 (RMS):</Text>
            <Text className="text-gray-300 text-xs">{result.details.noise_level.toFixed(2)}</Text>
          </View>

          <View className="flex-row justify-between mb-1">
            <Text className="text-gray-400 text-xs">주요 주파수:</Text>
            <Text className="text-gray-300 text-xs">{result.details.frequency.toFixed(0)} Hz</Text>
          </View>

          {/* @ts-ignore: ml_anomaly_score might be missing in older types */}
          {result.details.ml_anomaly_score !== undefined && (
             <View className="flex-row justify-between mb-1">
                <Text className="text-gray-400 text-xs">AI 이상 점수:</Text>
                {/* @ts-ignore */}
                <Text className={`text-xs font-bold ${result.details.ml_anomaly_score < 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {/* @ts-ignore */}
                  {result.details.ml_anomaly_score.toFixed(2)}
                </Text>
             </View>
          )}
          
          {result.details.duration && (
             <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-700">
                <Text className="text-gray-500 text-[10px]">분석 시간:</Text>
                <Text className="text-gray-500 text-[10px]">{result.details.duration.toFixed(1)}s</Text>
             </View>
          )}
        </View>
      )}
    </View>
  );
};
