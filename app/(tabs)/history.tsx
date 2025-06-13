import { View } from 'react-native'
import ListTransactions from '../transactions/list-transactions'
import Header from '@/components/transactions/header'

const History = () => {
  return (
    <View className='flex-1 bg-background/60'>
      <Header title={'Transactions'} />
      <ListTransactions />
    </View>
  )
}
export default History