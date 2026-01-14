import { useThemedColors } from '@/hooks/useThemedColors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { useVerifyMerchant } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  Layout,
  LinearTransition,
} from 'react-native-reanimated';
import * as z from 'zod';
import PhoneNumberInput from '../data/phone-number-input';
import StackHeader from '../header.stack';
import { useSession } from '../session-context';
import ElectricityConfirmationModal from './electricity-confirmation-modal';
import ProviderSelector from './provider-selector';

const electricitySchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  meterNumber: z
    .string()
    .min(5, 'Meter number is required'),
  amount: z
    .number()
    .min(1000, 'Minimum amount is ₦1,000'),
  isPrepaid: z.boolean(),
});

type ElectricityFormInputs = z.infer<typeof electricitySchema>;

const quickAmounts = [1000, 2000, 3000, 5000, 10000, 20000];

// Meter Type Toggle Component with polished styling
const MeterTypeToggle = React.memo(({
  isPrepaid,
  onToggle
}: {
  isPrepaid: boolean;
  onToggle: (value: boolean) => void;
}) => {
  return (
    <View className="bg-secondary/50 rounded-2xl p-1.5">
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => onToggle(true)}
          activeOpacity={0.8}
          className={`flex-1 py-3.5 px-4 rounded-xl items-center justify-center ${isPrepaid ? 'bg-amber-500' : 'bg-transparent'
            }`}
        >
          <View className="flex-row items-center gap-x-2">
            <Ionicons
              name="flash"
              size={16}
              color={isPrepaid ? 'white' : '#9ca3af'}
            />
            <Text className={`font-semibold text-sm ${isPrepaid ? 'text-white' : 'text-muted-foreground'
              }`}>
              Prepaid
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onToggle(false)}
          activeOpacity={0.8}
          className={`flex-1 py-3.5 px-4 rounded-xl items-center justify-center ${!isPrepaid ? 'bg-amber-500' : 'bg-transparent'
            }`}
        >
          <View className="flex-row items-center gap-x-2">
            <Ionicons
              name="calendar"
              size={16}
              color={!isPrepaid ? 'white' : '#9ca3af'}
            />
            <Text className={`font-semibold text-sm ${!isPrepaid ? 'text-white' : 'text-muted-foreground'
              }`}>
              Postpaid
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
});

