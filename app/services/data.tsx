import BuyDataScreen from '@/components/data/buy-data'
import React from 'react'
import { useColorScheme } from 'react-native'
import { Text, View } from 'react-native'

const DataScreen = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  return (
    <View className={`flex flex-1 bg-background/75 dark:bg-background relative ${theme}`}>
        <BuyDataScreen />
    </View>
  )
}

export default DataScreen