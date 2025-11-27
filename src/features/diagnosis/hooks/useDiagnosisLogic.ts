import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAudioRecorder } from './useAudioRecorder';
import AnalysisService, { AnalysisTaskResponse } from '../services/analysisService';
import { mockUploadAudio, mockGetAnalysisResult } from '../services/mockAnalysisService';
import { ENV } from '../../../config/env';
import { useCameraPermissions } from 'expo-camera'; // 카메라 권한 훅 추가
import { Audio } from 'expo-av'; // 오디오 권한 훅 추가

export const useDiagnosisLogic = (deviceId: string) => {
  const {
    status: recordingStatus,
    uri,
    durationMillis,
    startRecording,
    stopRecording,
    resetRecorder, // 추가
    // pauseRecording, // 필요한 경우 사용
    // resumeRecording, // 필요한 경우 사용
  } = useAudioRecorder();

  const [isUploading, setIsUploading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [analysisTask, setAnalysisTask] = useState<AnalysisTaskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 권한 상태 관리
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  // 마이크 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === 'granted');
    })();
  }, []);

  // State to drive UI status
  const [uiStatus, setUiStatus] = useState<'idle' | 'recording' | 'analyzing' | 'result'>('idle');

  // Sync recording status with UI status
  useEffect(() => {
    console.log(`[Logic] Recording Status Changed: ${recordingStatus}`);
    if (recordingStatus === 'recording') {
      setUiStatus('recording');
    } else if (recordingStatus === 'stopped' && !isUploading && !analysisTask) {
       // 녹음이 멈췄고, 아직 업로드나 분석이 시작되지 않았으면 -> 대기 상태 (Trigger는 UPLOAD로 표시됨)
       console.log('[Logic] Recording stopped. Ready to upload.');
       // uiStatus는 'recording'에서 벗어나야 하므로 'idle'로 두거나 별도 상태가 필요할 수 있음.
       // 하지만 TacticalTrigger는 recordingStatus를 직접 참조하여 'stopped'일 때 'UPLOAD'를 표시함.
       // 따라서 uiStatus는 'idle'로 리셋해도 무방함 (TargetReticle이 idle 상태로 돌아감)
       setUiStatus('idle');
    }
  }, [recordingStatus]);

  // Polling Logic
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    const fetchResult = async () => {
      if (!taskId) return;

      try {
        console.log(`[Logic] Polling... TaskID: ${taskId}`);
        const service = ENV.IS_DEMO_MODE ? mockGetAnalysisResult : AnalysisService.getAnalysisResult;
        const result = await service(taskId);
        
        console.log(`[Logic] Polling Result: ${result.status}`);
        setAnalysisTask(result);

        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          console.log('[Logic] Analysis Finished. Setting UI to result.');
          if (pollingInterval) clearInterval(pollingInterval);
          setIsUploading(false);
          setUiStatus('result'); // 결과 화면으로 전환
        }
      } catch (err: any) {
        console.error('Failed to fetch analysis result:', err);
        setError(err.message || 'Failed to fetch analysis result');
        if (pollingInterval) clearInterval(pollingInterval);
        setIsUploading(false);
        setUiStatus('result'); // 에러지만 결과 화면(에러 표시)으로 전환
      }
    };

    if (taskId && (analysisTask?.status !== 'COMPLETED' && analysisTask?.status !== 'FAILED')) {
      console.log('[Logic] Starting Polling Interval...');
      pollingInterval = setInterval(fetchResult, 2000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [taskId, analysisTask?.status]);

  const handleTrigger = async () => {
    console.log(`[Logic] Trigger Pressed. RecStatus: ${recordingStatus}, UIStatus: ${uiStatus}, URI: ${uri ? 'Exists' : 'Null'}`);

    if (!cameraPermission?.granted || !micPermission) {
        Alert.alert("권한 필요", "카메라와 마이크 권한이 모두 있어야 진단을 시작할 수 있습니다.");
        return;
    }

    // Case 1: Start Recording (Idle or Stopped)
    // 주의: 'stopped' 상태에서 uri가 있어도, 사용자가 다시 누르면 재녹음(초기화)으로 간주할지, 업로드로 간주할지 결정해야 함.
    // 현재 로직: stopped 상태면 -> Upload로 분기
    
    if (recordingStatus === 'idle') {
      console.log('[Logic] Starting new recording...');
      setTaskId(null);
      setAnalysisTask(null);
      setError(null);
      setUiStatus('recording');
      await startRecording();
    } 
    else if (recordingStatus === 'recording') {
      console.log('[Logic] Stopping recording...');
      await stopRecording();
      // Stop 후 자동으로 업로드하지 않고, 사용자가 'UPLOAD' 버튼을 누르도록 유도
    } 
    else if (recordingStatus === 'stopped') {
        if (uri) {
            console.log('[Logic] Uploading existing recording...');
            handleUpload();
        } else {
            // 에러 상황: stopped인데 uri가 없음 -> 재녹음 유도
            console.warn('[Logic] Stopped but no URI. Restarting recording...');
            setUiStatus('recording');
            await startRecording();
        }
    }
  };
  
  const handleUpload = async () => {
    if (!uri) {
        console.error('[Logic] Upload requested but no URI');
        return;
    }
    
    console.log('[Logic] Upload started. URI:', uri);
    setIsUploading(true);
    setUiStatus('analyzing');
    setError(null);

    try {
      let newTaskId: string;
      if (ENV.IS_DEMO_MODE) {
        newTaskId = await mockUploadAudio(uri);
      } else {
        newTaskId = await AnalysisService.uploadAudio(uri, deviceId);
      }
      
      console.log('[Logic] Upload success. Task ID:', newTaskId);
      setTaskId(newTaskId);
      setAnalysisTask({
        task_id: newTaskId,
        status: 'PENDING',
        created_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('[Logic] Upload failed:', err);
      setError(err.message);
      setIsUploading(false);
      setUiStatus('idle'); // 실패 시 다시 대기
      Alert.alert("Upload Failed", err.message);
    }
  };

  const resetDiagnosis = () => {
      setTaskId(null);
      setAnalysisTask(null);
      setError(null);
      setUiStatus('idle');
      resetRecorder(); // 레코더 상태 초기화
  };

  return {
    recordingStatus,
    uiStatus,
    durationMillis,
    isUploading,
    analysisTask,
    error,
    handleTrigger,
    resetDiagnosis,
    cameraPermissionGranted: cameraPermission?.granted,
    micPermissionGranted: micPermission,
  };
};
