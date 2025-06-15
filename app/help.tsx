import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Linking, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
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

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-5">
        <View className="items-center mt-10 mb-10">
          <Ionicons name="help-circle-outline" size={48} color={colors.primary} />
          <Text className="text-foreground text-2xl font-bold mt-4 mb-2">Need Help?</Text>
          <Text className="text-muted-foreground text-base text-center px-5">
            We're here to assist you with any questions or concerns
          </Text>
        </View>

        <View className="gap-4">
          <TouchableOpacity 
            className="bg-card rounded-2xl p-4 flex-row items-center justify-between"
            onPress={handleWhatsAppPress}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="logo-whatsapp" size={32} color="#25D366" />
              <View className="ml-4 flex-1">
                <Text className="text-foreground text-lg font-semibold">Chat on WhatsApp</Text>
                <Text className="text-muted-foreground text-sm">
                  Get instant support from our team
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="bg-card rounded-2xl p-4 flex-row items-center justify-between"
            onPress={handleEmailPress}
          >
            <View className="flex-row items-center flex-1">
              <Ionicons name="mail-outline" size={32} color={colors.primary} />
              <View className="ml-4 flex-1">
                <Text className="text-foreground text-lg font-semibold">Send us an Email</Text>
                <Text className="text-muted-foreground text-sm">
                  We'll respond within 24 hours
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View className="mt-auto py-5">
          <Text className="text-muted-foreground text-sm text-center">
            Our support team is available Monday to Friday, 9:00 AM - 5:00 PM WAT
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default HelpScreen