// Meter Verification Card Component
const MeterVerificationCard = React.memo(({
  verificationStatus,
  customerInfo,
  isVerifying,
  onClear,
}: {
  verificationStatus: 'idle' | 'loading' | 'success' | 'error';
  customerInfo: any;
  isVerifying: boolean;
  onClear: () => void;
}) => {
  if (verificationStatus === 'idle') return null;

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      layout={Layout}
    >
      {verificationStatus === 'loading' && (
        <View className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
          <View className="flex-row items-center gap-x-3">
            <View className="w-10 h-10 rounded-xl bg-blue-500/20 items-center justify-center">
              <Ionicons name="sync" size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                Verifying meter number...
              </Text>
              <Text className="text-blue-500 dark:text-blue-300 text-xs mt-0.5">
                Please wait while we fetch your details
              </Text>
            </View>
          </View>
        </View>
      )}

      {verificationStatus === 'success' && customerInfo && (
        <View className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-row items-center gap-x-2">
              <View className="w-8 h-8 rounded-lg bg-emerald-500/20 items-center justify-center">
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
              </View>
              <Text className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                Verified Successfully
              </Text>
            </View>
            <TouchableOpacity onPress={onClear} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={22} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <View className="bg-emerald-500/5 rounded-xl p-3 space-y-2">
            <View className="flex-row items-center gap-x-2">
              <Ionicons name="person" size={14} color="#10b981" />
              <Text className="text-foreground font-medium text-sm flex-1" numberOfLines={1}>
                {customerInfo.Customer_Name}
              </Text>
            </View>
            {customerInfo.Address && (
              <View className="flex-row items-start gap-x-2">
                <Ionicons name="location" size={14} color="#10b981" />
                <Text className="text-muted-foreground text-xs flex-1" numberOfLines={2}>
                  {customerInfo.Address}
                </Text>
              </View>
            )}
          </View>

          {customerInfo.Outstanding > 0 && (
            <View className="mt-3 bg-orange-500/10 rounded-xl p-3 flex-row items-center gap-x-2">
              <Ionicons name="alert-circle" size={16} color="#f59e0b" />
              <Text className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                Outstanding: ₦{customerInfo.Outstanding.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      )}

      {verificationStatus === 'error' && (
        <View className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
          <View className="flex-row items-center gap-x-3">
            <View className="w-10 h-10 rounded-xl bg-red-500/20 items-center justify-center">
              <Ionicons name="close-circle" size={20} color="#ef4444" />
            </View>
            <View className="flex-1">
              <Text className="text-red-600 dark:text-red-400 font-semibold text-sm">
                Verification Failed
              </Text>
              <Text className="text-red-500 dark:text-red-300 text-xs mt-0.5">
                Please check the meter number and try again
              </Text>
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
});

const BuyElectricityScreen = () => {
  const { colors } = useThemedColors();
  const [selectedProvider, setSelectedProvider] = useState<string | number | null>(8);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [lastVerifiedMeter, setLastVerifiedMeter] = useState<string>('');
  const [lastVerifiedProvider, setLastVerifiedProvider] = useState<string | number | null>(null);
  const [lastVerifiedType, setLastVerifiedType] = useState<boolean | null>(null);

  const { mutateAsync: verifyMerchant, isPending: isVerifyingMeter } = useVerifyMerchant();

  const {
    user,
    refetchElectricityServices,
    loadingElectricityServices,
    walletBalance,
    electricityServices,
    appConfig
  } = useSession();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    trigger,
    watch,
  } = useForm<ElectricityFormInputs>({
    resolver: zodResolver(electricitySchema),
    defaultValues: {
      phoneNumber: user?.user_metadata?.phone || '',
      meterNumber: '',
      amount: 0,
      isPrepaid: true,
    },
  });

  const watchedAmount = watch('amount');
  const watchedMeterNumber = watch('meterNumber');
  const watchedIsPrepaid = watch('isPrepaid');

  // Calculate commission (10% of the amount)
  const commissionRate = appConfig?.electricity_commission_rate || 0.1;
  const commissionAmount = watchedAmount * commissionRate;
  const totalAmount = watchedAmount + commissionAmount;

  // Calculate data bonus (2.5% of total amount)
  const dataBonus = Math.floor(totalAmount * 0.025);
  const dataBonusMB = dataBonus > 0 ? `${dataBonus}MB` : null;

  // Check if user can afford
  const canAfford = useMemo(() => {
    if (!walletBalance) return false;
    return walletBalance.balance >= totalAmount;
  }, [walletBalance, totalAmount]);

  const electricityData = useMemo(() => ({
    serviceID: selectedProvider!,
    meterNumber: getValues('meterNumber'),
    phoneNumber: getValues('phoneNumber'),
    amount: getValues('amount'),
    commissionAmount: commissionAmount,
    totalAmount: totalAmount,
    isPrepaid: watchedIsPrepaid,
    customerInfo: customerInfo,
    dataBonus: dataBonusMB
  }), [selectedProvider, getValues, commissionAmount, totalAmount, watchedIsPrepaid, customerInfo, dataBonusMB]);

  const handleVerifyMeter = useCallback(async () => {
    try {
      if (isVerifyingMeter || verificationStatus === 'loading') {
        return;
      }

      if (!selectedProvider || !watchedMeterNumber || watchedMeterNumber.length < 5) {
        return;
      }

      if (lastVerifiedMeter === watchedMeterNumber &&
        lastVerifiedProvider === selectedProvider &&
        lastVerifiedType === watchedIsPrepaid &&
        verificationStatus === 'success') {
        return;
      }

      const selectedProviderData = electricityServices?.find(p => p.id === selectedProvider);

      if (!selectedProviderData?.service_id) {
        Toast.show({ type: 'error', text1: 'Invalid provider selected.' });
        return;
      }

      setVerificationStatus('loading');
      setCustomerInfo(null);

      const result = await verifyMerchant({
        type: watchedIsPrepaid ? 'prepaid' : 'postpaid',
        billersCode: watchedMeterNumber,
        serviceID: selectedProviderData.service_id
      });

      if (result?.data && !result.data.WrongBillersCode) {
        setVerificationStatus('success');
        setCustomerInfo(result.data);
        setLastVerifiedMeter(watchedMeterNumber);
        setLastVerifiedProvider(selectedProvider);
        setLastVerifiedType(watchedIsPrepaid);
        Toast.show({
          type: 'success',
          text1: 'Meter verified successfully!',
          text2: `Customer: ${result.data.Customer_Name}`
        });
      } else {
        setVerificationStatus('error');
        setCustomerInfo(null);
        setLastVerifiedMeter('');
        setLastVerifiedProvider(null);
        setLastVerifiedType(null);
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setCustomerInfo(null);
      setLastVerifiedMeter('');
      setLastVerifiedProvider(null);
      setLastVerifiedType(null);
      Toast.show({
        type: 'error',
        text1: 'Verification failed',
        text2: error?.message || 'Please try again'
      });
    }
  }, [isVerifyingMeter, verificationStatus, selectedProvider, watchedMeterNumber, electricityServices, watchedIsPrepaid, lastVerifiedMeter, lastVerifiedProvider, lastVerifiedType]);

  const handleMeterTypeChange = useCallback((newIsPrepaid: boolean) => {
    setValue('isPrepaid', newIsPrepaid);
    if (lastVerifiedType !== newIsPrepaid) {
      setVerificationStatus('idle');
      setCustomerInfo(null);
      setLastVerifiedMeter('');
      setLastVerifiedProvider(null);
      setLastVerifiedType(null);
    }
  }, [setValue, lastVerifiedType]);

  const handleClearVerification = useCallback(() => {
    setVerificationStatus('idle');
    setCustomerInfo(null);
    setLastVerifiedMeter('');
    setLastVerifiedProvider(null);
    setLastVerifiedType(null);
    setValue('meterNumber', '');
  }, [setValue]);

  // Auto-verify meter when conditions are met
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        selectedProvider &&
        watchedMeterNumber &&
        watchedMeterNumber.length >= 8 &&
        watchedMeterNumber.length <= 15 &&
        !isVerifyingMeter &&
        verificationStatus !== 'loading' &&
        !(lastVerifiedMeter === watchedMeterNumber &&
          lastVerifiedProvider === selectedProvider &&
          lastVerifiedType === watchedIsPrepaid &&
          verificationStatus === 'success')
      ) {
        handleVerifyMeter();
      }
    }, 700);

    return () => clearTimeout(timer);
  }, [
    selectedProvider,
    watchedMeterNumber,
    watchedIsPrepaid,
    isVerifyingMeter,
    verificationStatus,
    lastVerifiedMeter,
    lastVerifiedProvider,
    lastVerifiedType,
    handleVerifyMeter
  ]);

  const onSubmit = useCallback((data: ElectricityFormInputs) => {
    if (!selectedProvider) {
      Toast.show({ type: 'error', text1: 'Please select a provider.' });
      return;
    }

    if (!data.amount || data.amount < 1000) {
      Toast.show({ type: 'error', text1: 'Minimum amount is ₦1,000.' });
      return;
    }

    if (verificationStatus !== 'success') {
      Toast.show({ type: 'error', text1: 'Please verify the meter number first.' });
      return;
    }

    setShowConfirmationModal(true);
  }, [selectedProvider, verificationStatus]);

  const handleSelectContact = useCallback((phoneNumber: string) => {
    setValue('phoneNumber', phoneNumber);
    trigger('phoneNumber');
  }, [setValue, trigger]);

  const handleQuickAmount = useCallback((amount: number) => {
    setValue('amount', amount);
    trigger('amount');
  }, [setValue, trigger]);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background h-full">
      <StackHeader title={'Electricity'} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={loadingElectricityServices!}
            onRefresh={refetchElectricityServices}
            colors={[colors.primary]}
          />
        }
      >
        {/* Hero Header */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(100)}
          className="mx-4 mt-4 mb-5"
        >
          <LinearGradient
            colors={['#f59e0b', '#ef4444', '#ec4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 24, position: 'relative', overflow: 'hidden' }}
          >
            {/* Decorative circles */}
            <View className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <View className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
            <Ionicons
              name="sparkles"
              size={24}
              color="rgba(255,255,255,0.3)"
              style={{ position: 'absolute', top: 16, right: 16 }}
            />

            <View className="relative z-10">
              <View className="flex-row items-center gap-x-3 mb-1">
                <View className="w-12 h-12 rounded-xl bg-white/20 items-center justify-center">
                  <Ionicons name="flash" size={24} color="white" />
                </View>
                <View>
                  <Text className="text-2xl font-bold text-white">Electricity</Text>
                  <Text className="text-sm text-white/80">Pay your bills instantly</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats Grid */}
        <View className="flex-row gap-x-3 mx-4 mb-5">
          {/* Wallet Balance */}
          <Animated.View
            entering={FadeInLeft.duration(400).delay(200)}
            className="flex-1 p-4 rounded-2xl bg-card border border-border/50"
          >
            <View className="flex-row items-center gap-x-3">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center">
                <Ionicons name="wallet" size={20} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Balance</Text>
                <Text className="text-lg font-bold text-foreground" numberOfLines={1}>
                  {formatNigerianNaira(walletBalance?.balance || 0)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Data Bonus */}
          <Animated.View
            entering={FadeInRight.duration(400).delay(250)}
            className="flex-1 p-4 rounded-2xl bg-card border border-border/50"
          >
            <View className="flex-row items-center gap-x-3">
              <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                <Ionicons name="gift" size={20} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">Data Bonus</Text>
                <Text className="text-lg font-bold text-foreground">
                  {walletBalance?.data_bonus || '0MB'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Provider Selection */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(300)}
          className="mx-4 mb-4"
        >
          <View className="bg-card rounded-2xl p-5 border border-border/50">
            <View className="flex-row items-center gap-x-2 mb-4">
              <Ionicons name="flash" size={18} color="#f59e0b" />
              <Text className="text-base font-bold text-foreground">Select Provider</Text>
            </View>
            <ProviderSelector
              selectedProvider={selectedProvider}
              onSelect={setSelectedProvider}
            />
          </View>
        </Animated.View>

        {/* Meter Details Section - Shows when provider is selected */}
        {selectedProvider && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            exiting={FadeOut.duration(200)}
            layout={LinearTransition}
            className="mx-4 mb-4"
          >
            <View className="bg-card rounded-2xl p-5 border border-border/50 space-y-5">
              <View className="flex-row items-center gap-x-2">
                <Ionicons name="keypad" size={18} color={colors.primary} />
                <Text className="text-base font-bold text-foreground">Meter Details</Text>
              </View>

              {/* Meter Type Toggle */}
              <View className='my-2'>
                <Text className="text-sm font-semibold text-muted-foreground mb-2">
                  Meter Type
                </Text>
                <MeterTypeToggle
                  isPrepaid={watchedIsPrepaid}
                  onToggle={handleMeterTypeChange}
                />
              </View>

              {/* Meter Number Input */}
              <View className='my-2'>
                <Text className="text-sm font-semibold text-muted-foreground mb-2">
                  Meter Number
                </Text>
                <Controller
                  control={control}
                  name="meterNumber"
                  render={({ field: { onChange, value } }) => (
                    <View className="relative">
                      <View className="absolute left-4 top-[50%] -translate-y-1/2 z-10">
                        <Ionicons name="keypad" size={18} color={colors.mutedForeground} />
                      </View>
                      <TextInput
                        placeholder="Enter meter number"
                        value={value}
                        placeholderTextColor={colors.mutedForeground}
                        onChangeText={(text) => {
                          onChange(text);
                          if (text !== lastVerifiedMeter) {
                            setVerificationStatus('idle');
                            setCustomerInfo(null);
                          }
                        }}
                        className={`bg-secondary/50 border rounded-xl pl-12 pr-12 py-4 text-base text-foreground font-mono ${verificationStatus === 'success'
                          ? 'border-emerald-500/50 bg-emerald-500/5'
                          : verificationStatus === 'error'
                            ? 'border-red-500/50'
                            : 'border-border/50'
                          }`}
                        keyboardType="numeric"
                        maxLength={15}
                      />
                      {isVerifyingMeter && (
                        <View className="absolute right-4 top-1/2 -translate-y-1/2">
                          <Ionicons name="sync" size={18} color={colors.primary} />
                        </View>
                      )}
                    </View>
                  )}
                />
                {errors.meterNumber && (
                  <Text className="text-destructive text-xs mt-1">
                    {errors.meterNumber.message}
                  </Text>
                )}
              </View>

              {/* Verification Status Card */}
              <MeterVerificationCard
                verificationStatus={verificationStatus}
                customerInfo={customerInfo}
                isVerifying={isVerifyingMeter}
                onClear={handleClearVerification}
              />

              {/* Phone Number Input */}
              <View>
                <Text className="text-sm font-semibold text-muted-foreground mb-2">
                  Phone Number (for token notification)
                </Text>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, value } }) => (
                    <PhoneNumberInput
                      className="border-0 bg-secondary/50 rounded-xl text-base font-medium"
                      value={value}
                      onChange={onChange}
                      error={errors.phoneNumber?.message}
                      onSelectContact={handleSelectContact}
                    />
                  )}
                />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Amount Section - Shows when meter is verified */}
        {selectedProvider && verificationStatus === 'success' && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            exiting={FadeOut.duration(200)}
            layout={Layout}
            className="mx-4 mb-4"
          >
            <View className="bg-card rounded-2xl p-5 border border-border/50 space-y-4">
              <View className="flex-row items-center gap-x-2">
                <Ionicons name="wallet" size={18} color={colors.primary} />
                <Text className="text-base font-bold text-foreground">Amount</Text>
              </View>

              {/* Quick Amounts */}
              <View className="flex-row flex-wrap gap-2">
                {quickAmounts.map((amt) => (
                  <TouchableOpacity
                    key={amt}
                    onPress={() => handleQuickAmount(amt)}
                    activeOpacity={0.7}
                    className={`px-4 py-2.5 rounded-full border ${watchedAmount === amt
                      ? 'bg-primary border-primary'
                      : 'bg-secondary/50 border-border/50'
                      }`}
                  >
                    <Text className={`font-semibold text-sm ${watchedAmount === amt ? 'text-white' : 'text-foreground'
                      }`}>
                      {formatNigerianNaira(amt)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Custom Amount Input */}
              <View>
                <Text className="text-sm font-semibold text-muted-foreground mb-2">
                  Custom Amount
                </Text>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field: { onChange, value } }) => (
                    <View className="relative">
                      <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <Text className="text-xl font-bold text-muted-foreground">₦</Text>
                      </View>
                      <TextInput
                        placeholder="0"
                        keyboardType="numeric"
                        value={value ? value.toString() : ''}
                        placeholderTextColor={colors.mutedForeground}
                        onChangeText={(text) => {
                          const numericValue = parseFloat(text) || 0;
                          onChange(numericValue);
                        }}
                        className="bg-secondary/50 border border-border/50 rounded-xl pl-12 pr-4 py-4 text-2xl font-bold text-foreground text-center"
                      />
                    </View>
                  )}
                />
                {errors.amount && (
                  <Text className="text-destructive text-xs mt-1">
                    {errors.amount.message}
                  </Text>
                )}
              </View>

              {/* Insufficient Balance Warning */}
              {user && watchedAmount >= 1000 && !canAfford && (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  className="p-3 bg-red-500/10 rounded-xl flex-row items-center gap-x-2"
                >
                  <Ionicons name="alert-circle" size={16} color="#ef4444" />
                  <Text className="text-red-500 text-xs font-medium flex-1">
                    Insufficient balance. You need {formatNigerianNaira(totalAmount - (walletBalance?.balance || 0))} more.
                  </Text>
                </Animated.View>
              )}
            </View>
          </Animated.View>
        )}

        {/* Transaction Summary */}
        {selectedProvider && verificationStatus === 'success' && watchedAmount >= 1000 && (
          <Animated.View
            entering={FadeInDown.duration(400)}
            layout={Layout}
            className="mx-4 mb-4"
          >
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.05)', 'rgba(249, 115, 22, 0.05)']}
              style={{ borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' }}
            >
              <Text className="text-sm font-bold text-foreground mb-3">
                Transaction Summary
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground text-sm">Electricity Amount</Text>
                  <Text className="text-foreground font-semibold">
                    {formatNigerianNaira(watchedAmount)}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground text-sm">
                    Service Charge ({(commissionRate * 100).toFixed(0)}%)
                  </Text>
                  <Text className="text-foreground font-semibold">
                    {formatNigerianNaira(commissionAmount)}
                  </Text>
                </View>
                {dataBonusMB && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-muted-foreground text-sm">Data Bonus</Text>
                    <Text className="text-emerald-500 font-semibold">+{dataBonusMB}</Text>
                  </View>
                )}
                <View className="h-px bg-border/50 my-2" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground font-bold">Total</Text>
                  <Text className="text-lg font-bold text-primary">
                    {formatNigerianNaira(totalAmount)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Submit Button */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(400)}
          className="mx-4 mt-2"
        >
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            disabled={
              verificationStatus !== 'success' ||
              !watchedAmount ||
              watchedAmount < 1000
            }
            className={`rounded-2xl overflow-hidden ${verificationStatus !== 'success' || !watchedAmount || watchedAmount < 1000
              ? 'opacity-50'
              : ''
              }`}
          >
            <LinearGradient
              colors={['#f59e0b', '#ef4444', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 20, alignItems: 'center', justifyContent: 'center' }}
            >
              <View className="flex-row items-center gap-x-3">
                <Ionicons name="flash" size={22} color="white" />
                <Text className="text-white font-bold text-lg">
                  {isVerifyingMeter ? 'Verifying...' : 'Buy Electricity'}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <ElectricityConfirmationModal
          isVisible={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          electricityData={electricityData}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default React.memo(BuyElectricityScreen);
