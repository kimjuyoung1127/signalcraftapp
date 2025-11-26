import React from 'react';
import { View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainNavigator } from './MainNavigator';
import { SettingsScreen } from '../screens/SettingsScreen';
import { DiagnosisScreen } from '../features/diagnosis/screens/DiagnosisScreen';
import { LayoutDashboard, Settings, Activity } from 'lucide-react-native';
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
                name="AnalysisTab"
                component={DiagnosisScreen}
                options={{
                    tabBarLabel: '진단',
                    tabBarIcon: ({ color, focused }) => (
                        <View 
                            className={`items-center justify-center rounded-full ${focused ? 'bg-[#00E5FF20]' : ''}`} 
                            style={{ 
                                width: 56, 
                                height: 56, 
                                marginTop: -20,
                                borderWidth: 2,
                                borderColor: focused ? '#00E5FF' : '#262626',
                                backgroundColor: '#101010'
                            }}
                        >
                            <Activity color={focused ? '#00E5FF' : '#A0A0A0'} size={28} />
                        </View>
                    ),
                }}
            />

            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                options={{
                    tabBarLabel: '설정',
                    tabBarIcon: ({ color, size }) => (
                        <Settings color={color} size={size} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}

export const MainTabNavigator = TabNavigatorComponent;