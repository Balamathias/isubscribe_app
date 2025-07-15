import { COLORS } from '@/constants/colors';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Image, Text, View } from 'react-native';

const IsubscribeLogo = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const colors = COLORS[theme];
  return (
    <View className="flex-row items-center justify-center mb-10">
      <Image
        source={require('@/assets/images/logo-icon.png')}
        className="w-11 h-11 mr-0.5"
        style={{ tintColor: colors.primary }}
      />
      <Text className="text-[26px] font-semibold" style={{ color: colors.primary }}>isubscribe</Text>
    </View>
  );
};

export default IsubscribeLogo;