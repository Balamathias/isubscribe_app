import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../globals.css';

import { supabase } from '@/lib/supabase';
import { AppState } from 'react-native';

import { SessionProvider } from '@/components/session-context';
import toastConfig from '@/config/toast-config';
import { useThemedColors } from '@/hooks/useThemedColors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

import * as SystemUI from 'expo-system-ui';

function AppContent() {
  const { theme, colors } = useThemedColors();

  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  });

  const client = new QueryClient();

  SystemUI.setBackgroundColorAsync(colors.background);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <QueryClientProvider client={client}>
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
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
              <Toast config={toastConfig} />
          </SessionProvider>
        </QueryClientProvider>
      </NavigationThemeProvider>
    </GestureHandlerRootView>
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
