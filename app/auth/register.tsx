import RegisterForm from '@/components/auth/register-form'
import React from 'react'
import { View, ScrollView, Text } from 'react-native'

const RegisterScreen = () => {
  return (
    <View className="flex flex-1 bg-background min-h-full justify-center items-center w-full py-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <RegisterForm />
      </ScrollView>
    </View>
  )
}

export default RegisterScreen