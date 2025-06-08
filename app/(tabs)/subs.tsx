import { View } from 'react-native'
import React, { useEffect } from 'react'
import { Button } from '@react-navigation/elements'
import { microservice } from '@/services/ai.ms'

const Subs = () => {
  useEffect(() => {
    microservice.get('/mobile/wallets/').then(res => console.log(res.data)).catch(err => console.error(err))
  })
  
  return (
    <View className='flex-1 items-center justify-center'>
      <Button
        onPressIn={() => {}}
      >
        Ping
      </Button>
    </View>
  )
}
export default Subs