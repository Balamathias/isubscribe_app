import { COLORS } from '@/constants/colors'
import { Ionicons } from '@expo/vector-icons'
import { router, Tabs } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Props {
    title?: string | null
}

const Header = ({ title }: Props) => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  const colors = COLORS[theme]

  return (
    <Tabs.Screen 
        options={{
            headerShown: true,
            header: ({navigation}) => (
                <View className={`${theme} flex-row bg-background`}>
                    <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-4 w-full py-4">
                        <TouchableOpacity className="flex-row items-center gap-x-1.5" onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" color={colors.foreground} size={24} />
                            <Text className="text-xl font-medium text-foreground" numberOfLines={1}>{title || 'Transaction'}</Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center gap-x-4">
                            <TouchableOpacity onPress={() => router.push(`/help`)}>
                                <Ionicons name="headset-outline" color={colors.foreground} size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => router.push(`/history`)}>
                                <Ionicons name="time-outline" color={colors.foreground} size={24} />
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