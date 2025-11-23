import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';


interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View className={`mb-4 ${className}`}>
            {label && (
                <Text className="text-textSecondary text-sm mb-2 font-medium">
                    {label}
                </Text>
            )}
            <TextInput
                className={`bg-bgElevated border rounded-lg px-4 py-3 text-textPrimary text-base ${error
                    ? 'border-accentDanger'
                    : isFocused
                        ? 'border-accentPrimary'
                        : 'border-borderSubtle'
                    }`}
                placeholderTextColor="#505050"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                {...props}
            />
            {error && (
                <Text className="text-accentDanger text-xs mt-1">
                    {error}
                </Text>
            )}
        </View>
    );
};
