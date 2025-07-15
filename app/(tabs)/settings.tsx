import { SettingsList } from '@/components/settings/settings-list'
import Header from '@/components/transactions/header'
import React from 'react'
import { useColorScheme } from 'react-native'
import { ScrollView, View } from 'react-native'

const Settings = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  return (
    <View className={'flex-1 bg-background/60 min-h-full' + ` ${theme}`}>
      <Header title="Settings" />
      <SettingsList />
    </View>
  )
}
export default Settings