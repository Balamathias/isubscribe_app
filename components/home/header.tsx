import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { router, Tabs } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Avatar from '../ui/avatar'
import { useSession } from '../session-context'

const Header = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const colors = COLORS[theme]

  const { user, session } = useSession()

  const getUserInitials = () => user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split(`@`)[0]

  return (
    <Tabs.Screen 
        options={{
            headerShown: true,
            header: () => (
                <View className={`${theme} flex-row bg-background`}>
                    <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-4 w-full py-4">
                        <View className="flex-row items-center gap-x-1.5">
                            {
                                user ? (
                                    <Avatar 
                                        source={{ uri: user?.user_metadata?.picture}}
                                        size={32}
                                    />
                                ): (
                                    <Avatar 
                                        size={32}
                                    />
                                )
                            }
                            <Text className="text-xl font-medium text-foreground">Hi, {getUserInitials() ? getUserInitials() : 'Guest'}.</Text>
                        </View>

                        <View className="flex-row items-center gap-x-4">
                            <TouchableOpacity onPress={() => router.push(`/auth/login`)}>
                                <Ionicons name="headset-outline" color={colors.foreground} size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push(`/auth/verify-otp`)}>
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