import { Ionicons } from '@expo/vector-icons'
import { useThemedColors } from '@/hooks/useThemedColors'
import { router } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface Props {
    title?: string | null
}

/**
 * Header component for Tab screens.
 * Renders header directly without using Tabs.Screen to avoid navigation context issues.
 */
const TabHeader = ({ title }: Props) => {
  const { colors, theme } = useThemedColors()

  return (
    <View className={`${theme} bg-background`}>
      <SafeAreaView edges={['top']} className="flex-row items-center justify-between px-4 w-full py-4">
        <Text className="text-xl font-bold text-foreground">{title || 'Screen'}</Text>
        <TouchableOpacity
          onPress={() => router.push(`/help`)}
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: colors.muted + '50' }}
        >
          <Ionicons name="headset-outline" color={colors.foreground} size={22} />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

export default TabHeader
