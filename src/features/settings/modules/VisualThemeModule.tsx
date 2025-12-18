// src/features/settings/modules/VisualThemeModule.tsx
// 시각화 테마 설정 모듈

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SettingsSection, SettingsItem } from '../types/settings';
import { SettingsSection as SettingsSectionComponent } from '../components/SettingsSection';
import { SettingsItem as SettingsItemComponent } from '../components/SettingsItem';
import { useSettings } from '../hooks/useSettings';
import { Palette, LayoutGrid, Eye } from 'lucide-react-native';

export const VisualThemeModule: React.FC = () => {
  const { createSettingsSection, createSettingsItem } = useSettings();

  // 컬러맵 옵션
  const colorMapOptions = [
    { value: 'cyberpunk', label: 'Cyberpunk Neon' },
    { value: 'inferno', label: 'Inferno Heatmap' },
    { value: 'grayscale', label: 'Grayscale' },
    { value: 'viridis', label: 'Viridis' },
    { value: 'plasma', label: 'Plasma' },
  ];

  // 시각화 설정 섹션 정의
  const visualSection = createSettingsSection(
    'visual',
    '시각화 테마',
    [
      createSettingsItem(
        'color-map',
        'select',
        '컬러맵 선택',
        'visual.colorMap',
        {
          options: colorMapOptions,
          description: '스펙트로그램 및 그래프의 색상 테마',
        }
      ),
      createSettingsItem(
        'show-grid',
        'toggle',
        '그리드 표시',
        'visual.showGrid',
        {
          description: '그래프에 그리드 라인을 표시합니다',
        }
      ),
      createSettingsItem(
        'animation-speed',
        'slider',
        '애니메이션 속도',
        'visual.animationSpeed',
        {
          min: 0.5,
          max: 2.0,
          step: 0.1,
          unit: 'x',
          description: '시각화 애니메이션 속도 조절',
        }
      ),
      createSettingsItem(
        'contrast',
        'slider',
        '대비 조절',
        'visual.contrastLevel',
        {
          min: 0.0,
          max: 1.0,
          step: 0.1,
          unit: '',
          description: '시각화 요소의 대비 조절',
        }
      ),
    ],
    '그래프 및 스펙트로그램 스타일 설정'
  );

  return (
    <SettingsSectionComponent section={visualSection}>
      {/* 시각화 설정 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Palette size={20} color="#00E5FF" />
          <Text style={styles.infoText}>다양한 컬러맵 선택</Text>
        </View>
        <View style={styles.infoItem}>
          <LayoutGrid size={20} color="#00E5FF" />
          <Text style={styles.infoText}>그리드 및 레이아웃 설정</Text>
        </View>
        <View style={styles.infoItem}>
          <Eye size={20} color="#00E5FF" />
          <Text style={styles.infoText}>시각적 최적화 옵션</Text>
        </View>
      </View>

      {/* 설정 항목 렌더링 */}
      {visualSection.items.map((item) => (
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