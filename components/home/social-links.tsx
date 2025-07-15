import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'

const SocialLinks = () => {
  return (
    <View className="bg-background items-center py-8 mt-6">
      <View className="flex-row space-x-6 mb-6">
        <TouchableOpacity className="w-14 h-14 rounded-full bg-secondary border border-border items-center justify-center shadow-md">
          <Ionicons name="logo-twitter" size={30} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 rounded-full bg-secondary border border-border items-center justify-center shadow-md">
          <Ionicons name="logo-facebook" size={30} color="#4267B2" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 rounded-full bg-secondary border border-border items-center justify-center shadow-md">
          <Ionicons name="logo-instagram" size={30} color="#C13584" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 rounded-full bg-secondary border border-border items-center justify-center shadow-md">
          <Ionicons name="logo-whatsapp" size={30} color="#25D366" />
        </TouchableOpacity>
      </View>
      <Text className="text-muted-foreground text-base font-semibold">
        Privacy <Text className="text-gray-400">|</Text> About <Text className="text-gray-400">|</Text> Terms & Conditions
      </Text>
    </View>
  )
}

export default SocialLinks 