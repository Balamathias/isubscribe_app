import VerifyOtp from '@/components/auth/verify-otp-form'
import React from 'react'
import { ScrollView, useColorScheme, View } from 'react-native'

const VerifyOTPScreen = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  return (
    <View className={"flex flex-1 bg-background min-h-full justify-center items-center w-full py-4" + ` ${theme}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <VerifyOtp />
      </ScrollView>
    </View>
  )
}

export default VerifyOTPScreen