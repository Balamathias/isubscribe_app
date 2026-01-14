import { SettingsList } from '@/components/settings/settings-list'
import TabHeader from '@/components/ui/tab-header'
import { useThemedColors } from '@/hooks/useThemedColors'
import React from 'react'
import { View } from 'react-native'

const Settings = () => {
  const { theme } = useThemedColors()

  return (
    <View className={'flex-1 bg-background/60 min-h-full' + ` ${theme}`}>
      <TabHeader title="Settings" />
      <SettingsList />
    </View>
  )
}
export default Settings
