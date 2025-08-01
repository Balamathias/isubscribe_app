import FundWalletBottomSheet, { CreditCard } from '@/components/home/fund-wallet-sheet'
import GenerateAccountForm from '@/components/home/generate-account-form'
import Header from '@/components/transactions/header'
import { COLORS } from '@/constants/colors'
import { useThemedColors } from '@/hooks/useThemedColors'
import { useGetAccount } from '@/services/api-hooks'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { ActivityIndicator, Clipboard, Platform, Text, ToastAndroid, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

const Accounts = () => {
  const [showFundWalletBottomSheet, setShowFundWalletBottomSheet] = React.useState(false);
  const [showGenerateForm, setShowGenerateForm] = React.useState(false);
  const { data: accountData, isPending } = useGetAccount()
  const { theme } = useThemedColors()

  const account = accountData?.data || null
  const hasPalmPayAccount = account?.palmpay_account_number
  const hasReservedAccount = account?.account_number

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

  const handleGenerateAccount = () => {
    setShowGenerateForm(true);
  };

  const handleCloseGenerateForm = () => {
    setShowGenerateForm(false);
  };

  const renderNoAccountsMessage = () => (
    <View className="flex-col items-center justify-center flex-1 px-4">
      <View className="w-24 h-24 rounded-full bg-muted/20 items-center justify-center mb-6">
        <Ionicons name="card-outline" size={48} color={COLORS.light.muted} />
      </View>
      <Text className="text-foreground font-bold text-xl mb-2 text-center">
        No Accounts Available
      </Text>
      <Text className="text-muted-foreground text-center mb-8 leading-6">
        We couldn't automatically generate funding accounts for you. Create a reserved account to start funding your wallet.
      </Text>
      <TouchableOpacity
        onPress={handleGenerateAccount}
        className="bg-primary rounded-xl p-4 flex-row items-center"
      >
        <Ionicons name="add-circle-outline" size={24} color="#fff" style={{ marginRight: 12 }} />
        <Text className="text-white font-semibold text-lg">Generate Reserved Account</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-background p-4 ${theme}`}>
        <Header title={'Accounts'} />
      {isPending ? (
        <ActivityIndicator color={COLORS.light.primary} size={'large'}/>
      ) : !hasPalmPayAccount && !hasReservedAccount ? (
        renderNoAccountsMessage()
      ) : (
        <View className='mt-6'>          
          <View className="flex-col md:flex-row justify-center items-center gap-4 gap-y-8">
            {hasPalmPayAccount && (
              <CreditCard
                colors={['#6017b9', '#af5eed', '#31033d']}
                accountNumber={account?.palmpay_account_number || '**********'}
                bankName={'Palmpay'}
                accountName={account?.palmpay_account_name || '****** ******'}
                onCopy={() => handleCopy(account?.palmpay_account_number || '')}
              />
            )}

            {hasReservedAccount && (
              <CreditCard
                colors={['#5f4808', '#4c0a2d', '#131d37']}
                accountNumber={account?.account_number || ''}
                bankName="Moniepoint"
                accountName={"iSubscribe Network Technology.-" + account?.account_name}
                onCopy={() => handleCopy(account?.account_number || '')}
              />
            )}
          </View>

          {/* Generate Additional Account Option */}
          {(hasPalmPayAccount || hasReservedAccount) && !(hasPalmPayAccount && hasReservedAccount) && (
            <View className="mt-8 p-4 bg-card border border-border/20 rounded-xl shadow-sm">
              <View className="flex-row items-center justify-between">
                <View className="flex-1 mr-4">
                  <Text className="text-foreground font-semibold text-lg mb-1">
                    Need More Options?
                  </Text>
                  <Text className="text-muted-foreground">
                    Generate an additional reserved account for more funding flexibility
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleGenerateAccount}
                  className="bg-primary rounded-lg px-5 py-3 flex-row items-center"
                >
                  <Ionicons name="add-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text className="text-white font-semibold">Generate</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <FundWalletBottomSheet 
            isVisible={showFundWalletBottomSheet} 
            onClose={handleCloseBottomSheet} 
          />
        </View>
      )}

      <GenerateAccountForm
        isVisible={showGenerateForm}
        onClose={handleCloseGenerateForm}
        onSuccess={() => {
          // Account data will be automatically refetched
        }}
      />
    </SafeAreaView>
  )
}

export default Accounts