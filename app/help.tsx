import StarryBackground from '@/components/starry-background'
import Header from '@/components/transactions/header'
import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Linking, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

const HelpScreen = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = COLORS[theme]

  const handleWhatsAppPress = () => {
    Linking.openURL(`whatsapp://send?phone=+2347049597498&text=${encodeURIComponent('My dearest gentle isubscribe,\n\n> Please briefly describe how we may help you...')}`)
  }

  const handleEmailPress = () => {
    Linking.openURL(`mailto:isubscribenetwork@gmail.com`)
  }

  const handleFAQPress = () => {
    router.push('/faq')
  }

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`}>
      <Header title={'Help & Support'} />

      <View className="flex-1 p-5">
        <Animated.View
          entering={FadeIn.delay(200)}
          className="items-center mt-10 mb-10"
        >
          <Ionicons name="help-circle-outline" size={48} color={colors.primary} />
          <Text className="text-foreground text-2xl font-bold mt-4 mb-2">Need Help?</Text>
          <Text className="text-muted-foreground text-base text-center px-5">
            We're here to assist you with any questions or concerns
          </Text>
        </Animated.View>

        <View className="gap-4">
          <Animated.View entering={FadeIn.delay(300)}>
            <TouchableOpacity 
              className="bg-card rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-border"
              onPress={handleFAQPress}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                  <Ionicons name="help-circle" size={24} color={colors.primary} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-foreground text-lg font-semibold">Frequently Asked Questions</Text>
                  <Text className="text-muted-foreground text-sm">
                    Find quick answers to common questions
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(400)}>
            <TouchableOpacity 
              className="bg-card rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-border"
              onPress={handleWhatsAppPress}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center">
                  <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-foreground text-lg font-semibold">Chat on WhatsApp</Text>
                  <Text className="text-muted-foreground text-sm">
                    Get instant support from our team
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeIn.delay(500)}>
            <TouchableOpacity 
              className="bg-card rounded-2xl p-4 flex-row items-center justify-between shadow-sm border border-border"
              onPress={handleEmailPress}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                  <Ionicons name="mail-outline" size={24} color={colors.primary} />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-foreground text-lg font-semibold">Send us an Email</Text>
                  <Text className="text-muted-foreground text-sm">
                    We'll respond within 24 hours
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Animated.View entering={FadeIn.delay(600)} className="mt-auto py-5">
          <Text className="text-muted-foreground text-sm text-center">
            Our support team is available Monday to Friday, 9:00 AM - 5:00 PM WAT
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  )
}

export default HelpScreen