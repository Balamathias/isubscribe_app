

import BuyEducationScreen from '@/components/education/buy-education';
import Header from '@/components/transactions/header';
import { useThemedColors } from '@/hooks/useThemedColors';
import React from 'react'
import { View } from 'react-native'

const EducationScreen = () => {
  const { theme } = useThemedColors()
  return (
    <View className={"flex flex-1 bg-background/40 relative" + ` ${theme}`}>
        <Header title={'Education'} />
        <BuyEducationScreen />
    </View>

  )
}

export default EducationScreen