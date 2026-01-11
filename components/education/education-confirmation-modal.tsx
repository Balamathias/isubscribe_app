import BottomSheet from '@/components/ui/bottom-sheet';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { EducationCard, EducationService } from '@/services/api';
import { QUERY_KEYS, useProcessTransaction, useVerifyPin } from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import PinPad from '../pin-pad';
import { useSession } from '../session-context';
import EducationStatusModal from './education-status-modal';
import { ServiceType } from './service-type-tabs';

interface EducationConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  serviceType: ServiceType;
  service: EducationService | null;
  quantity: number;
  phone: string;
  profileId?: string;
  profileName?: string;
  totalAmount: number;
  basePrice: number;
  dataBonus: number;
  onSuccess: () => void;
}

type PaymentMethod = 'wallet' | 'cashback';

const EducationConfirmationModal: React.FC<EducationConfirmationModalProps> = ({
  isVisible,
  onClose,
  serviceType,
  service,
  quantity,
  phone,
  profileId,
  profileName,
  totalAmount,
  basePrice,
  dataBonus,
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

  const { mutateAsync: processTransaction, isPending, data: transaction } = useProcessTransaction();
  const { mutateAsync: verifyPin, isPending: verifyingPin } = useVerifyPin();

  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [purchaseResult, setPurchaseResult] = useState<{
    status: 'success' | 'error' | 'pending';
    pins?: string[];
    cards?: EducationCard[];
    error?: string;
  } | null>(null);

  const currentBalance =
    selectedPaymentMethod === 'wallet'
      ? walletBalance?.balance || 0
      : walletBalance?.cashback_balance || 0;

  const isInsufficientFunds = totalAmount > currentBalance;

  // Get service type label
  const getServiceTypeLabel = () => {
    switch (serviceType) {
      case 'jamb':
        return 'JAMB';
      case 'waec':
        return 'WAEC';
      case 'de':
        return 'Direct Entry';
    }
  };

  const handleProcessRequest = async () => {
    if (!service) return;

    setLoadingText('Processing...');

    const payload = {
      channel: 'education',
      service_type: serviceType,
      variation_code: service.variation_code,
      phone,
      quantity,
      payment_method: selectedPaymentMethod,
      amount: totalAmount,
      ...(profileId && {
        billers_code: profileId,
        profile_id: profileId,
      }),
    };

    await processTransaction(payload, {
      onSuccess: (data) => {
        if (data?.error) {
          setPurchaseResult({
            status: 'error',
            error: data.message || 'Transaction failed',
          });
        } else {
          setPurchaseResult({
            status: 'success',
            pins: data?.data?.pins,
            cards: data?.data?.cards,
          });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
          queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
        }
        onClose();
        setPinPadVisible(false);
        setOpenStatusModal(true);
      },
      onError: (error) => {
        console.error(error?.message);
        setPurchaseResult({
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
      Alert.alert(
        'Insufficient Funds',
        `You do not have enough funds in your ${paymentMethodName} to complete this transaction.`
      );
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

  const handleStatusModalClose = () => {
    setOpenStatusModal(false);
    if (purchaseResult?.status === 'success') {
      onSuccess();
    }
  };

  return (
    <>
      <BottomSheet
        isVisible={isVisible}
        onClose={onClose}
        title={`Confirm ${getServiceTypeLabel()} Purchase`}
      >
        {isPending && <LoadingSpinner isPending={isPending} />}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="flex flex-col gap-4 w-full py-2">
            {/* Header with gradient icon */}
            <View className="items-center mb-2">
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-16 h-16 rounded-2xl items-center justify-center"
              >
                <Ionicons name="school" size={32} color="white" />
              </LinearGradient>
              <Text className="text-foreground font-bold text-lg mt-3">
                {service?.name || service?.variation_code}
              </Text>
              <Text className="text-muted-foreground text-sm">
                {quantity} {quantity === 1 ? 'PIN' : 'PINs'} • {getServiceTypeLabel()}
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
                <Text className="text-foreground font-semibold ml-2">Transaction Details</Text>
              </View>
              <Ionicons
                name={showDetails ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>

            {showDetails && (
              <Animated.View entering={FadeIn.duration(200)} className="space-y-2">
                {/* Service */}
                <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                  <Text className="text-muted-foreground text-sm">Service</Text>
                  <Text className="text-foreground font-semibold text-sm">
                    {getServiceTypeLabel()}
                  </Text>
                </View>

                {/* Phone */}
                <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                  <Text className="text-muted-foreground text-sm">Phone Number</Text>
                  <Text className="text-foreground font-mono font-semibold text-sm">{phone}</Text>
                </View>

                {/* Profile ID (JAMB/DE) */}
                {profileId && (
                  <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                    <Text className="text-muted-foreground text-sm">Profile ID</Text>
                    <Text className="text-foreground font-mono font-semibold text-sm">
                      {profileId}
                    </Text>
                  </View>
                )}

                {/* Profile Name */}
                {profileName && (
                  <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                    <Text className="text-muted-foreground text-sm">Profile Name</Text>
                    <Text className="text-foreground font-semibold text-sm" numberOfLines={1}>
                      {profileName}
                    </Text>
                  </View>
                )}

                {/* Quantity */}
                <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                  <Text className="text-muted-foreground text-sm">Quantity</Text>
                  <Text className="text-foreground font-semibold text-sm">
                    {quantity} {quantity === 1 ? 'PIN' : 'PINs'}
                  </Text>
                </View>

                {/* Price per PIN */}
                <View className="flex-row justify-between p-3 bg-secondary/30 rounded-xl">
                  <Text className="text-muted-foreground text-sm">Price per PIN</Text>
                  <Text className="text-foreground font-semibold text-sm">
                    {formatNigerianNaira(basePrice)}
                  </Text>
                </View>

                {/* Data Bonus */}
                {dataBonus > 0 && (
                  <View className="flex-row justify-between p-3 bg-emerald-500/10 rounded-xl">
                    <View className="flex-row items-center">
                      <Ionicons name="gift" size={14} color="#10b981" />
                      <Text className="text-emerald-600 dark:text-emerald-400 text-sm ml-2">
                        Data Bonus
                      </Text>
                    </View>
                    <Text className="text-emerald-500 font-semibold text-sm">
                      +{(dataBonus / 1000).toFixed(1)}MB
                    </Text>
                  </View>
                )}

                {/* Total */}
                <View className="flex-row justify-between p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <Text className="text-foreground font-bold">Total Amount</Text>
                  <Text className="text-blue-500 font-bold text-lg">
                    {formatNigerianNaira(totalAmount)}
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* Payment Method Selection */}
            <Text className="text-foreground font-semibold text-base mt-2">
              Select Payment Method
            </Text>

            {/* Wallet Payment Option */}
            <TouchableOpacity
              disabled={(walletBalance?.balance || 0) < totalAmount}
              activeOpacity={0.7}
              className={`rounded-xl p-4 flex-row justify-between items-center border ${
                selectedPaymentMethod === 'wallet'
                  ? 'bg-blue-500/10 border-blue-500'
                  : 'bg-secondary/30 border-border/30'
              } ${(walletBalance?.balance || 0) < totalAmount ? 'opacity-50' : ''}`}
              onPress={() => setSelectedPaymentMethod('wallet')}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center">
                  <Ionicons name="wallet" size={20} color="#3b82f6" />
                </View>
                <View className="ml-3">
                  <Text className="text-foreground font-semibold text-sm">Wallet Balance</Text>
                  <Text className="text-foreground font-bold text-base">
                    {formatNigerianNaira(walletBalance?.balance || 0)}
                  </Text>
                  {(walletBalance?.balance || 0) < totalAmount && (
                    <Text className="text-red-500 text-xs">Insufficient funds</Text>
                  )}
                </View>
              </View>
              {selectedPaymentMethod === 'wallet' && (
                <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
                  <Ionicons name="checkmark" size={14} color="white" />
                </View>
              )}
            </TouchableOpacity>

            {/* Cashback Payment Option */}
            {walletBalance?.cashback_balance !== undefined &&
              walletBalance?.cashback_balance > 0 && (
                <TouchableOpacity
                  disabled={(walletBalance?.cashback_balance || 0) < totalAmount}
                  activeOpacity={0.7}
                  className={`rounded-xl p-4 flex-row justify-between items-center border ${
                    selectedPaymentMethod === 'cashback'
                      ? 'bg-emerald-500/10 border-emerald-500'
                      : 'bg-secondary/30 border-border/30'
                  } ${(walletBalance?.cashback_balance || 0) < totalAmount ? 'opacity-50' : ''}`}
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
                      {(walletBalance?.cashback_balance || 0) < totalAmount && (
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
                    : ['#3b82f6', '#8b5cf6', '#a855f7']
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
                      : `Pay ${formatNigerianNaira(totalAmount)}`}
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
        title="Confirm Transaction"
        description={`Enter your 4-digit PIN to complete the ${getServiceTypeLabel()} purchase.`}
        onSuccess={async () => await handleProcessRequest()}
        onError={() => console.error('Error occurred or invalid PIN.')}
        loadingText={loadingText}
        successMessage="Pin Verified."
      />

      <EducationStatusModal
        isVisible={openStatusModal}
        onClose={handleStatusModalClose}
        status={purchaseResult?.status || 'pending'}
        serviceType={serviceType}
        serviceName={service?.name || service?.variation_code}
        quantity={quantity}
        amount={totalAmount}
        pins={purchaseResult?.pins}
        cards={purchaseResult?.cards}
        dataBonus={dataBonus}
        phone={phone}
        error={purchaseResult?.error}
      />
    </>
  );
};

export default EducationConfirmationModal;
