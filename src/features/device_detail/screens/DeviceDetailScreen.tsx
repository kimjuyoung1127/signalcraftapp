import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StyleSheet, Linking, Platform } from 'react-native';
import { ScreenLayout } from '../../../components/ui/ScreenLayout';
import { ChevronLeft, Settings } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useDeviceStore } from '../../../store/useDeviceStore';
import AnalysisService, { DetailedAnalysisReport } from '../../diagnosis/services/analysisService';
import { OverviewTab, DetailAnalysisTab, PredictionTab } from '../../diagnosis/components/report/DiagnosisReportView';
import { MaintenanceActionFab } from '../components/MaintenanceActionFab'; // NEW IMPORT
import { Ionicons } from '@expo/vector-icons';

type DeviceDetailScreenRouteProp = RouteProp<{ DeviceDetail: { deviceId: string } }, 'DeviceDetail'>;

const { width } = Dimensions.get('window');

export const DeviceDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<DeviceDetailScreenRouteProp>();
    const { selectedDevice, selectDevice } = useDeviceStore();
    const rawDeviceId = route.params?.deviceId || selectedDevice?.device_id || selectedDevice?.id || 'dev_unknown';
    const deviceId = String(rawDeviceId);

    const [reportData, setReportData] = useState<DetailedAnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'Overview' | 'Detail' | 'Prediction'>('Overview');

    const fetchReport = useCallback(async (id: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedReport = await AnalysisService.getDetailedAnalysisReport(id);
            setReportData(fetchedReport);
        } catch (err: any) {
            console.error("Failed to fetch detailed report:", err);
            setError("리포트를 불러오는데 실패했습니다: " + (err.message || '알 수 없는 에러'));
            setReportData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            if (deviceId) {
                fetchReport(deviceId);
            } else {
                setError("장비 ID를 찾을 수 없습니다.");
                setIsLoading(false);
            }
        }, [deviceId, fetchReport])
    );

    if (isLoading) {
        return (
            <ScreenLayout>
                <ActivityIndicator size="large" color="#00E5FF" className="flex-1 justify-center items-center" />
            </ScreenLayout>
        );
    }

    if (error) {
        return (
            <ScreenLayout>
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-red-500 text-lg text-center mb-4">{error}</Text>
                    <TouchableOpacity onPress={() => fetchReport(deviceId)} className="bg-accentPrimary p-3 rounded-lg">
                        <Text className="text-white font-bold">재시도</Text>
                    </TouchableOpacity>
                </View>
            </ScreenLayout>
        );
    }

    if (!reportData) {
        return (
            <ScreenLayout>
                <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-textSecondary text-lg text-center">리포트 데이터를 찾을 수 없습니다.</Text>
                </View>
            </ScreenLayout>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Overview':
                return <OverviewTab reportData={reportData} isDemo={false} />;
            case 'Detail':
                return <DetailAnalysisTab reportData={reportData} />;
            case 'Prediction':
                return <PredictionTab reportData={reportData} />;
            default:
                return null;
        }
    };

    return (
        <ScreenLayout className="flex-1">
            <View className="flex-row items-center justify-between mt-2 mb-6 px-4">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-2">
                        <ChevronLeft color="#F5F5F5" size={24} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-textSecondary text-[10px] font-bold tracking-[0.2em]">
                            대상 시스템
                        </Text>
                        <Text className="text-white text-xl font-bold tracking-wider" style={{ color: getStatusColor(reportData.status.current_state), textShadowColor: getStatusColor(reportData.status.current_state), textShadowRadius: 10 }}>
                            {selectedDevice?.name?.toUpperCase() || 'UNKNOWN DEVICE'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('SettingsTab')} className="p-2 -mr-2 ml-2">
                    <View className="w-8 h-8 bg-bgElevated rounded-lg items-center justify-center border border-borderSubtle">
                        <Settings size={18} color="#A0A0A0" />
                    </View>
                </TouchableOpacity>
            </View>

            <View className="flex-row h-12 bg-bgElevated border-b border-borderSubtle">
                {['Overview', 'Detail', 'Prediction'].map((tab) => {
                    const isActive = activeTab === tab;
                    const label = tab === 'Overview' ? '요약' : tab === 'Detail' ? '상세 분석' : '미래 예측';
                    return (
                        <TouchableOpacity
                            key={tab}
                            className={`flex-1 items-center justify-center border-b-2 ${isActive ? 'border-accentPrimary' : 'border-transparent'}`}
                            onPress={() => setActiveTab(tab as any)}
                        >
                            <Text className={`text-sm font-bold ${isActive ? 'text-accentPrimary' : 'text-textSecondary'}`}>
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View className="flex-1">
                {renderTabContent()}
            </View>

            {/* FAB Container */}
            <View style={styles.fabContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AnalysisTab', { deviceId: deviceId })}
                    style={[styles.settingsFab, { borderColor: '#00E5FF', backgroundColor: 'rgba(0, 229, 255, 0.1)' }]} // Distinct styling for primary action
                >
                    <Ionicons name="scan" size={24} color="#00E5FF" />
                </TouchableOpacity>

                <MaintenanceActionFab />
                
            </View>
        </ScreenLayout>
    );
};

const getStatusColor = (status: StatusType) => {
    switch (status) {
        case 'NORMAL': return '#00E5FF'; // accentPrimary
        case 'WARNING': return '#FFC800'; // accentWarning
        case 'CRITICAL': return '#FF3366'; // accentDanger
        default: return '#A0A0A0'; // textSecondary
    }
};

const styles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12, // Spacing between FABs
        zIndex: 100,
    },
    settingsFab: {
        backgroundColor: '#101010',
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#262626',
        elevation: 5,
    }
});