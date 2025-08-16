import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../globals.css';

import { supabase } from '@/lib/supabase';
import { Appearance, AppState } from 'react-native';

import { SessionProvider } from '@/components/session-context';
import toastConfig from '@/config/toast-config';
import { useThemedColors } from '@/hooks/useThemedColors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import { NotificationProvider } from '@/contexts/notification-context';
import * as SystemUI from 'expo-system-ui';

import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colorScheme as nwColorScheme } from 'nativewind';

const queryClient = new QueryClient();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function AppContent() {
  const { theme, colors } = useThemedColors();

  const THEME_STORAGE_KEY = '@isubscribe_theme_mode';

  useEffect(() => {
      (async () => {
        try {
          const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
          const mode: 'system' | 'light' | 'dark' = (saved === 'light' || saved === 'dark' || saved === 'system')
            ? (saved as any)
            : 'system';
          if (mode === 'system') {
            const current = Appearance.getColorScheme() || 'light';
            nwColorScheme.set(current as 'light' | 'dark');
          } else {
            nwColorScheme.set(mode);
          }
        } catch {}
      })();
    }, []);

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  });

  SystemUI.setBackgroundColorAsync(colors.background);

  return (
    <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SessionProvider>
                <Stack
                  screenOptions={{
                    animation: 'slide_from_right',
                    animationDuration: 500,
                    headerShown: false,
                    animationTypeForReplace: 'pop',
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="auth" />
                  <Stack.Screen name="services" />
                  <Stack.Screen name="transactions" />
                  <Stack.Screen name="reset-password" />
                  <Stack.Screen name="help" />
                  <Stack.Screen name="coming-soon" />
                  <Stack.Screen name="accounts" />
                  <Stack.Screen name="faq" />
                  <Stack.Screen name="reset-pin" />
                  <Stack.Screen name="privacy" />
                  <Stack.Screen name="about" />
                  <Stack.Screen name="terms" />
                  <Stack.Screen name="profile-update" />
                  <Stack.Screen name="+not-found" />
                </Stack>
                <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
                <Toast config={toastConfig} />
            </SessionProvider>
          </GestureHandlerRootView>
        </NotificationProvider>
      </QueryClientProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {

  const { colors } = useThemedColors();

  SystemUI.setBackgroundColorAsync(colors.background);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AppContent />
  );
}
