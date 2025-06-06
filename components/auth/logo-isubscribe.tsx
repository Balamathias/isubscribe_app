import React from 'react';
import { Image, Text, View } from 'react-native';

const IsubscribeLogo = () => {
  return (
    <View className="flex-row items-center justify-center mb-10">
      <Image
        source={require('@/assets/images/logo-icon.png')}
        className="w-11 h-11 mr-0.5"
        style={{ tintColor: '#7B2FF2' }}
      />
      <Text className="text-[26px] font-semibold text-[#7B2FF2]">isubscribe</Text>
    </View>
  );
};

export default IsubscribeLogo;