import React from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({ children, className }) => {
    return (
        <SafeAreaView className={`flex-1 bg-bg ${className}`}>
            <StatusBar barStyle="light-content" backgroundColor="#050505" />
            <View className="flex-1">
                {children}
            </View>
        </SafeAreaView>
    );
};
