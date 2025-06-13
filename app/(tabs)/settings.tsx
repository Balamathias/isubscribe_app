import { SettingsList } from '@/components/settings/settings-list'
import Header from '@/components/transactions/header'
import React from 'react'
import { ScrollView, View } from 'react-native'

const Settings = () => {

  return (
    <View className='flex-1 bg-background/60 min-h-full'>
      <Header title="Settings" />
      <SettingsList />
    </View>
  )
}
export default Settings