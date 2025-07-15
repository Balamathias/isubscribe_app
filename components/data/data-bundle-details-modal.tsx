import BottomSheet from '@/components/ui/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { SuperPlansMB } from '@/services/api';
import { QUERY_KEYS, useProcessTransaction, useVerifyPin } from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import PinPad from '../pin-pad';
import { useSession } from '../session-context';
import StatusModal from '../status-modal';
import Avatar from '../ui/avatar';
import { networks } from './buy-data';
import LoadingSpinner from '../ui/loading-spinner';

interface DataBundleDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedBundleDetails: SuperPlansMB;
  onSubmit: () => void;
  networkId: string,
  phoneNumber: string,
  category: string
}

type PaymentMethod = 'wallet' | 'cashback';

const DataBundleDetailsModal: React.FC<DataBundleDetailsModalProps> = ({
  isVisible,
  onClose,
  selectedBundleDetails,
  onSubmit,
  networkId,
  phoneNumber,
  category
}) => {

    const [isPinPadVisible, setPinPadVisible] = useState(false);
    const { user, walletBalance } = useSession()
    const { authenticate, isBiometricEnabled } = useLocalAuth();
    const { use_bonus } = useLocalSearchParams()

    const colorSheme = useColorScheme()
    const theme = colorSheme === 'dark' ? 'dark' : 'light'
    const colors = COLORS[theme]
    const [loadingText, setLoadingText] = useState('')
    
    const queryClient = useQueryClient()

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(use_bonus === 'true' ? 'cashback' : 'wallet');

    const { mutateAsync: processTransaction, isPending, data: transaction } = useProcessTransaction()
    const { mutateAsync: verifyPin, isPending: verifyingPin } = useVerifyPin()

    const [openStatusModal, setOpenStatusModal] = useState(false)

    const currentBalance = selectedPaymentMethod === 'wallet' 
      ? (walletBalance?.balance || 0) 
      : (walletBalance?.cashback_balance || 0);

    const isInsufficientFunds = selectedBundleDetails?.price > currentBalance;

    const handleProcessRequest = async () => {
      setLoadingText('Processing...')
      await processTransaction({
        channel: 'data_bundle',
        plan_id: selectedBundleDetails?.id,
        category: category,
        payment_method: selectedPaymentMethod,
        phone: phoneNumber,
      }, {
        onSuccess: (data) => {
          setOpenStatusModal(true)
          if (data?.error) {
            onClose()
            setPinPadVisible(false)
          } else {
            onClose()
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance]})
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions]})
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getBeneficiaries]})
          }
        },
        onError: (error) => {
          console.error(error?.message)
          onClose()
          setPinPadVisible(false)
          Alert.alert("Transaction Error", error?.message || "An unexpected error occurred.");
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

    const handleProceed = async () => {
      if (!user) {
        router.push(`/auth/login`)
        return
      }

      if (isInsufficientFunds) {
        const paymentMethodName = selectedPaymentMethod === 'wallet' ? 'wallet' : 'Data Bonus';
        Alert.alert("Insufficient Funds", `You do not have enough funds in your ${paymentMethodName} to complete this transaction.`);
        return;
      }

      if (isBiometricEnabled) {
        try {
          const authenticated = await authenticate(() => setPinPadVisible(true));
          if (authenticated) {
            await handleProcessRequest()
          } else {
            setPinPadVisible(true)
          }
        } catch (error) {
          console.error('Local auth failed:', error)
          setPinPadVisible(true)
        }
      } else {
        setPinPadVisible(true)
      }
    }

    const network = networks.find(n => n.id === networkId);

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={onClose}
        title={`${selectedBundleDetails?.quantity} - ${selectedBundleDetails?.duration}(Corporate Gifting)`}
      >
        {isPending && (
            <LoadingSpinner isPending={isPending} />
        )}
        <ScrollView className="flex-1">
          <View className="flex flex-col gap-4 w-full relative">
            <View className="p-4 bg-secondary rounded-xl mb-4 w-full">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Product</Text>
                <View className="flex-row items-center">
                  <Text className="text-foreground font-semibold text-sm sm:text-base mr-2">{network?.name}</Text>
                  <Avatar 
                    size={18} 
                    source={network?.logo}
                    resizeMode='contain'
                  />
                </View>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Phone Number</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{phoneNumber}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Price</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{formatNigerianNaira(selectedBundleDetails?.price)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Amount</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{selectedBundleDetails?.quantity}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Duration</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{selectedBundleDetails?.duration}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Data Bonus</Text>
                <Text className="text-primary font-semibold text-sm sm:text-base">+<Text>{selectedBundleDetails?.data_bonus}</Text></Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground text-sm sm:text-base">Plan Type</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base flex-1 text-right ml-2" numberOfLines={1}>{selectedBundleDetails?.name}</Text>
              </View>
            </View>

            <TouchableOpacity 
              disabled={(walletBalance?.balance || 0) < selectedBundleDetails?.price} 
              activeOpacity={0.7} 
              className={`bg-primary/10 rounded-xl p-3 sm:p-4 flex-row justify-between items-center
                ${selectedPaymentMethod === 'wallet' ? 'border border-primary' : ''} 
                ${((walletBalance?.balance || 0) < selectedBundleDetails?.price) ? ' bg-red-500/10' : ''}`}
              onPress={() => setSelectedPaymentMethod('wallet')}
            >
              <View className="flex-row items-center">
                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                <View className="ml-2 sm:ml-3">
                  <Text className="text-foreground font-bold text-base sm:text-lg">
                    Wallet Balance <Text className="text-muted-foreground text-xs sm:text-sm font-normal">• 
                    {((walletBalance?.balance || 0) < selectedBundleDetails?.price) ? ' Insufficient Funds' : ' Available' }
                    </Text>
                  </Text>
                  <Text className="text-foreground font-bold text-lg sm:text-xl">
                    {formatNigerianNaira(user ? (walletBalance?.balance || 0) : 0)}
                  </Text>
                </View>
              </View>
              {selectedPaymentMethod === 'wallet' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>

            {walletBalance?.cashback_balance !== undefined && (
              <TouchableOpacity 
                disabled={(walletBalance?.cashback_balance || 0) < selectedBundleDetails?.price} 
                activeOpacity={0.7} 
                className={`bg-primary/10 rounded-xl p-3 sm:p-4 flex-row justify-between items-center mb-2 
                  ${selectedPaymentMethod === 'cashback' ? 'border border-primary' : ''} 
                  ${((walletBalance?.cashback_balance || 0) < selectedBundleDetails?.price) ? ' bg-red-500/10' : ''}`}
                onPress={() => setSelectedPaymentMethod('cashback')}
              >
                <View className="flex-row items-center">
                  <Ionicons name="gift-outline" size={20} color={colors.primary} />
                  <View className="ml-2 sm:ml-3">
                    <Text className="text-foreground font-bold text-base sm:text-lg">
                      Data Bonus <Text className="text-muted-foreground text-xs sm:text-sm font-normal">• 
                      {((walletBalance?.cashback_balance || 0) < selectedBundleDetails?.price) ? ' Insufficient Funds' : ' Available' }
                      </Text>
                    </Text>
                    <Text className="text-foreground font-bold text-lg sm:text-xl">
                      {user ? (walletBalance?.data_bonus || formatNigerianNaira(walletBalance?.cashback_balance || 0)) : formatNigerianNaira(0)}
                    </Text>
                  </View>
                </View>
                {selectedPaymentMethod === 'cashback' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="rounded-xl py-3 sm:py-4 overflow-hidden bg-primary flex flex-row items-center justify-center gap-x-1 mb-4"
              onPress={handleProceed}
              activeOpacity={0.5}
              disabled={!user || isInsufficientFunds} 
            >
              <LinearGradient
                colors={[colors.primary, '#e65bf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute inset-0"
              />
              {!user && <Ionicons size={18} name='log-in-outline' color={'white'} />}
              <Text className="text-primary-foreground text-base sm:text-lg font-bold">{user ? 'Proceed' : 'Login'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheet>

      <PinPad
        isVisible={isPinPadVisible}
        onClose={() => setPinPadVisible(false)}
        handler={handlePinSubmit}
        title="Confirm Transaction"
        description="Enter your 4-digit PIN to complete the payment."
        onSuccess={async () => await handleProcessRequest()}
        onError={() => console.error('Error occured or invalid PIN.')}
        loadingText={loadingText}
        successMessage='Pin Verified.'
      />

      <StatusModal 
        amount={transaction?.data?.amount || 0}
        quantity={(transaction?.data as any)?.quantity}
        data_bonus={(transaction?.data as any)?.data_bonus}
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
          setOpenStatusModal(false)
        }}
      />
    </>
  );
};

export default DataBundleDetailsModal;