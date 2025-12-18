// src/features/settings/modules/DataSyncModule.tsx
// 데이터 동기화 설정 모듈

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SettingsSection, SettingsItem } from '../types/settings';
import { SettingsSection as SettingsSectionComponent } from '../components/SettingsSection';
import { SettingsItem as SettingsItemComponent } from '../components/SettingsItem';
import { useSettings } from '../hooks/useSettings';
import { Database, Trash2, CloudUpload, Wifi } from 'lucide-react-native';

export const DataSyncModule: React.FC = () => {
  const { createSettingsSection, createSettingsItem } = useSettings();

  // 데이터 동기화 설정 섹션 정의
  const dataSection = createSettingsSection(
    'data',
    '데이터 및 저장소',
    [
      createSettingsItem(
        'cache-limit',
        'slider',
        '캐시 보관 기간',
        'sync.cacheLimitDays',
        {
          min: 7,
          max: 90,
          step: 1,
          unit: ' 일',
          description: '로컬에 저장된 오디오 파일 보관 기간',
        }
      ),
      createSettingsItem(
        'max-retries',
        'slider',
        '최대 재시도 횟수',
        'sync.maxUploadRetries',
        {
          min: 1,
          max: 10,
          step: 1,
          unit: ' 회',
          description: '업로드 실패 시 재시도 횟수',
        }
      ),
      createSettingsItem(
        'clear-cache',
        'action',
        '캐시 삭제',
        'clear-cache-action',
        {
          description: '로컬에 저장된 모든 캐시 파일 삭제',
        }
      ),
      createSettingsItem(
        'wifi-only',
        'toggle',
        'Wi-Fi 전용 업로드',
        'sync.wifiOnlyUpload',
        {
          description: 'Wi-Fi 환경에서만 오디오 파일 업로드',
        }
      ),
    ],
    '데이터 저장 및 동기화 설정'
  );

  return (
    <SettingsSectionComponent section={dataSection}>
      {/* 데이터 설정 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Database size={20} color="#00E5FF" />
          <Text style={styles.infoText}>로컬 데이터 관리</Text>
        </View>
        <View style={styles.infoItem}>
          <CloudUpload size={20} color="#00E5FF" />
          <Text style={styles.infoText}>클라우드 동기화 설정</Text>
        </View>
        <View style={styles.infoItem}>
          <Trash2 size={20} color="#00E5FF" />
          <Text style={styles.infoText}>캐시 정리 옵션</Text>
        </View>
      </View>

      {/* 설정 항목 렌더링 */}
      {dataSection.items.map((item) => (
        <SettingsItemComponent key={item.id} item={item} />
      ))}
    </SettingsSectionComponent>
  );
};

const styles = StyleSheet.create({
  infoContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
  },
});