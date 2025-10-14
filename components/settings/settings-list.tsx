import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { supabase } from '@/lib/supabase';
import { useSignOut } from '@/services/auth-hooks';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { colorScheme as nwColorScheme, useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Appearance, FlatList, Pressable, Switch, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSession } from '../session-context';
import BottomSheet from '../ui/bottom-sheet';
import DeleteAccountModal from './delete-account-modal';

export function SettingsList() {
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  const { isBiometricSupported, isBiometricEnabled, toggleBiometric } = useLocalAuth();
  const { mutate: logout, isPending: loggingOut } = useSignOut();
  const { user, refetchTransactions } = useSession();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const THEME_STORAGE_KEY = '@isubscribe_theme_mode';
  const [showThemeSheet, setShowThemeSheet] = useState(false);
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');

  // When following system, update on OS theme changes
  useEffect(() => {
    if (themeMode !== 'system') return;
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      nwColorScheme.set((colorScheme || 'light') as 'light' | 'dark');
    });
    return () => sub.remove();
  }, [themeMode]);

  const applyThemeMode = async (mode: 'system' | 'light' | 'dark') => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      if (mode === 'system') {
        const current = Appearance.getColorScheme() || 'light';
        nwColorScheme.set(current as 'light' | 'dark');
      } else {
        nwColorScheme.set(mode);
      }
      Toast.show({
        type: 'success',
        text1: `${mode === 'system' ? 'System Default' : mode === 'dark' ? 'Dark' : 'Light'} theme applied`
      });
      setShowThemeSheet(false);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Theme change failed', text2: e?.message });
    }
  };

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {

        queryClient.clear();
        supabase.removeAllChannels();
        refetchTransactions();

        Toast.show({
          type: 'success',
          text1: 'Signed out successfully.'
        });

        setTimeout(() => {
          router.replace('/(tabs)');
        }, 150);
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Sign out failed!',
          text2: error?.message
        });
      }
    });
  };

  const settingsData = [
    {
      id: 'biometric',
      title: 'Biometric Authentication',
      description: isBiometricSupported
        ? 'Use fingerprint or face ID to secure your app'
        : 'Biometric authentication not supported on this device',
      icon: 'finger-print-outline',
      type: 'toggle',
      disabled: !isBiometricSupported,
      value: isBiometricEnabled,
      onToggle: toggleBiometric
    },
    {
      id: 'reset-pin',
      title: 'Reset Transaction PIN',
      description: 'Change your 4-digit transaction PIN',
      icon: 'key-outline',
      type: 'link',
      onPress: () => router.push('/reset-pin')
    },
    {
      id: 'profile-update',
      title: 'Update Profile Information',
      description: 'Update your name, email, phone number, etc.',
      icon: 'person-outline',
      type: 'link',
      onPress: () => router.push('/profile-update')
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage notification preferences',
      icon: 'notifications-outline',
      type: 'toggle',
      value: false,
      onToggle: () => {}
    },
    {
      id: 'theme',
      title: 'Theme',
      description: themeMode === 'system' ? 'Follow system' : (themeMode === 'dark' ? 'Dark' : 'Light'),
      icon: themeMode === 'system' ? 'phone-portrait-outline' : (themeMode === 'dark' ? 'moon-outline' : 'sunny-outline'),
      type: 'link',
      onPress: () => setShowThemeSheet(true)
    },
    {
      id: 'language',
      title: 'Language',
      description: 'Change app language',
      icon: 'language-outline',
      type: 'link',
      onPress: () => {}
    },
    {
      id: 'privacy',
      title: 'Privacy',
      description: 'Manage privacy settings',
      icon: 'shield-outline',
      type: 'link',
      onPress: () => router.push('/privacy')
    },
    {
      id: 'about',
      title: 'About',
      description: 'App version and information',
      icon: 'information-circle-outline',
      type: 'link',
      onPress: () => router.push('/about')
    },
    {
      id: 'auth-action',
      title: user ? 'Logout' : 'Login',
      description: user ? `Sign out of ${user?.email}` : 'Sign in to your account',
      icon: user ? 'log-out-outline' : 'log-in-outline',
      type: 'auth-action',
      onPress: user ? handleLogout : () => router.push('/auth/login'),
      isDangerous: !!user,
      isLoading: loggingOut
    },
    {
      id: 'separator',
      type: 'separator'
    },
    ...(user ? [{
      id: 'delete-account',
      title: 'Delete Account',
      description: 'Permanently delete your account and all data',
      icon: 'trash-outline',
      type: 'action',
      isDangerous: true,
      onPress: () => setShowDeleteModal(true),
    }] : []),
  ];

  const renderSettingItem = ({ item }: { item: any }) => {
    if (item.type === 'separator') {
      return <View className="h-6" />;
    }

    if (item.type === 'auth-action') {
      return (
        <Pressable
          onPress={item.onPress}
          className={`flex-row items-center p-5 rounded-3xl mb-3 border ${
            item.isDangerous
              ? 'border-red-500/30'
              : 'border-primary/30'
          }`}
          style={{
            backgroundColor: item.isDangerous
              ? 'rgba(239, 68, 68, 0.08)'
              : `${colors.primary}08`
          }}
        >
          <View
            className={`w-12 h-12 rounded-full items-center justify-center mr-4`}
            style={{
              backgroundColor: item.isDangerous
                ? 'rgba(239, 68, 68, 0.15)'
                : `${colors.primary}15`
            }}
          >
            <Ionicons
              name={item.icon}
              size={20}
              color={item.isDangerous ? '#ef4444' : colors.primary}
            />
          </View>

          <View className="flex-1">
            <Text className={`font-semibold text-base mb-1 ${
              item.isDangerous ? 'text-red-500' : 'text-primary'
            }`}>
              {item.title}
            </Text>
            <Text className={`text-xs ${
              item.isDangerous ? 'text-red-400' : 'text-muted-foreground'
            }`}>
              {item.description}
            </Text>
          </View>

          {item.isLoading ? (
            <ActivityIndicator size="small" color={item.isDangerous ? '#ef4444' : colors.primary} />
          ) : (
            <Ionicons
              name="chevron-forward"
              size={20}
              color={item.isDangerous ? '#ef4444' : colors.primary}
            />
          )}
        </Pressable>
      );
    }

    return (
      <Pressable
        className={`flex-row items-center p-5 rounded-3xl mb-3 border border-border/50 ${
          item.disabled ? 'opacity-50' : ''
        }`}
        style={{
          backgroundColor: item.isDangerous
            ? 'rgba(239, 68, 68, 0.08)'
            : colors.card
        }}
        disabled={item.disabled}
        onPress={item.type === 'toggle' && item.onToggle ? item.onToggle : item.onPress}
      >
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4`}
          style={{
            backgroundColor: item.isDangerous
              ? 'rgba(239, 68, 68, 0.15)'
              : ``
          }}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.isDangerous ? '#ef4444' : colors.mutedForeground}
          />
        </View>

        <View className="flex-1">
          <Text className={`font-semibold text-base mb-1 ${
            item.isDangerous ? 'text-red-600 dark:text-red-400' : 'text-foreground'
          }`}>
            {item.title}
          </Text>
          <Text className={`text-xs ${
            item.isDangerous ? 'text-red-500 dark:text-red-500' : 'text-muted-foreground'
          }`}>
            {item.description}
          </Text>
        </View>

        {item.type === 'toggle' ? (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.mutedForeground, true: colors.primary }}
            thumbColor={isDark ? '#f4f4f5' : '#f4f4f5'}
            disabled={item.disabled}
          />
        ) : (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={item.isDangerous ? '#ef4444' : colors.mutedForeground}
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-1 bg-background p-5 pb-0 h-full">
        <FlatList
          data={settingsData}
          renderItem={renderSettingItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 24,
            flexGrow: 1
          }}
          style={{ flex: 1 }}
        />
      </View>
      {showDeleteModal && (
        <DeleteAccountModal
          isVisible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
        />
      )}

      {
        showThemeSheet &&
        <BottomSheet
          isVisible={showThemeSheet}
          onClose={() => setShowThemeSheet(false)}
          title="Choose Theme"
        >
          <View className="gap-y-3 flex">
            <Pressable
              onPress={() => applyThemeMode('system')}
              className={`flex-row items-center p-5 rounded-3xl border ${
                themeMode === 'system' ? 'border-primary' : 'border-border/50'
              }`}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base mb-1">Use System Theme</Text>
                <Text className="text-muted-foreground text-xs">Automatically match your device</Text>
              </View>
              {themeMode === 'system' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>

            <Pressable
              onPress={() => applyThemeMode('light')}
              className={`flex-row items-center p-5 rounded-3xl border ${
                themeMode === 'light' ? 'border-primary' : 'border-border/50'
              }`}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
              >
                <Ionicons name="sunny-outline" size={20} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base mb-1">Light</Text>
                <Text className="text-muted-foreground text-xs">Bright and vibrant</Text>
              </View>
              {themeMode === 'light' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>

            <Pressable
              onPress={() => applyThemeMode('dark')}
              className={`flex-row items-center p-5 rounded-3xl border ${
                themeMode === 'dark' ? 'border-primary' : 'border-border/50'
              }`}
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: '#8b5cf615' }}
              >
                <Ionicons name="moon-outline" size={20} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-semibold text-base mb-1">Dark</Text>
                <Text className="text-muted-foreground text-xs">Cool and comfortable</Text>
              </View>
              {themeMode === 'dark' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </Pressable>
          </View>
        </BottomSheet>
      }
    </View>
  );
}
