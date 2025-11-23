import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainNavigator } from './MainNavigator';
import { SettingsScreen } from '../screens/SettingsScreen';
import { LayoutDashboard, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

function TabNavigatorComponent() {
    const insets = useSafeAreaInsets();
    const safeAreaInsets = insets;
    const { bottom } = safeAreaInsets;

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#101010', // bgElevated
                    borderTopColor: '#262626', // borderSubtle
                    paddingBottom: Math.max(12, bottom),
                    paddingTop: Math.max(16, safeAreaInsets.top || 16),
                    height: Math.max(100, bottom + 80),
                },
                tabBarActiveTintColor: '#00E5FF', // accentPrimary
                tabBarInactiveTintColor: '#A0A0A0', // textSecondary
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: 'bold',
                    letterSpacing: 1,
                },
            }}
            sceneContainerStyle={{
                backgroundColor: '#050505', // bg
                paddingBottom: Math.max(16, bottom), // 화면 콘텐츠와 탭 사이 여백
            }}
        >
            <Tab.Screen
                name="DashboardTab"
                component={MainNavigator}
                options={{
                    tabBarLabel: '모니터',
                    tabBarIcon: ({ color, size }) => (
                        <LayoutDashboard color={color} size={size} />
                    ),
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                options={{
                    tabBarLabel: '시스템',
                    tabBarIcon: ({ color, size }) => (
                        <Settings color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export const MainTabNavigator = TabNavigatorComponent;
