// src/features/settings/components/SettingsSection.tsx
// 설정 섹션 컨테이너 컴포넌트

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SettingsSection as SettingsSectionType } from '../types/settings';

interface SettingsSectionProps {
  section: SettingsSectionType;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ section, children }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{section.title}</Text>
        {section.description && (
          <Text style={styles.description}>{section.description}</Text>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00E5FF',
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00E5FF',
  },
  title: {
    color: '#00E5FF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
});