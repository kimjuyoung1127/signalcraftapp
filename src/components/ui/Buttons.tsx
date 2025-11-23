import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
    onPress: () => void;
    title: string;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

export const PrimaryButton: React.FC<ButtonProps> = ({
    onPress,
    title,
    isLoading,
    disabled,
    className
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            className={`bg-accentPrimary/10 border border-accentPrimary py-4 rounded-lg items-center justify-center active:bg-accentPrimary/20 ${disabled ? 'opacity-50' : ''} ${className}`}
        >
            {isLoading ? (
                <ActivityIndicator color="#00E5FF" />
            ) : (
                <Text className="text-accentPrimary font-bold text-lg tracking-wider uppercase">
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};

export const GhostButton: React.FC<ButtonProps> = ({
    onPress,
    title,
    isLoading,
    disabled,
    className
}) => {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            className={`py-4 items-center justify-center ${disabled ? 'opacity-50' : ''} ${className}`}
        >
            {isLoading ? (
                <ActivityIndicator color="#A0A0A0" />
            ) : (
                <Text className="text-textSecondary font-medium text-base">
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
};
