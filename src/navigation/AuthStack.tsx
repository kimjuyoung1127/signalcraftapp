import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export const AuthStack = () => {
    const hasSeenOnboarding = useAuthStore((state) => state.hasSeenOnboarding);

    return (
        <Stack.Navigator 
            screenOptions={{ headerShown: false }}
            initialRouteName={hasSeenOnboarding ? 'Login' : 'Onboarding'}
        >
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
    );
};
