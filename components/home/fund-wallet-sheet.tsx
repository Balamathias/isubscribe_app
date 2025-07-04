import { COLORS } from '@/constants/colors';
import { useGetAccount } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Clipboard, Modal, Platform, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';

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
  const { data: accountData, isPending } = useGetAccount()

  const account = accountData?.data || null

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

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          className="flex-1 justify-end bg-black/50"
        >
          {
            isPending && <ActivityIndicator color={COLORS.light.primary} />
          }
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
            className="bg-background rounded-t-3xl p-6 max-h-[80vh]"
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-forground font-bold text-xl">Fund Your Wallet</Text>
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close-circle-outline" size={30} className='text-forground' />
              </TouchableOpacity>
            </View>

            <View className="flex-col md:flex-row justify-center items-center gap-4">
              <CreditCard
                colors={['#7B2FF2', '#F357A8']}
                accountNumber={account?.palmpay_account_number || '**********'}
                bankName={'Palmpay'}
                accountName={account?.palmpay_account_name || '****** ******'}
                onCopy={() => handleCopy(account?.palmpay_account_number || '**********')}
              />

              {account?.account_number && <CreditCard
                colors={['#6017b9', '#af5eed']}
                accountNumber={account?.account_number || ''}
                bankName="Moniepoint"
                accountName={"iSubscribe Network Technology.-" + account?.account_name}
                onCopy={() => handleCopy(account?.account_number || '')}
              />}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default FundWalletBottomSheet;