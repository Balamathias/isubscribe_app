

import BuyEducationScreen from '@/components/education/buy-education';
import Header from '@/components/transactions/header';
import React from 'react'
import { View } from 'react-native'

const EducationScreen = () => {
  return (
    <View className="flex flex-1 bg-background/40 relative">
        <Header title={'Education'} />
        <BuyEducationScreen />
    </View>

  )
}

export default EducationScreen