import React from 'react';
import { View, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemedColors } from '@/hooks/useThemedColors';

const SplashScreen = () => {
  const { colors, theme } = useThemedColors()

  return (
    <SafeAreaView className={`flex-1 bg-background items-center justify-center`}>
      <View className="flex-1 items-center justify-center">
        <View className="flex-row items-center justify-center mb-10">
          <Image
            source={require('@/assets/images/logo-icon.png')}
            className="w-11 h-11 mr-0.5"
            style={{ tintColor: colors.primary }}
          />
          <Text className="text-[26px] font-semibold" style={{ color: colors.primary }}>isubscribe</Text>
        </View>
      </View>
      <Text className="text-sm text-muted-foreground mb-8">Subscribe and stay connected</Text>
    </SafeAreaView>
  );
};

export default SplashScreen;



