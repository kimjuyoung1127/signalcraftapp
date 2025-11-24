import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { Input } from '../components/ui/Input';
import { PrimaryButton, GhostButton } from '../components/ui/Buttons';
import { useAuthStore } from '../store/useAuthStore';
import { AuthService, LoginResponse, SignupResponse } from '../services/auth';

export const LoginScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSignupMode, setIsSignupMode] = useState(false);

    const login = useAuthStore((state) => state.login);
    const loginDemo = useAuthStore((state) => state.loginDemo);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('오류', '이메일과 비밀번호를 입력해주세요');
            return;
        }

        setIsLoading(true);
        try {
            const response: LoginResponse = await AuthService.login(email, password);
            if (response.success && response.data) {
                login(response.data.user, response.data.access_token);
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

    const handleSignup = async () => {
        if (!email || !password || !username) {
            Alert.alert('오류', '이메일, 비밀번호, 사용자 이름을 모두 입력해주세요');
            return;
        }

        setIsLoading(true);
        try {
            const response: SignupResponse = await AuthService.signup(email, password, username, fullName);
            if (response.success && response.data) {
                Alert.alert('회원가입 성공', '회원가입이 완료되었습니다. 로그인해주세요.');
                setIsSignupMode(false); // Switch back to login mode
            } else {
                Alert.alert('회원가입 실패', response.error?.message || '회원가입에 실패했습니다');
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
                    label="사용자 이름"
                    placeholder="사용자 이름을 입력하세요"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    editable={isSignupMode}
                />

                <Input
                    label="성명"
                    placeholder="성명을 입력하세요"
                    value={fullName}
                    onChangeText={setFullName}
                    editable={isSignupMode}
                />

                <Input
                    label="접근 코드"
                    placeholder="비밀번호를 입력하세요"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <View className="h-4" />

                {isSignupMode ? (
                    <PrimaryButton
                        title="회원가입"
                        onPress={handleSignup}
                        isLoading={isLoading}
                    />
                ) : (
                    <PrimaryButton
                        title="로그인"
                        onPress={handleLogin}
                        isLoading={isLoading}
                    />
                )}

                <View className="flex-row justify-center py-2">
                    <TouchableOpacity
                        onPress={() => setIsSignupMode(!isSignupMode)}
                        className="px-4 py-2"
                    >
                        <Text className="text-textSecondary text-center">
                            {isSignupMode ? '로그인으로 전환' : '회원가입'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <GhostButton
                    title="데모 모드 시작"
                    onPress={handleDemoLogin}
                    disabled={isLoading}
                />
            </View>
        </ScreenLayout>
    );
};
