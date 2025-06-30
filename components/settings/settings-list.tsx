import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { supabase } from '@/lib/supabase';
import { QUERY_KEYS } from '@/services/api-hooks';
import { useSignOut } from '@/services/auth-hooks';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, Switch, Text, useColorScheme, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useSession } from '../session-context';

export function SettingsList() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isBiometricSupported, isBiometricEnabled, toggleBiometric } = useLocalAuth();
  const { mutate: logout, isPending: loggingOut } = useSignOut();
  const queryClient = useQueryClient();
  const { user } = useSession()

  const settings = [
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
      type: 'toggle'
    },
    {
      id: 'theme',
      title: 'Dark Mode',
      description: 'Toggle dark/light theme',
      icon: 'moon-outline',
      type: 'toggle'
    },
    {
      id: 'language',
      title: 'Language',
      description: 'Change app language',
      icon: 'language-outline',
      type: 'link'
    },
    {
      id: 'privacy',
      title: 'Privacy',
      description: 'Manage privacy settings',
      icon: 'shield-outline',
      type: 'link'
    },
    {
      id: 'about',
      title: 'About',
      description: 'App version and information',
      icon: 'information-circle-outline',
      type: 'link'
    }
  ];

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: `Signed out successfully.`
        });
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance]});
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions]});
        
        try {
          supabase.removeAllChannels()
        } catch (error: any) {
          console.error(error)
        }

        router.replace(`/`);
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: `Sign out failed!`,
          text2: error?.message
        });
      }
    });
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {settings.map((setting) => (
          <Pressable
            key={setting.id}
            className={`flex-row items-center p-4 border-b border-border/80 ${setting.disabled ? 'opacity-50' : ''}`}
            disabled={setting.disabled}
            onPress={setting.type === 'toggle' && setting.onToggle ? setting.onToggle : undefined}
          >
            <View className="w-8 h-8 rounded-full bg-secondary items-center justify-center mr-3">
              <Ionicons 
                name={setting.icon as any} 
                size={15} 
                color={isDark ? '#71717a' : '#71717a'} 
              />
            </View>
            
            <View className="flex-1">
              <Text className="text-foreground font-medium">{setting.title}</Text>
              <Text className="text-muted-foreground text-sm">{setting.description}</Text>
            </View>

            {setting.type === 'toggle' ? (
              <Switch
                value={setting.value}
                onValueChange={setting.onToggle}
                trackColor={{ false: '#71717a', true: COLORS.light.primary }}
                thumbColor={isDark ? '#f4f4f5' : '#f4f4f5'}
                disabled={setting.disabled}
              />
            ) : (
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color="#71717a" 
              />
            )}
          </Pressable>
        ))}
      </ScrollView>

      {user ? (
        <Pressable
          onPress={handleLogout}
          className="flex-row items-center p-4 border-t border-border/80"
        >
          <View className="w-8 h-8 rounded-full bg-red-500/10 items-center justify-center mr-3">
            <Ionicons 
              name="log-out-outline" 
              size={20} 
              color="#ef4444" 
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-red-500 font-medium">Logout</Text>
            <Text className="text-muted-foreground text-sm">Sign out of your account</Text>
          </View>

          {loggingOut && (
            <ActivityIndicator size="small" color="#ef4444" />
          )}
        </Pressable>
      ) : (
        <Pressable
          onPress={() => router.push('/auth/login')}
          className="flex-row items-center p-4 border-t border-border/80"
        >
          <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3">
            <Ionicons 
              name="log-in-outline" 
              size={20} 
              color={COLORS.light.primary} 
            />
          </View>
          
          <View className="flex-1">
            <Text className="text-primary font-medium">Login</Text>
            <Text className="text-muted-foreground text-sm">Sign in to your account</Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}
