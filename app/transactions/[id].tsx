import { View, Text } from 'react-native'
import React from 'react'
import TransactionDetail from '@/components/transactions/transaction-detail'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useThemedColors } from '@/hooks/useThemedColors'


const TransactionDetailScreen = () => {
  const { theme } = useThemedColors()
  return (
    <SafeAreaView className={'flex flex-1 bg-background' + ` ${theme}`} edges={['bottom']}>
      <TransactionDetail />
    </SafeAreaView>
  )
}

export default TransactionDetailScreen