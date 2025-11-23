import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { useDeviceStore } from '../store/useDeviceStore';
import { ChevronLeft, Activity, AlertTriangle, Zap, Volume2, Settings, TrendingUp, Clock, Radio } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusType } from '../components/ui/StatusPill';
import { StatusPill } from '../components/ui/StatusPill';

export const DeviceDetailScreen = () => {
    const navigation = useNavigation();
    const selectedDevice = useDeviceStore((state) => state.selectedDevice);
    const updateDeviceStatus = useDeviceStore((state) => state.updateDeviceStatus);

    if (!selectedDevice) return null;

    const status = selectedDevice.status;

    // 동적인 오디오 분석 데이터 (실제로는 백엔드에서 받아올 데이터)
    const audioMetrics = React.useMemo(() => {
        if (status === 'NORMAL') {
            return {
                noiseLevel: 45,
                frequency: '60 Hz',
                vibrationAmplitude: 2.1,
                signalQuality: 98,
                harmonics: [12, 15, 8, 3, 1],
                trendData: Array.from({ length: 24 }, (_, i) => 
                    42 + Math.sin(i * 0.5) * 5 + Math.random() * 3
                )
            };
        } else if (status === 'WARNING') {
            return {
                noiseLevel: 78,
                frequency: '45 Hz',
                vibrationAmplitude: 5.8,
                signalQuality: 76,
                harmonics: [25, 38, 22, 15, 8],
                trendData: Array.from({ length: 24 }, (_, i) => 
                    75 + Math.sin(i * 0.3) * 15 + Math.random() * 10
                )
            };
        } else {
            return {
                noiseLevel: 105,
                frequency: '28 Hz',
                vibrationAmplitude: 12.4,
                signalQuality: 42,
                harmonics: [45, 52, 38, 28, 18],
                trendData: Array.from({ length: 24 }, (_, i) => 
                    102 + Math.sin(i * 0.2) * 25 + Math.random() * 15
                )
            };
        }
    }, [status]);

    const getStatusColor = (s: StatusType) => {
        switch (s) {
            case 'NORMAL': return '#00FF9D';
            case 'WARNING': return '#FF5E00';
            case 'CRITICAL': return '#FF0055';
            default: return '#505050';
        }
    };

    const currentColor = getStatusColor(status);

    const handleStatusChange = (newStatus: StatusType) => {
        updateDeviceStatus(selectedDevice.id, newStatus);
    };

    return (
        <ScreenLayout className="pb-6">
            {/* 헤더 */}
            <View className="flex-row items-center justify-between mt-2 mb-6">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="p-2 -ml-2 mr-2"
                    >
                        <ChevronLeft color="#F5F5F5" size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-textSecondary text-[10px] font-bold tracking-[0.2em]">
                            대상 시스템
                        </Text>
                        <Text className="text-white text-xl font-bold tracking-wider" style={{ color: currentColor, textShadowColor: currentColor, textShadowRadius: 10 }}>
                            {selectedDevice.name.toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* 설정 버튼 */}
                <TouchableOpacity
                    onPress={() => navigation.navigate('SettingsTab')}
                    className="p-2 -mr-2 ml-2"
                >
                    <View className="w-8 h-8 bg-bgElevated rounded-lg items-center justify-center border border-borderSubtle">
                        <Settings size={18} color="#A0A0A0" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* 스크롤 가능한 콘텐츠 */}
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* 비주얼라이저 영역 */}
                <View className="items-center justify-center -mt-10 mb-6">
                    <AudioVisualizer status={status} />

                    {/* HUD 통계 */}
                    <View className="absolute top-0 right-0 w-full items-end px-4">
                        <View className="flex-row items-center gap-2 mb-1">
                            <Volume2 size={14} color={currentColor} />
                            <Text className="text-textSecondary text-xs">
                                {status === 'NORMAL' ? '45dB' : status === 'WARNING' ? '72dB' : '98dB'}
                            </Text>
                        </View>
                        <View className="w-24 h-1 bg-bgElevated rounded-full overflow-hidden">
                            <View
                                className="h-full transition-all duration-300"
                                style={{
                                    width: status === 'NORMAL' ? '30%' : status === 'WARNING' ? '60%' : '95%',
                                    backgroundColor: currentColor
                                }}
                            />
                        </View>
                    </View>
                </View>

                {/* 오디오 분석 대시보드 */}
                <View className="px-4 mb-6">
                    <View className="bg-bgElevated rounded-2xl border border-borderSubtle p-4">
                        <View className="flex-row items-center mb-4">
                            <Radio size={16} color={currentColor} />
                            <Text className="text-white font-semibold ml-2">오디오 진단 분석</Text>
                        </View>

                        {/* 주요 지표 */}
                        <View className="grid grid-cols-2 gap-3 mb-4">
                            <View className="bg-bg rounded-xl p-3">
                                <View className="flex-row items-center mb-1">
                                    <Volume2 size={12} color={currentColor} />
                                    <Text className="text-textSecondary text-xs ml-1">소음 레벨</Text>
                                </View>
                                <Text className="text-white text-lg font-bold" style={{ color: currentColor }}>
                                    {audioMetrics.noiseLevel} dB
                                </Text>
                            </View>

                            <View className="bg-bg rounded-xl p-3">
                                <View className="flex-row items-center mb-1">
                                    <TrendingUp size={12} color={currentColor} />
                                    <Text className="text-textSecondary text-xs ml-1">진폭</Text>
                                </View>
                                <Text className="text-white text-lg font-bold" style={{ color: currentColor }}>
                                    {audioMetrics.vibrationAmplitude} mm
                                </Text>
                            </View>

                            <View className="bg-bg rounded-xl p-3">
                                <View className="flex-row items-center mb-1">
                                    <Clock size={12} color={currentColor} />
                                    <Text className="text-textSecondary text-xs ml-1">주파수</Text>
                                </View>
                                <Text className="text-white text-lg font-bold" style={{ color: currentColor }}>
                                    {audioMetrics.frequency}
                                </Text>
                            </View>

                            <View className="bg-bg rounded-xl p-3">
                                <View className="flex-row items-center mb-1">
                                    <Activity size={12} color={currentColor} />
                                    <Text className="text-textSecondary text-xs ml-1">신호 품질</Text>
                                </View>
                                <Text className="text-white text-lg font-bold" style={{ color: currentColor }}>
                                    {audioMetrics.signalQuality}%
                                </Text>
                            </View>
                        </View>

                        {/* 고조파 분석 */}
                        <View className="mb-3">
                            <Text className="text-textSecondary text-sm mb-2">고조파 분석</Text>
                            <View className="bg-bg rounded-xl p-3">
                                <View className="flex-row items-end justify-between h-16">
                                    {audioMetrics.harmonics.map((value, index) => (
                                        <View key={index} className="flex-1 mx-0.5 items-center">
                                            <View 
                                                className="w-full rounded-t transition-all duration-300"
                                                style={{
                                                    height: `${(value / 60) * 100}%`,
                                                    backgroundColor: currentColor,
                                                    opacity: 0.7 + (index * 0.05)
                                                }}
                                            />
                                            <Text className="text-textSecondary text-xs mt-1">
                                                H{index + 1}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>

                        {/* 경고 메시지 */}
                        <View className="bg-bg rounded-xl p-3 border-l-4" style={{ borderLeftColor: currentColor }}>
                            <Text className="text-white text-sm font-semibold mb-1">
                                {status === 'NORMAL' ? '정상 상태' : status === 'WARNING' ? '주의 필요' : '즉시 점검'}
                            </Text>
                            <Text className="text-textSecondary text-xs">
                                {status === 'NORMAL' 
                                    ? '장비가 정상 범위 내에서 운영되고 있습니다.'
                                    : status === 'WARNING'
                                    ? '이상 신호가 감지되었습니다. 주기적인 모니터링이 필요합니다.'
                                    : '위험 수준의 이상 신호가 감지되었습니다. 즉시 점검 후 조치가 필요합니다.'
                                }
                            </Text>
                        </View>
                    </View>
                </View>

            {/* 데모 컨트롤 (심사위원용) */}
                <View className="px-4 mb-6">
                    <View className="bg-bgElevated/90 p-2 rounded-2xl border border-borderSubtle">
                        <Text className="text-textSecondary text-xs text-center mb-2 tracking-widest">
                            DEMO CONTROL (심사위원용)
                        </Text>
                        <View className="flex-row justify-between">
                            <TouchableOpacity
                                onPress={() => handleStatusChange('NORMAL')}
                                className={`flex-1 items-center gap-1 p-3 rounded-xl ${status === 'NORMAL' ? 'bg-bg' : ''}`}
                                style={status === 'NORMAL' ? { borderColor: '#00FF9D', borderWidth: 1 } : {}}
                            >
                                <Activity size={18} color={status === 'NORMAL' ? '#00FF9D' : '#555'} />
                                <Text className={`text-[10px] font-bold ${status === 'NORMAL' ? 'text-[#00FF9D]' : 'text-textSecondary'}`}>정상</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleStatusChange('WARNING')}
                                className={`flex-1 items-center gap-1 p-3 rounded-xl mx-1 ${status === 'WARNING' ? 'bg-bg' : ''}`}
                                style={status === 'WARNING' ? { borderColor: '#FF5E00', borderWidth: 1 } : {}}
                            >
                                <AlertTriangle size={18} color={status === 'WARNING' ? '#FF5E00' : '#555'} />
                                <Text className={`text-[10px] font-bold ${status === 'WARNING' ? 'text-[#FF5E00]' : 'text-textSecondary'}`}>경고</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleStatusChange('CRITICAL')}
                                className={`flex-1 items-center gap-1 p-3 rounded-xl ${status === 'CRITICAL' ? 'bg-bg' : ''}`}
                                style={status === 'CRITICAL' ? { borderColor: '#FF0055', borderWidth: 1 } : {}}
                            >
                                <Zap size={18} color={status === 'CRITICAL' ? '#FF0055' : '#555'} />
                                <Text className={`text-[10px] font-bold ${status === 'CRITICAL' ? 'text-[#FF0055]' : 'text-textSecondary'}`}>위험</Text>
                            </TouchableOpacity>
                        </View>
                        <Text className="text-center text-[8px] text-textSecondary mt-3 tracking-widest opacity-60">
                            ※ 실제 운영 시에는 자동 분석을 통해 상태가 결정됩니다
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </ScreenLayout>
    );
};
