import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { Input } from '../components/ui/Input';
import { PrimaryButton, GhostButton } from '../components/ui/Buttons';
import { useAuthStore } from '../store/useAuthStore';
import { AuthService } from '../services/auth';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const login = useAuthStore((state) => state.login);
    const loginDemo = useAuthStore((state) => state.loginDemo);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('오류', '이메일과 비밀번호를 입력해주세요');
            return;
        }

        setIsLoading(true);
        try {
            const response = await AuthService.login(email, password);
            if (response.success) {
                login(response.data.user, response.data.token);
            } else {
                Alert.alert('로그인 실패', response.error?.message || '알 수 없는 오류');
            }
        } catch (error) {
            Alert.alert('오류', '서버 연결에 실패했습니다');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setIsLoading(true);
        try {
            await AuthService.loginDemo();
            loginDemo();
        } catch (error) {
            Alert.alert('오류', '데모 모드 실패');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenLayout className="justify-center">
            <View className="mb-12">
                <Text className="text-accentPrimary text-4xl font-bold mb-2">
                    SIGNALCRAFT
                </Text>
                <Text className="text-textSecondary text-lg tracking-widest">
                    모바일 터미널
                </Text>
            </View>

            <View className="w-full space-y-4">
                <Input
                    label="운영자 ID"
                    placeholder="이메일을 입력하세요"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
                <Input
                    label="접근 코드"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <View className="h-4" />

                <PrimaryButton
                    title="연결 초기화"
                    onPress={handleLogin}
                    isLoading={isLoading}
                />

                <GhostButton
                    title="데모 모드 시작"
                    onPress={handleDemoLogin}
                    disabled={isLoading}
                />
            </View>
        </ScreenLayout>
    );
};
