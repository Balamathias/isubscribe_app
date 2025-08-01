import BuyAirtimeScreen from '@/components/airtime/buy-airtime'
import React from 'react'
import { useColorScheme } from 'react-native'
import { Text, View } from 'react-native'

const AirtimeScreen = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  return (
    <View className={`flex flex-1 bg-background/75 dark:bg-background relative ${theme}`}>
        <BuyAirtimeScreen />
    </View>
  )
}

export default AirtimeScreen