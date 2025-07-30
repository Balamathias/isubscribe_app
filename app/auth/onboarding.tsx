import { useSession } from '@/components/session-context'
import { useThemedColors } from '@/hooks/useThemedColors'
import { QUERY_KEYS, useVerifyPin } from '@/services/api-hooks'
import { Ionicons } from '@expo/vector-icons'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
  TextInput,
  Vibration,
  View
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

type PinStep = 'create' | 'confirm' | 'success';

const OnboardingScreen = () => {
  const { session } = useSession()
  const { theme, colors } = useThemedColors()
  const [currentStep, setCurrentStep] = useState<PinStep>('create')
  const [firstPin, setFirstPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { mutate: verifyPin } = useVerifyPin()
  const queryClient = useQueryClient()

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current
  const fadeAnimation = useRef(new Animated.Value(1)).current
  const scaleAnimation = useRef(new Animated.Value(1)).current

  // Pin input refs
  const pinRefs = useRef<(TextInput | null)[]>([])

  const animateShake = () => {
    Vibration.vibrate(100)
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start()
  }

  const animateTransition = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnimation, { toValue: 0.95, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(fadeAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start()
    })
  }

  const handlePinChange = (value: string, index: number, isConfirm: boolean) => {
    const currentPin = isConfirm ? confirmPin : firstPin
    const setPin = isConfirm ? setConfirmPin : setFirstPin
    
    const newPin = currentPin.split('')
    newPin[index] = value
    const updatedPin = newPin.join('')
    setPin(updatedPin)

    // Auto-focus next input
    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus()
    }

    // Handle completion
    if (updatedPin.length === 4) {
      if (currentStep === 'create' && !isConfirm) {
        setTimeout(() => {
          animateTransition()
          setCurrentStep('confirm')
          // Focus first confirm input
          setTimeout(() => pinRefs.current[0]?.focus(), 300)
        }, 200)
      } else if (currentStep === 'confirm' && isConfirm) {
        handlePinSubmit(updatedPin)
      }
    }
  }

  const handleKeyPress = (key: string, index: number, isConfirm: boolean) => {
    if (key === 'Backspace') {
      const currentPin = isConfirm ? confirmPin : firstPin
      if (!currentPin[index] && index > 0) {
        pinRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePinSubmit = async (pin: string) => {
    if (pin !== firstPin) {
      animateShake()
      Toast.show({
        type: 'error',
        text1: 'PIN Mismatch',
        text2: 'PINs do not match. Please try again.'
      })
      setConfirmPin('')
      setTimeout(() => pinRefs.current[0]?.focus(), 100)
      return
    }

    setIsLoading(true)
    
    verifyPin({ pin, action: 'new' }, {
      onSuccess: (data) => {
        if (data?.error) {
          throw new Error(data?.message || 'Failed to set PIN')
        }
          
        if (data?.data?.pin_set) {
          setCurrentStep('success')
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'PIN set successfully!'
          })
          
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getUserProfile] })
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] })
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] })
          
          // Navigate after animation
          setTimeout(() => {
            router.replace('/(tabs)')
          }, 2000)
        }
        setIsLoading(false)
      },
      onError: (error) => {
        setIsLoading(false)
        animateShake()
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'Failed to set PIN'
        })
        setConfirmPin('')
        setTimeout(() => pinRefs.current[0]?.focus(), 100)
      }
    })
  }

  const handleGoBack = () => {
    if (currentStep === 'confirm') {
      animateTransition()
      setCurrentStep('create')
      setConfirmPin('')
      setTimeout(() => pinRefs.current[3]?.focus(), 300)
    } else {
      router.back()
    }
  }

  const renderPinInputs = (isConfirm: boolean = false) => {
    const pin = isConfirm ? confirmPin : firstPin
    
    return (
      <Animated.View 
        style={{ 
          transform: [
            { translateX: shakeAnimation },
            { scale: scaleAnimation }
          ],
          opacity: fadeAnimation
        }}
        className="flex-row justify-center gap-4 mb-8"
      >
        {[0, 1, 2, 3].map((index) => (
          <View key={index} className="relative">
            <TextInput
              ref={(ref) => { pinRefs.current[index] = ref }}
              className={`w-16 h-16 rounded-2xl text-center text-2xl font-bold border-2 ${
                pin[index] 
                  ? 'border-primary bg-primary/5 text-foreground' 
                  : 'border-border bg-card text-muted-foreground'
              }`}
              value={pin[index] || ''}
              onChangeText={(value) => handlePinChange(value, index, isConfirm)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index, isConfirm)}
              keyboardType="numeric"
              maxLength={1}
              secureTextEntry
              selectTextOnFocus
              autoFocus={index === 0 && currentStep === 'create' && !isConfirm}
            />
            {pin[index] && (
              <View className="absolute inset-0 rounded-2xl bg-primary/10 items-center justify-center">
                <View className="w-3 h-3 rounded-full bg-primary" />
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'create':
        return (
          <View className="gap-y-3">
            <View className="items-center mb-12">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
                <Ionicons name="lock-closed" size={32} color={colors.primary} />
              </View>
              <Text className="text-foreground text-2xl font-bold mb-2">Create Your PIN</Text>
              <Text className="text-muted-foreground text-center text-base leading-6">
                Set a 4-digit PIN to secure your account and transactions
              </Text>
            </View>
            {renderPinInputs(false)}
          </View>
        )

      case 'confirm':
        return (
          <View className="gap-y-3">
            <View className="items-center mb-12">
              <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-6">
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              </View>
              <Text className="text-foreground text-2xl font-bold mb-2">Confirm Your PIN</Text>
              <Text className="text-muted-foreground text-center text-base leading-6">
                Re-enter your PIN to confirm and complete setup
              </Text>
            </View>
            {renderPinInputs(true)}
          </View>
        )

      case 'success':
        return (
          <Animated.View
            style={{ opacity: fadeAnimation, transform: [{ scale: scaleAnimation }] }}
            className="items-center"
          >
            <View className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-8">
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
            <Text className="text-foreground text-2xl font-bold mb-4">PIN Set Successfully!</Text>
            <Text className="text-muted-foreground text-center text-base mb-8">
              Your account is now secure. Redirecting to your dashboard...
            </Text>
            <ActivityIndicator size="large" color={colors.primary} />
          </Animated.View>
        )

      default:
        return null
    }
  }

  if (!session) {
    router.replace('/auth/login')
    return null
  }

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
      >

        {/* Content */}
        <View className="flex-1 justify-center">
          {renderStepContent()}
        </View>

        {/* Loading State */}
        {isLoading && currentStep !== 'success' && (
          <View className="absolute inset-0 bg-background/80 items-center justify-center">
            <View className="bg-card rounded-2xl p-6 items-center shadow-lg border border-border">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-foreground font-semibold text-lg mt-4">Setting PIN...</Text>
              <Text className="text-muted-foreground text-sm">Please wait</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export default OnboardingScreen