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

  const { profile, loadingProfile, session, isLoading, refetchProfile } = useSession()

  React.useEffect(() => {
    if (session) {
      refetchProfile()
    }
  }, [session, refetchProfile])

  if (isLoading || loadingProfile) {
    return null
  }

  if (session && profile && (profile?.onboarded !== true)) {
    return <Redirect href="/auth/onboarding" />
  }

  // Allow unauthenticated users to access tabs for special experience
  // if (!session) {
  //   return <Redirect href="/auth/login" />
  // }


  return (
      <Tabs
        screenOptions={{
            tabBarActiveTintColor: theme.primary,
            tabBarStyle: {
                display: 'none',
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