import LoginForm from '@/components/auth/login-form'
import React from 'react'
import { ScrollView, View } from 'react-native'

const LoginScreen = () => {
  return (
    <View className="flex flex-1 bg-background min-h-full justify-center items-center w-full py-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <LoginForm />
      </ScrollView>
    </View>
  )
}

export default LoginScreen