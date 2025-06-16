import { View, Text } from 'react-native'
import React from 'react'
import TransactionDetail from '@/components/transactions/transaction-detail'
import { SafeAreaView } from 'react-native-safe-area-context'

const TransactionDetailScreen = () => {
  return (
    <SafeAreaView className='flex flex-1 bg-background'>
      <TransactionDetail />
    </SafeAreaView>
  )
}

export default TransactionDetailScreen