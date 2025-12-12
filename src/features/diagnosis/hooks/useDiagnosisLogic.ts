import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAudioRecorder } from './useAudioRecorder';
import AnalysisService, { AnalysisTaskResponse, DetailedAnalysisReport } from '../services/analysisService';
import { mockUploadAudio, mockGetAnalysisResult } from '../services/mockAnalysisService';
import { ENV } from '../../../config/env';
import { useCameraPermissions } from 'expo-camera';
import { Audio } from 'expo-av';
import { useDeviceStore } from '../../../store/useDeviceStore'; // Import useDeviceStore

export const useDiagnosisLogic = (deviceId: string, selectedModelId: string, selectedModelType: string) => { // [수정] selectedModelType 인자 추가
  const {
    status: recordingStatus,
    uri,
    durationMillis,
    startRecording,
    stopRecording,
    resetRecorder,
  } = useAudioRecorder();

  const [isUploading, setIsUploading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [analysisTask, setAnalysisTask] = useState<AnalysisTaskResponse | null>(null);
  const [detailedReport, setDetailedReport] = useState<DetailedAnalysisReport | null>(null); // 새 상세 리포트 상태
  const [error, setError] = useState<string | null>(null);

  // 권한 상태 관리
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, setMicPermission] = useState<boolean | null>(null);

  // deviceId 기반 데모 모드 판단
  const isDemoMode = deviceId.startsWith('MOCK-');

  // 마이크 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setMicPermission(status === 'granted');
    })();
  }, []);

  // State to drive UI status
  const [uiStatus, setUiStatus] = useState<'idle' | 'recording' | 'analyzing' | 'fetching_report' | 'result'>('idle');

  // Sync recording status with UI status
  useEffect(() => {
    console.log(`[Logic] Recording Status Changed: ${recordingStatus}`);
    if (recordingStatus === 'recording') {
      setUiStatus('recording');
    } else if (recordingStatus === 'stopped' && !isUploading && !analysisTask) {
       console.log('[Logic] Recording stopped. Ready to upload.');
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
        // [수정] Hybrid 모드 지원: 전역 데모 모드이거나 현재 장비가 Mock 장비인 경우 Mock 서비스 사용
        const service = (ENV.IS_DEMO_MODE || isDemoMode) ? mockGetAnalysisResult : AnalysisService.getAnalysisResult;
        const result = await service(taskId);
        
        console.log(`[Logic] Polling Result: ${result.status}`);
        setAnalysisTask(result);

        if (result.status === 'COMPLETED' || result.status === 'FAILED') {
          console.log('[Logic] Analysis Finished. Setting UI to result.');
          if (pollingInterval) clearInterval(pollingInterval);
          setIsUploading(false);
          setUiStatus('fetching_report'); // 상세 리포트 fetch 상태 추가

          // 분석 결과가 COMPLETED 되었으면 상세 리포트 페칭
          if (result.status === 'COMPLETED') {
            try {
              const report = await AnalysisService.getDetailedAnalysisReport(deviceId);
              setDetailedReport(report);
              useDeviceStore.getState().fetchDevices(); // Refresh device list
              setUiStatus('result'); // 최종 결과 화면으로 전환
            } catch (reportError: any) {
              console.error('Failed to fetch detailed report:', reportError);
              setError(reportError.message || 'Failed to fetch detailed report');
              setUiStatus('result'); // 리포트 페칭 실패 시에도 결과 화면으로 전환 (에러 표시)
            }
          } else {
            setUiStatus('result'); // 실패 시 바로 결과 화면으로 전환
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch analysis result:', err);
        setError(err.message || 'Failed to fetch analysis result');
        if (pollingInterval) clearInterval(pollingInterval);
        setIsUploading(false);
        setUiStatus('result'); // 에러 발생 시 결과 화면(에러 표시)으로 전환
      }
    };

    if (taskId && (analysisTask?.status !== 'COMPLETED' && analysisTask?.status !== 'FAILED')) {
      console.log('[Logic] Starting Polling Interval...');
      pollingInterval = setInterval(fetchResult, 2000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [taskId, analysisTask?.status, deviceId]); // deviceId를 의존성 배열에 추가

  const handleTrigger = async () => {
    console.log(`[Logic] Trigger Pressed. RecStatus: ${recordingStatus}, UIStatus: ${uiStatus}, URI: ${uri ? 'Exists' : 'Null'}`);

    if (!allPermissionsGranted) { // allPermissionsGranted 사용
        Alert.alert("권한 필요", "카메라와 마이크 권한이 모두 있어야 진단을 시작할 수 있습니다.");
        return;
    }

    if (recordingStatus === 'idle') {
      console.log('[Logic] Starting new recording...');
      setTaskId(null);
      setAnalysisTask(null);
      setDetailedReport(null); // 리셋 시 상세 리포트도 초기화
      setError(null);
      setUiStatus('recording');
      await startRecording();
    } 
    else if (recordingStatus === 'recording') {
      console.log('[Logic] Stopping recording...');
      await stopRecording();
    } 
    else if (recordingStatus === 'stopped') {
        if (uri) {
            console.log('[Logic] Uploading existing recording...');
            handleUpload();
        }
        else {
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
      // [수정] Hybrid 모드 지원: 전역 데모 모드이거나 현재 장비가 Mock 장비인 경우 Mock 업로드 사용
      if (ENV.IS_DEMO_MODE || isDemoMode) { 
        newTaskId = await mockUploadAudio(uri);
      } else {
        // [수정] selectedModelType을 파라미터로 전달
        newTaskId = await AnalysisService.uploadAudio(uri, deviceId, selectedModelId, selectedModelType); 
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
      setDetailedReport(null); // 리셋 시 상세 리포트도 초기화
      setError(null);
      setUiStatus('idle');
      resetRecorder(); // 레코더 상태 초기화
  };

  const allPermissionsGranted = cameraPermission?.granted && micPermission;

  return {
    recordingStatus,
    uiStatus,
    durationMillis,
    isUploading,
    analysisTask,
    detailedReport, // 상세 리포트 반환
    error,
    handleTrigger,
    resetDiagnosis,
    cameraPermissionGranted: cameraPermission?.granted,
    micPermissionGranted: micPermission,
    allPermissionsGranted, // 모든 권한 상태 반환
    isDemoMode, // 데모 모드 상태 반환
  };
};

