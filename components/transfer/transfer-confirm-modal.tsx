import BottomSheet from '@/components/ui/bottom-sheet';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { TransferRecipient } from '@/services/api';
import { QUERY_KEYS, useInitiateTransfer, useVerifyPin } from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import PinPad from '../pin-pad';
import { useSession } from '../session-context';
import TransferStatusModal from './transfer-status-modal';

interface TransferConfirmModalProps {
  isVisible: boolean;
  onClose: () => void;
  recipient: TransferRecipient | null;
  amount: number;
  description?: string;
  onSuccess: () => void;
}

type PaymentMethod = 'wallet' | 'cashback';

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const TransferConfirmModal: React.FC<TransferConfirmModalProps> = ({
  isVisible,
  onClose,
  recipient,
  amount,
  description,
  onSuccess,
}) => {
  const [isPinPadVisible, setPinPadVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const { user, walletBalance } = useSession();
  const { authenticate, isBiometricEnabled } = useLocalAuth();

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];
  const [loadingText, setLoadingText] = useState('');

  const queryClient = useQueryClient();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('wallet');

  const { mutateAsync: initiateTransfer, isPending } = useInitiateTransfer();
  const { mutateAsync: verifyPin } = useVerifyPin();

  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [transferResult, setTransferResult] = useState<{
    status: 'success' | 'error' | 'pending';
    transactionId?: string;
    balanceAfter?: number;
    error?: string;
  } | null>(null);

  const currentBalance =
    selectedPaymentMethod === 'wallet'
      ? walletBalance?.balance || 0
      : walletBalance?.cashback_balance || 0;

  const isInsufficientFunds = amount > currentBalance;

  const handleProcessTransfer = async () => {
    if (!recipient) return;

    setLoadingText('Processing transfer...');

    const payload = {
      recipient_id: recipient.id,
      amount,
      ...(description && { description }),
    };

    await initiateTransfer(payload, {
      onSuccess: (data) => {
        if (data?.error) {
          setTransferResult({
            status: 'error',
            error: data.message || 'Transfer failed',
          });
        } else {
          setTransferResult({
            status: 'success',
            transactionId: data?.data?.transaction_id,
            balanceAfter: data?.data?.balance_after,
          });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getTransferLimits] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getRecentTransferRecipients] });
        }
        onClose();
        setPinPadVisible(false);
        setOpenStatusModal(true);
      },
      onError: (error) => {
        console.error(error?.message);
        setTransferResult({
          status: 'error',
          error: error?.message || 'An unexpected error occurred',
        });
        onClose();
        setPinPadVisible(false);
        setOpenStatusModal(true);
      },
    });
  };

  const handlePinSubmit = async (pin: string) => {
    setLoadingText('Verifying PIN...');
    const pinRequest = await verifyPin({ pin });

    if (pinRequest.data?.is_valid) {
      setLoadingText('Verified.');
      await handleProcessTransfer();
      return true;
    } else {
      setLoadingText('PIN verification failed.');
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
      Alert.alert(
        'Insufficient Funds',
        `You do not have enough funds in your ${paymentMethodName} to complete this transfer.`
      );
      return;
    }

    if (isBiometricEnabled) {
      try {
        const authenticated = await authenticate();
        if (authenticated) {
          // Biometric auth succeeded, process transfer directly
          await handleProcessTransfer();
        } else {
          // Biometric failed or cancelled, fallback to PIN
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

  const handleStatusModalClose = () => {
    setOpenStatusModal(false);
    if (transferResult?.status === 'success') {
      onSuccess();
    }
  };

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={onClose}
        title="Confirm Transfer"
      >
        {isPending && <LoadingSpinner isPending={isPending} />}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex flex-col gap-4 w-full py-2">
            {/* Header with recipient info */}
            <View className="items-center mb-2">
              {recipient?.avatar ? (
                <View className="w-16 h-16 rounded-2xl overflow-hidden">
                  <Image
                    source={{ uri: recipient.avatar }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View
                  className="w-16 h-16 rounded-full items-center justify-center bg-primary/20"
                >
                  <Text className="text-white font-bold text-xl">
                    {recipient ? getInitials(recipient.full_name) : '?'}
                  </Text>
                </View>
              )}
              <View className="flex-row items-center mt-3">
                <Text className="text-foreground font-bold text-lg">
                  {recipient?.full_name}
                </Text>
                {recipient?.is_verified && (
                  <View className="ml-2 bg-blue-500 rounded-full p-0.5">
                    <Ionicons name="shield-checkmark" size={12} color="white" />
                  </View>
                )}
              </View>
              <Text className="text-muted-foreground text-sm">
                {formatNigerianNaira(amount)}
              </Text>
            </View>

            {/* Collapsible Details Section */}
            <TouchableOpacity
              onPress={() => setShowDetails(!showDetails)}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-4 bg-secondary/50 rounded-xl"
            >
              <View className="flex-row items-center">
                <Ionicons name="receipt-outline" size={18} color={colors.primary} />
                <Text className="text-foreground font-semibold ml-2">Transfer Details</Text>
              </View>
              <Ionicons
                name={showDetails ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>

            {showDetails && (
              <Animated.View entering={FadeIn.duration(200)} className="gap-y-2">
                {/* Recipient */}
                <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                  <Text className="text-muted-foreground text-sm">Recipient</Text>
                  <Text className="text-foreground font-semibold text-sm" numberOfLines={1}>
                    {recipient?.full_name}
                  </Text>
                </View>

                {/* Username */}
                {recipient?.username && (
                  <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                    <Text className="text-muted-foreground text-sm">Username</Text>
                    <Text className="text-foreground font-semibold text-sm">
                      @{recipient.username}
                    </Text>
                  </View>
                )}

                {/* Amount */}
                <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                  <Text className="text-muted-foreground text-sm">Amount</Text>
                  <Text className="text-foreground font-semibold text-sm">
                    {formatNigerianNaira(amount)}
                  </Text>
                </View>

                {/* Fee */}
                <View className="flex-row justify-between p-3 bg-emerald-500/10 rounded-xl">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                    <Text className="text-emerald-600 dark:text-emerald-400 text-sm ml-2">
                      Transaction Fee
                    </Text>
                  </View>
                  <Text className="text-emerald-500 font-semibold text-sm">Free</Text>
                </View>

                {/* Note */}
                {description && (
                  <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                    <Text className="text-muted-foreground text-sm">Note</Text>
                    <Text className="text-foreground font-semibold text-sm flex-1 text-right ml-4" numberOfLines={2}>
                      {description}
                    </Text>
                  </View>
                )}

                {/* Total */}
                <View className="flex-row justify-between p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <Text className="text-foreground font-bold">Total Amount</Text>
                  <Text className="text-primary font-bold text-lg">
                    {formatNigerianNaira(amount)}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Warning */}
            <View className="flex-row items-start p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Ionicons name="warning" size={18} color="#f59e0b" />
              <Text className="text-amber-600 dark:text-amber-400 text-xs ml-2 flex-1">
                This transfer is irreversible. Please confirm the recipient details before proceeding.
              </Text>
            </View>

            {/* Payment Method Selection */}
            <Text className="text-foreground font-semibold text-base mt-2">
              Select Payment Method
            </Text>

            {/* Wallet Payment Option */}
            <TouchableOpacity
              disabled={(walletBalance?.balance || 0) < amount}
              activeOpacity={0.7}
              className={`rounded-xl p-4 flex-row justify-between items-center border ${
                selectedPaymentMethod === 'wallet'
                  ? 'bg-primary/10 border-primary'
                  : 'bg-secondary/30 border-border/30'
              } ${(walletBalance?.balance || 0) < amount ? 'opacity-50' : ''}`}
              onPress={() => setSelectedPaymentMethod('wallet')}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                  <Ionicons name="wallet" size={20} color={colors.primary} />
                </View>
                <View className="ml-3">
                  <Text className="text-foreground font-semibold text-sm">Wallet Balance</Text>
                  <Text className="text-foreground font-bold text-base">
                    {formatNigerianNaira(walletBalance?.balance || 0)}
                  </Text>
                  {(walletBalance?.balance || 0) < amount && (
                    <Text className="text-red-500 text-xs">Insufficient funds</Text>
                  )}
                </View>
              </View>
              {selectedPaymentMethod === 'wallet' && (
                <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Cashback Payment Option */}
            {walletBalance?.cashback_balance !== undefined &&
              walletBalance?.cashback_balance > 0 && (
                <TouchableOpacity
                  disabled={(walletBalance?.cashback_balance || 0) < amount}
                  activeOpacity={0.7}
                  className={`rounded-xl p-4 flex-row justify-between items-center border ${
                    selectedPaymentMethod === 'cashback'
                      ? 'bg-emerald-500/10 border-emerald-500'
                      : 'bg-secondary/30 border-border/30'
                  } ${(walletBalance?.cashback_balance || 0) < amount ? 'opacity-50' : ''}`}
                  onPress={() => setSelectedPaymentMethod('cashback')}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                      <Ionicons name="gift" size={20} color="#10b981" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-foreground font-semibold text-sm">Cashback Balance</Text>
                      <Text className="text-foreground font-bold text-base">
                        {formatNigerianNaira(walletBalance?.cashback_balance || 0)}
                      </Text>
                      {(walletBalance?.cashback_balance || 0) < amount && (
                        <Text className="text-red-500 text-xs">Insufficient funds</Text>
                      )}
                    </View>
                  </View>
                  {selectedPaymentMethod === 'cashback' && (
                    <View className="w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
                      <Ionicons name="checkmark" size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              )}

            {/* Proceed Button */}
            <TouchableOpacity
              className="rounded-2xl overflow-hidden mt-2"
              onPress={handleProceed}
              activeOpacity={0.8}
              disabled={!user || isInsufficientFunds}
            >
              <LinearGradient
                colors={
                  !user || isInsufficientFunds
                    ? ['#9ca3af', '#6b7280']
                    : ['#7c3aed', '#e65bf8']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="py-4 items-center justify-center"
              >
                <View className="flex-row items-center">
                  {!user && <Ionicons size={18} name="log-in-outline" color="white" />}
                  <Text className="text-white font-bold text-lg ml-2">
                    {!user
                      ? 'Login to Continue'
                      : isInsufficientFunds
                      ? 'Insufficient Funds'
                      : `Send ${formatNigerianNaira(amount)}`}
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheet>

      <PinPad
        isVisible={isPinPadVisible}
        onClose={() => setPinPadVisible(false)}
        handler={handlePinSubmit}
        title="Confirm Transfer"
        description={`Enter your 4-digit PIN to send ${formatNigerianNaira(amount)} to ${recipient?.full_name}.`}
        onSuccess={() => {}}
        onError={() => console.error('Error occurred or invalid PIN.')}
        loadingText={loadingText}
        successMessage="Transfer initiated."
      />

      <TransferStatusModal
        isVisible={openStatusModal}
        onClose={handleStatusModalClose}
        status={transferResult?.status || 'pending'}
        amount={amount}
        balanceAfter={transferResult?.balanceAfter}
        transactionId={transferResult?.transactionId}
        recipientName={recipient?.full_name}
        error={transferResult?.error}
      />
    </>
  );
};

export default TransferConfirmModal;
