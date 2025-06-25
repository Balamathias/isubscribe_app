import PinPad from '@/components/pin-pad'
import { useSession } from '@/components/session-context'
import { QUERY_KEYS, useVerifyPin } from '@/services/api-hooks'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const OnboardingScreen = () => {
  const { session } = useSession()
  const [isFirstPinVisible, setIsFirstPinVisible] = useState(true)
  const [firstPin, setFirstPin] = useState('')
  const { mutate: verifyPin, isPending } = useVerifyPin()

  if (!session) return router.replace(`/`)

  const queryClient = useQueryClient()

  const handleFirstPin = async (pin: string) => {
    setFirstPin(pin)
    setIsFirstPinVisible(false)
    return true
  }

  const handleConfirmPin = async (pin: string) => {
    if (pin !== firstPin) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'PINs do not match. Please try again.'
      })
      return false
    }

    verifyPin({ pin, action: 'new' }, {
      onSuccess: (data) => {
        if (data?.error) throw new Error(data?.message)
          
        if (data?.data?.pin_set) {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'PIN set successfully!'
          })
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getUserProfile] })
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] })
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] })
          router.replace('/')
        }
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'Failed to set PIN'
        })
      }
    })
    return true
  }

  return (
    <SafeAreaView className="flex flex-1 bg-background min-h-full justify-center items-center w-full py-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="items-center px-4">
          <Text className="text-foreground text-2xl font-bold mb-4">Set Your PIN</Text>
          <Text className="text-muted-foreground text-center mb-8">
            {isFirstPinVisible 
              ? 'Create a new PIN to secure your account'
              : 'Confirm your PIN to proceed'}
          </Text>
        </View>

        <PinPad
          isVisible={true}
          onClose={() => {}}
          handler={isFirstPinVisible ? handleFirstPin : handleConfirmPin}
          title={isFirstPinVisible ? 'Create PIN' : 'Confirm PIN'}
          description={isFirstPinVisible 
            ? 'Enter a 4-digit PIN to secure your account'
            : 'Re-enter your PIN to confirm'}
          loadingText="Setting PIN..."
          successMessage="PIN set successfully!"
          errorMessage="Failed to set PIN. Please try again."
          pinLength={4}
          onSuccess={() => {
            if (!isFirstPinVisible) {
              router.replace('/')
            }
          }}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default OnboardingScreen