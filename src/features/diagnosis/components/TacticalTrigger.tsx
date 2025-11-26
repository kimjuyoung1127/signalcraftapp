import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface TacticalTriggerProps {
  status: 'idle' | 'recording' | 'paused' | 'stopped' | 'analyzing';
  onPress: () => void;
  onLongPress?: () => void;
}

export const TacticalTrigger: React.FC<TacticalTriggerProps> = ({ status, onPress, onLongPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  };

  const getStyle = () => {
    switch (status) {
      case 'recording':
        return { borderColor: '#FF3366', backgroundColor: 'rgba(255, 51, 102, 0.2)' }; // Red
      case 'analyzing':
        return { borderColor: '#FFC800', backgroundColor: 'rgba(255, 200, 0, 0.2)' }; // Yellow
      case 'stopped':
        return { borderColor: '#00FF9D', backgroundColor: 'rgba(0, 255, 157, 0.2)' }; // Green (Ready to Upload)
      case 'idle':
      default:
        return { borderColor: '#00E5FF', backgroundColor: 'rgba(0, 229, 255, 0.1)' }; // Cyan
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'recording': return 'STOP';
      case 'analyzing': return 'WAIT';
      case 'stopped': return 'UPLOAD';
      default: return 'SCAN';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        style={[styles.button, getStyle()]}
      >
        <View style={[styles.innerRing, { borderColor: getStyle().borderColor }]}>
           <Text style={[styles.text, { color: getStyle().borderColor }]}>{getLabel()}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    alignItems: 'center',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 14,
  }
});
