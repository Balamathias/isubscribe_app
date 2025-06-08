import { SessionProvider } from '@/components/session-context';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { useColorScheme } from 'react-native';

const Layout = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
  return (
    <SessionProvider>
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                tabBarStyle: {
                    shadowColor: 'transparent',
                    borderTopWidth: 0,
                },
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" color={color} size={size} />
                    ),
                    headerShown: false,
                    headerStyle: {
                        shadowColor: 'transparent',
                        borderBottomWidth: 0,
                    },
                }} 
            />
            <Tabs.Screen 
            name="subs" 
            options={{ 
                title: 'Subs',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="gift-outline" color={color} size={size} />
                ),
            }} />
            <Tabs.Screen 
            name="history" 
            options={{ 
                title: 'History',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="time-outline" color={color} size={size} />
                ),
            }} />
            <Tabs.Screen 
            name="settings" 
            options={{ 
                title: 'Settings',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="settings-outline" color={color} size={size} />
                ),
            }} />
        </Tabs>
    </SessionProvider>
  )
}

export default Layout