import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusPill, StatusType } from './ui/StatusPill';
import { ChevronRight, Activity, Wifi } from 'lucide-react-native'; // Added Wifi icon
import { formatRelativeTime } from '../utils/dateUtils'; // Import utility

interface DeviceCardProps {
    name: string;
    model: string;
    status: StatusType;
    location: string;
    lastReading: string; // Keep for fallback/simplicity, but will use last_reading_at if available
    last_reading_at?: string; // ISO 8601 string from backend
    isOnline?: boolean; // New field for online status
    onPress: () => void;
    onLongPress?: () => void; // New: Optional long press handler
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
    name,
    model,
    status,
    location,
    lastReading,
    last_reading_at,
    isOnline,
    onPress,
    onLongPress, // New: Destructure onLongPress
}) => {
    const displayLastUpdate = last_reading_at ? formatRelativeTime(last_reading_at) : lastReading;
    const displayStatus = isOnline ? '실시간 연동' : (status === 'OFFLINE' ? '오프라인' : displayLastUpdate); // 'OFFLINE' takes precedence for display
    const statusColor = isOnline ? '#00E5FF' : '#A0A0A0'; // Neon green for online, gray for offline/unknown

    // 디버깅용: 콘솔에 상태 정보 출력 (DB 장비만 출력)
    if (name.includes('DB') || name.includes('A-1')) {
        console.log(`[DeviceCard] ${name}: isOnline=${isOnline}, lastReading=${displayLastUpdate}, last_reading_at=${last_reading_at}`);
    }

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress} // New: Bind onLongPress
            className="bg-bgElevated border border-borderSubtle rounded-xl p-4 mb-3 active:bg-borderSubtle/30"
        >
            <View className="flex-row justify-between items-start mb-3">
                <View>
                    <Text className="text-textSecondary text-xs font-bold tracking-widest mb-1">
                        {model}
                    </Text>
                    <Text className="text-textPrimary text-lg font-bold">{name}</Text>
                </View>
                <StatusPill status={status} />
            </View>

            <View className="flex-row justify-between items-end">
                <View>
                    <Text className="text-textSecondary text-xs font-bold tracking-widest mb-1">
                        위치: <Text className="text-textPrimary">{location}</Text>
                    </Text>
                    <View className="flex-row items-center">
                        {isOnline ? (
                            <Wifi size={12} color={statusColor} style={{ marginRight: 4 }} />
                        ) : (
                            <Activity size={12} color={statusColor} style={{ marginRight: 4 }} />
                        )}
                        <Text className="text-textSecondary text-xs" style={{ color: statusColor }}>
                            {displayStatus}
                        </Text>
                    </View>
                </View>
                <ChevronRight size={20} color="#505050" />
            </View>
        </TouchableOpacity>
    );
};
