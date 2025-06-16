import React from 'react';
import { View, Image, Text } from 'react-native';
import { useSession } from './session-context';
import { SafeAreaView } from 'react-native-safe-area-context';

const SplashScreen = () => {
  const { isLoading, user } = useSession();

  if (!isLoading) return null;

  return (
    <SafeAreaView className="flex-1 bg-background items-center justify-center">
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center justify-center mb-10">
          <Image
            source={require('@/assets/images/logo-icon.png')}
            className="w-11 h-11 mr-0.5"
            style={{ tintColor: '#7B2FF2' }}
          />
          <Text className="text-[26px] font-semibold text-[#7B2FF2]">isubscribe</Text>
        </View>
      </View>
      <Text className="text-sm text-muted-foreground mb-8">Subscribe and stay connected</Text>
    </SafeAreaView>
  );
};

export default SplashScreen;

