import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

// Deep linking configuration
const linking = {
    prefixes: ['signalcraft-mobile://', 'https://signalcraft.com'], // Adjusted prefix
    config: {
        screens: {
            Main: {
                screens: {
                    Home: { // Assuming 'Home' is the name of the tab that contains DiagnosisScreen
                        screens: {
                            Diagnosis: 'analysis/:id', // Matches a path like 'signalcraft-mobile://analysis/123'
                        },
                    },
                },
            },
            Auth: 'auth', // Example for AuthStack
        },
    },
};

export const RootNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <NavigationContainer linking={linking}>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={MainTabNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
