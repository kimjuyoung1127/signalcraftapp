import { useState, useEffect, useRef } from 'react';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy'; // 변경된 부분
import { Platform } from 'react-native';

type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export const useAudioRecorder = () => {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(undefined);
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [uri, setUri] = useState<string | undefined>(undefined);
  const [durationMillis, setDurationMillis] = useState<number>(0);

  // 권한 요청
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn("Microphone permission not granted.");
        // 사용자에게 권한이 필요하다고 알림
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      // 녹음 설정
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const newRecording = new Audio.Recording();
      
      // 상태 업데이트 콜백 설정 (500ms 마다 호출)
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setDurationMillis(status.durationMillis);
        }
      });
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();

      setRecording(newRecording);
      setStatus('recording');
      setUri(undefined);
      setDurationMillis(0);

      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      setStatus('idle');
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const recordingUri = recording.getURI();
        setUri(recordingUri || undefined);
        setStatus('stopped');
        setRecording(undefined);
        console.log('Recording stopped and stored at', recordingUri);

        if (recordingUri) {
           const info = await FileSystem.getInfoAsync(recordingUri);
           console.log('Recording file info:', info);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setStatus('stopped');
    }
  };

  const pauseRecording = async () => {
    try {
      if (recording && status === 'recording') {
        await recording.pauseAsync();
        setStatus('paused');
        console.log('Recording paused');
      }
    } catch (err) {
      console.error('Failed to pause recording', err);
    }
  };

  const resumeRecording = async () => {
    try {
      if (recording && status === 'paused') {
        await recording.startAsync();
        setStatus('recording');
        console.log('Recording resumed');
      }
    } catch (err) {
      console.error('Failed to resume recording', err);
    }
  };

  const resetRecorder = async () => {
      if (recording) {
          try {
              await recording.stopAndUnloadAsync();
          } catch (e) {
              console.warn("Error unloading recording during reset:", e);
          }
      }
      setRecording(undefined);
      setUri(undefined);
      setStatus('idle');
      setDurationMillis(0);
      console.log('Recorder reset to idle');
  };

  // 컴포넌트 언마운트 시 녹음 정리
  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
        setRecording(undefined);
      }
    };
  }, [recording]);

  return {
    recording,
    status,
    uri,
    durationMillis,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecorder, // 추가
  };
};

// 헬퍼 함수: 밀리초를 시:분:초 형식으로 변환
export const formatDuration = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
