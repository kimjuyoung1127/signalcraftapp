import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HoloTelemetryProps {
  status: string;
  durationMillis: number;
  taskId?: string | null;
}

export const HoloTelemetry: React.FC<HoloTelemetryProps> = ({ status, durationMillis, taskId }) => {
  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 1000 / 60);
    const seconds = Math.floor((millis / 1000) % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.panel}>
        <Text style={styles.label}>STATUS</Text>
        <Text style={styles.value}>{status.toUpperCase()}</Text>
      </View>
      
      <View style={styles.panel}>
        <Text style={styles.label}>TIME</Text>
        <Text style={styles.value}>{formatTime(durationMillis)}</Text>
      </View>

      {taskId && (
        <View style={styles.panel}>
          <Text style={styles.label}>TASK ID</Text>
          <Text style={styles.tinyValue}>{taskId.slice(0, 8)}...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '25%',
    right: 20,
    alignItems: 'flex-end',
  },
  panel: {
    backgroundColor: 'rgba(0, 20, 40, 0.6)',
    padding: 8,
    marginBottom: 8,
    borderRightWidth: 2,
    borderRightColor: '#00E5FF',
    minWidth: 100,
  },
  label: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  value: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  tinyValue: {
    color: '#A0A0A0',
    fontSize: 12,
    fontFamily: 'monospace',
  }
});
