// src/features/settings/modules/NotificationModule.tsx
// 알림 필터 설정 모듈

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SettingsSection, SettingsItem } from '../types/settings';
import { SettingsSection as SettingsSectionComponent } from '../components/SettingsSection';
import { SettingsItem as SettingsItemComponent } from '../components/SettingsItem';
import { useSettings } from '../hooks/useSettings';
import { Bell, AlertCircle, Vibrate, Volume2 } from 'lucide-react-native';

export const NotificationModule: React.FC = () => {
  const { createSettingsSection, createSettingsItem } = useSettings();

  // 알림 레벨 옵션
  const alertLevelOptions = [
    { value: 'all', label: '모든 알림' },
    { value: 'normal', label: '일반 이상' },
    { value: 'warning', label: '경고 이상' },
    { value: 'critical', label: '심각만' },
  ];

  // 알림 설정 섹션 정의
  const notificationSection = createSettingsSection(
    'notifications',
    '알림 필터',
    [
      createSettingsItem(
        'min-alert-level',
        'select',
        '최소 알림 레벨',
        'alerts.minAlertLevel',
        {
          options: alertLevelOptions,
          description: '이 레벨 이상의 알림만 표시합니다',
        }
      ),
      createSettingsItem(
        'show-popup',
        'toggle',
        '팝업 알림 표시',
        'alerts.showPopupNotifications',
        {
          description: '화면에 팝업으로 알림을 표시합니다',
        }
      ),
      createSettingsItem(
        'vibration',
        'toggle',
        '진동 활성화',
        'alerts.vibrationEnabled',
        {
          description: '알림 시 진동으로 알립니다',
        }
      ),
      createSettingsItem(
        'sound',
        'toggle',
        '소리 활성화',
        'alerts.soundEnabled',
        {
          description: '알림 시 소리를 재생합니다',
        }
      ),
    ],
    '알림 중요도 및 표시 방식 설정'
  );

  return (
    <SettingsSectionComponent section={notificationSection}>
      {/* 알림 설정 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Bell size={20} color="#00E5FF" />
          <Text style={styles.infoText}>중요도 기반 필터링</Text>
        </View>
        <View style={styles.infoItem}>
          <AlertCircle size={20} color="#00E5FF" />
          <Text style={styles.infoText}>다양한 알림 레벨</Text>
        </View>
        <View style={styles.infoItem}>
          <Vibrate size={20} color="#00E5FF" />
          <Text style={styles.infoText}>진동 및 소리 설정</Text>
        </View>
      </View>

      {/* 설정 항목 렌더링 */}
      {notificationSection.items.map((item) => (
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