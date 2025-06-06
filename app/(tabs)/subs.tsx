import { View, Text } from 'react-native'
import React from 'react'
import MyScreen from '@/components/examples/my-screen'

const Subs = () => {
  return (
    <View className='flex-1 items-center justify-center'>
      <Text className='text-primary'>Subs</Text>
      <MyScreen />
    </View>
  )
}
export default Subs