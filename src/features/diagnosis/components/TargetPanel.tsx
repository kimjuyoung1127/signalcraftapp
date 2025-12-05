import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TargetPanelProps {
  deviceName: string;
  model?: string;
  deviceId?: string;
}

export const TargetPanel: React.FC<TargetPanelProps> = ({ deviceName, model, deviceId }) => {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.headerRow}>
        <View style={styles.indicator} />
        <Text style={styles.label}>TARGET SYSTEM ACQUIRED</Text>
      </View>
      
      <View style={styles.contentBox}>
        <Text style={styles.deviceName}>{deviceName.toUpperCase()}</Text>
        {model && <Text style={styles.modelName}>{model}</Text>}
        {deviceId && <Text style={styles.deviceId}>ID: {deviceId}</Text>}
      </View>
      
      {/* Decorative Corner Brackets */}
      <View style={[styles.bracket, styles.bracketTopLeft]} />
      <View style={[styles.bracket, styles.bracketTopRight]} />
      <View style={[styles.bracket, styles.bracketBottomLeft]} />
      <View style={[styles.bracket, styles.bracketBottomRight]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Safe area padding
    left: 20,
    width: 200,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: '#00E5FF',
    borderRadius: 4,
    marginRight: 6,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  label: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  contentBox: {
    backgroundColor: 'rgba(0, 20, 40, 0.6)',
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#00E5FF',
  },
  deviceName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  modelName: {
    color: '#A0A0A0',
    fontSize: 12,
    marginBottom: 2,
  },
  deviceId: {
    color: '#505050',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  // Decorative Brackets
  bracket: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderColor: '#00E5FF',
    opacity: 0.5,
  },
  bracketTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 1,
    borderLeftWidth: 1,
  },
  bracketTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 1,
    borderRightWidth: 1,
  },
  bracketBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  bracketBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 1,
    borderRightWidth: 1,
  },
});
