import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { useAudioRecorder, formatDuration } from '../hooks/useAudioRecorder';
import { Mic, Square, Pause, Play, Upload, RefreshCcw } from 'lucide-react-native';
import AnalysisService, { AnalysisTaskResponse, AnalysisResult as AnalysisResultType } from '../services/analysis'; // AnalysisResultType 이름을 변경
import { mockUploadAudio, mockGetAnalysisResult } from '../services/mock/analysis';
import { ENV } from '../config/env';

// 분석 결과 카드를 위한 컴포넌트
const AnalysisResultCard: React.FC<{ result: AnalysisResultType }> = ({ result }) => {
  let bgColor = 'bg-gray-700';
  let borderColor = 'border-gray-600';
  let textColor = 'text-gray-200';
  let accentColor = '';

  switch (result.label) {
    case 'NORMAL':
      bgColor = 'bg-green-900/40';
      borderColor = 'border-green-500'; // 'border-accentGreen'
      textColor = 'text-green-300';
      accentColor = 'text-green-400';
      break;
    case 'WARNING':
      bgColor = 'bg-yellow-900/40';
      borderColor = 'border-yellow-500'; // 'border-accentWarning'
      textColor = 'text-yellow-300';
      accentColor = 'text-yellow-400';
      break;
    case 'CRITICAL':
      bgColor = 'bg-red-900/40';
      borderColor = 'border-red-500'; // 'border-accentDanger'
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


export const AnalysisScreen = () => {
  const {
    status: recordingStatus, // recordingStatus로 이름 변경하여 다른 status와 혼동 방지
    uri,
    durationMillis,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  const [isUploading, setIsUploading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [analysisTask, setAnalysisTask] = useState<AnalysisTaskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Polling logic for analysis result
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchResult = async () => {
      if (!taskId) return;

      try {
        const service = ENV.IS_DEMO_MODE ? mockGetAnalysisResult : AnalysisService.getAnalysisResult;
        const result = await service(taskId);
        setAnalysisTask(result);

        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          if (pollingInterval) clearInterval(pollingInterval);
          setIsUploading(false); // 분석 완료 시 업로드 상태 해제
        }
      } catch (err: any) {
        console.error('Failed to fetch analysis result:', err);
        setError(err.message || 'Failed to fetch analysis result');
        if (pollingInterval) clearInterval(pollingInterval);
        setIsUploading(false);
        setAnalysisTask((prev) => prev ? { ...prev, status: 'FAILED' } : null);
      }
    };

    if (taskId && (analysisTask?.status !== 'COMPLETED' && analysisTask?.status !== 'FAILED')) {
      pollingInterval = setInterval(fetchResult, 2000); // 2초마다 폴링
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [taskId, analysisTask?.status]); // taskId나 analysisTask의 상태가 변경될 때마다 재실행

  const handleUpload = async () => {
    if (!uri) {
      Alert.alert('Error', 'No recorded audio to upload.');
      return;
    }
    setError(null);
    setTaskId(null);
    setAnalysisTask(null);
    setIsUploading(true);

    try {
      const service = ENV.IS_DEMO_MODE ? mockUploadAudio : AnalysisService.uploadAudio;
      const newTaskId = await service(uri);
      setTaskId(newTaskId);
      setAnalysisTask({
        task_id: newTaskId,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      });
      Alert.alert('Upload Started', `Task ID: ${newTaskId}`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Failed to upload audio.');
      Alert.alert('Upload Failed', err.message || 'Please try again.');
      setIsUploading(false);
    }
  };
  
  const getAnalysisStatusText = () => {
      if (isUploading) return 'UPLOADING...';
      if (!taskId) return 'READY';
      if (analysisTask) return analysisTask.status;
      return 'UNKNOWN';
  };

  const renderControlButtons = () => {
    switch (recordingStatus) {
      case 'idle':
        return (
          <TouchableOpacity 
            onPress={startRecording} 
            className="w-20 h-20 rounded-full bg-accentPrimary items-center justify-center"
            disabled={isUploading}
          >
            <Mic color="black" size={40} />
          </TouchableOpacity>
        );
      case 'recording':
        return (
          <View className="flex-row items-center justify-center space-x-4">
            <TouchableOpacity 
              onPress={pauseRecording} 
              className="w-16 h-16 rounded-full bg-accentWarning items-center justify-center"
              disabled={isUploading}
            >
              <Pause color="black" size={30} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={stopRecording} 
              className="w-20 h-20 rounded-full bg-accentDanger items-center justify-center"
              disabled={isUploading}
            >
              <Square color="black" size={40} />
            </TouchableOpacity>
          </View>
        );
      case 'paused':
        return (
          <View className="flex-row items-center justify-center space-x-4">
            <TouchableOpacity 
              onPress={resumeRecording} 
              className="w-16 h-16 rounded-full bg-accentWarning items-center justify-center"
              disabled={isUploading}
            >
              <Play color="black" size={30} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={stopRecording} 
              className="w-20 h-20 rounded-full bg-accentDanger items-center justify-center"
              disabled={isUploading}
            >
              <Square color="black" size={40} />
            </TouchableOpacity>
          </View>
        );
      case 'stopped':
        return (
          <View className="flex-row items-center justify-center space-x-4">
            {uri && ( // 녹음된 URI가 있으면 업로드 버튼 표시
                <TouchableOpacity 
                    onPress={handleUpload} 
                    className={`w-16 h-16 rounded-full ${isUploading ? 'bg-gray-500' : 'bg-accentPrimary'} items-center justify-center`}
                    disabled={isUploading}
                >
                    {isUploading ? <ActivityIndicator color="black" size="small" /> : <Upload color="black" size={30} />}
                </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={startRecording} 
              className="w-20 h-20 rounded-full bg-gray-600 items-center justify-center"
              disabled={isUploading}
            >
              <Mic color="white" size={40} />
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-gray-400 text-lg mb-4">
          Recording Status: <Text className="font-bold text-white">{recordingStatus.toUpperCase()}</Text>
        </Text>
        <Text className="text-gray-400 text-lg mb-4">
          Analysis Status: <Text className="font-bold text-white">{getAnalysisStatusText()}</Text>
        </Text>

        <Text className="text-white text-6xl font-bold mb-8">
          {formatDuration(durationMillis)}
        </Text>

        <View className="mb-8">
          {/* TODO: Add Audio Visualizer component here */}
          {recordingStatus === 'recording' && (
              <Text className="text-gray-500">
                [Visualizer Running...]
              </Text>
          )}
          {(isUploading || analysisTask?.status === 'PENDING' || analysisTask?.status === 'PROCESSING') && !analysisTask?.result && (
              <ActivityIndicator size="large" color="#00E5FF" />
          )}
        </View>

        {renderControlButtons()}

        {error && (
            <View className="mt-8 p-4 bg-accentDanger/20 rounded-lg w-full max-w-sm border border-accentDanger">
                <Text className="text-accentDanger text-sm font-bold">Error:</Text>
                <Text className="text-accentDanger text-xs break-all">{error}</Text>
            </View>
        )}

        {uri && (
          <View className="mt-8 p-4 bg-bgElevated rounded-lg w-full max-w-sm">
            <Text className="text-textSecondary text-sm">Recording saved to:</Text>
            <Text className="text-textPrimary text-xs break-all">{uri}</Text>
          </View>
        )}

        {analysisTask?.status === 'COMPLETED' && analysisTask.result && (
            <View className="mt-8">
                <AnalysisResultCard result={analysisTask.result} />
            </View>
        )}
      </View>
    </ScreenLayout>
  );
};