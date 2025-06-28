import { Stack } from 'expo-router'
import React from 'react'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 1500,
      }}
    >
        <Stack.Screen
            name='data'
            options={{ 
              headerShown: false,
              animationTypeForReplace: 'push',
              gestureDirection: 'horizontal',
            }}
        />
        <Stack.Screen
            name='airtime'
            options={{ 
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal'
            }}
        />
    </Stack>
  )
}

export default Layout