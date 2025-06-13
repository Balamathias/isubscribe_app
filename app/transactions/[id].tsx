import { View, Text } from 'react-native'
import React from 'react'
import TransactionDetail from '@/components/transactions/transaction-detail'

const TransactionDetailScreen = () => {
  return (
    <View className='flex flex-1 bg-background'>
      <TransactionDetail />
    </View>
  )
}

export default TransactionDetailScreen