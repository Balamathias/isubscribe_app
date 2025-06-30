


import Header from '@/components/transactions/header';
import BuyTvCableScreen from '@/components/tv-cable/buy-tv-cable';
import React from 'react'
import { Text, View } from 'react-native'

const TvCableScreen = () => {
  return (
    <View className="flex flex-1 bg-background/40">
        <Header title={'TV Cable'} />
        <BuyTvCableScreen />
    </View>

  )
}

export default TvCableScreen