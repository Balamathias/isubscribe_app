import BottomSheet from '@/components/ui/bottom-sheet';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { COLORS } from '@/constants/colors';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { QUERY_KEYS, useProcessTransaction, useVerifyPin } from '@/services/api-hooks';
import { formatDataAmount } from '@/utils';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import PinPad from '../pin-pad';
import { useSession } from '../session-context';
import StatusModal from '../status-modal';
import { networks } from './buy-airtime';

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
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];
  const [loadingText, setLoadingText] = useState<string>('');

  const queryClient = useQueryClient();
  const { authenticate, isBiometricEnabled } = useLocalAuth();

  const { user, walletBalance } = useSession();
  const { mutateAsync: processTransaction, isPending, data: transaction } = useProcessTransaction();
  const { mutateAsync: verifyPin, isPending: verifyingPin } = useVerifyPin();

  const [openStatusModal, setOpenStatusModal] = useState(false);

  const network = networks.find((n) => n.id === networkId);
  const insufficientFunds = (walletBalance?.balance || 0) < selectedPlan?.price;
  const dataBonus = formatDataAmount(selectedPlan?.price * 0.01);

  const handleProcessRequest = async () => {
    setLoadingText('Processing...');
    await processTransaction(
      {
        channel: 'airtime',
        amount: selectedPlan?.price,
        network: networkId,
        payment_method: 'wallet',
        phone: phoneNumber,
      },
      {
        onSuccess: (data) => {
          if (!data?.error) {
            setOpenStatusModal(true);
            onClose();
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getWalletBalance] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getLatestTransactions] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.getBeneficiaries] });
          } else {
            setOpenStatusModal(true);
            onClose();
            setPinPadVisible(false);
          }
        },
        onError: (error) => {
          setOpenStatusModal(false);
          onClose();
          setPinPadVisible(false);
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

  const handleProceed = async () => {
    if (!user) {
      router.push(`/auth/login`);
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
      } catch {
        setPinPadVisible(true);
      }
    } else {
      setPinPadVisible(true);
    }
  };

  if (!selectedPlan) {
    return null;
  }

  return (
    <>
      <BottomSheet isVisible={isVisible} onClose={onClose} title="Confirm Purchase">
        {(verifyingPin || isPending) && <LoadingSpinner isPending={verifyingPin || isPending} />}

        <View className="py-2">
          {/* Header with Network Logo */}
          <View className="items-center mb-5">
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-3"
              style={{ backgroundColor: '#fff' }}
            >
              <Image source={network?.logo} style={{ width: 40, height: 40 }} resizeMode="contain" className="rounded-full" />
            </View>
            <Text className="text-2xl font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
              {formatNigerianNaira(selectedPlan?.price).split('.')[0]}
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
            >
              {network?.name} Airtime
            </Text>
          </View>

          {/* Details Card */}
          <View
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            {/* Phone Number */}
            <View className="flex-row justify-between items-center py-3">
              <Text
                className="text-sm"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
              >
                Phone Number
              </Text>
              <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                {phoneNumber}
              </Text>
            </View>

            <View
              className="h-px"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
            />

            {/* Amount */}
            <View className="flex-row justify-between items-center py-3">
              <Text
                className="text-sm"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
              >
                Amount
              </Text>
              <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                {formatNigerianNaira(selectedPlan?.price)}
              </Text>
            </View>

            <View
              className="h-px"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
            />

            {/* Data Bonus */}
            <View className="flex-row justify-between items-center py-3">
              <Text
                className="text-sm"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
              >
                Data Bonus
              </Text>
              <View className="flex-row items-center">
                <View
                  className="px-2 py-0.5 rounded-full mr-1"
                  style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: '#22c55e' }}>
                    FREE
                  </Text>
                </View>
                <Text className="font-semibold text-sm" style={{ color: '#22c55e' }}>
                  +{dataBonus}
                </Text>
              </View>
            </View>
          </View>

          {/* Wallet Balance Card */}
          <TouchableOpacity
            disabled={insufficientFunds}
            activeOpacity={0.85}
            className="rounded-2xl p-4 mb-4 flex-row justify-between items-center"
            style={{
              backgroundColor: insufficientFunds
                ? 'rgba(239,68,68,0.08)'
                : isDark
                  ? 'rgba(255,255,255,0.03)'
                  : 'rgba(0,0,0,0.02)',
              borderWidth: 1,
              borderColor: insufficientFunds
                ? 'rgba(239,68,68,0.2)'
                : colors.primary + '40',
            }}
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl items-center justify-center bg-primary/15">
                <Ionicons name="wallet" size={20} color={colors.primary} />
              </View>
              <View className="ml-3">
                <View className="flex-row items-center">
                  <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                    Wallet
                  </Text>
                  <Text
                    className="text-xs ml-2"
                    style={{
                      color: insufficientFunds ? '#ef4444' : '#22c55e',
                    }}
                  >
                    {insufficientFunds ? '• Insufficient' : '• Selected'}
                  </Text>
                </View>
                <Text className="font-bold text-lg" style={{ color: isDark ? '#fff' : '#111' }}>
                  {formatNigerianNaira(user ? walletBalance?.balance || 0 : 0)}
                </Text>
              </View>
            </View>
            <View
              className="w-6 h-6 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          {/* Proceed Button */}
          <TouchableOpacity
            className="rounded-2xl overflow-hidden"
            onPress={handleProceed}
            activeOpacity={0.9}
            disabled={insufficientFunds && !!user}
          >
            <LinearGradient
              colors={
                insufficientFunds && user
                  ? isDark
                    ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']
                    : ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.08)']
                  : [colors.primary, '#a855f7']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 flex-row items-center justify-center"
            >
              {!user && <Ionicons size={18} name="log-in-outline" color="white" />}
              <Text
                className="font-bold text-base ml-1"
                style={{
                  color:
                    insufficientFunds && user
                      ? isDark
                        ? 'rgba(255,255,255,0.4)'
                        : 'rgba(0,0,0,0.3)'
                      : '#fff',
                }}
              >
                {!user ? 'Login to Continue' : insufficientFunds ? 'Insufficient Balance' : 'Proceed'}
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
        description={`Enter your 4-digit PIN to buy ${formatNigerianNaira(selectedPlan?.price)} airtime.`}
        onSuccess={async () => await handleProcessRequest()}
        onError={() => { }}
        loadingText={loadingText}
        successMessage="PIN Verified."
      />

      <StatusModal
        amount={transaction?.data?.amount || 0}
        status={transaction?.error ? 'error' : (transaction?.data?.status as any)}
        data_bonus={(transaction?.data as any)?.data_bonus}
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
          onClose();
          setOpenStatusModal(false);
        }}
      />
    </>
  );
};

export default AirtimeDetailsModal;