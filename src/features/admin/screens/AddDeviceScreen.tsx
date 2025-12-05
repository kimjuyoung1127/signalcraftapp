import React, { useState } from 'react';
import { View, Text, Alert, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { ScreenLayout } from '../../../components/ui/ScreenLayout';
import { Input } from '../../../components/ui/Input';
import { PrimaryButton } from '../../../components/ui/Buttons';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { DeviceService } from '../../../services/device'; // Will add createDevice here

export const AddDeviceScreen = () => {
    const navigation = useNavigation();
    const [deviceId, setDeviceId] = useState('');
    const [name, setName] = useState('');
    const [model, setModel] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddDevice = async () => {
        if (!deviceId || !name || !model) {
            Alert.alert('필수 입력 누락', '장비 ID, 이름, 모델은 필수 입력 항목입니다.');
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const newDevice = { device_id: deviceId, name, model, location };
            const response = await DeviceService.createDevice(newDevice);

            if (response.success && response.data) {
                Alert.alert('장비 등록 성공', `장비 '${response.data.name}'이(가) 성공적으로 등록되었습니다.`);
                navigation.goBack(); // Go back to Dashboard
            } else {
                setError(response.error?.message || '장비 등록에 실패했습니다.');
                Alert.alert('등록 실패', response.error?.message || '알 수 없는 오류가 발생했습니다.');
            }
        } catch (err: any) {
            console.error('Failed to add device:', err);
            setError(err.message || '장비 등록 중 오류가 발생했습니다.');
            Alert.alert('오류', err.message || '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenLayout className="flex-1">
            <View className="flex-row items-center mt-2 mb-6 px-4">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-2">
                    <ChevronLeft color="#F5F5F5" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold flex-1">새 장비 등록</Text>
            </View>

            <ScrollView className="flex-1 px-4">
                <Input
                    label="장비 ID"
                    placeholder="예: COMP-001"
                    value={deviceId}
                    onChangeText={setDeviceId}
                    autoCapitalize="none"
                    editable={!isLoading}
                    error={error && deviceId === '' ? '장비 ID는 필수입니다.' : undefined}
                />
                <Input
                    label="장비 이름"
                    placeholder="예: 압축기 A-1"
                    value={name}
                    onChangeText={setName}
                    editable={!isLoading}
                    error={error && name === '' ? '장비 이름은 필수입니다.' : undefined}
                />
                <Input
                    label="모델명"
                    placeholder="예: SC-900X"
                    value={model}
                    onChangeText={setModel}
                    editable={!isLoading}
                    error={error && model === '' ? '모델명은 필수입니다.' : undefined}
                />
                <Input
                    label="설치 위치 (선택 사항)"
                    placeholder="예: 1공장 2라인"
                    value={location}
                    onChangeText={setLocation}
                    editable={!isLoading}
                />

                {error && <Text className="text-accentDanger text-sm text-center mt-4">{error}</Text>}

                <View className="mt-8 mb-4">
                    <PrimaryButton
                        title="장비 등록"
                        onPress={handleAddDevice}
                        isLoading={isLoading}
                        disabled={isLoading}
                    />
                </View>
            </ScrollView>
        </ScreenLayout>
    );
};
