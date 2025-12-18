import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EngineerModeView } from '../features/engineer/screens/EngineerModeView';

export const EngineerScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <EngineerModeView />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
});
