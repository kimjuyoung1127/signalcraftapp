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
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();

      setRecording(newRecording);
      setStatus('recording');
      setUri(undefined); // 새 녹음 시작 시 기존 URI 초기화
      setDurationMillis(0);

      // 타이머 시작
      intervalRef.current = setInterval(async () => {
        const currentStatus = await newRecording.getStatusAsync();
        if (currentStatus.isRecording) {
          setDurationMillis(currentStatus.durationMillis || 0);
        }
      }, 1000);

      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
      setStatus('idle');
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        await recording.stopAndUnloadAsync();
        const recordingUri = recording.getURI();
        setUri(recordingUri || undefined);
        setStatus('stopped');
        setRecording(undefined);
        console.log('Recording stopped and stored at', recordingUri);

        // 녹음된 파일 정보 확인 (선택 사항)
        if (recordingUri) {
           const info = await FileSystem.getInfoAsync(recordingUri); // FileSystem/legacy 사용시 다시 활성화
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
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
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
        await recording.startAsync(); // pauseAsync() 후 startAsync()가 resume 역할
        setStatus('recording');
        // 타이머 재개
        intervalRef.current = setInterval(async () => {
          const currentStatus = await recording.getStatusAsync();
          if (currentStatus.isRecording) {
            setDurationMillis(currentStatus.durationMillis || 0);
          }
        }, 1000);
        console.log('Recording resumed');
      }
    } catch (err) {
      console.error('Failed to resume recording', err);
    }
  };

  // 컴포넌트 언마운트 시 녹음 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (recording) {
        recording.stopAndUnloadAsync();
        setRecording(undefined);
      }
    };
  }, [recording]); // recording 객체가 변경될 때도 정리

  return {
    recording,
    status,
    uri,
    durationMillis,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
};

// 헬퍼 함수: 밀리초를 시:분:초 형식으로 변환
export const formatDuration = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
