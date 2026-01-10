import { useSession } from '@/components/session-context';
import SplashScreen from '@/components/splash-screen';
import CustomTabBar from '@/components/ui/custom-tab-bar';
import { COLORS } from '@/constants/colors';
import useFirstLaunch from '@/hooks/useFirstLaunch';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { useColorScheme } from 'react-native';

const Layout = () => {
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

    const { profile, session, isLoading } = useSession();
    const { isFirstLaunch, isLoading: isFirstLaunchLoading } = useFirstLaunch();

    // Show splash while checking first launch and session status
    if (isLoading || isFirstLaunchLoading) {
        return <SplashScreen />;
    }

    // Redirect to intro screen for first-time users who aren't logged in
    if (!session && isFirstLaunch) {
        return <Redirect href="/auth/intro" />;
    }

    // Redirect to login for returning users who aren't logged in
    if (!session) {
        return <Redirect href="/auth/login" />;
    }

    // Redirect to onboarding (PIN setup) for logged-in users who haven't completed onboarding
    if (session && profile && profile?.onboarded !== true) {
        return <Redirect href="/auth/onboarding" />;
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: theme.primary,
                tabBarStyle: {
                    display: 'none',
                },
                headerShown: false,
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
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
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="time-outline" color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings-outline" color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default Layout;
