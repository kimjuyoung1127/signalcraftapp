import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { ChevronLeft, Settings, Bell, Wifi, Database, Shield, Moon, Globe } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/useAuthStore';

export const SettingsScreen = () => {
    const navigation = useNavigation();
    const { logout } = useAuthStore();

    const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
    const [autoConnect, setAutoConnect] = React.useState(false);
    const [darkMode, setDarkMode] = React.useState(true);
    const [dataCollection, setDataCollection] = React.useState(true);

    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel'
                },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                            // Navigation will automatically update based on auth state
                            console.log('Successfully logged out');
                        } catch (error) {
                            console.error('Error during logout:', error);
                            Alert.alert('오류', '로그아웃에 실패했습니다');
                        }
                    }
                }
            ]
        );
    };

    const settingsItems = [
        {
            icon: Bell,
            title: '알림 설정',
            subtitle: '위험 및 경고 알림 수신',
            type: 'toggle',
            value: notificationsEnabled,
            onToggle: setNotificationsEnabled
        },
        {
            icon: Wifi,
            title: '자동 연결',
            subtitle: 'IoT 기기 자동 연결',
            type: 'toggle',
            value: autoConnect,
            onToggle: setAutoConnect
        },
        {
            icon: Database,
            title: '데이터 수집',
            subtitle: '진단 데이터 수집 동의',
            type: 'toggle',
            value: dataCollection,
            onToggle: setDataCollection
        },
        {
            icon: Shield,
            title: '보안 및 개인정보',
            subtitle: '인증 및 데이터 보안 설정',
            type: 'navigation',
            onPress: () => console.log('Navigate to security settings')
        },
        {
            icon: Globe,
            title: '언어 및 지역',
            subtitle: '한국어 (대한민국)',
            type: 'navigation',
            onPress: () => console.log('Navigate to language settings')
        }
    ];

    const renderSettingsItem = (item, index) => {
        const IconComponent = item.icon;
        
        return (
            <TouchableOpacity
                key={index}
                onPress={item.onPress}
                className="bg-bgElevated mx-4 mb-3 p-4 rounded-2xl border border-borderSubtle"
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View className="w-10 h-10 bg-bg rounded-xl items-center justify-center mr-3">
                            <IconComponent size={20} color="#00E5FF" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-white font-semibold text-base mb-1">
                                {item.title}
                            </Text>
                            <Text className="text-textSecondary text-sm">
                                {item.subtitle}
                            </Text>
                        </View>
                    </View>
                    
                    {item.type === 'toggle' && (
                        <Switch
                            value={item.value}
                            onValueChange={item.onToggle}
                            trackColor={{ false: '#262626', true: '#00E5FF30' }}
                            thumbColor={item.value ? '#00E5FF' : '#A0A0A0'}
                            ios_backgroundColor="#262626"
                        />
                    )}
                    
                    {item.type === 'navigation' && (
                        <ChevronLeft 
                            size={20} 
                            color="#A0A0A0" 
                            style={{ transform: [{ rotate: '180deg' }] }}
                        />
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <ScreenLayout className="pt-2">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 -ml-2 mr-2"
                    >
                        <ChevronLeft color="#F5F5F5" size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-textSecondary text-[10px] font-bold tracking-[0.2em]">
                            시스템 관리
                        </Text>
                        <Text className="text-white text-xl font-bold tracking-wider">
                            설정
                        </Text>
                    </View>
                </View>
            </View>

            {/* 설정 목록 */}
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-textSecondary text-xs font-bold tracking-[0.2em] px-4 mb-3">
                        시스템 설정
                    </Text>
                    {settingsItems.slice(0, 3).map((item, index) => renderSettingsItem(item, index))}
                </View>

                <View className="mb-6">
                    <Text className="text-textSecondary text-xs font-bold tracking-[0.2em] px-4 mb-3">
                        개인 설정
                    </Text>
                    {settingsItems.slice(3).map((item, index) => renderSettingsItem(item, index + 3))}
                </View>

                {/* 앱 정보 */}
                <View className="mx-4 mb-6 p-4 rounded-2xl border border-borderSubtle bg-bgElevated">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-white font-semibold">SignalCraft Mobile</Text>
                        <Text className="text-textSecondary text-xs">v1.0.0</Text>
                    </View>
                    <Text className="text-textSecondary text-sm leading-relaxed">
                        산업용 IoT 기기의 오디오 기반 AI 진단 시스템
                    </Text>
                    <Text className="text-textSecondary text-xs mt-3">
                        © 2025 SignalCraft Team
                    </Text>
                </View>

                {/* 로그아웃 버튼 */}
                <View className="mx-4 mb-8">
                    <TouchableOpacity
                        className="bg-red-500/20 border border-red-500/50 p-4 rounded-2xl"
                        onPress={handleLogout}
                    >
                        <Text className="text-red-400 font-semibold text-center">
                            로그아웃
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </ScreenLayout>
    );
};
