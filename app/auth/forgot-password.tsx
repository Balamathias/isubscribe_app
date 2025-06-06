import ForgotPasswordForm from '@/components/auth/forgot-password-form'
import React from 'react'
import { ScrollView, View } from 'react-native'

const ForgotPasswordScreen = () => {
  return (
    <View className="flex flex-1 bg-background min-h-full justify-center items-center w-full py-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className='w-full'>
        <ForgotPasswordForm />
      </ScrollView>
    </View>
  )
}

export default ForgotPasswordScreen