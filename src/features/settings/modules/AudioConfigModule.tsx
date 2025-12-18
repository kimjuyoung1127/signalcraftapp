// src/features/settings/modules/AudioConfigModule.tsx
// 오디오 센서 설정 모듈

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SettingsSection, SettingsItem } from '../types/settings';
import { SettingsSection as SettingsSectionComponent } from '../components/SettingsSection';
import { SettingsItem as SettingsItemComponent } from '../components/SettingsItem';
import { useSettings } from '../hooks/useSettings';
import { Mic, Volume2, Shield } from 'lucide-react-native';

export const AudioConfigModule: React.FC = () => {
  const { createSettingsSection, createSettingsItem } = useSettings();

  // 오디오 설정 섹션 정의
  const audioSection = createSettingsSection(
    'audio',
    '오디오 센서 설정',
    [
      createSettingsItem(
        'input-gain',
        'slider',
        '입력 게인',
        'audio.inputGain',
        {
          min: 0.5,
          max: 2.0,
          step: 0.1,
          unit: 'x',
          description: '마이크 입력 감도 조절 (현장 소음 환경에 따라 조정)',
        }
      ),
      createSettingsItem(
        'noise-gate',
        'toggle',
        '노이즈 게이트 활성화',
        'audio.noiseGateEnabled',
        {
          description: '특정 데시벨 이하 소리는 무시합니다',
        }
      ),
      createSettingsItem(
        'noise-threshold',
        'slider',
        '노이즈 기준치',
        'audio.noiseGateThreshold',
        {
          min: -60,
          max: -20,
          step: 5,
          unit: ' dB',
          description: '이 기준치 이하 소리는 필터링됩니다',
          disabled: !useSettings().getSettingValue('audio', 'noiseGateEnabled'),
        }
      ),
      createSettingsItem(
        'normalize',
        'toggle',
        '오디오 정규화',
        'audio.normalizeAudio',
        {
          description: '오디오 볼륨을 자동으로 정규화합니다',
        }
      ),
    ],
    '마이크 입력 및 오디오 처리 설정'
  );

  return (
    <SettingsSectionComponent section={audioSection}>
      {/* 오디오 설정 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Mic size={20} color="#00E5FF" />
          <Text style={styles.infoText}>마이크 입력 감도 조절</Text>
        </View>
        <View style={styles.infoItem}>
          <Volume2 size={20} color="#00E5FF" />
          <Text style={styles.infoText}>노이즈 필터링 옵션</Text>
        </View>
        <View style={styles.infoItem}>
          <Shield size={20} color="#00E5FF" />
          <Text style={styles.infoText}>오디오 품질 최적화</Text>
        </View>
      </View>

      {/* 설정 항목 렌더링 */}
      {audioSection.items.map((item) => (
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