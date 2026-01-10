import React from 'react'
import { Stack } from 'expo-router'
import { useSession } from '@/components/session-context'

const Layout = () => {
    const { user, profile, isLoading, loadingProfile, session } = useSession()

    if (isLoading || loadingProfile) {
        return null
    }

    return (
        <Stack>
            <Stack.Protected guard={!user ? true : false}>
                <Stack.Screen
                    name="intro"
                    options={{
                        headerShown: false
                    }}
                />
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
                <Stack.Screen
                    name="reset-password"
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
                (session && profile && profile?.onboarded) ? false : true
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