// src/features/settings/hooks/useSettings.ts
// 설정 관련 커스텀 훅

import { useSettingsStore } from '../store/useSettingsStore';
import { SettingsItem, SettingsSection } from '../types/settings';
import * as FileSystem from 'expo-file-system';
import { Alert } from 'react-native';

/**
 * 설정 값을 쉽게 가져오고 업데이트할 수 있는 훅
 * @returns 설정 관련 유틸리티 함수
 */
export const useSettings = () => {
  const { settings, setSetting, setSettings, resetSettings } = useSettingsStore();

  /**
   * 설정 값 가져오기
   * @param group 설정 그룹
   * @param key 설정 키
   * @returns 설정 값
   */
  const getSettingValue = <K extends keyof typeof settings>(
    group: K,
    key: keyof typeof settings[K]
  ) => {
    if (!settings || !settings[group]) {
      return undefined;
    }
    return settings[group][key];
  };

  /**
   * 설정 값 업데이트
   * @param group 설정 그룹
   * @param key 설정 키
   * @param value 새로운 값
   */
  const updateSetting = <K extends keyof typeof settings>(
    group: K,
    key: keyof typeof settings[K],
    value: typeof settings[K][keyof typeof settings[K]]
  ) => {
    setSetting(group, key, value);
  };

  /**
   * 설정 섹션 생성
   * UI 컴포넌트에서 사용할 설정 섹션을 동적으로 생성
   * @param sectionId 섹션 ID
   * @param title 섹션 제목
   * @param items 설정 항목 배열
   * @returns 설정 섹션 객체
   */
  const createSettingsSection = (
    sectionId: string,
    title: string,
    items: SettingsItem[],
    description?: string,
    icon?: string
  ): SettingsSection => {
    return {
      id: sectionId,
      title,
      description,
      icon,
      items,
    };
  };

  /**
   * 설정 항목 생성
   * @param itemId 항목 ID
   * @param type 항목 타입
   * @param label 레이블
   * @param key 설정 키 경로
   * @param options 추가 옵션
   * @returns 설정 항목 객체
   */
  const createSettingsItem = (
    itemId: string,
    type: SettingsItem['type'],
    label: string,
    key: string,
    options?: {
      min?: number;
      max?: number;
      step?: number;
      unit?: string;
      description?: string;
      options?: { value: string; label: string }[];
      defaultValue?: any;
    }
  ): SettingsItem => {
    return {
      id: itemId,
      type,
      label,
      key,
      ...options,
    };
  };

  /**
   * 설정 값 토글
   * @param group 설정 그룹
   * @param key 설정 키
   */
  const toggleSetting = <K extends keyof typeof settings>(
    group: K,
    key: keyof typeof settings[K]
  ) => {
    if (!settings || !settings[group]) {
      console.warn(`Setting group '${String(group)}' not found, cannot toggle.`);
      return;
    }
    const currentValue = settings[group][key];
    if (typeof currentValue === 'boolean') {
      setSetting(group, key, !currentValue);
    }
  };

  /**
   * 액션 수행
   * @param actionId 액션 ID
   */
  const performAction = async (actionId: string) => {
    switch (actionId) {
      case 'clearCache':
        try {
          // 캐시 디렉토리 정보 가져오기
          const cacheDir = FileSystem.cacheDirectory;
          const documentDir = FileSystem.documentDirectory;
          
          if (!cacheDir) return;

          // 캐시 파일 목록 가져오기
          const cacheFiles = await FileSystem.readDirectoryAsync(cacheDir);
          
          let documentFiles: string[] = [];
          if (documentDir) {
             documentFiles = await FileSystem.readDirectoryAsync(documentDir);
          }
          
          // 실제 캐시 파일 삭제 로직
          // 주의: 실제 앱에서는 더 세밀한 필터링이 필요
          const filesToDelete = [...cacheFiles, ...documentFiles]
            .filter(file => file.endsWith('.wav') || file.endsWith('.tmp'));
          
          if (filesToDelete.length === 0) {
            Alert.alert('캐시 삭제', '삭제할 캐시 파일이 없습니다.');
            return;
          }
          
          // 파일 삭제
          for (const file of filesToDelete) {
            try {
              if (cacheFiles.includes(file)) {
                await FileSystem.deleteAsync(`${cacheDir}${file}`);
              } else if (documentDir) {
                await FileSystem.deleteAsync(`${documentDir}${file}`);
              }
            } catch (error) {
              console.warn(`Failed to delete ${file}:`, error);
            }
          }
          
          Alert.alert('성공', `${filesToDelete.length}개의 캐시 파일을 삭제했습니다.`);
        } catch (error) {
          console.error('Cache clear error:', error);
          Alert.alert('오류', '캐시 삭제 중 오류가 발생했습니다.');
        }
        break;
      
      default:
        console.warn(`Unknown action: ${actionId}`);
        break;
    }
  };

  return {
    settings,
    getSettingValue,
    updateSetting,
    setSettings,
    resetSettings,
    createSettingsSection,
    createSettingsItem,
    toggleSetting,
    performAction,
  };
};

/**
 * 특정 설정 그룹의 값을 구독하는 훅
 * @param group 설정 그룹
 * @returns 해당 그룹의 설정 값
 */
export const useSettingGroup = <K extends keyof ReturnType<typeof useSettingsStore.getState>['settings']>(
  group: K
) => {
  const { settings } = useSettingsStore();
  return settings[group];
};

/**
 * 개별 설정 값을 구독하는 훅
 * @param group 설정 그룹
 * @param key 설정 키
 * @returns 해당 설정 값
 */
export const useSettingValue = <
  K extends keyof ReturnType<typeof useSettingsStore.getState>['settings'],
  T extends keyof ReturnType<typeof useSettingsStore.getState>['settings'][K]
>(
  group: K,
  key: T
) => {
  const { settings } = useSettingsStore();
  return settings[group][key];
};