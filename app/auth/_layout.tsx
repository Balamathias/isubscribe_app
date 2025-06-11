import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const Layout = () => {
  return (
    <Stack>
        <Stack.Screen
            name="login"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="register"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="verify-otp"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="forgot-password"
            options={{
                headerShown: false
            }}
        />
        <Stack.Screen
            name="onboarding"
            options={{
                headerShown: false
            }}
        />
    </Stack>
  )
}

export default Layout