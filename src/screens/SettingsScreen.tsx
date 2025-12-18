// src/screens/SettingsScreen.tsx
// 메인 설정 화면

import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native'; // [NEW] Import TouchableOpacity, Alert
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { UserProfileHeader } from '../features/settings/components/UserProfileHeader';
import { NetworkStatusModule } from '../features/settings/modules/NetworkStatusModule';
import { AudioConfigModule } from '../features/settings/modules/AudioConfigModule';
import { VisualThemeModule } from '../features/settings/modules/VisualThemeModule';
import { DataSyncModule } from '../features/settings/modules/DataSyncModule';
import { NotificationModule } from '../features/settings/modules/NotificationModule';
import { useSettings } from '../features/settings/hooks/useSettings';
import { useAuthStore } from '../store/useAuthStore'; // [NEW] Import useAuthStore
import { LogOut } from 'lucide-react-native'; // [NEW] Import LogOut icon

export const SettingsScreen: React.FC = () => {
  const { settings } = useSettings();
  const logout = useAuthStore((state) => state.logout); // [NEW] Get logout function

  const handleLogout = () => {
    Alert.alert(
        "로그아웃",
        "정말 로그아웃 하시겠습니까?",
        [
            { text: "취소", style: "cancel" },
            { 
                text: "로그아웃", 
                style: "destructive", 
                onPress: async () => {
                    await logout();
                    // AuthStack으로 자동 전환됨 (RootNavigator의 조건부 렌더링에 의해)
                } 
            }
        ]
    );
  };

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 섹션 */}
          <View style={styles.header}>
            <Text style={styles.title}>SIGNALCRAFT</Text>
            <Text style={styles.subtitle}>INDUSTRIAL AI MONITOR</Text>
            <Text style={styles.settingsTitle}>설정</Text>
          </View>

          {/* 사용자 프로필 헤더 */}
          <UserProfileHeader
            onPress={() => {
              // TODO: 프로필 편집 화면으로 이동
              console.log('Profile edit pressed');
            }}
          />

          {/* 설정 모듈들 */}
          <View style={styles.modulesContainer}>
            {/* 네트워크 상태 모듈 */}
            <NetworkStatusModule />

            {/* 오디오 설정 모듈 */}
            <AudioConfigModule />

            {/* 시각화 설정 모듈 */}
            <VisualThemeModule />

            {/* 데이터 동기화 모듈 */}
            <DataSyncModule />

            {/* 알림 설정 모듈 */}
            <NotificationModule />
          </View>

          {/* 로그아웃 버튼 */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#FF3366" />
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>

          {/* 디버그 정보 (개발용) */}
          {settings.profile.showAdvancedOptions && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>설정 버전: {settings.version}</Text>
              <Text style={styles.debugText}>마지막 업데이트: {new Date(settings.lastUpdated).toLocaleString()}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    color: '#00E5FF',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: '#A0A0A0',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modulesContainer: {
    marginBottom: 24, // Reduced margin
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A', // bgElevated
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3366', // accentDanger
    marginBottom: 24,
    gap: 8,
  },
  logoutText: {
    color: '#FF3366', // accentDanger
    fontWeight: 'bold',
    fontSize: 16,
  },
  debugInfo: {
    padding: 16,
    backgroundColor: '#000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginTop: 0,
  },
  debugText: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 4,
  },
});