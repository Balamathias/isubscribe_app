import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/services/api-hooks';
import { useSignOut } from '@/services/auth-hooks';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Switch, Text, useColorScheme, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSession } from '../session-context';
import DeleteAccountModal from './delete-account-modal';

export function SettingsList() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];
  const { isBiometricSupported, isBiometricEnabled, toggleBiometric } = useLocalAuth();
  const { mutate: logout, isPending: loggingOut } = useSignOut();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Signed out successfully.'
        });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
        
        try {
          supabase.removeAllChannels();
        } catch (error: any) {
          console.error(error);
        }

        router.replace('/');
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
      title: 'Dark Mode',
      description: 'Toggle dark/light theme',
      icon: 'moon-outline',
      type: 'toggle',
      value: isDark,
      onToggle: () => {}
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
      onPress: () => {}
    },
    {
      id: 'about',
      title: 'About',
      description: 'App version and information',
      icon: 'information-circle-outline',
      type: 'link',
      onPress: () => {}
    },
    {
      id: 'auth-action',
      title: user ? 'Logout' : 'Login',
      description: user ? 'Sign out of your account' : 'Sign in to your account',
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
      return <View className="h-4" />;
    }

    if (item.type === 'auth-action') {
      return (
        <Pressable
          onPress={item.onPress}
          className={`flex-row items-center p-4 rounded-xl ${
            item.isDangerous ? 'bg-red-50 dark:bg-red-900/20' : 'bg-primary/10'
          }`}
        >
          <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
            item.isDangerous ? 'bg-red-100 dark:bg-red-900' : 'bg-primary/20'
          }`}>
            <Ionicons 
              name={item.icon} 
              size={20} 
              color={item.isDangerous ? '#ef4444' : colors.primary} 
            />
          </View>
          
          <View className="flex-1">
            <Text className={`font-medium ${
              item.isDangerous ? 'text-red-500' : 'text-primary'
            }`}>
              {item.title}
            </Text>
            <Text className={`text-sm ${
              item.isDangerous ? 'text-red-400' : 'text-muted-foreground'
            }`}>
              {item.description}
            </Text>
          </View>

          {item.isLoading && (
            <ActivityIndicator size="small" color={item.isDangerous ? '#ef4444' : colors.primary} />
          )}
        </Pressable>
      );
    }

    return (
      <Pressable
        className={`flex-row items-center p-4 border-b border-border/80 ${
          item.disabled ? 'opacity-50' : ''
        } ${item.isDangerous ? 'bg-red-50 dark:bg-red-900/20' : ''}`}
        disabled={item.disabled}
        onPress={item.type === 'toggle' && item.onToggle ? item.onToggle : item.onPress}
      >
        <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
          item.isDangerous ? 'bg-red-100 dark:bg-red-900' : 'bg-secondary'
        }`}>
          <Ionicons 
            name={item.icon} 
            size={15} 
            color={item.isDangerous ? '#EF4444' : colors.mutedForeground} 
          />
        </View>
        
        <View className="flex-1">
          <Text className={`font-medium ${
            item.isDangerous ? 'text-red-600 dark:text-red-400' : 'text-foreground'
          }`}>
            {item.title}
          </Text>
          <Text className={`text-sm ${
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
            color={item.isDangerous ? '#EF4444' : colors.mutedForeground} 
          />
        )}
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-1 bg-background p-4">
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
    </View>
  );
}

