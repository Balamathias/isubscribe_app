import { useSession } from '@/components/session-context';
import CustomTabBar from '@/components/ui/custom-tab-bar';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

const Layout = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

  const { profile, loadingProfile } = useSession()

  if (profile && profile?.onboarded !== true && !loadingProfile) {
    return <Redirect href="/auth/onboarding" />
  }

  return (
    <Tabs
        screenOptions={{
            tabBarActiveTintColor: theme.primary,
            tabBarStyle: {
                display: 'none', // Hide default tab bar
            },
            headerShown: false,
        }}
        tabBar={props => <CustomTabBar {...props} />}
    >
        <Tabs.Screen 
            name="index" 
            options={{ 
                title: 'Home',
                tabBarIcon: ({ color, size }) => (
                    <Ionicons name="home-outline" color={color} size={size} />
                ),
            }} 
        />
        <Tabs.Screen 
        name="subs" 
        options={{ 
            title: 'Subs',
            href: null,
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
  )
}

export default Layout