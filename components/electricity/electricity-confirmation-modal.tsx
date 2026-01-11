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
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import PinPad from '../pin-pad';
import { useSession } from '../session-context';
import ElectricityStatusModal from './electricity-status-modal';
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
    dataBonus?: string | null;
  };
}

type PaymentMethod = 'wallet' | 'cashback';

const ElectricityConfirmationModal: React.FC<ElectricityConfirmationModalProps> = ({
  isVisible,
  onClose,
  electricityData
}) => {
  const [isPinPadVisible, setPinPadVisible] = useState(false);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
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

  // Animation for icon
  const iconScale = useSharedValue(1);
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  React.useEffect(() => {
    if (isVisible) {
      iconScale.value = withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 15 })
      );
    }
  }, [isVisible]);

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
      amount: electricityData.amount,
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
        title="Confirm Purchase"
      >
        {isPending && (
          <LoadingSpinner isPending={isPending} />
        )}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex flex-col gap-4 w-full pb-4">

            {/* Animated Electricity Icon */}
            <View className="items-center py-3">
              <Animated.View style={iconAnimatedStyle}>
                <View className="relative">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                  >
                    <Ionicons name="bulb" size={20} color="white" />
                  </View>
                  {/* Pulse effect */}
                  <Animated.View
                    entering={FadeIn.duration(1000).delay(500)}
                    className="absolute inset-0 rounded-full bg-amber-500/20"
                    style={{ transform: [{ scale: 1.3 }] }}
                  />
                </View>
              </Animated.View>
            </View>

            {/* Amount Display */}
            <View className="items-center">
              <Text className="text-sm text-muted-foreground">You are paying</Text>
              <Text className="text-3xl font-bold text-foreground mt-1">
                {formatNigerianNaira(electricityData.totalAmount)}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                (₦{electricityData.amount.toLocaleString()} + ₦{electricityData.commissionAmount.toLocaleString()} service charge)
              </Text>
            </View>

            {/* Collapsible Details Section */}
            <View className="bg-secondary/30 rounded-2xl overflow-hidden">
              {/* Summary Row - Always visible */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setDetailsExpanded(!detailsExpanded)}
                className="p-4 flex-row items-center justify-between"
              >
                <View className="flex-row items-center gap-x-3 flex-1">
                  <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                    <Ionicons name="person" size={18} color={colors.primary} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground">Customer</Text>
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                      {electricityData.customerInfo?.Customer_Name || 'N/A'}
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name={detailsExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>

              {/* Expandable Details */}
              {detailsExpanded && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  className="px-4 pb-4 gap-y-3 border-t border-border/30 pt-3"
                >
                  {/* Provider */}
                  <View className="flex-row items-center gap-x-3">
                    <View className="w-10 h-10 rounded-xl bg-amber-500/10 items-center justify-center">
                      <Ionicons name="bulb" size={18} color="#f59e0b" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-muted-foreground">Provider</Text>
                      <View className="flex-row items-center gap-x-2">
                        <Text className="text-sm font-semibold text-foreground">{selectedProvider?.name}</Text>
                        {selectedProvider?.thumbnail && (
                          <Image
                            source={{ uri: selectedProvider.thumbnail }}
                            className="w-5 h-5 rounded-full"
                            resizeMode='contain'
                          />
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Meter Number */}
                  <View className="flex-row items-center gap-x-3">
                    <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                      <Ionicons name="keypad" size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-muted-foreground">
                        Meter Number ({electricityData.isPrepaid ? 'Prepaid' : 'Postpaid'})
                      </Text>
                      <Text className="text-sm font-semibold text-foreground font-mono">
                        {electricityData.meterNumber}
                      </Text>
                    </View>
                  </View>

                  {/* Address */}
                  {electricityData.customerInfo?.Address && (
                    <View className="flex-row items-center gap-x-3">
                      <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                        <Ionicons name="location" size={18} color={colors.primary} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-muted-foreground">Address</Text>
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
                          {electricityData.customerInfo.Address}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Phone */}
                  <View className="flex-row items-center gap-x-3">
                    <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                      <Ionicons name="call" size={18} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs text-muted-foreground">Token will be sent to</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {electricityData.phoneNumber}
                      </Text>
                    </View>
                  </View>

                  {/* Data Bonus */}
                  {electricityData.dataBonus && (
                    <View className="flex-row items-center gap-x-3">
                      <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                        <Ionicons name="gift" size={18} color="#10b981" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xs text-muted-foreground">Data Bonus</Text>
                        <Text className="text-sm font-semibold text-emerald-500">
                          +{electricityData.dataBonus}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Outstanding Balance */}
                  {electricityData.customerInfo?.Outstanding > 0 && (
                    <View className="bg-orange-500/10 rounded-xl p-3 flex-row items-center gap-x-2">
                      <Ionicons name="alert-circle" size={16} color="#f59e0b" />
                      <Text className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                        Outstanding: ₦{electricityData.customerInfo.Outstanding.toLocaleString()}
                      </Text>
                    </View>
                  )}
                </Animated.View>
              )}
            </View>

            {/* Payment Method Selection */}
            <View className="gap-y-2">
              <Text className="text-sm font-semibold text-muted-foreground">Payment Method</Text>

              {/* Wallet Option */}
              <TouchableOpacity
                disabled={(walletBalance?.balance || 0) < electricityData.totalAmount}
                activeOpacity={0.7}
                onPress={() => setSelectedPaymentMethod('wallet')}
                className={`flex-row items-center gap-x-3 p-3 rounded-xl border ${
                  selectedPaymentMethod === 'wallet'
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50'
                } ${(walletBalance?.balance || 0) < electricityData.totalAmount ? 'opacity-50' : ''}`}
              >
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <Ionicons name="wallet" size={18} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Wallet Balance</Text>
                  <Text className="text-xs text-muted-foreground">
                    {formatNigerianNaira(walletBalance?.balance || 0)}
                    {(walletBalance?.balance || 0) < electricityData.totalAmount && ' • Insufficient'}
                  </Text>
                </View>
                <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                  selectedPaymentMethod === 'wallet'
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground/30'
                }`}>
                  {selectedPaymentMethod === 'wallet' && (
                    <View className="w-2 h-2 rounded-full bg-white" />
                  )}
                </View>
              </TouchableOpacity>

              {/* Cashback Option */}
              {walletBalance?.cashback_balance !== undefined && walletBalance?.cashback_balance > 0 && (
                <TouchableOpacity
                  disabled={(walletBalance?.cashback_balance || 0) < electricityData.totalAmount}
                  activeOpacity={0.7}
                  onPress={() => setSelectedPaymentMethod('cashback')}
                  className={`flex-row items-center gap-x-3 p-3 rounded-xl border ${
                    selectedPaymentMethod === 'cashback'
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-border/50'
                  } ${(walletBalance?.cashback_balance || 0) < electricityData.totalAmount ? 'opacity-50' : ''}`}
                >
                  <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                    <Ionicons name="gift" size={18} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">Cashback Balance</Text>
                    <Text className="text-xs text-muted-foreground">
                      {formatNigerianNaira(walletBalance?.cashback_balance || 0)}
                      {(walletBalance?.cashback_balance || 0) < electricityData.totalAmount && ' • Insufficient'}
                    </Text>
                  </View>
                  <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    selectedPaymentMethod === 'cashback'
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-muted-foreground/30'
                  }`}>
                    {selectedPaymentMethod === 'cashback' && (
                      <View className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
              className="rounded-2xl overflow-hidden"
              onPress={handleProceed}
              activeOpacity={0.8}
              disabled={!user || isInsufficientFunds}
              style={{ opacity: (!user || isInsufficientFunds) ? 0.5 : 1 }}
            >
              <LinearGradient
                colors={['#f59e0b', '#ef4444', '#ec4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center justify-center"
              >
                <View className="flex-row items-center gap-x-2">
                  {!user && <Ionicons size={18} name='log-in-outline' color={'white'} />}
                  <Text className="text-white text-lg font-bold">
                    {user ? 'Proceed to Pay' : 'Login to Continue'}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Security Note */}
            <Text className="text-center text-xs text-muted-foreground">
              Your transaction is secured with end-to-end encryption
            </Text>
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

      <ElectricityStatusModal
        isVisible={openStatusModal}
        onClose={() => setOpenStatusModal(false)}
        status={transaction?.error ? 'error' : (transaction?.data?.status as 'success' | 'error' | 'pending') || 'pending'}
        amount={transaction?.data?.amount || electricityData.totalAmount}
        token={transaction?.data?.token}
        formattedToken={transaction?.data?.formatted_token}
        dataBonus={electricityData.dataBonus || undefined}
        customerName={electricityData.customerInfo?.Customer_Name}
        meterNumber={electricityData.meterNumber}
        providerName={selectedProvider?.name!}
        error={transaction?.error ? (transaction?.message || 'Transaction failed') : undefined}
      />
    </>
  );
};

export default ElectricityConfirmationModal;
