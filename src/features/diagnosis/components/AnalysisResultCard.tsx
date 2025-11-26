import React from 'react';
import { View, Text } from 'react-native';
import { AnalysisResult as AnalysisResultType } from '../services/analysisService';

export const AnalysisResultCard: React.FC<{ result: AnalysisResultType }> = ({ result }) => {
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

  return (
    <View className={`w-full max-w-sm p-4 rounded-lg border-2 ${bgColor} ${borderColor} mb-8`}>
      <Text className={`text-xl font-bold mb-2 ${textColor}`}>Result: {result.label}</Text>
      <Text className="text-gray-300 mb-1">Score: <Text className={`${accentColor}`}>{result.score.toFixed(2)}</Text></Text>
      <Text className="text-gray-300 mb-3">{result.summary}</Text>
      
      {result.details && (
        <View className="border-t border-gray-600 pt-3 mt-3">
          <Text className="text-gray-400 text-sm font-bold mb-1">Details:</Text>
          <Text className="text-gray-400 text-xs">Noise Level: {result.details.noise_level} dB</Text>
          <Text className="text-gray-400 text-xs">Vibration: {result.details.vibration.toFixed(2)}</Text>
          <Text className="text-gray-400 text-xs">Frequency: {result.details.frequency.toFixed(2)} Hz</Text>
        </View>
      )}
    </View>
  );
};
