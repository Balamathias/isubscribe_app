import RegisterForm from '@/components/auth/register-form'
import React from 'react'
import { View, ScrollView, Text, useColorScheme } from 'react-native'

const RegisterScreen = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  return (
    <View className={"flex flex-1 bg-background min-h-full justify-center items-center w-full py-4" + ` ${theme}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <RegisterForm />
      </ScrollView>
    </View>
  )
}

export default RegisterScreen