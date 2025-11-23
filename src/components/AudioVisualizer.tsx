import React, { useEffect } from 'react';
import { View, Dimensions, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    SharedValue,
} from 'react-native-reanimated';
import { StatusType } from './ui/StatusPill';

interface AudioVisualizerProps {
    status: StatusType;
}

const { width } = Dimensions.get('window');
const VISUALIZER_SIZE = width * 0.8;
const BAR_COUNT = 40;

const COLORS = {
    NORMAL: '#00FF9D',
    WARNING: '#FF5E00',
    CRITICAL: '#FF0055',
    OFFLINE: '#505050',
};

const getStatusText = (status: StatusType) => {
    switch (status) {
        case 'NORMAL':
            return '정상';
        case 'WARNING':
            return '경고';
        case 'CRITICAL':
            return '위험';
        case 'OFFLINE':
        default:
            return '오프라인';
    }
};

// Separate component for each bar to adhere to Rules of Hooks (useAnimatedStyle)
const VisualizerBar = ({
    index,
    height,
    color
}: {
    index: number;
    height: SharedValue<number>;
    color: string;
}) => {
    const rotationDeg = (index / BAR_COUNT) * 360;

    const barStyle = useAnimatedStyle(() => ({
        height: height.value,
        backgroundColor: color,
        transform: [
            { rotate: `${rotationDeg}deg` },
            { translateY: -VISUALIZER_SIZE / 3.5 }, // Push out from center
        ],
        opacity: 0.8,
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: 5,
    }));

    return (
        <Animated.View
            className="absolute w-1.5 rounded-full origin-bottom"
            style={barStyle}
        />
    );
};

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ status }) => {
    const color = COLORS[status] || COLORS.OFFLINE;
    const statusText = getStatusText(status);

    // Animation Values
    const rotation = useSharedValue(0);
    const reverseRotation = useSharedValue(0);
    const pulse = useSharedValue(1);
    const pingScale = useSharedValue(1);
    const pingOpacity = useSharedValue(0.2);

    // Initialize bar values
    // We use a constant array of hooks here because BAR_COUNT is constant
    // However, calling useSharedValue in a loop inside the component body is also technically a violation if the loop order changes,
    // but since BAR_COUNT is constant, we can do it, OR better: use a single array shared value?
    // Reanimated doesn't support array shared values easily for individual animations.
    // We will create the array of shared values once using useMemo or just useState initialization if we want to be super safe,
    // but standard practice often allows constant loops. 
    // To be strictly safe with hooks, we should probably just create them.
    // Actually, calling hooks in a loop is risky. 
    // Better approach: Create a component that manages its own height? 
    // Or just create the array of shared values. Since BAR_COUNT is 40, it's fine.

    const barValues = Array.from({ length: BAR_COUNT }).map(() => useSharedValue(10));

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

    // Audio Data Simulation Loop
    useEffect(() => {
        if (status === 'OFFLINE') {
            barValues.forEach(bar => { bar.value = withTiming(5); });
            return;
        }

        const interval = setInterval(() => {
            const baseAmp = status === 'NORMAL' ? 20 : status === 'WARNING' ? 50 : 90;

            barValues.forEach((bar, i) => {
                // Simulate wave + noise
                const time = Date.now() * 0.005;
                const wave = Math.sin(i * 0.5 + time) * 0.5 + 0.5;
                const noise = Math.random() * 0.5;
                const targetHeight = 10 + (baseAmp * wave * noise) + (Math.random() * baseAmp * 0.3);

                bar.value = withTiming(targetHeight, { duration: 100 });
            });
        }, 100);

        return () => clearInterval(interval);
    }, [status]);

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
        shadowRadius: 20,
    }));

    return (
        <View className="items-center justify-center" style={{ width: VISUALIZER_SIZE, height: VISUALIZER_SIZE }}>

            {/* Echo Effect */}
            <Animated.View
                className="absolute w-full h-full rounded-full border border-2"
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
                {barValues.map((barHeight, i) => (
                    <VisualizerBar
                        key={i}
                        index={i}
                        height={barHeight}
                        color={color}
                    />
                ))}
            </View>

            {/* Center Core */}
            <Animated.View
                className="w-32 h-32 rounded-full bg-black z-10 items-center justify-center border-2"
                style={coreStyle}
            >
                <View className="items-center">
                    <Text className="text-white font-bold tracking-widest opacity-80 text-xs">
                        {statusText}
                    </Text>
                </View>
            </Animated.View>

        </View>
    );
};
