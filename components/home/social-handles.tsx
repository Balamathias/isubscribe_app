import { View, Text, TouchableOpacity, Image, Linking } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'
import { router } from 'expo-router'

const SocialLinks = () => {
  const handleSocialLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url)
      if (supported) {
        await Linking.openURL(url)
      } else {
        router.navigate(url as any)
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to open URL'
      })
    }
  }

  return (
    <View className="items-center py-8 mt-6">
      <View className="flex-row gap-x-6 mb-6">
        <TouchableOpacity 
          onPress={() => handleSocialLink('https://x.com/isubscribe_ng')}
          className="w-14 h-14 rounded-full bg-white dark:bg-secondary items-center justify-center shadow-md">
          <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleSocialLink('https://facebook.com/isubscribe.ng')}
          className="w-14 h-14 rounded-full bg-white dark:bg-secondary items-center justify-center shadow-md">
          <Ionicons name="logo-facebook" size={24} color="#4267B2" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleSocialLink('https://instagram.com/isubscribe_ng')}
          className="w-14 h-14 rounded-full bg-white dark:bg-secondary items-center justify-center shadow-md">
          <Ionicons name="logo-instagram" size={24} color="#C13584" />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => handleSocialLink('https://chat.whatsapp.com/FtUv7tE95Bt4vPbZ3DbNLS')}
          className="w-14 h-14 rounded-full bg-white dark:bg-secondary items-center justify-center shadow-md">
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
        </TouchableOpacity>
      </View>
      <Text className="text-muted-foreground text-base font-semibold">
        Privacy <Text className="text-gray-400">|</Text> About <Text className="text-gray-400">|</Text> Terms & Conditions
      </Text>
    </View>
  )
}

export default SocialLinks
