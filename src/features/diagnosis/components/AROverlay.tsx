import React from 'react';
import { View, StyleSheet } from 'react-native';

export const AROverlay = () => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Responsive Corners using Views */}
      <View style={[styles.corner, styles.topLeft]} />
      <View style={[styles.corner, styles.topRight]} />
      <View style={[styles.corner, styles.bottomLeft]} />
      <View style={[styles.corner, styles.bottomRight]} />

      {/* Center Crosshair */}
      <View style={styles.center}>
        <View style={styles.crosshairH} />
        <View style={styles.crosshairV} />
      </View>

      {/* Scanlines Effect (Optional - CSS trick) */}
      <View style={styles.scanlines} />
    </View>
  );
};

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#00E5FF',
    borderWidth: 2,
  },
  topLeft: {
    top: 60, // Adjusted for StatusBar/SafeArea
    left: 20,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 60,
    right: 20,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 120, // Adjusted for TabBar
    left: 20,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 120,
    right: 20,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crosshairH: {
    width: 20,
    height: 1,
    backgroundColor: 'rgba(0, 229, 255, 0.5)',
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0, 229, 255, 0.5)',
  },
  scanlines: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // In a real app, we might use an image or repeating gradient for scanlines
    // For now, just a subtle tint
  }
});
