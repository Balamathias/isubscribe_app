

import BuyElectricityScreen from '@/components/electricity/buy-electricity';
import Header from '@/components/transactions/header';
import React from 'react';
import { useColorScheme } from 'react-native';
import { View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

const ElectricityScreen = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  return (
    <View 
        className={`flex flex-1 bg-background/40 relative ${theme}`}>
        <Header title={'Electricity'} />
        <BuyElectricityScreen />
    </View>

  )
}

export default ElectricityScreen