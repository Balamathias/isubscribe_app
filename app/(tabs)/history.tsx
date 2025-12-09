import React, { useState } from 'react'
import { useColorScheme, View, TouchableOpacity, Text, ScrollView } from 'react-native'
import ListTransactions from '../transactions/list-transactions'
import Header from '@/components/transactions/header'
import TransactionAnalytics from '@/components/history/transaction-analytics'
import { COLORS } from '@/constants/colors'

const History = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = COLORS[theme]
  const [activeTab, setActiveTab] = useState<'list' | 'analytics'>('list')

  return (
    <View className={'flex-1 bg-background/90 dark:bg-background' + ` ${theme}`}>
      <Header title={'Transactions'} />

      <View className="flex-row mx-4 my-2 mb-4 bg-muted/20 p-1 rounded-xl border border-border/50">
        <TouchableOpacity
          onPress={() => setActiveTab('list')}
          className={`flex-1 py-2 rounded-lg items-center justify-center ${activeTab === 'list' ? 'bg-background shadow-sm' : ''}`}
        >
          <Text className={`font-semibold ${activeTab === 'list' ? 'text-foreground' : 'text-muted-foreground'}`}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('analytics')}
          className={`flex-1 py-2 rounded-lg items-center justify-center ${activeTab === 'analytics' ? 'bg-background shadow-sm' : ''}`}
        >
          <Text className={`font-semibold ${activeTab === 'analytics' ? 'text-foreground' : 'text-muted-foreground'}`}>Analytics</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        {activeTab === 'list' ? (
          <ListTransactions />
        ) : (
          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <TransactionAnalytics />
          </ScrollView>
        )}
      </View>
    </View>
  )
}
export default History