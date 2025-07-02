import BottomSheet from '@/components/ui/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { QUERY_KEYS, useProcessTransaction, useVerifyPin } from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import PinPad from '../pin-pad';
import { useSession } from '../session-context';
import StatusModal from '../status-modal';
import LoadingSpinner from '../ui/loading-spinner';

interface ElectricityConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  electricityData: {
    serviceID: string | number;
    meterNumber: string;
    phoneNumber: string;
    amount: number;
    commissionAmount: number;
    totalAmount: number;
    isPrepaid: boolean;
    customerInfo?: any;
  };
}

type PaymentMethod = 'wallet' | 'cashback';

const ElectricityConfirmationModal: React.FC<ElectricityConfirmationModalProps> = ({
  isVisible,
  onClose,
  electricityData
}) => {
  const [isPinPadVisible, setPinPadVisible] = useState(false);
  const { user, walletBalance, electricityServices } = useSession();
  const { authenticate, isBiometricEnabled } = useLocalAuth();

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];
  const [loadingText, setLoadingText] = useState('');
  
  const queryClient = useQueryClient();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('wallet');

  const { mutateAsync: processTransaction, isPending, data: transaction } = useProcessTransaction();
  const { mutateAsync: verifyPin, isPending: verifyingPin } = useVerifyPin();

  const [openStatusModal, setOpenStatusModal] = useState(false);

  const currentBalance = selectedPaymentMethod === 'wallet' 
    ? (walletBalance?.balance || 0) 
    : (walletBalance?.cashback_balance || 0);

  const isInsufficientFunds = electricityData?.totalAmount > currentBalance;

  const selectedProvider = electricityServices?.find(p => p.id === electricityData.serviceID);

  const handleProcessRequest = async () => {
    setLoadingText('Processing...');
    await processTransaction({
      channel: 'electricity',
      id: electricityData.serviceID,
      payment_method: selectedPaymentMethod,
      phone: electricityData.phoneNumber,
      billers_code: electricityData.meterNumber,
      variation_code: electricityData.isPrepaid ? 'prepaid' : 'postpaid',
      amount: electricityData.amount, // Use total amount including commission
    }, {
      onSuccess: (data) => {
        setOpenStatusModal(true);
        if (data?.error) {
          onClose();
          setPinPadVisible(false);
        } else {
          onClose();
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getBeneficiaries] });
        }
      },
      onError: (error) => {
        console.error(error?.message);
        onClose();
        setPinPadVisible(false);
        Alert.alert("Transaction Error", error?.message || "An unexpected error occurred.");
      }
    });
  };

  const handlePinSubmit = async (pin: string) => {
    setLoadingText('Verifying Pin...');
    const pinRequest = await verifyPin({ pin });

    if (pinRequest.data?.is_valid) {
      setLoadingText('Verified.');
      return true;
    } else {
      setLoadingText('Pin verification failed.');
      return false;
    }
  };

  const handleProceed = async () => {
    if (!user) {
      router.push(`/auth/login`);
      return;
    }

    if (isInsufficientFunds) {
      const paymentMethodName = selectedPaymentMethod === 'wallet' ? 'wallet' : 'cashback';
      Alert.alert("Insufficient Funds", `You do not have enough funds in your ${paymentMethodName} to complete this transaction.`);
      return;
    }

    if (isBiometricEnabled) {
      try {
        const authenticated = await authenticate();
        if (authenticated) {
          await handleProcessRequest();
        } else {
          setPinPadVisible(true);
        }
      } catch (error) {
        console.error('Local auth failed:', error);
        setPinPadVisible(true);
      }
    } else {
      setPinPadVisible(true);
    }
  };

  return (
      <>
      <BottomSheet
        isVisible={isVisible}
        onClose={onClose}
        title={`${electricityData.isPrepaid ? 'Prepaid' : 'Postpaid'} Electricity`}
       >
        {isPending && (
            <LoadingSpinner isPending={isPending} />
        )}
        <ScrollView className="flex-1">
          <View className="flex flex-col gap-4 w-full">
            
            <View className="p-4 bg-secondary rounded-xl mb-4 w-full">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Provider</Text>
                <View className="flex-row items-center">
                  <Text className="text-foreground font-semibold text-sm sm:text-base mr-2">{selectedProvider?.name}</Text>
                  <Image 
                    source={{ uri: selectedProvider?.thumbnail! }}
                    className="w-5 h-5 rounded-full"
                    resizeMode='contain'
                  />
                </View>
              </View>
              
              {electricityData.customerInfo && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground text-sm sm:text-base">Customer Name</Text>
                  <Text className="text-foreground font-semibold text-sm sm:text-base flex-1 text-right ml-2" numberOfLines={1}>
                    {electricityData.customerInfo.Customer_Name}
                  </Text>
                </View>
              )}
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Meter Number</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{electricityData.meterNumber}</Text>
              </View>
              
              {electricityData.customerInfo?.Address && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground text-sm sm:text-base">Address</Text>
                  <Text className="text-foreground font-semibold text-sm sm:text-base flex-1 text-right ml-2" numberOfLines={2}>
                    {electricityData.customerInfo.Address}
                  </Text>
                </View>
              )}
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Phone Number</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{electricityData.phoneNumber}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Amount</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{formatNigerianNaira(electricityData.amount)}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Charges (10%)</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{formatNigerianNaira(electricityData.commissionAmount)}</Text>
              </View>
              
              <View className="border-t border-border mt-2 pt-2">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-foreground font-bold text-base sm:text-lg">Total Amount</Text>
                  <Text className="text-primary font-bold text-base sm:text-lg">{formatNigerianNaira(electricityData.totalAmount)}</Text>
                </View>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Type</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">{electricityData.isPrepaid ? 'Prepaid' : 'Postpaid'}</Text>
              </View>
              
              {electricityData.customerInfo?.Outstanding > 0 && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-orange-600 text-sm sm:text-base">Outstanding</Text>
                  <Text className="text-orange-600 font-semibold text-sm sm:text-base">
                    ₦{electricityData.customerInfo.Outstanding.toLocaleString()}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              disabled={(walletBalance?.balance || 0) < electricityData.totalAmount} 
              activeOpacity={0.7} 
              className={`bg-primary/10 rounded-xl p-3 sm:p-4 flex-row justify-between items-center
                ${selectedPaymentMethod === 'wallet' ? 'border border-primary' : ''} 
                ${((walletBalance?.balance || 0) < electricityData.totalAmount) ? ' bg-red-500/10' : ''}`}
              onPress={() => setSelectedPaymentMethod('wallet')}
            >
              <View className="flex-row items-center">
                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                <View className="ml-2 sm:ml-3">
                  <Text className="text-foreground font-bold text-base sm:text-lg">
                    Wallet Balance <Text className="text-muted-foreground text-xs sm:text-sm font-normal">• 
                    {((walletBalance?.balance || 0) < electricityData.totalAmount) ? ' Insufficient Funds' : ' Available' }
                    </Text>
                  </Text>
                  <Text className="text-foreground font-bold text-lg sm:text-xl">
                    {formatNigerianNaira(user ? (walletBalance?.balance || 0) : 0)}
                  </Text>
                </View>
              </View>
              {selectedPaymentMethod === 'wallet' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>

            {walletBalance?.cashback_balance !== undefined && walletBalance?.cashback_balance > 0 && (
              <TouchableOpacity 
                disabled={(walletBalance?.cashback_balance || 0) < electricityData.totalAmount} 
                activeOpacity={0.7} 
                className={`bg-primary/10 rounded-xl p-3 sm:p-4 flex-row justify-between items-center mb-2 
                  ${selectedPaymentMethod === 'cashback' ? 'border border-primary' : ''} 
                  ${((walletBalance?.cashback_balance || 0) < electricityData.totalAmount) ? ' bg-red-500/10' : ''}`}
                onPress={() => setSelectedPaymentMethod('cashback')}
              >
                <View className="flex-row items-center">
                  <Ionicons name="gift-outline" size={20} color={colors.primary} />
                  <View className="ml-2 sm:ml-3">
                    <Text className="text-foreground font-bold text-base sm:text-lg">
                      Cashback Balance <Text className="text-muted-foreground text-xs sm:text-sm font-normal">• 
                      {((walletBalance?.cashback_balance || 0) < electricityData.totalAmount) ? ' Insufficient Funds' : ' Available' }
                      </Text>
                    </Text>
                    <Text className="text-foreground font-bold text-lg sm:text-xl">
                      {formatNigerianNaira(user ? (walletBalance?.cashback_balance || 0) : 0)}
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
              <Text className="text-primary-foreground text-base sm:text-lg font-bold">{user ? 'Pay Now' : 'Login'}</Text>
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
        onError={() => console.error('Error occurred or invalid PIN.')}
        loadingText={loadingText}
        successMessage='Pin Verified.'
      />

      <StatusModal 
        amount={transaction?.data?.amount || 0}
        status={
          transaction?.error ? 'error' : transaction?.data?.status as any
        }
        transaction={transaction?.data}
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

export default ElectricityConfirmationModal;
