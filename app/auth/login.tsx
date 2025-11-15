import LoginForm from '@/components/auth/login-form'
import React from 'react'
import { ScrollView, useColorScheme, View } from 'react-native'


const LoginScreen = () => {
  const colorScheme = useColorScheme()
    const theme = colorScheme === 'dark' ? 'dark' : 'light'
  return (
    <View className={"flex flex-1 bg-background min-h-full justify-center items-center w-full py-4 pb-8" + ` ${theme}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <LoginForm />
      </ScrollView>
    </View>
  )
}

export default LoginScreen