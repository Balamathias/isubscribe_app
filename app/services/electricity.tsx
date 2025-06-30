

import BuyElectricityScreen from '@/components/electricity/buy-electricity';
import Header from '@/components/transactions/header';
import React from 'react';
import { View } from 'react-native';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

const ElectricityScreen = () => {
  return (
    <View 
        className="flex flex-1 bg-background/40 relative">
        <Header title={'Electricity'} />
        <BuyElectricityScreen />
    </View>

  )
}

export default ElectricityScreen