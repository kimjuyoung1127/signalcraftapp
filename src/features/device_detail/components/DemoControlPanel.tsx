import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Activity, AlertTriangle, Zap } from 'lucide-react-native';

export type StatusType = 'NORMAL' | 'WARNING' | 'CRITICAL';

interface DemoControlPanelProps {
    currentStatus: StatusType;
    onStatusChange: (newStatus: StatusType) => void;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({ currentStatus, onStatusChange }) => {
    const getStatusColor = (s: StatusType) => {
        switch (s) {
            case 'NORMAL': return '#00FF9D'; // accentPrimary
            case 'WARNING': return '#FFC800'; // accentWarning
            case 'CRITICAL': return '#FF3366'; // accentDanger
            default: return '#A0A0A0'; // textSecondary
        }
    };

    return (
        <View className="bg-bgElevated/90 p-2 rounded-2xl border border-borderSubtle my-4 mx-4">
            <Text className="text-textSecondary text-xs text-center mb-2 tracking-widest">
                DEMO CONTROL (심사위원용)
            </Text>
            <View className="flex-row justify-between">
                <TouchableOpacity
                    onPress={() => onStatusChange('NORMAL')}
                    className={`flex-1 items-center gap-1 p-3 rounded-xl ${currentStatus === 'NORMAL' ? 'bg-bg' : ''}`}
                    style={currentStatus === 'NORMAL' ? { borderColor: getStatusColor('NORMAL'), borderWidth: 1 } : {}}
                >
                    <Activity size={18} color={currentStatus === 'NORMAL' ? getStatusColor('NORMAL') : '#555'} />
                    <Text className={`text-[10px] font-bold ${currentStatus === 'NORMAL' ? 'text-accentPrimary' : 'text-textSecondary'}`}>정상</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onStatusChange('WARNING')}
                    className={`flex-1 items-center gap-1 p-3 rounded-xl mx-1 ${currentStatus === 'WARNING' ? 'bg-bg' : ''}`}
                    style={currentStatus === 'WARNING' ? { borderColor: getStatusColor('WARNING'), borderWidth: 1 } : {}}
                >
                    <AlertTriangle size={18} color={currentStatus === 'WARNING' ? getStatusColor('WARNING') : '#555'} />
                    <Text className={`text-[10px] font-bold ${currentStatus === 'WARNING' ? 'text-accentWarning' : 'text-textSecondary'}`}>경고</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => onStatusChange('CRITICAL')}
                    className={`flex-1 items-center gap-1 p-3 rounded-xl ${currentStatus === 'CRITICAL' ? 'bg-bg' : ''}`}
                    style={currentStatus === 'CRITICAL' ? { borderColor: getStatusColor('CRITICAL'), borderWidth: 1 } : {}}
                >
                    <Zap size={18} color={currentStatus === 'CRITICAL' ? getStatusColor('CRITICAL') : '#555'} />
                    <Text className={`text-[10px] font-bold ${currentStatus === 'CRITICAL' ? 'text-accentDanger' : 'text-textSecondary'}`}>위험</Text>
                </TouchableOpacity>
            </View>
            <Text className="text-center text-[8px] text-textSecondary mt-3 tracking-widest opacity-60">
                ※ 실제 운영 시에는 자동 분석을 통해 상태가 결정됩니다
            </Text>
        </View>
    );
};
