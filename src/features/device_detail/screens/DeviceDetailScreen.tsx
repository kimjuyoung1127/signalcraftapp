import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, StyleSheet } from 'react-native';
import { ScreenLayout } from '../../../components/ui/ScreenLayout';
import { ChevronLeft, Settings } from 'lucide-react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { useDeviceStore } from '../../../store/useDeviceStore';
import AnalysisService, { DetailedAnalysisReport } from '../../diagnosis/services/analysisService';
import { OverviewTab, DetailAnalysisTab, PredictionTab } from '../../diagnosis/components/report/DiagnosisReportView';
import { DemoControlPanel, StatusType as DemoStatusType } from '../components/DemoControlPanel'; // StatusType 가져오기

type DeviceDetailScreenRouteProp = RouteProp<{ DeviceDetail: { deviceId: string } }, 'DeviceDetail'>;

const { width } = Dimensions.get('window');

export const DeviceDetailScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<DeviceDetailScreenRouteProp>();
    const { selectedDevice, selectDevice } = useDeviceStore(); // selectedDevice 사용
    // deviceId가 숫자일 수도 있으므로 String()으로 변환하고, device_id(문자열) 필드가 있으면 우선 사용
    const rawDeviceId = route.params?.deviceId || selectedDevice?.device_id || selectedDevice?.id || 'dev_unknown';
    const deviceId = String(rawDeviceId);

    const [reportData, setReportData] = useState<DetailedAnalysisReport | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'Overview' | 'Detail' | 'Prediction'>('Overview');

    // 심사위원용 데모 상태
    const [demoCurrentStatus, setDemoCurrentStatus] = useState<DemoStatusType>('NORMAL');
    const [showDemoControl, setShowDemoControl] = useState(false); // 토글 상태 추가

    const fetchReport = useCallback(async (id: string, useDemoId: string | null = null) => {
        setIsLoading(true);
        setError(null);
        try {
            // 데모 컨트롤에서 넘어온 상태에 따라 MOCK ID 변경
            const targetDeviceId = useDemoId || id;

            // useDiagnosisLogic에서 가져오는 것과 동일한 API 호출
            const fetchedReport = await AnalysisService.getDetailedAnalysisReport(targetDeviceId);
            setReportData(fetchedReport);
            // 데모 컨트롤의 현재 상태도 업데이트
            setDemoCurrentStatus(fetchedReport.status.current_state);

        } catch (err: any) {
            console.error("Failed to fetch detailed report:", err);
            setError("리포트를 불러오는데 실패했습니다: " + (err.message || '알 수 없는 에러'));
            setReportData(null); // 에러 발생 시 데이터 초기화
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 화면 포커스 시 데이터 로드
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

    // 데모 컨트롤 상태 변경 핸들러
    const handleDemoStatusChange = (newStatus: DemoStatusType) => {
        const mockDeviceIdMap = {
            'NORMAL': 'MOCK-003',
            'WARNING': 'MOCK-002',
            'CRITICAL': 'MOCK-001',
        };
        const targetMockId = mockDeviceIdMap[newStatus];
        setDemoCurrentStatus(newStatus); // UI 상태 즉시 반영
        fetchReport(deviceId, targetMockId); // 실제 deviceId는 유지하되, 데모 데이터는 mockId로 요청
    };

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

    // --- Render Tab Content ---
    const renderTabContent = () => {
        const isDemoMode = deviceId.startsWith('MOCK-') || (reportData && reportData.status.current_state !== demoCurrentStatus); // MOCK 장비거나 데모 컨트롤로 조작된 경우
        switch (activeTab) {
            case 'Overview':
                return <OverviewTab reportData={reportData} isDemo={isDemoMode} />;
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
            {/* 헤더 */}
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

                {/* 설정 버튼 */}
                <TouchableOpacity onPress={() => navigation.navigate('SettingsTab')} className="p-2 -mr-2 ml-2">
                    <View className="w-8 h-8 bg-bgElevated rounded-lg items-center justify-center border border-borderSubtle">
                        <Settings size={18} color="#A0A0A0" />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Custom Tab Bar */}
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

            {/* Tab Content */}
            <View className="flex-1">
                {renderTabContent()}
            </View>

            {/* Demo Control Toggle Button (FAB) */}
            <TouchableOpacity 
                onPress={() => setShowDemoControl(!showDemoControl)}
                style={{
                    position: 'absolute',
                    bottom: 20,
                    right: 20,
                    backgroundColor: '#101010',
                    borderRadius: 25,
                    width: 50,
                    height: 50,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: '#262626',
                    elevation: 5,
                    zIndex: 100
                }}
            >
                <Settings size={24} color={showDemoControl ? '#00E5FF' : '#A0A0A0'} />
            </TouchableOpacity>

            {/* Demo Control Panel (Bottom Sheet style) */}
            {showDemoControl && (
                <View style={{
                    position: 'absolute',
                    bottom: 80, // FAB 위에 표시
                    left: 20,
                    right: 20,
                    zIndex: 100
                }}>
                    <DemoControlPanel 
                        currentStatus={demoCurrentStatus} 
                        onStatusChange={handleDemoStatusChange} 
                    />
                </View>
            )}
        </ScreenLayout>
    );
};

// ... (getStatusColor function remains)
const getStatusColor = (status: DemoStatusType) => {
    switch (status) {
        case 'NORMAL': return '#00E5FF'; // accentPrimary
        case 'WARNING': return '#FFC800'; // accentWarning
        case 'CRITICAL': return '#FF3366'; // accentDanger
        default: return '#A0A0A0'; // textSecondary
    }
};

const localStyles = StyleSheet.create({
    // 필요한 경우 스타일 추가
});