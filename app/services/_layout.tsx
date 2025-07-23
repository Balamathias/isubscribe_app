import { Stack } from 'expo-router'
import React from 'react'

const Layout = () => {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        animationDuration: 500,
        animationTypeForReplace: 'pop',
      }}
    >
        <Stack.Screen
            name='data'
            options={{ 
              headerShown: false,
              animationTypeForReplace: 'pop',
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
        <Stack.Screen
            name='electricity'
            options={{ 
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal'
            }}
        />
        <Stack.Screen
            name='education'
            options={{ 
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal'
            }}
        />
        <Stack.Screen
            name='tv-cable'
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