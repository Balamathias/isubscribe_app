import BottomSheet from '@/components/ui/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import PinPad from '../pin-pad';
import { networks } from './buy-airtime';
import Avatar from '../ui/avatar';
import { useSession } from '../session-context';
import { router } from 'expo-router';
import { QUERY_KEYS, useProcessTransaction, useVerifyPin } from '@/services/account-hooks';
import Toast from 'react-native-toast-message';
import StatusModal from '../status-modal';
import { useQueryClient } from '@tanstack/react-query';

interface AirtimeDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPlan: any;
  onSubmit: () => void;
  phoneNumber: string;
  networkId: string;
}

const AirtimeDetailsModal: React.FC<AirtimeDetailsModalProps> = ({
  isVisible,
  onClose,
  selectedPlan,
  onSubmit,
  phoneNumber,
  networkId,
}) => {
  const [isPinPadVisible, setPinPadVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];
  const [loadingText, setLoadingText] = useState<string>('')

  const queryClient = useQueryClient()

  const { user, walletBalance } = useSession()
  const { mutateAsync: processTransaction, isPending, data: transaction } = useProcessTransaction()
  const { mutateAsync: verifyPin, isPending: verifyingPin } = useVerifyPin()

  const [openStatusModal, setOpenStatusModal] = useState(false)

  const handleProcessRequest = async () => {
    setLoadingText('Processing...')
    const result = await processTransaction({
      channel: 'airtime',
      amount: selectedPlan?.price,
      network: networkId,
      payment_method: 'wallet',
      phone: phoneNumber,
    }, {
      onSuccess: (data) => {
        if (!data?.error) {
          setOpenStatusModal(true)
          onClose()
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance]})
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions]})
        } else {
          setOpenStatusModal(true)
          onClose()
          setPinPadVisible(false)
        }
      },
      onError: (error) => {
        console.error(error?.message)
        setOpenStatusModal(false)
        onClose()
        setPinPadVisible(false)
        alert(error?.message)
      }
    })
  }


  const handlePinSubmit = async (pin: string) => {

    setLoadingText('Verifying Pin...')

    const pinRequest = await verifyPin({ pin })

    if (pinRequest.data?.is_valid) {
      setLoadingText('Verified.')
      return true
    } else {
      setLoadingText('Pin verification failed.')
      return false
    }
  };

  if (!selectedPlan) {
    return null;
  }

  const network = networks.find(n => n.id === networkId);

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={onClose}
        title={`${formatNigerianNaira(selectedPlan?.price).split('.')[0]} Airtime`}
      >
        <View className="flex flex-col gap-4 w-full relative">

          {(verifyingPin || isPending) && (
              <View className='bg-transparent inset-0 absolute flex justify-center items-center z-10 right-0 left-0 bottom-0 top-0'>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text className="text-foreground mt-2">{'Processing...'}</Text>
              </View>
          )}

          <View className="p-4 bg-secondary rounded-xl mb-4 w-full">
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground text-base">Product</Text>
              <View className="flex-row items-center">
                <Text className="text-foreground font-semibold text-base mr-2">{network?.name}</Text>
                <Avatar source={network?.logo} size={18} fallback={network?.id}/>
              </View>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground text-base">Phone Number</Text>
              <Text className="text-foreground font-semibold text-base">{phoneNumber}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground text-base">Amount</Text>
              <Text className="text-foreground font-semibold text-base">{formatNigerianNaira(selectedPlan?.price)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-muted-foreground text-base">Bonus</Text>
              <Text className="text-primary font-semibold text-base">+{formatNigerianNaira(selectedPlan?.price * 0.02)}</Text>
            </View>
          </View>

          <TouchableOpacity disabled={(walletBalance?.balance || 0) < selectedPlan?.price} activeOpacity={0.7} className={"bg-primary/10 rounded-xl p-4 flex-row justify-between items-center mb-4" + ((walletBalance?.balance || 0) < selectedPlan?.price && " bg-red-500/10")}>
            <View className="flex-row items-center">
              <Ionicons name="wallet-outline" size={24} color={colors.primary} />
              <View className="ml-3">
                <Text className="text-foreground font-bold text-lg">Wallet Balance <Text className="text-muted-foreground text-sm font-normal">• {(walletBalance?.balance || 0) < selectedPlan?.price ? 'Insufficient Funds' : 'Selected' }</Text></Text>
                <Text className="text-foreground font-bold text-xl">{formatNigerianNaira(user ? (walletBalance?.balance || 0) : 0)}</Text>
              </View>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
              className="rounded-xl py-4 overflow-hidden bg-primary flex flex-row items-center justify-center gap-x-1"
              onPress={() => user ? setPinPadVisible(true) : router.push(`/auth/login`)}
              activeOpacity={0.5}
              disabled={(selectedPlan?.price > (walletBalance?.balance!))}
          >
              <LinearGradient
                  colors={[colors.primary, '#e65bf8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute inset-0"
              />
              {!user && <Ionicons size={20} name='log-in-outline' color={'white'} />}
              <Text className="text-primary-foreground text-lg font-bold">{user ? 'Proceed' : 'Login'}</Text>
          </TouchableOpacity>


        </View>
      </BottomSheet>

      <PinPad
        isVisible={isPinPadVisible}
        onClose={() => setPinPadVisible(false)}
        handler={handlePinSubmit}
        title="Confirm Transaction"
        description="Enter your 4-digit PIN to complete the payment."
        onSuccess={async () => await handleProcessRequest()}
        onError={() => {console.error('PIN could not be verified.')}}
        loadingText={loadingText}
        successMessage='PIN Verified.'
      />

      <StatusModal 
        amount={transaction?.data?.amount || 0}
        status={
          transaction?.error ? 'error' : transaction?.data?.status as any
        }
        isVisible={openStatusModal}
        description={transaction?.data?.description || transaction?.message || ''}
        actionText={
          transaction?.error ? 'Done' : 'View Receipt'
        }
        onAction={transaction?.error ? undefined : () => {
          router.push({
            pathname: '/transactions/[id]',
            params: { id: String(transaction?.data?.id) }
          })
        }}
        onClose={() => {
          onClose()
          setOpenStatusModal(false)
        }}
      />
    </>
  );
};

export default AirtimeDetailsModal;