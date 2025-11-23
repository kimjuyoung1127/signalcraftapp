import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { PrimaryButton } from '../components/ui/Buttons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 1,
        title: 'SignalCraft 모바일',
        description: '산업용 AI 오디오 분석을 위한 최고의 현장 동반자.',
        icon: '🎧',
    },
    {
        id: 2,
        title: '실시간 모니터링',
        description: '압축기 건강 상태를 추적하고 중요한 알림을 즉시 수신.',
        icon: '📊',
    },
    {
        id: 3,
        title: '현장 진단',
        description: '현장에서 오디오를 녹음하고 몇 초 안에 AI 기반 비정상 감지.',
        icon: '🔍',
    },
];

export const OnboardingScreen = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigation = useNavigation<any>();

    const handleNext = () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigation.replace('Login');
        }
    };

    return (
        <ScreenLayout className="justify-between pb-10">
            <View className="flex-1 justify-center items-center">
                <Text className="text-6xl mb-8">{SLIDES[currentSlide].icon}</Text>
                <Text className="text-accentPrimary text-3xl font-bold text-center mb-4">
                    {SLIDES[currentSlide].title}
                </Text>
                <Text className="text-textSecondary text-lg text-center px-6">
                    {SLIDES[currentSlide].description}
                </Text>
            </View>

            <View className="w-full">
                <View className="flex-row justify-center mb-8 space-x-2">
                    {SLIDES.map((_, index) => (
                        <View
                            key={index}
                            className={`h-2 rounded-full ${index === currentSlide ? 'w-8 bg-accentPrimary' : 'w-2 bg-borderSubtle'
                                }`}
                        />
                    ))}
                </View>

                <PrimaryButton
                    title={currentSlide === SLIDES.length - 1 ? "시작하기" : "다음"}
                    onPress={handleNext}
                />
            </View>
        </ScreenLayout>
    );
};
