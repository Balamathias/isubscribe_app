import LoginForm from '@/components/auth/login-form'
import React from 'react'
import { ScrollView, View } from 'react-native'
import Animated, { SlideInLeft, SlideInRight, SlideOutRight } from 'react-native-reanimated';


const LoginScreen = () => {
  return (
    <Animated.View entering={SlideInRight.duration(300)} exiting={SlideOutRight.duration(400)} className="flex flex-1 bg-background min-h-full justify-center items-center w-full py-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <LoginForm />
      </ScrollView>
    </Animated.View>
  )
}

export default LoginScreen