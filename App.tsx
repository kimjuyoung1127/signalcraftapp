import './global.css';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/useAuthStore';

export default function App() {
  // Check authentication status when app starts
  useEffect(() => {
    const checkAuth = async () => {
      await useAuthStore.getState().checkAuthStatus();
    };

    checkAuth();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor="#050505" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
