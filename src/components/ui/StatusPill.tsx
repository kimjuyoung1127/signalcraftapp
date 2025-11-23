import React from 'react';
import { View, Text } from 'react-native';

export type StatusType = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE';

interface StatusPillProps {
    status: StatusType;
    className?: string;
}

const getStatusColor = (status: StatusType) => {
    switch (status) {
        case 'NORMAL':
            return 'bg-accentPrimary/20 border-accentPrimary text-accentPrimary';
        case 'WARNING':
            return 'bg-accentWarning/20 border-accentWarning text-accentWarning';
        case 'CRITICAL':
            return 'bg-accentDanger/20 border-accentDanger text-accentDanger';
        case 'OFFLINE':
        default:
            return 'bg-textSecondary/20 border-textSecondary text-textSecondary';
    }
};

const getStatusText = (status: StatusType) => {
    switch (status) {
        case 'NORMAL':
            return '정상';
        case 'WARNING':
            return '경고';
        case 'CRITICAL':
            return '위험';
        case 'OFFLINE':
        default:
            return '오프라인';
    }
};

export const StatusPill: React.FC<StatusPillProps> = ({ status, className }) => {
    const colorClass = getStatusColor(status);
    const statusText = getStatusText(status);

    return (
        <View className={`border px-3 py-1 rounded-full self-start ${colorClass} ${className}`}>
            <Text className={`text-xs font-bold ${colorClass.split(' ').pop()}`}>
                {statusText}
            </Text>
        </View>
    );
};
