

import BuyElectricityScreen from '@/components/electricity/buy-electricity';
import Header from '@/components/electricity/header';
import React from 'react'
import { Text, View } from 'react-native'
import Animated, { SlideInDown, SlideInLeft, SlideInRight, SlideInUp, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';

const ElectricityScreen = () => {
  return (
      <View className="flex flex-1 bg-background relative">
        <Animated.View
        entering={SlideInRight.duration(500)}
        exiting={SlideOutLeft.duration(400)}
        className="flex-1 bg-background"
      >
        <Animated.View entering={SlideInRight.duration(500)}>
          <Header />
        </Animated.View>
        <BuyElectricityScreen />
      </Animated.View>
    </View>

  )
}

export default ElectricityScreen