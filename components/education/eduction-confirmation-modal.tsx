import BottomSheet from '@/components/ui/bottom-sheet';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { QUERY_KEYS, useProcessTransaction, useVerifyPin } from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import PinPad from '../pin-pad';
import { useSession } from '../session-context';
import StatusModal from '../status-modal';

interface EducationConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  educationData: {
    serviceType: 'jamb' | 'waec' | 'de';
    variationCode: string;
    phoneNumber: string;
    profileCode?: string;
    quantity: number;
    amount: number;
    examType?: 'utme' | 'de';
  };
}

type PaymentMethod = 'wallet' | 'cashback';

const EducationConfirmationModal: React.FC<EducationConfirmationModalProps> = ({
  isVisible,
  onClose,
  educationData
}) => {
  const [isPinPadVisible, setPinPadVisible] = useState(false);
  const { user, walletBalance, appConfig } = useSession();
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

  const isInsufficientFunds = educationData?.amount > currentBalance;

  // Get service details
  const getServiceDetails = () => {
    switch (educationData.serviceType) {
      case 'jamb':
        return {
          name: 'JAMB',
          fullName: `JAMB ${educationData.examType === 'utme' ? 'UTME' : 'Direct Entry'}`,
          icon: 'school-outline'
        };
      case 'waec':
        return {
          name: 'WAEC',
          fullName: 'WAEC Direct',
          icon: 'school-outline'
        };
      case 'de':
        return {
          name: 'JAMB',
          fullName: 'JAMB Direct Entry',
          icon: 'school-outline'
        };
      default:
        return {
          name: 'Education',
          fullName: 'Education Service',
          icon: 'school-outline'
        };
    }
  };

  const serviceDetails = getServiceDetails();

  const handleProcessRequest = async () => {
    setLoadingText('Processing...');
    
    // Prepare payload according to backend requirements
    const payload = {
      channel: 'education',
      service_type: educationData.serviceType,
      variation_code: educationData.variationCode,
      phone: educationData.phoneNumber,
      quantity: educationData.quantity,
      payment_method: selectedPaymentMethod,
      amount: educationData.amount,
      ...(educationData.profileCode && { 
        billers_code: educationData.profileCode,
        profile_id: educationData.profileCode 
      })
    };

    await processTransaction(payload, {
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
        title={`${serviceDetails.fullName} Registration`}
      >
        {isPending && (
          <LoadingSpinner isPending={isPending} />
        )}
        <ScrollView className="flex-1">
          <View className="flex flex-col gap-4 w-full">
            
            {/* Transaction Details */}
            <View className="p-4 bg-secondary rounded-xl mb-4 w-full">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Service</Text>
                <View className="flex-row items-center">
                  <Ionicons 
                    name={serviceDetails.icon as any} 
                    size={18} 
                    color={colors.primary} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text className="text-foreground font-semibold text-sm sm:text-base">
                    {serviceDetails.fullName}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Phone Number</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">
                  {educationData.phoneNumber}
                </Text>
              </View>
              
              {educationData.profileCode && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground text-sm sm:text-base">Profile Code</Text>
                  <Text className="text-foreground font-semibold text-sm sm:text-base">
                    {educationData.profileCode}
                  </Text>
                </View>
              )}
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted-foreground text-sm sm:text-base">Quantity</Text>
                <Text className="text-foreground font-semibold text-sm sm:text-base">
                  {educationData.quantity}
                </Text>
              </View>
              
              {educationData.serviceType === 'jamb' && educationData.examType && (
                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted-foreground text-sm sm:text-base">Exam Type</Text>
                  <Text className="text-foreground font-semibold text-sm sm:text-base">
                    {educationData.examType.toUpperCase()}
                  </Text>
                </View>
              )}
              
              <View className="border-t border-border mt-2 pt-2">
                <View className="flex-row justify-between">
                  <Text className="text-foreground font-bold text-base sm:text-lg">Total Amount</Text>
                  <Text className="text-foreground font-bold text-base sm:text-lg">
                    {formatNigerianNaira(educationData.amount)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Payment Method Selection */}
            <Text className="text-foreground font-semibold text-base mb-2">Select Payment Method</Text>

            {/* Wallet Payment Option */}
            <TouchableOpacity 
              disabled={(walletBalance?.balance || 0) < educationData.amount} 
              activeOpacity={0.7} 
              className={`bg-primary/10 rounded-xl p-3 sm:p-4 flex-row justify-between items-center
                ${selectedPaymentMethod === 'wallet' ? 'border border-primary' : ''} 
                ${((walletBalance?.balance || 0) < educationData.amount) ? ' bg-red-500/10' : ''}`}
              onPress={() => setSelectedPaymentMethod('wallet')}
            >
              <View className="flex-row items-center">
                <Ionicons name="wallet-outline" size={20} color={colors.primary} />
                <View className="ml-3">
                  <Text className="text-foreground font-semibold text-sm sm:text-base">
                    Wallet Balance
                  </Text>
                  <Text className="text-foreground font-bold text-base sm:text-lg">
                    {formatNigerianNaira(walletBalance?.balance || 0)}
                  </Text>
                  {(walletBalance?.balance || 0) < educationData.amount && (
                    <Text className="text-destructive text-xs">Insufficient funds</Text>
                  )}
                </View>
              </View>
              {selectedPaymentMethod === 'wallet' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>

            {/* Cashback Payment Option */}
            {walletBalance?.cashback_balance !== undefined && walletBalance?.cashback_balance > 0 && (
              <TouchableOpacity 
                disabled={(walletBalance?.cashback_balance || 0) < educationData.amount} 
                activeOpacity={0.7} 
                className={`bg-primary/10 rounded-xl p-3 sm:p-4 flex-row justify-between items-center mb-2 
                  ${selectedPaymentMethod === 'cashback' ? 'border border-primary' : ''} 
                  ${((walletBalance?.cashback_balance || 0) < educationData.amount) ? ' bg-red-500/10' : ''}`}
                onPress={() => setSelectedPaymentMethod('cashback')}
              >
                <View className="flex-row items-center">
                  <Ionicons name="gift-outline" size={20} color={colors.primary} />
                  <View className="ml-3">
                    <Text className="text-foreground font-semibold text-sm sm:text-base">
                      Cashback Balance
                    </Text>
                    <Text className="text-foreground font-bold text-base sm:text-lg">
                      {formatNigerianNaira(walletBalance?.cashback_balance || 0)}
                    </Text>
                    {(walletBalance?.cashback_balance || 0) < educationData.amount && (
                      <Text className="text-destructive text-xs">Insufficient funds</Text>
                    )}
                  </View>
                </View>
                {selectedPaymentMethod === 'cashback' && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
              </TouchableOpacity>
            )}

            {/* Proceed Button */}
            <TouchableOpacity
              className="rounded-2xl py-4 overflow-hidden bg-primary flex flex-row items-center justify-center gap-x-1 mb-4"
              onPress={handleProceed}
              activeOpacity={0.5}
              disabled={!user || isInsufficientFunds} 
              style = {{
                experimental_backgroundImage: 'linear-gradient(to right, ' + colors.primary + ', ' + colors.destructive + ')',
              }}
            >
              {!user && <Ionicons size={18} name='log-in-outline' color={'white'} />}
              <Text className="text-primary-foreground text-base sm:text-lg font-bold">
                {!user ? 'Login to Continue' : isInsufficientFunds ? 'Insufficient Funds' : 'Proceed with Payment'}
              </Text>
            </TouchableOpacity>

            {/* Information Note */}
            <View className="bg-muted/30 rounded-xl p-4 hidden">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={16} color={colors.primary} />
                <Text className="text-sm font-semibold text-foreground ml-2">Important Information</Text>
              </View>
              <Text className="text-xs text-muted-foreground leading-4">
                • Ensure all information is correct before payment{'\n'}
                • {educationData.serviceType === 'jamb' ? 'JAMB profile code is required for registration' : 'WAEC registration will be processed instantly'}{'\n'}
                • You'll receive confirmation via SMS and email{'\n'}
                • Transaction is non-refundable once processed
              </Text>
            </View>
          </View>
        </ScrollView>
      </BottomSheet>

      <PinPad
        isVisible={isPinPadVisible}
        onClose={() => setPinPadVisible(false)}
        handler={handlePinSubmit}
        title="Confirm Transaction"
        description="Enter your 4-digit PIN to complete the education service payment."
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

export default EducationConfirmationModal;
