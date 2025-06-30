


import BuyTvCableScreen from '@/components/tv-cable/buy-tv-cable';
import Header from '@/components/tv-cable/header';
import React from 'react'
import { Text, View } from 'react-native'
import Animated, { SlideInDown, SlideInLeft, SlideInRight, SlideInUp, SlideOutLeft, SlideOutRight } from 'react-native-reanimated';

const TvCableScreen = () => {
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
        <BuyTvCableScreen />
      </Animated.View>
    </View>

  )
}

export default TvCableScreen