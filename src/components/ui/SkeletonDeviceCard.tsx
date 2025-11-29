import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence
} from 'react-native-reanimated';

const SkeletonItem = ({ style }: { style: any }) => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.7, { duration: 1000 }),
                withTiming(0.3, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={[styles.skeletonBlock, style, animatedStyle]} />
    );
};

export const SkeletonDeviceCard = () => {
    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    {/* Model Name Skeleton */}
                    <SkeletonItem style={{ width: 80, height: 12, marginBottom: 8 }} />
                    {/* Device Name Skeleton */}
                    <SkeletonItem style={{ width: 150, height: 24 }} />
                </View>
                {/* Status Pill Skeleton */}
                <SkeletonItem style={{ width: 60, height: 24, borderRadius: 12 }} />
            </View>

            <View style={styles.footerRow}>
                <View>
                    {/* Location Skeleton */}
                    <SkeletonItem style={{ width: 100, height: 12, marginBottom: 8 }} />
                    {/* Status Text Skeleton */}
                    <SkeletonItem style={{ width: 120, height: 12 }} />
                </View>
                {/* Chevron Skeleton */}
                <SkeletonItem style={{ width: 20, height: 20, borderRadius: 10 }} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#101010', // bgElevated
        borderColor: '#262626', // borderSubtle
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
    },
    skeletonBlock: {
        backgroundColor: '#262626', // borderSubtle color for skeleton
        borderRadius: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
});
