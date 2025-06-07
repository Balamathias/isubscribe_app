import { useSignOut } from '@/services/auth-hooks'
import { Button } from '@react-navigation/elements'
import { router } from 'expo-router'
import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import Toast from 'react-native-toast-message'

const Settings = () => {
  const { mutate: logout, isPending: loggingOut } = useSignOut()
  return (
    <View className='flex-1 items-center justify-center'>
      <Text className='text-primary'>Settings</Text>

      <Button
        variant='filled'
        onPressIn={() => {
          logout(undefined, {
            onSuccess: () => {
              Toast.show({
                type: 'success',
                text1: `Signed out successfully.`
              })
              router.replace(`/`)
            },
            onError: (error) => {
              Toast.show({
                type: 'error',
                text1: `Sign out failed!`,
                text2: error?.message
              })
            }
          })
        }}
      >
        {
          loggingOut ? 'Processing...' : 'Logout'
        }
      </Button>
    </View>
  )
}
export default Settings