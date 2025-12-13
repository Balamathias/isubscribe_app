import LoginForm from '@/components/auth/login-form'
import React from 'react'
import { StatusBar, useColorScheme, View } from 'react-native'

const LoginScreen = () => {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <View className={`flex-1 bg-background ${isDark ? 'dark' : 'light'}`}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <LoginForm />
    </View>
  )
}

export default LoginScreen
