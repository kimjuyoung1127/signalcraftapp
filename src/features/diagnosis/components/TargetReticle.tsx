import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';

interface TargetReticleProps {
  status: 'idle' | 'recording' | 'analyzing' | 'result';
  audioLevel?: number; // 0 ~ 1 normalized
}

export const TargetReticle: React.FC<TargetReticleProps> = ({ status, audioLevel = 0 }) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Idle rotation animation
  useEffect(() => {
    if (status === 'idle') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 8000, easing: Easing.linear }),
        -1
      );
      scale.value = withTiming(1);
      opacity.value = withTiming(0.7);
    } else if (status === 'recording') {
      cancelAnimation(rotation);
      // Pulse effect based on audio level (simulated or real)
      scale.value = withTiming(1 + audioLevel * 0.5, { duration: 100 });
      opacity.value = 1;
    } else if (status === 'analyzing') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1
      );
      scale.value = withRepeat(
        withSequence(withTiming(0.8, { duration: 500 }), withTiming(1.2, { duration: 500 })),
        -1
      );
    }
  }, [status, audioLevel]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
      opacity: opacity.value,
    };
  });

  const getColor = () => {
    switch (status) {
      case 'recording': return '#FF3366'; // Danger Red
      case 'analyzing': return '#FFC800'; // Warning Yellow
      case 'result': return '#00E5FF'; // Cyan
      default: return '#00E5FF';
    }
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.View style={[styles.circle, animatedStyle, { borderColor: getColor() }]}>
        <View style={[styles.dot, { backgroundColor: getColor() }]} />
        <View style={[styles.dot, { backgroundColor: getColor(), top: '50%', left: -2 }]} />
        <View style={[styles.dot, { backgroundColor: getColor(), top: '100%', left: '50%', marginLeft: -2 }]} />
        <View style={[styles.dot, { backgroundColor: getColor(), top: '50%', right: -2 }]} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
  }
});
