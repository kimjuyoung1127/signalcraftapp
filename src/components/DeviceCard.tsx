import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { StatusPill, StatusType } from './ui/StatusPill';
import { ChevronRight, Activity } from 'lucide-react-native';

interface DeviceCardProps {
    name: string;
    model: string;
    status: StatusType;
    location: string;
    lastReading: string;
    onPress: () => void;
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
    name,
    model,
    status,
    location,
    lastReading,
    onPress,
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
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
                        <Activity size={12} color="#A0A0A0" style={{ marginRight: 4 }} />
                        <Text className="text-textSecondary text-xs">
                            마지막 업데이트: {lastReading}
                        </Text>
                    </View>
                </View>
                <ChevronRight size={20} color="#505050" />
            </View>
        </TouchableOpacity>
    );
};
