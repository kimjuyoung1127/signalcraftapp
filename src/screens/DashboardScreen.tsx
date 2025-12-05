import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StatusBar, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { DeviceCard } from '../components/DeviceCard';
import { useDeviceStore } from '../store/useDeviceStore';
import { useAuthStore } from '../store/useAuthStore'; // Import useAuthStore
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Settings, Plus } from 'lucide-react-native'; // Import Plus icon

import { SkeletonDeviceCard } from '../components/ui/SkeletonDeviceCard';

export const DashboardScreen = () => {
    const navigation = useNavigation<any>();
    const { devices, isLoading, fetchDevices, selectDevice, error, removeDevice } = useDeviceStore(); // Get removeDevice
    const { isAdmin } = useAuthStore(); // Get isAdmin state

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

    const handleDeviceLongPress = (device: any) => {
        if (!isAdmin) {
            Alert.alert('권한 없음', '장비 삭제는 관리자만 가능합니다.');
            return;
        }

        Alert.alert(
            '장비 삭제',
            `정말로 "${device.name}" 장비를 삭제하시겠습니까? (device_id: ${device.device_id})`,
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        await removeDevice(device.device_id);
                        // 삭제 후 목록 새로고침 (useDeviceStore의 removeDevice에서 이미 filter 처리함)
                        // fetchDevices(); // 필요 시, 백엔드로부터 최종 상태를 다시 가져옴
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const handleSettingsPress = () => {
        navigation.navigate('SettingsTab');
    };

    const handleAddDevicePress = () => {
        navigation.navigate('AddDevice'); // Navigate to AddDeviceScreen
    };

    const renderContent = () => {
        if (isLoading && devices.length === 0) {
            return (
                <View style={{ paddingHorizontal: 20 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonDeviceCard key={i} />
                    ))}
                </View>
            );
        }

        if (error) {
            return (
                <View className="flex-1 justify-center items-center p-5">
                    <Text className="text-accentDanger text-lg mb-2">Error</Text>
                    <Text className="text-textSecondary text-center mb-4">{error}</Text>
                    <TouchableOpacity
                        onPress={fetchDevices}
                        className="bg-bgElevated px-4 py-2 rounded-lg border border-borderSubtle"
                    >
                        <Text className="text-textPrimary">Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
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
                        last_reading_at={item.last_reading_at}
                        isOnline={item.isOnline}
                        onPress={() => handleDevicePress(item)}
                        onLongPress={() => handleDeviceLongPress(item)} // New: Pass long press handler
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
                ListEmptyComponent={
                    <View className="flex-1 justify-center items-center py-10">
                        <Text className="text-textSecondary">No devices found.</Text>
                    </View>
                }
            />
        );
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
                <View className="flex-row justify-between items-center mb-4 px-1">
                    {/* 모니터링 대상 텍스트 삭제됨 */}
                    <View className="flex-row items-center gap-2">
                        {/* 전체 Badge */}
                        <View className="px-2 py-1 rounded bg-bgElevated border border-borderSubtle">
                            <Text className="text-[10px] text-textSecondary font-bold">
                                전체 <Text className="text-white">{devices.length}</Text>
                            </Text>
                        </View>

                        {/* 온라인 Badge */}
                        <View className={`px-2 py-1 rounded border ${dbConnectedDevices > 0 ? 'bg-green-900/20 border-green-500/30' : 'bg-bgElevated border-borderSubtle'}`}>
                            <View className="flex-row items-center">
                                <View className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dbConnectedDevices > 0 ? 'bg-green-400' : 'bg-gray-500'}`} />
                                <Text className={`text-[10px] font-bold ${dbConnectedDevices > 0 ? 'text-green-400' : 'text-gray-500'}`}>
                                    온라인 {dbConnectedDevices}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {renderContent()}
            </View>

            {isAdmin && (
                <TouchableOpacity
                    onPress={handleAddDevicePress}
                    style={styles.addDeviceFab}
                >
                    <Plus size={24} color="#00E5FF" />
                </TouchableOpacity>
            )}
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    addDeviceFab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#101010',
        borderRadius: 28,
        width: 56,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#00E5FF',
        elevation: 5,
        shadowColor: '#00E5FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
});
