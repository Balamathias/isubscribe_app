import TransferMoney from '@/components/transfer/transfer-money';
import Header from '@/components/transactions/header';
import { useThemedColors } from '@/hooks/useThemedColors';
import React from 'react'
import { View } from 'react-native'

const TransferScreen = () => {
  const { theme } = useThemedColors()
  return (
    <View className={"flex flex-1 bg-background/40 relative" + ` ${theme}`}>
        <Header title={'Send Money'} />
        <TransferMoney />
    </View>
  )
}

export default TransferScreen
