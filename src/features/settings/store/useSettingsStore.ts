// src/features/settings/store/useSettingsStore.ts
// 확장형 설정 저장소 (Zustand + Persist)

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppSettings } from '../types/settings';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 기본 설정 값 정의
const defaultSettings: AppSettings = {
  audio: {
    inputGain: 1.0,
    noiseGateEnabled: false,
    noiseGateThreshold: -40,
    normalizeAudio: true,
  },
  visual: {
    colorMap: 'cyberpunk',
    showGrid: true,
    animationSpeed: 1.0,
    contrastLevel: 0.7,
  },
  sync: {
    wifiOnlyUpload: true,
    autoUploadEnabled: true,
    cacheLimitDays: 30,
    maxUploadRetries: 3,
  },
  alerts: {
    minAlertLevel: 'warning',
    showPopupNotifications: true,
    vibrationEnabled: true,
    soundEnabled: true,
  },
  profile: {
    displayName: '',
    selectedStoreId: null,
    showAdvancedOptions: false,
  },
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
};

/**
 * 설정 저장소 인터페이스
 * 상태 관리 및 영구 저장 기능을 제공
 */
export const useSettingsStore = create<{
  settings: AppSettings;
  setSetting: <K extends keyof AppSettings>(
    group: K,
    key: keyof AppSettings[K],
    value: AppSettings[K][keyof AppSettings[K]]
  ) => void;
  setSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  updateLastUpdated: () => void;
}>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      /**
       * 개별 설정 업데이트
       * @param group 설정 그룹 (audio, visual, sync, alerts, profile)
       * @param key 설정 키
       * @param value 새로운 값
       */
      setSetting: (group, key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [group]: {
              ...state.settings[group],
              [key]: value,
            },
          },
        }));
        get().updateLastUpdated();
      },
      
      /**
       * 여러 설정 한 번에 업데이트
       * @param newSettings 부분적으로 업데이트할 설정 객체
       */
      setSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
        get().updateLastUpdated();
      },
      
      /**
       * 모든 설정 초기화
       */
      resetSettings: () => {
        set({ settings: defaultSettings });
        get().updateLastUpdated();
      },
      
      /**
       * 마지막 업데이트 시간 갱신
       */
      updateLastUpdated: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            lastUpdated: new Date().toISOString(),
          },
        }));
      },
    }),
    {
      name: 'signalcraft-settings', // 스토리지 키
      storage: createJSONStorage(() => AsyncStorage), // AsyncStorage 사용
      version: 1, // 마이그레이션 버전
      migrate: (persistedState: any, version) => {
        const incomingSettings = persistedState?.settings || {};
        
        // Deep merge to ensure new setting groups/keys are added
        const mergedSettings = {
          ...defaultSettings,
          ...incomingSettings,
          audio: { ...defaultSettings.audio, ...(incomingSettings.audio || {}) },
          visual: { ...defaultSettings.visual, ...(incomingSettings.visual || {}) },
          sync: { ...defaultSettings.sync, ...(incomingSettings.sync || {}) },
          alerts: { ...defaultSettings.alerts, ...(incomingSettings.alerts || {}) },
          profile: { ...defaultSettings.profile, ...(incomingSettings.profile || {}) },
        };

        return {
          ...persistedState,
          settings: mergedSettings,
          version: 1,
        };
      },
    }
  )
);

// 설정 값 가져오기 유틸리티 함수
/**
 * 설정 값 가져오기
 * @param group 설정 그룹
 * @param key 설정 키
 * @returns 현재 설정 값
 */
export const getSetting = <K extends keyof AppSettings>(
  group: K,
  key: keyof AppSettings[K]
): AppSettings[K][keyof AppSettings[K]] => {
  const { settings } = useSettingsStore.getState();
  return settings[group][key];
};

// 설정 초기화 함수 (테스트용)
export const initializeSettings = () => {
  useSettingsStore.getState().resetSettings();
};