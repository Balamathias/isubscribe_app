import { useColorScheme, View } from 'react-native'
import ListTransactions from '../transactions/list-transactions'
import Header from '@/components/transactions/header'

const History = () => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'

  return (
    <View className={'flex-1 bg-background/90 dark:bg-background' + ` ${theme}`}>
      <Header title={'Transactions'} />
      <ListTransactions />
    </View>
  )
}
export default History