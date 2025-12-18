// src/features/settings/components/UserProfileHeader.tsx
// 사용자 프로필 헤더 컴포넌트

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useSettingValue } from '../hooks/useSettings';
import { useAuthStore } from '../../../store/useAuthStore';
import { User, ChevronRight, Settings } from 'lucide-react-native';

interface UserProfileHeaderProps {
  onPress?: () => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ onPress }) => {
  const { user } = useAuthStore();
  const displayName = useSettingValue('profile', 'displayName');
  const selectedStoreId = useSettingValue('profile', 'selectedStoreId');
  
  // 실제 사용자 데이터와 설정 데이터를 결합
  const actualDisplayName = user?.full_name || displayName || user?.username || '사용자 이름';
  const actualStoreInfo = user?.stores?.find(store => store.id === selectedStoreId)?.name 
    || (selectedStoreId ? `사업장 ID: ${selectedStoreId}` : '사업장 선택되지 않음');
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.profileInfo}>
        <View style={styles.avatar}>
          <User size={24} color="#00E5FF" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{actualDisplayName}</Text>
          <Text style={styles.store}>{actualStoreInfo}</Text>
        </View>
      </View>
      <ChevronRight size={20} color="#A0A0A0" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#00E5FF',
    marginBottom: 24,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00E5FF20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  store: {
    color: '#A0A0A0',
    fontSize: 12,
  },
});