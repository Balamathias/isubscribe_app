import BottomSheet from '@/components/ui/bottom-sheet';
import LoadingSpinner from '@/components/ui/loading-spinner';
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
import { Alert, Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import PinPad from '../pin-pad';
import { useSession } from '../session-context';
import StatusModal from '../status-modal';
import { networks } from './buy-data';

interface DataBundleDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedBundleDetails: SuperPlansMB;
  onSubmit: () => void;
  networkId: string;
  phoneNumber: string;
  category: string;
}

type PaymentMethod = 'wallet' | 'cashback';

const DataBundleDetailsModal: React.FC<DataBundleDetailsModalProps> = ({
  isVisible,
  onClose,
  selectedBundleDetails,
  onSubmit,
  networkId,
  phoneNumber,
  category,
}) => {
  const [isPinPadVisible, setPinPadVisible] = useState(false);
  const { user, walletBalance } = useSession();
  const { authenticate, isBiometricEnabled } = useLocalAuth();
  const { use_bonus } = useLocalSearchParams();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];
  const [loadingText, setLoadingText] = useState('');

  const queryClient = useQueryClient();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(
    use_bonus === 'true' ? 'cashback' : 'wallet'
  );

  const { mutateAsync: processTransaction, isPending, data: transaction } = useProcessTransaction();
  const { mutateAsync: verifyPin } = useVerifyPin();

  const [openStatusModal, setOpenStatusModal] = useState(false);

  const network = networks.find((n) => n.id === networkId);
  const currentBalance =
    selectedPaymentMethod === 'wallet' ? walletBalance?.balance || 0 : walletBalance?.cashback_balance || 0;
  const isInsufficientFunds = selectedBundleDetails?.price > currentBalance;
  const hasDataBonus = selectedBundleDetails?.data_bonus && selectedBundleDetails.data_bonus !== '0MB';
  const hasCashback = walletBalance?.cashback_balance !== undefined && walletBalance.cashback_balance > 0;

  const handleProcessRequest = async () => {
    setLoadingText('Processing...');
    await processTransaction(
      {
        channel: 'data_bundle',
        plan_id: selectedBundleDetails?.id,
        category: category,
        payment_method: selectedPaymentMethod,
        phone: phoneNumber,
      },
      {
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
          onClose();
          setPinPadVisible(false);
          Alert.alert('Transaction Error', error?.message || 'An unexpected error occurred.');
        },
      }
    );
  };

  const handlePinSubmit = async (pin: string) => {
    setLoadingText('Verifying PIN...');
    const pinRequest = await verifyPin({ pin });

    if (pinRequest.data?.is_valid) {
      setLoadingText('Verified.');
      return true;
    } else {
      setLoadingText('PIN verification failed.');
      return false;
    }
  };

  const handleProceed = () => {
    if (!user) {
      router.push(`/auth/login`);
      return;
    }

    if (isInsufficientFunds) {
      router.push(`/accounts`);
      return;
    }

    if (isBiometricEnabled) {
      authenticate(() => setPinPadVisible(true))
        .then((authenticated) => {
          if (authenticated) {
            handleProcessRequest();
          } else {
            setPinPadVisible(true);
          }
        })
        .catch(() => {
          setPinPadVisible(true);
        });
    } else {
      setPinPadVisible(true);
    }
  };

  return (
    <>
      <BottomSheet isVisible={isVisible && !isPinPadVisible} onClose={onClose} title="Confirm Purchase">
        {isPending && <LoadingSpinner isPending={isPending} />}

        <View className="py-1">
          {/* Compact Header */}
          <View className="flex-row items-center mb-3">
            <View
              className="w-11 h-11 rounded-full items-center justify-center mr-3"
              style={{ backgroundColor: '#fff' }}
            >
              <Image source={network?.logo} style={{ width: 28, height: 28 }} resizeMode="contain" className='rounded-full' />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                {selectedBundleDetails?.quantity}
              </Text>
              <Text
                className="text-xs"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
              >
                {network?.name} • {selectedBundleDetails?.duration}
              </Text>
            </View>
            <Text className="font-bold text-base" style={{ color: colors.primary }}>
              {use_bonus === 'true'
                ? selectedBundleDetails?.data_bonus_price
                : formatNigerianNaira(selectedBundleDetails?.price)?.split('.')[0]}
            </Text>
          </View>

          {/* Compact Details */}
          <View
            className="rounded-xl px-3 py-2 mb-3"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
                Phone
              </Text>
              <Text className="font-semibold text-xs" style={{ color: isDark ? '#fff' : '#111' }}>
                {phoneNumber}
              </Text>
            </View>
            <View className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
                Plan
              </Text>
              <Text className="font-semibold text-xs text-right flex-1 ml-4" style={{ color: isDark ? '#fff' : '#111' }} numberOfLines={1}>
                {selectedBundleDetails?.name}
              </Text>
            </View>
            <View className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} />
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
                Duration
              </Text>
              <Text className="font-semibold text-xs" style={{ color: isDark ? '#fff' : '#111' }}>
                {selectedBundleDetails?.duration}
              </Text>
            </View>
            {hasDataBonus && (
              <>
                <View className="h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} />
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
                    Bonus
                  </Text>
                  <Text className="font-semibold text-xs" style={{ color: '#22c55e' }}>
                    +{selectedBundleDetails?.data_bonus}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Payment Methods - Stacked */}
          <View className="gap-y-2 mb-3">
            {/* Wallet Option */}
            <TouchableOpacity
              disabled={(walletBalance?.balance || 0) < selectedBundleDetails?.price}
              activeOpacity={0.85}
              onPress={() => setSelectedPaymentMethod('wallet')}
              className="rounded-xl p-3 flex-row justify-between items-center"
              style={{
                backgroundColor:
                  (walletBalance?.balance || 0) < selectedBundleDetails?.price
                    ? 'rgba(239,68,68,0.08)'
                    : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                borderWidth: 1.5,
                borderColor:
                  selectedPaymentMethod === 'wallet'
                    ? colors.primary
                    : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-lg items-center justify-center bg-primary/15">
                  <Ionicons name="wallet" size={18} color={colors.primary} />
                </View>
                <View className="ml-2.5">
                  <View className="flex-row items-center">
                    <Text className="font-semibold text-xs" style={{ color: isDark ? '#fff' : '#111' }}>Wallet</Text>
                    <Text className="text-[10px] ml-1.5" style={{ color: (walletBalance?.balance || 0) < selectedBundleDetails?.price ? '#ef4444' : '#22c55e' }}>
                      {(walletBalance?.balance || 0) < selectedBundleDetails?.price ? '• Insufficient' : '• Available'}
                    </Text>
                  </View>
                  <Text className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                    {formatNigerianNaira(user ? walletBalance?.balance || 0 : 0).split('.')[0]}
                  </Text>
                </View>
              </View>
              {selectedPaymentMethod === 'wallet' && (
                <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                  <Ionicons name="checkmark" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Cashback Option */}
            {hasCashback && (
              <TouchableOpacity
                disabled={(walletBalance?.cashback_balance || 0) < selectedBundleDetails?.price}
                activeOpacity={0.85}
                onPress={() => setSelectedPaymentMethod('cashback')}
                className="rounded-xl p-3 flex-row justify-between items-center"
                style={{
                  backgroundColor:
                    (walletBalance?.cashback_balance || 0) < selectedBundleDetails?.price
                      ? 'rgba(239,68,68,0.08)'
                      : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderWidth: 1.5,
                  borderColor:
                    selectedPaymentMethod === 'cashback'
                      ? '#22c55e'
                      : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }}
              >
                <View className="flex-row items-center">
                  <View className="w-9 h-9 rounded-lg items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                    <Ionicons name="gift" size={18} color="#22c55e" />
                  </View>
                  <View className="ml-2.5">
                    <View className="flex-row items-center">
                      <Text className="font-semibold text-xs" style={{ color: isDark ? '#fff' : '#111' }}>Data Bonus</Text>
                      <Text className="text-[10px] ml-1.5" style={{ color: (walletBalance?.cashback_balance || 0) < selectedBundleDetails?.price ? '#ef4444' : '#22c55e' }}>
                        {(walletBalance?.cashback_balance || 0) < selectedBundleDetails?.price ? '• Insufficient' : '• Available'}
                      </Text>
                    </View>
                    <Text className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                      {walletBalance?.data_bonus || formatNigerianNaira(walletBalance?.cashback_balance || 0).split('.')[0]}
                    </Text>
                  </View>
                </View>
                {selectedPaymentMethod === 'cashback' && (
                  <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: '#22c55e' }}>
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Proceed Button */}
          <TouchableOpacity
            onPress={handleProceed}
            disabled={isPending}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isInsufficientFunds && user
                  ? ['#f59e0b', '#ea580c']
                  : [colors.primary, '#a855f7']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!user && <Ionicons size={16} name="log-in-outline" color="white" />}
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14, marginLeft: 4 }}>
                {!user ? 'Login to Continue' : isInsufficientFunds ? 'Fund Wallet' : 'Proceed'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </BottomSheet>

      <PinPad
        isVisible={isPinPadVisible}
        onClose={() => setPinPadVisible(false)}
        handler={handlePinSubmit}
        title="Confirm Transaction"
        description={`Enter your 4-digit PIN to buy ${selectedBundleDetails?.quantity} data.`}
        onSuccess={async () => await handleProcessRequest()}
        onError={() => { }}
        loadingText={loadingText}
        successMessage="PIN Verified."
      />

      <StatusModal
        amount={transaction?.data?.amount || 0}
        quantity={(transaction?.data as any)?.quantity}
        data_bonus={(transaction?.data as any)?.data_bonus}
        status={transaction?.error ? 'error' : (transaction?.data?.status as any)}
        isVisible={openStatusModal}
        description={transaction?.data?.description || transaction?.message || ''}
        actionText={transaction?.error ? 'Done' : 'View Receipt'}
        onAction={
          transaction?.error
            ? undefined
            : () => {
              router.push({
                pathname: '/transactions/[id]',
                params: { id: String(transaction?.data?.id) },
              });
            }
        }
        onClose={() => {
          setOpenStatusModal(false);
        }}
      />
    </>
  );
};

export default DataBundleDetailsModal;