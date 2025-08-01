import { View, Text } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'
import { SessionProvider, useSession } from '@/components/session-context'
import { useLocalSearchParams } from 'expo-router'

const Layout = () => {
  const { user, profile, isLoading, loadingProfile } = useSession()

  if (isLoading || loadingProfile) {
    return null
  }

  return (
    <Stack>
        <Stack.Protected guard={!user ? true : false}>
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
                name="forgot-password"
                options={{
                    headerShown: false
                }}
            />
        </Stack.Protected>
        
        <Stack.Screen
            name="verify-otp"
            options={{
                headerShown: false
            }}
        />

        <Stack.Protected guard={
            (profile && profile?.onboarded) ? false : true
        }>
            <Stack.Screen
                name="onboarding"
                options={{
                    headerShown: false,
                }}
            />
        </Stack.Protected>
    </Stack>
  )
}

export default Layout