


import Header from '@/components/transactions/header';
import BuyTvCableScreen from '@/components/tv-cable/buy-tv-cable';
import { useThemedColors } from '@/hooks/useThemedColors';
import React from 'react'
import { Text, View } from 'react-native'

const TvCableScreen = () => {
  const { theme } = useThemedColors()
  return (
    <View className={`flex flex-1 bg-background/40 ${theme}`}>
        <Header title={'TV Cable'} />
        <BuyTvCableScreen />
    </View>

  )
}

export default TvCableScreen