import BuyElectricityScreen from '@/components/electricity/buy-electricity';
import { useThemedColors } from '@/hooks/useThemedColors';
import React from 'react';
import { View } from 'react-native';

const ElectricityScreen = () => {
  const { theme } = useThemedColors()
  return (
    <View className={`flex flex-1 bg-background/40 relative ${theme}`}>
        <BuyElectricityScreen />
    </View>

  )
}

export default ElectricityScreen