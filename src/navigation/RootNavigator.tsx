import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <NavigationContainer>
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
