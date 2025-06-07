import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message'

const SocialLinks = () => {
  return (
    <View className="items-center py-8 mt-6">
      <View className="flex-row gap-x-6 mb-6">
        <TouchableOpacity
          onPress={() => {
            Toast.show({
              type: 'success',
              text1: 'You clicked X',
              text2: 'We are very excited about the fact that you clicked X'
            })
          }} 
          className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-md">
          <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-md">
          <Ionicons name="logo-facebook" size={24} color="#4267B2" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-md">
          <Ionicons name="logo-instagram" size={24} color="#C13584" />
        </TouchableOpacity>
        <TouchableOpacity className="w-14 h-14 rounded-full bg-white items-center justify-center shadow-md">
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
