import { COLORS } from '@/constants/colors';
import { useThemedColors } from '@/hooks/useThemedColors';
import { RecentTransferRecipient, TransferRecipient } from '@/services/api';
import {
  useGetRecentTransferRecipients,
  useGetTransferLimits,
  useGetWalletBalance,
  useLookupTransferRecipient,
} from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import StackHeader from '../header.stack';
import { useSession } from '../session-context';
import RecentRecipients from './recent-recipients';
import RecipientPreview from './recipient-preview';
import TransferConfirmModal from './transfer-confirm-modal';

const MIN_AMOUNT = 50;
const MAX_AMOUNT = 20000;

const QUICK_AMOUNTS = [50, 100, 500, 1000, 5000, 10000];

const formatQuickAmount = (amount: number): string => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return `${amount}`;
};

const TransferMoney = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const appColors = COLORS[theme];
  const { colors } = useThemedColors();
  const { user } = useSession();

  // State
  const [identifier, setIdentifier] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<TransferRecipient | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  const lookupDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // API Hooks
  const { data: walletData, isLoading: loadingBalance } = useGetWalletBalance();
  const { data: limitsData, isLoading: loadingLimits } = useGetTransferLimits(!!user);
  const { data: recentData, isLoading: loadingRecent } = useGetRecentTransferRecipients(5, !!user);
  const { mutateAsync: lookupRecipient, isPending: isLookingUp } = useLookupTransferRecipient();

  const walletBalance = walletData?.data;
  const limits = limitsData?.data;
  const recentRecipients = recentData?.data || [];

  // Parsed amount
  const parsedAmount = useMemo(() => {
    const parsed = parseFloat(amount.replace(/[^0-9.]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }, [amount]);

  // Validation
  const canAfford = useMemo(() => {
    if (!walletBalance || loadingBalance) return false;
    return walletBalance.balance >= parsedAmount;
  }, [walletBalance, loadingBalance, parsedAmount]);

  const withinDailyLimit = useMemo(() => {
    if (!limits) return true;
    return (limits.daily_used + parsedAmount) <= limits.daily_limit;
  }, [limits, parsedAmount]);

  const dailyLimitProgress = useMemo(() => {
    if (!limits) return 0;
    return Math.min(100, (limits.daily_used / limits.daily_limit) * 100);
  }, [limits]);

  const dailyRemaining = useMemo(() => {
    if (!limits) return 0;
    return limits.daily_remaining;
  }, [limits]);

  // Form validation
  const isFormValid = useMemo(() => {
    if (!selectedRecipient) return false;
    if (parsedAmount < MIN_AMOUNT) return false;
    if (parsedAmount > MAX_AMOUNT) return false;
    if (!canAfford) return false;
    if (!withinDailyLimit) return false;
    return true;
  }, [selectedRecipient, parsedAmount, canAfford, withinDailyLimit]);

  // Handle identifier change with debounced lookup
  const handleIdentifierChange = useCallback((value: string) => {
    setIdentifier(value);
    setSelectedRecipient(null);
    setLookupError(null);

    // Clear existing timer
    if (lookupDebounceTimer.current) {
      clearTimeout(lookupDebounceTimer.current);
    }

    // Only lookup if we have at least 3 characters
    if (value.length >= 3) {
      lookupDebounceTimer.current = setTimeout(async () => {
        try {
          const result = await lookupRecipient(value);
          if (result.error || !result.data) {
            setLookupError(result.message || 'User not found');
            setSelectedRecipient(null);
          } else {
            setSelectedRecipient(result.data.recipient);
            setLookupError(null);
          }
        } catch (error: any) {
          setLookupError(error.message || 'Failed to find user');
          setSelectedRecipient(null);
        }
      }, 400);
    }
  }, [lookupRecipient]);

  // Handle recent recipient selection
  const handleRecentRecipientSelect = useCallback((recent: RecentTransferRecipient) => {
    // Create a TransferRecipient from RecentTransferRecipient
    const recipient: TransferRecipient = {
      id: recent.id,
      full_name: recent.full_name,
      avatar: recent.avatar,
      username: null,
      email_masked: recent.email_masked,
      phone_masked: recent.phone_masked,
      is_verified: true, // Assume verified for recent recipients
      is_onboarded: true,
      has_wallet: true,
    };
    setSelectedRecipient(recipient);
    setIdentifier(recent.full_name);
    setLookupError(null);
  }, []);

  // Handle clear recipient
  const handleClearRecipient = useCallback(() => {
    setSelectedRecipient(null);
    setIdentifier('');
    setLookupError(null);
  }, []);

  // Handle amount change
  const handleAmountChange = (value: string) => {
    // Only allow numbers
    const cleanValue = value.replace(/[^0-9]/g, '');
    setAmount(cleanValue);
  };

  // Handle quick amount selection
  const handleQuickAmountSelect = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  // Handle submit
  const handleSubmit = () => {
    if (!selectedRecipient) {
      Toast.show({ type: 'error', text1: 'Please select a recipient' });
      return;
    }

    if (parsedAmount < MIN_AMOUNT) {
      Toast.show({ type: 'error', text1: `Minimum amount is ${formatNigerianNaira(MIN_AMOUNT)}` });
      return;
    }

    if (parsedAmount > MAX_AMOUNT) {
      Toast.show({ type: 'error', text1: `Maximum amount is ${formatNigerianNaira(MAX_AMOUNT)}` });
      return;
    }

    if (!canAfford && user) {
      Toast.show({ type: 'error', text1: 'Insufficient balance' });
      return;
    }

    if (!withinDailyLimit) {
      Toast.show({ type: 'error', text1: 'Daily transfer limit exceeded' });
      return;
    }

    if (!user) {
      Toast.show({ type: 'error', text1: 'Please login to continue' });
      return;
    }

    setIsModalVisible(true);
  };

  // Handle successful transfer
  const handleTransferSuccess = () => {
    setSelectedRecipient(null);
    setIdentifier('');
    setAmount('');
    setDescription('');
    setLookupError(null);
    setIsModalVisible(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (lookupDebounceTimer.current) {
        clearTimeout(lookupDebounceTimer.current);
      }
    };
  }, []);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <StackHeader title="Send Money" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="mx-4 mt-3 rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={['#7c3aed', '#e65bf8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 24, position: 'relative' }}
          >
            {/* Decorative circles */}
            <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <View className="absolute top-4 right-4">
              <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.3)" />
            </View>

            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-xl bg-white/20 items-center justify-center">
                <Ionicons name="send" size={28} color="white" />
              </View>
              <View className="ml-4">
                <Text className="text-2xl font-bold text-white">Send Money</Text>
                <Text className="text-sm text-white/80">Zero fees, instant transfer</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats Grid */}
        <View className="flex-row gap-3 mx-4 mt-4">
          {/* Wallet Balance */}
          <Animated.View
            entering={FadeInLeft.delay(100).duration(400)}
            className="flex-1 p-4 rounded-2xl bg-card border border-border/30"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <Ionicons name="wallet" size={20} color={colors.primary} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-muted-foreground">Balance</Text>
                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                  {loadingBalance ? '...' : formatNigerianNaira(walletBalance?.balance || 0)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Daily Limit */}
          <Animated.View
            entering={FadeInRight.delay(150).duration(400)}
            className="flex-1 p-4 rounded-2xl bg-card border border-border/30"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-orange-500/10 items-center justify-center">
                <Ionicons name="speedometer" size={20} color="#f97316" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-muted-foreground">Daily Limit</Text>
                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                  {loadingLimits ? '...' : formatNigerianNaira(dailyRemaining)}
                </Text>
              </View>
            </View>
            {/* Progress bar */}
            {limits && (
              <View className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
                <View
                  className={`h-full rounded-full ${dailyLimitProgress > 80 ? 'bg-orange-500' : 'bg-primary'}`}
                  style={{ width: `${dailyLimitProgress}%` }}
                />
              </View>
            )}
          </Animated.View>
        </View>

        {/* Recent Recipients */}
        {user && recentRecipients.length > 0 && !selectedRecipient && (
          <Animated.View
            entering={FadeInDown.delay(200).duration(400)}
            className="mt-4"
          >
            <RecentRecipients
              recipients={recentRecipients}
              onSelect={handleRecentRecipientSelect}
              isLoading={loadingRecent}
            />
          </Animated.View>
        )}

        {/* Main Form Card */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          className="mx-4 mt-4 p-5 rounded-2xl bg-card border border-border/30"
        >
          {/* Recipient Section */}
          <View className="mb-4">
            <Text className="text-base font-bold text-foreground mb-3">Recipient</Text>

            {selectedRecipient ? (
              <RecipientPreview
                recipient={selectedRecipient}
                onClear={handleClearRecipient}
              />
            ) : (
              <View>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Ionicons name="search" size={18} color={appColors.mutedForeground} />
                  </View>
                  <TextInput
                    placeholder="Email, phone, or account number"
                    value={identifier}
                    onChangeText={handleIdentifierChange}
                    placeholderTextColor={appColors.mutedForeground}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className={`bg-secondary/50 border rounded-xl pl-12 pr-12 py-4 text-base text-foreground ${
                      lookupError ? 'border-red-500/50' : 'border-border'
                    }`}
                  />
                  {isLookingUp && (
                    <View className="absolute right-4 top-1/2 -translate-y-1/2">
                      <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                  )}
                </View>

                {lookupError && (
                  <Animated.View
                    entering={FadeIn.duration(200)}
                    className="flex-row items-center mt-2"
                  >
                    <Ionicons name="alert-circle" size={14} color="#ef4444" />
                    <Text className="text-red-500 text-xs ml-1">{lookupError}</Text>
                  </Animated.View>
                )}
              </View>
            )}
          </View>

          {/* Amount Section */}
          <View>
            <Text className="text-base font-bold text-foreground mb-3">Amount</Text>

            {/* Quick Amount Pills */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-3"
              contentContainerStyle={{ gap: 8 }}
            >
              {QUICK_AMOUNTS.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  onPress={() => handleQuickAmountSelect(quickAmount)}
                  activeOpacity={0.7}
                  className={`px-4 py-2 rounded-xl border ${
                    parsedAmount === quickAmount
                      ? 'bg-primary/10 border-primary'
                      : 'bg-secondary/30 border-border/30'
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      parsedAmount === quickAmount ? 'text-primary' : 'text-foreground'
                    }`}
                  >
                    {formatNigerianNaira(quickAmount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Amount Input */}
            <View className="relative">
              <Text className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground z-10">
                ₦
              </Text>
              <TextInput
                placeholder="0"
                value={amount}
                onChangeText={handleAmountChange}
                placeholderTextColor={appColors.mutedForeground}
                keyboardType="numeric"
                className="bg-secondary/50 border border-border rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-foreground text-center"
              />
            </View>

            {/* Amount validation messages */}
            {parsedAmount > 0 && parsedAmount < MIN_AMOUNT && (
              <Animated.View
                entering={FadeIn.duration(200)}
                className="flex-row items-center mt-2"
              >
                <Ionicons name="alert-circle" size={14} color="#f97316" />
                <Text className="text-orange-500 text-xs ml-1">
                  Minimum amount is {formatNigerianNaira(MIN_AMOUNT)}
                </Text>
              </Animated.View>
            )}

            {parsedAmount > MAX_AMOUNT && (
              <Animated.View
                entering={FadeIn.duration(200)}
                className="flex-row items-center mt-2"
              >
                <Ionicons name="alert-circle" size={14} color="#ef4444" />
                <Text className="text-red-500 text-xs ml-1">
                  Maximum amount is {formatNigerianNaira(MAX_AMOUNT)}
                </Text>
              </Animated.View>
            )}

            {user && parsedAmount > 0 && !canAfford && (
              <Animated.View
                entering={FadeIn.duration(200)}
                className="flex-row items-center mt-2"
              >
                <Ionicons name="alert-circle" size={14} color="#ef4444" />
                <Text className="text-red-500 text-xs ml-1">
                  Insufficient balance
                </Text>
              </Animated.View>
            )}

            {user && parsedAmount > 0 && !withinDailyLimit && (
              <Animated.View
                entering={FadeIn.duration(200)}
                className="flex-row items-center mt-2"
              >
                <Ionicons name="alert-circle" size={14} color="#f97316" />
                <Text className="text-orange-500 text-xs ml-1">
                  Daily limit exceeded. {formatNigerianNaira(dailyRemaining)} remaining.
                </Text>
              </Animated.View>
            )}
          </View>

          {/* Note Section */}
          <View className="mt-4">
            <Text className="text-sm font-semibold text-muted-foreground mb-2">
              Note (optional)
            </Text>
            <TextInput
              placeholder="Add a note for the recipient"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={appColors.mutedForeground}
              maxLength={100}
              className="bg-secondary/50 border border-border rounded-xl px-4 py-3 text-base text-foreground"
            />
          </View>
        </Animated.View>

        {/* Transfer Summary */}
        {selectedRecipient && parsedAmount >= MIN_AMOUNT && parsedAmount <= MAX_AMOUNT && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            layout={Layout.springify()}
            className="mx-4 mt-4"
          >
            <LinearGradient
              colors={['rgba(124, 58, 237, 0.05)', 'rgba(230, 91, 248, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 20, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.2)' }}
            >
              <Text className="text-sm font-bold text-foreground mb-3">Transfer Summary</Text>
              <View className="gap-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Recipient</Text>
                  <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                    {selectedRecipient.full_name}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Amount</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatNigerianNaira(parsedAmount)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Fee</Text>
                  <Text className="text-sm font-semibold text-emerald-500">Free</Text>
                </View>
                <View className="h-px bg-border/50 my-2" />
                <View className="flex-row justify-between items-center">
                  <Text className="font-bold text-foreground">Total</Text>
                  <Text className="text-lg font-bold text-primary">
                    {formatNigerianNaira(parsedAmount)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Submit Button */}
        <View className="mx-4 mt-6">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid || isLookingUp || !user}
            className="rounded-2xl overflow-hidden shadow-lg"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                !isFormValid || isLookingUp || !user
                  ? ['#9ca3af', '#6b7280']
                  : ['#7c3aed', '#e65bf8']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center' }}
            >
              <View className="flex-row items-center">
                {isLookingUp ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-lg ml-2">Finding user...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="send" size={22} color="white" />
                    <Text className="text-white font-bold text-lg mx-2">Send Money</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login prompt for guests */}
          {!user && (
            <Text className="text-center text-xs text-muted-foreground mt-3">
              Please login to send money
            </Text>
          )}
        </View>

        {/* Confirmation Modal */}
        <TransferConfirmModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          recipient={selectedRecipient}
          amount={parsedAmount}
          description={description || undefined}
          onSuccess={handleTransferSuccess}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransferMoney;
