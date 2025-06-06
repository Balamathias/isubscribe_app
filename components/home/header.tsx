import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Avatar from '../ui/avatar'

const Header = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const colors = COLORS[theme]

  return (
    <Tabs.Screen 
        options={{
            headerShown: true,
            header: () => (
                <View className={`${theme} flex-row bg-background`}>
                    <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-4 w-full py-4">
                        <View className="flex-row items-center gap-x-1.5">
                            <Avatar 
                                source={require('@/assets/images/people/gogo.png')}
                                size={32}
                            />
                            <Text className="text-xl font-medium text-foreground">Hi, Mathias.</Text>
                        </View>

                        <View className="flex-row items-center gap-x-4">
                            <TouchableOpacity>
                                <Ionicons name="headset-outline" color={colors.foreground} size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity>
                                <Ionicons name="notifications-outline" color={colors.foreground} size={24} />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            ),
        }}
    />
  )
}

export default Header