import { COLORS } from '@/constants/colors';
import { useGetAccount } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Clipboard, Platform, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import BottomSheet from '../ui/bottom-sheet';
import GenerateAccountForm from './generate-account-form';

interface CreditCardProps {
  colors: string[];
  accountNumber: string;
  bankName: string;
  accountName: string;
  onCopy?: () => void;
}

export const CreditCard: React.FC<CreditCardProps> = ({
  colors,
  accountNumber,
  bankName,
  accountName,
  onCopy
}) => {
  return (
    <LinearGradient
      colors={colors as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="rounded-2xl p-5 w-full md:w-1/2 min-h-[180px] overflow-hidden"
    >
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center flex-1 mr-2">
          <Ionicons name="card-outline" size={24} color="#fff" />
          <Text className="text-white font-semibold text-lg ml-2 flex-wrap">isubscribe Virtual</Text>
        </View>
        <View className="flex-row">
          <View className="w-4 h-4 rounded-full bg-white/30 mr-1" />
          <View className="w-4 h-4 rounded-full bg-white/30" />
        </View>
      </View>
      <Text className="text-white/80 text-xs mb-1">ACCOUNT NUMBER</Text>
      <View className="flex-row justify-between items-center">
        <Text className="text-white font-bold text-2xl flex-1 mr-2 flex-wrap">{accountNumber}</Text>
        <TouchableOpacity onPress={onCopy} className="bg-white rounded-full p-3">
          <Ionicons name="copy-outline" size={20} color="#7B2FF2" />
        </TouchableOpacity>
      </View>
      <View className="flex-row justify-between items-start mt-4">
        <View className="flex-1 mr-2">
          <Text className="text-white/80 text-xs mb-1">BANK NAME</Text>
          <Text className="text-white font-semibold flex-wrap text-sm sm:text-base">{bankName}</Text>
        </View>
        <View className="items-end flex-1">
          <Text className="text-white/80 text-xs mb-1">ACCOUNT NAME</Text>
          <Text className="text-white font-semibold text-sm sm:text-base text-right flex-wrap">{accountName}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

interface FundWalletBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const FundWalletBottomSheet: React.FC<FundWalletBottomSheetProps> = ({ isVisible, onClose }) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const { data: accountData, isPending, refetch: refetchAccount } = useGetAccount()

  const account = accountData?.data || null
  const hasPalmPayAccount = account?.palmpay_account_number
  const hasReservedAccount = account?.account_number

  // Refetch account data when sheet becomes visible
  useEffect(() => {
    if (isVisible) {
      refetchAccount();
    }
  }, [isVisible, refetchAccount]);

  const handleCopy = async (text: string) => {
    try {
      await Clipboard.setString(text);
      setCopiedText(text);
      
      if (Platform.OS === 'android') {
        ToastAndroid.show('Account number copied to clipboard', ToastAndroid.SHORT);
      } else {
        Toast.show({
          type: 'success',
          text1: `Account Number copied successfully.`
        })
      }
      
      setTimeout(() => {
        setCopiedText(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const handleGenerateAccount = () => {
    setShowGenerateForm(true);
  };

  const handleCloseGenerateForm = () => {
    setShowGenerateForm(false);
  };

  const renderNoAccountsAvailable = () => (
    <View className="flex-col items-center justify-center p-6">
      <View className="w-20 h-20 rounded-full bg-muted/20 items-center justify-center mb-4">
        <Ionicons name="card-outline" size={40} color={COLORS.light.muted} />
      </View>
      <Text className="text-foreground font-semibold text-lg mb-2 text-center">
        No Funding Account Available
      </Text>
      <Text className="text-muted-foreground text-center mb-6">
        We couldn't generate a PalmPay account for you automatically. Generate a reserved account to fund your wallet.
      </Text>
      <TouchableOpacity
        onPress={handleGenerateAccount}
        className="bg-primary rounded-xl p-4 flex-row items-center"
      >
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
        <Text className="text-white font-semibold">Generate Reserved Account</Text>
      </TouchableOpacity>
    </View>
  );

  const renderPartialAccounts = () => (
    <View className="space-y-4">
      <View className="flex-col md:flex-row justify-center items-center gap-4">
        {hasPalmPayAccount && (
          <CreditCard
            colors={['#a13ae1', '#740faa']}
            accountNumber={account?.palmpay_account_number || '**********'}
            bankName={'Palmpay'}
            accountName={account?.palmpay_account_name || '****** ******'}
            onCopy={() => handleCopy(account?.palmpay_account_number || '**********')}
          />
        )}

        {hasReservedAccount && (
          <CreditCard
            colors={['#6017b9', '#af5eed']}
            accountNumber={account?.account_number || ''}
            bankName="Moniepoint"
            accountName={"iSubscribe Network Technology.-" + account?.account_name}
            onCopy={() => handleCopy(account?.account_number || '')}
          />
        )}
      </View>

      {!hasReservedAccount && hasPalmPayAccount && (
        <View className="mt-4 p-4 bg-muted/10 rounded-xl">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <Text className="text-foreground font-medium mb-1">
                Need an Alternative?
              </Text>
              <Text className="text-muted-foreground text-sm">
                Generate a reserved account for additional funding options
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleGenerateAccount}
              className="bg-primary rounded-lg px-4 py-2"
            >
              <Text className="text-white font-medium text-sm">Generate</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View>
      <BottomSheet
        isVisible={isVisible}
        onClose={onClose}
        title='Fund Your Wallet'
      >
        {
          isPending && <ActivityIndicator color={COLORS.light.primary} />
        }

        {!isPending && !hasPalmPayAccount && !hasReservedAccount && renderNoAccountsAvailable()}
        
        {!isPending && (hasPalmPayAccount || hasReservedAccount) && renderPartialAccounts()}
            
      </BottomSheet>

      <GenerateAccountForm
        isVisible={showGenerateForm}
        onClose={handleCloseGenerateForm}
        onSuccess={() => {
          // The account data will be automatically refetched due to query invalidation
        }}
      />
    </View>
  );
};

export default FundWalletBottomSheet;