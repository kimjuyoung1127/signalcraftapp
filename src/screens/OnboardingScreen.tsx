import React, { useState } from 'react';
import { View, Text, Dimensions, TouchableOpacity } from 'react-native';
import { ScreenLayout } from '../components/ui/ScreenLayout';
import { PrimaryButton } from '../components/ui/Buttons';
import { useNavigation } from '@react-navigation/native';
import { Headphones, Activity, Search, ChevronRight, Check } from 'lucide-react-native';
import { useAuthStore } from '../store/useAuthStore';

const SLIDES = [
    {
        id: 1,
        title: 'SignalCraft 모바일',
        description: '산업용 AI 오디오 분석을 위한\n최고의 현장 파트너',
        Icon: Headphones,
    },
    {
        id: 2,
        title: '실시간 모니터링',
        description: '장비의 건강 상태를 추적하고\n중요한 알림을 즉시 수신하세요',
        Icon: Activity,
    },
    {
        id: 3,
        title: '현장 정밀 진단',
        description: '현장에서 오디오를 녹음하고\nAI가 즉시 비정상 징후를 포착합니다',
        Icon: Search,
    },
];

export const OnboardingScreen = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigation = useNavigation<any>();
    const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

    const handleNext = async () => {
        if (currentSlide < SLIDES.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            await completeOnboarding();
            navigation.replace('Login');
        }
    };

    const handleSkip = async () => {
        await completeOnboarding();
        navigation.replace('Login');
    };

    const CurrentIcon = SLIDES[currentSlide].Icon;

    return (
        <ScreenLayout className="justify-between pb-10">
            {/* Header with Skip Button */}
            <View className="flex-row justify-end px-6 py-4">
                <TouchableOpacity onPress={handleSkip} className="py-2 px-4">
                    <Text className="text-textSecondary font-medium">건너뛰기</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            <View className="flex-1 justify-center items-center mb-10">
                <View className="mb-12 p-8 bg-bgElevated rounded-full shadow-lg shadow-accentPrimary/20">
                    <CurrentIcon size={80} color="#00E5FF" />
                </View>

                <Text className="text-accentPrimary text-3xl font-bold text-center mb-4 px-4">
                    {SLIDES[currentSlide].title}
                </Text>

                <Text className="text-textSecondary text-lg text-center px-8 leading-relaxed">
                    {SLIDES[currentSlide].description}
                </Text>
            </View>

            {/* Footer controls */}
            <View className="w-full px-8 space-y-12">
                                {/* Indicators */}
                                <View className="flex-row justify-center space-x-3 mb-4">
                                    {SLIDES.map((_, index) => (
                                        <View
                                            key={index}
                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                index === currentSlide 
                                                    ? 'w-8 bg-accentPrimary' 
                                                    : 'w-5 bg-borderSubtle'
                                            }`}
                                        />
                                    ))}
                                </View>

                {/* Action Button */}
                <PrimaryButton
                    title={currentSlide === SLIDES.length - 1 ? "시작하기" : "다음"}
                    onPress={handleNext}
                    icon={currentSlide === SLIDES.length - 1 ? Check : ChevronRight}
                />
            </View>
        </ScreenLayout>
    );
};
