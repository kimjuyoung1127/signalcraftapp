import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { DeviceCard } from '../components/DeviceCard';
import { useDeviceStore } from '../store/useDeviceStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Settings } from 'lucide-react-native';

export const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const { devices, isLoading, fetchDevices, selectDevice, error } = useDeviceStore();
    
    // DB 연동 상태 계산
    const dbConnectedDevices = devices.filter(d => d.isOnline).length;
    const dbConnectionStatus = error ? '연결 오류' : (dbConnectedDevices > 0 ? 'DB 연동 중' : '오프라인');

    useFocusEffect(
        useCallback(() => {
            console.log('[DashboardScreen] Screen focused. Triggering fetchDevices...');
            fetchDevices();
        }, [])
    );

    const handleDevicePress = (device: any) => {
        selectDevice(device);
        navigation.navigate('DeviceDetail');
    };

    const handleSettingsPress = () => {
        navigation.navigate('SettingsTab');
    };

    return (
        <ScreenLayout>
            {/* 헤더 섹션 */}
            <View className="mt-6 mb-8">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-accentPrimary text-4xl font-bold tracking-tighter">
                            SIGNALCRAFT
                        </Text>
                        <Text className="text-textSecondary text-[10px] tracking-[0.3em] font-bold">
                            INDUSTRIAL AI MONITOR
                        </Text>
                    </View>

                    {/* 톱니바퀴 아이콘 */}
                    <TouchableOpacity
                        onPress={handleSettingsPress}
                        className="w-10 h-10 bg-bgElevated rounded-full items-center justify-center border border-borderSubtle"
                    >
                        <Settings size={20} color="#A0A0A0" />
                    </TouchableOpacity>
                </View>

                <View className="h-[1px] w-full bg-borderSubtle" />
            </View>

            {/* 장치 목록 */}
            <View className="flex-1">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-textPrimary font-bold text-sm tracking-widest">
                        시스템 상태
                    </Text>
                    <View className="flex-row items-center">
                        <Text className="text-textSecondary text-xs mr-2">
                            {dbConnectionStatus}
                        </Text>
                        <Text className="text-accentPrimary text-xs font-bold">
                            {devices.length} 활성 ({dbConnectedDevices} 온라인)
                        </Text>
                    </View>
                </View>

                <FlatList
                    data={devices}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <DeviceCard
                            name={item.name}
                            model={item.model}
                            status={item.status}
                            location={item.location}
                            lastReading={item.lastReading}
                            last_reading_at={item.last_reading_at} // Pass last_reading_at
                            isOnline={item.isOnline}             // Pass isOnline
                            onPress={() => handleDevicePress(item)}
                        />
                    )}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={fetchDevices}
                            tintColor="#00E5FF"
                            colors={['#00E5FF']}
                        />
                    }
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </ScreenLayout>
    );
};
