import FundWalletBottomSheet, { CreditCard } from '@/components/home/fund-wallet-sheet'
import Header from '@/components/transactions/header'
import { COLORS } from '@/constants/colors'
import { useThemedColors } from '@/hooks/useThemedColors'
import { useGetAccount } from '@/services/api-hooks'
import React from 'react'
import { ActivityIndicator, Clipboard, Platform, ToastAndroid, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const Accounts = () => {
  const [showFundWalletBottomSheet, setShowFundWalletBottomSheet] = React.useState(false);
  const { data: accountData, isPending } = useGetAccount()
  const { theme } = useThemedColors()

  const handleCopy = async (text: string) => {
    try {
      await Clipboard.setString(text);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Account number copied to clipboard', ToastAndroid.SHORT);
      } else {
        Toast.show({
          type: 'success',
          text1: 'Account number copied to clipboard'
        });
      }
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleCloseBottomSheet = () => {
    setShowFundWalletBottomSheet(false);
  };

  return (
    <SafeAreaView className={`flex-1 bg-background p-4 ${theme}`}>
        <Header title={'Accounts'} />
      {isPending ? (
        <ActivityIndicator color={COLORS.light.primary} size={'large'}/>
      ) : (
        <View className='mt-6'>          
          <View className="flex-col md:flex-row justify-center items-center gap-4 gap-y-8">
            <CreditCard
              colors={['#6017b9', '#af5eed', '#31033d']}
              accountNumber={accountData?.data?.palmpay_account_number || '**********'}
              bankName={'Palmpay'}
              accountName={accountData?.data?.palmpay_account_name || '****** ******'}
              onCopy={() => handleCopy(accountData?.data?.palmpay_account_number || '')}
            />

            {accountData?.data?.account_number && <CreditCard
              colors={['#5f4808', '#4c0a2d', '#131d37']}
              accountNumber={accountData?.data?.account_number || ''}
              bankName="Moniepoint"
              accountName={"iSubscribe Network Technology.-" + accountData?.data?.account_name}
              onCopy={() => handleCopy(accountData?.data?.account_number || '')}
            />}
          </View>

          <FundWalletBottomSheet 
            isVisible={showFundWalletBottomSheet} 
            onClose={handleCloseBottomSheet} 
          />
        </View>
      )}
    </SafeAreaView>
  )
}

export default Accounts