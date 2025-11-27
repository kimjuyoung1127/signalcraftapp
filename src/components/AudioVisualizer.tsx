import React, { useEffect } from 'react';
import { View, Dimensions, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay,
    SharedValue,
} from 'react-native-reanimated';
import { StatusType } from './ui/StatusPill';

interface AudioVisualizerProps {
    status: StatusType;
    size?: number; // 사이즈 조절을 위한 prop 추가
}

const { width } = Dimensions.get('window');
const DEFAULT_SIZE = width * 0.8;
const BAR_COUNT = 30; // 바 개수 줄임 (40 -> 30) 성능 최적화

const COLORS = {
    NORMAL: '#00FF9D',
    WARNING: '#FF5E00',
    CRITICAL: '#FF0055',
    OFFLINE: '#505050',
};

const getStatusText = (status: StatusType) => {
    switch (status) {
        case 'NORMAL': return '정상';
        case 'WARNING': return '경고';
        case 'CRITICAL': return '위험';
        case 'OFFLINE': default: return '오프라인';
    }
};

// 개별 바 컴포넌트 (Reanimated 최적화)
const VisualizerBar = ({
    index,
    status,
    color,
    size,
}: {
    index: number;
    status: StatusType;
    color: string;
    size: number;
}) => {
    const height = useSharedValue(10);
    const rotationDeg = (index / BAR_COUNT) * 360;

    useEffect(() => {
        // 상태에 따른 랜덤 애니메이션 (JS 스레드 부하 없이 UI 스레드에서 실행)
        const duration = Math.random() * 500 + 500; // 500ms ~ 1000ms
        const baseHeight = status === 'NORMAL' ? 0.05 : status === 'WARNING' ? 0.15 : 0.25; // size에 비례하는 높이로 변경 (0~1)
        
        // 랜덤 딜레이로 자연스러운 파동 연출
        const delay = Math.random() * 500;

        if (status === 'OFFLINE') {
            height.value = withTiming(5);
        } else {
            // withRepeat를 사용하여 네이티브 스레드에서 무한 반복
            height.value = withDelay(delay, withRepeat(
                withSequence(
                    withTiming(size * (baseHeight + Math.random() * 0.05), { duration: duration, easing: Easing.inOut(Easing.ease) }), // size에 비례
                    withTiming(size * 0.03, { duration: duration, easing: Easing.inOut(Easing.ease) }) // size에 비례 (최소 높이)
                ),
                -1, // Infinite
                true // Reverse
            ));
        }
    }, [status, size]); // size를 의존성 배열에 추가

    const barStyle = useAnimatedStyle(() => ({
        height: height.value,
        backgroundColor: color,
        transform: [
            { rotate: `${rotationDeg}deg` },
            { translateY: -size / 3.2 }, // 원 밖으로 밀어내기
        ],
        opacity: 0.8,
    }));

    return (
        <Animated.View
            className="absolute w-1 rounded-full origin-bottom"
            style={barStyle}
        />
    );
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ status, size = DEFAULT_SIZE }) => {
    const color = COLORS[status] || COLORS.OFFLINE;
    const statusText = getStatusText(status);

    // Animation Values
    const rotation = useSharedValue(0);
    const reverseRotation = useSharedValue(0);
    const pulse = useSharedValue(1);
    const pingScale = useSharedValue(1);
    const pingOpacity = useSharedValue(0.2);

    useEffect(() => {
        // 1. Rotate Rings
        rotation.value = withRepeat(
            withTiming(360, { duration: 20000, easing: Easing.linear }),
            -1
        );
        reverseRotation.value = withRepeat(
            withTiming(-360, { duration: 15000, easing: Easing.linear }),
            -1
        );

        // 2. Pulse Effect
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );

        // 3. Ping Effect (Echo)
        pingScale.value = withRepeat(
            withTiming(1.5, { duration: 3000, easing: Easing.out(Easing.ease) }),
            -1
        );
        pingOpacity.value = withRepeat(
            withSequence(
                withTiming(0.2, { duration: 0 }),
                withTiming(0, { duration: 3000 })
            ),
            -1
        );
    }, []);

    // Animated Styles
    const rotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    const reverseRotateStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${reverseRotation.value}deg` }],
    }));

    const pingStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pingScale.value }],
        opacity: pingOpacity.value,
        borderColor: color,
    }));

    const coreStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        borderColor: color,
        shadowColor: color,
        shadowOpacity: 0.5,
        shadowRadius: 10,
    }));

    return (
        <View className="items-center justify-center overflow-hidden" style={{ width: size, height: size }}>
            {/* Echo Effect */}
            <Animated.View
                className="absolute w-full h-full rounded-full border-2"
                style={pingStyle}
            />

            {/* Rotating Rings */}
            <Animated.View
                className="absolute w-full h-full rounded-full border border-neutral-800 border-dashed opacity-30"
                style={rotateStyle}
            />
            <Animated.View
                className="absolute w-[90%] h-[90%] rounded-full border border-neutral-900 opacity-50"
                style={reverseRotateStyle}
            />

            {/* Audio Bars */}
            <View className="absolute inset-0 items-center justify-center">
                {Array.from({ length: BAR_COUNT }).map((_, i) => (
                    <VisualizerBar
                        key={i}
                        index={i}
                        status={status}
                        color={color}
                        size={size} // Bar에도 size 전달
                    />
                ))}
            </View>

            {/* Center Core */}
            <Animated.View
                className="rounded-full bg-black z-10 items-center justify-center border-2"
                style={[coreStyle, { width: size * 0.35, height: size * 0.35 }]}
            >
                <View className="items-center">
                    <Text className="text-white font-bold tracking-widest opacity-80 text-[10px]">
                        {statusText}
                    </Text>
                </View>
            </Animated.View>

        </View>
    );
};
