import { useThemedColors } from '@/hooks/useThemedColors';
import { useVerifyMerchant } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
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
    .min(100, 'Minimum amount is ₦100'),
  isPrepaid: z.boolean(),
});

type ElectricityFormInputs = z.infer<typeof electricitySchema>;

const PaymentTypeToggle = React.memo(({ 
  isPrepaid, 
  onToggle 
}: { 
  isPrepaid: boolean; 
  onToggle: (value: boolean) => void;
}) => {
  const { colors } = useThemedColors()

  return (
    <View className="flex-row items-center justify-between bg-card rounded-2xl p-4">
      <Text className="text-sm font-medium text-foreground">Payment Type</Text>
      <Switch
        value={isPrepaid}
        onValueChange={onToggle}
        trackColor={{ false: colors.mutedForeground, true: colors.primary }}
        thumbColor={isPrepaid ? colors.primary : colors.mutedForeground}
      />
      <Text className="text-sm font-medium text-foreground">
        {isPrepaid ? 'Prepaid' : 'Postpaid'}
      </Text>
    </View>
  )
  }
);


const BuyElectricityScreen = () => {

  const { colors } = useThemedColors()
  const [selectedProvider, setSelectedProvider] = useState<string | number | null>(8);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  const [lastVerifiedMeter, setLastVerifiedMeter] = useState<string>('');
  const [lastVerifiedProvider, setLastVerifiedProvider] = useState<string | number | null>(null);
  const [lastVerifiedType, setLastVerifiedType] = useState<boolean | null>(null);

  const { mutateAsync: verifyMerchant, isPending: isVerifyingMeter } = useVerifyMerchant();
  
  const { user, refetchElectricityServices, loadingElectricityServices, walletBalance, electricityServices, appConfig } = useSession();

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
      isPrepaid: true, // Add isPrepaid to form defaults
    },
  });

  const watchedAmount = watch('amount');
  const watchedMeterNumber = watch('meterNumber');
  const watchedIsPrepaid = watch('isPrepaid'); // Watch the form state instead of useState

  
  // Calculate commission (10% of the amount)
  const commissionRate = appConfig?.electricity_commission_rate || 0.1; // 10%
  const commissionAmount = watchedAmount * commissionRate;
  const totalAmount = watchedAmount + commissionAmount;

  const electricityData = useMemo(() => ({
    serviceID: selectedProvider!,
    meterNumber: getValues('meterNumber'),
    phoneNumber: getValues('phoneNumber'),
    amount: getValues('amount'),
    commissionAmount: commissionAmount,
    totalAmount: totalAmount,
    isPrepaid: watchedIsPrepaid,
    customerInfo: customerInfo
  }), [selectedProvider, getValues, commissionAmount, totalAmount, watchedIsPrepaid, customerInfo]);

  const handleVerifyMeter = useCallback(async () => {
    try {
      if (isVerifyingMeter || verificationStatus === 'loading') {
        return;
      }

      if (!selectedProvider || !watchedMeterNumber || watchedMeterNumber.length < 5) {
        return;
      }

      // Check if we already verified this exact combination
      if (lastVerifiedMeter === watchedMeterNumber && 
          lastVerifiedProvider === selectedProvider && 
          lastVerifiedType === watchedIsPrepaid && 
          verificationStatus === 'success') {
        return; // Already verified, no need to verify again
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

  // Replace the useState toggle handler with a form setter
  const handleMeterTypeChange = useCallback((newIsPrepaid: boolean) => {
    setValue('isPrepaid', newIsPrepaid);
    // Reset verification when payment type changes
    if (lastVerifiedType !== newIsPrepaid) {
      setVerificationStatus('idle');
      setCustomerInfo(null);
      setLastVerifiedMeter('');
      setLastVerifiedProvider(null);
      setLastVerifiedType(null);
    }
  }, [setValue, lastVerifiedType]);

  // Auto-verify meter when conditions are met
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        selectedProvider &&
        watchedMeterNumber &&
        watchedMeterNumber.length >= 8 && // Minimum meter number length
        watchedMeterNumber.length <= 15 && // Maximum meter number length
        !isVerifyingMeter &&
        verificationStatus !== 'loading' &&
        // Only auto-verify if we haven't already verified this exact combination
        !(lastVerifiedMeter === watchedMeterNumber && 
          lastVerifiedProvider === selectedProvider && 
          lastVerifiedType === watchedIsPrepaid &&
          verificationStatus === 'success')
      ) {
        handleVerifyMeter();
      }
    }, 1000); // 1 second delay to avoid too many API calls while typing

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

    if (!data.amount || data.amount < 100) {
      Toast.show({ type: 'error', text1: 'Please enter a valid amount.' });
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


  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background h-full">
      <StackHeader title={'Electricity'} />
      {/* Header Section */}
      {/* <View className="px-6 py-4 bg-card/50 border-b border-border/30">
        <View className="flex-row items-center mb-2">
          <View className="w-10 h-10 bg-primary/10 rounded-2xl items-center justify-center mr-3">
            <Ionicons name="flash" size={20} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">Electricity Bills</Text>
            <Text className="text-sm text-muted-foreground">Pay your electricity bills instantly</Text>
          </View>
        </View>
      </View> */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="px-4"
        contentContainerStyle={{ paddingVertical: 12, flexGrow: 1, justifyContent: 'center' }}
        refreshControl={
          <RefreshControl
            refreshing={loadingElectricityServices!}
            onRefresh={refetchElectricityServices}
            colors={[colors.primary]}
          />
        }
      >
        
        <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-3">
            <Ionicons name="business" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Select Provider</Text>
          </View>
          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider}
          />
        </View>

        <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-4">
            <Ionicons name="card" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Payment Type</Text>
          </View>
          <PaymentTypeToggle 
            isPrepaid={watchedIsPrepaid} 
            onToggle={handleMeterTypeChange}
          />
        </View>

        <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-3">
            <Ionicons name="keypad" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Meter Information</Text>
          </View>
          <View className="space-y-3">
            <Controller
              control={control}
              name="meterNumber"
              render={({ field: { onChange, value } }) => (
                <View className="relative">
                  <TextInput
                    placeholder="Enter meter number"
                    value={value}
                    placeholderTextColor={colors.mutedForeground}
                    onChangeText={(text) => {
                      onChange(text);
                      // Reset verification status when meter number changes
                      if (text !== lastVerifiedMeter) {
                        setVerificationStatus('idle');
                        setCustomerInfo(null);
                      }
                    }}
                    className="bg-input border border-border rounded-xl px-4 py-5 text-base text-foreground font-medium"
                    keyboardType="numeric"
                  />
                </View>
              )}
            />
          </View>
          
          {verificationStatus !== 'idle' && (
            <View className={`mt-4 p-4 rounded-xl border ${
              verificationStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
              verificationStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
              'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <View className="flex-row items-center gap-x-3">
                <View className={`w-5 h-5 rounded-full items-center justify-center ${
                  verificationStatus === 'success' ? 'bg-green-500' :
                  verificationStatus === 'error' ? 'bg-red-500' :
                  'bg-blue-500'
                }`}>
                  <Ionicons 
                    name={
                      verificationStatus === 'success' ? 'checkmark' :
                      verificationStatus === 'error' ? 'close' :
                      'information'
                    }
                    size={12}
                    color="white"
                  />
                </View>
                <View className="flex-1">
                  {verificationStatus === 'success' && customerInfo && (
                    <View className="space-y-1">
                      <Text className="text-green-800 dark:text-green-400 font-semibold text-sm">Meter Verified Successfully</Text>
                      <Text className="text-green-700 dark:text-green-300 text-sm">
                        Customer: {customerInfo.Customer_Name}
                      </Text>
                      {customerInfo.Address && (
                        <Text className="text-green-600 dark:text-green-400 text-xs">
                          Address: {customerInfo.Address}
                        </Text>
                      )}
                      {customerInfo.Outstanding > 0 && (
                        <View className="bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-lg mt-2">
                          <Text className="text-orange-700 dark:text-orange-300 text-xs font-medium">
                            Outstanding Balance: ₦{customerInfo.Outstanding.toLocaleString()}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  {verificationStatus === 'error' && (
                    <View className="space-y-1">
                      <Text className="text-red-800 dark:text-red-400 font-semibold text-sm">Verification Failed</Text>
                      <Text className="text-red-700 dark:text-red-300 text-sm">
                        Please check the meter number and try again
                      </Text>
                    </View>
                  )}
                  {verificationStatus === 'loading' && (
                    <Text className="text-blue-800 dark:text-blue-400 font-semibold text-sm">Verifying meter number...</Text>
                  )}
                </View>
              </View>
            </View>
          )}
          
          {errors.meterNumber && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text className="text-destructive text-sm ml-2">{errors.meterNumber.message}</Text>
            </View>
          )}
        </View>

        <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-3">
            <Ionicons name="call" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Phone Number</Text>
          </View>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <PhoneNumberInput
                className="border-0 bg-input rounded-xl text-base font-medium"
                value={value}
                onChange={onChange}
                error={errors.phoneNumber?.message}
                onSelectContact={handleSelectContact}
              />
            )}
          />
        </View>

        <View className="bg-card rounded-2xl p-5 mb-6 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-4">
            <Ionicons name="wallet" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Payment Amount</Text>
          </View>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <View className="bg-input rounded-xl p-4 border border-border/30">
                <View className="flex-row items-center justify-center">
                  <Text className="text-2xl font-bold text-muted-foreground mr-2">₦</Text>
                  <TextInput
                    placeholder="0"
                    keyboardType="numeric"
                    value={value ? value.toString() : ''}
                    placeholderTextColor={colors.mutedForeground}
                    onChangeText={(text) => {
                      const numericValue = parseFloat(text) || 0;
                      onChange(numericValue);
                    }}
                    className="flex-1 text-center text-3xl font-bold text-foreground"
                    style={{ minHeight: 40 }}
                  />
                </View>
              </View>
            )}
          />
          
          {watchedAmount > 0 && (
            <View className="mt-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl p-4 border border-primary/20">
              <Text className="text-sm font-semibold text-foreground mb-3">Payment Breakdown</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground text-sm">Bill Amount</Text>
                  <Text className="text-foreground font-semibold">₦{watchedAmount.toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground text-sm">Service Charge ({commissionRate * 100}%)</Text>
                  <Text className="text-foreground font-semibold">₦{commissionAmount.toLocaleString()}</Text>
                </View>
                <View className="h-px bg-border my-2" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-foreground font-bold text-base">Total Amount</Text>
                  <Text className="text-primary font-bold text-lg">₦{totalAmount.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}
          
          {customerInfo?.Min_Purchase_Amount && (
            <View className="mt-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={16} color={colors.primary} />
                <Text className="text-blue-700 dark:text-blue-300 text-sm ml-2">
                  Minimum purchase: ₦{customerInfo.Min_Purchase_Amount.toLocaleString()}
                </Text>
              </View>
            </View>
          )}
          {errors.amount && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text className="text-destructive text-sm ml-2">{errors.amount.message}</Text>
            </View>
          )}
        </View>

        <View className="pt-4 pb-6">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            activeOpacity={0.8}
            disabled={
              verificationStatus !== 'success' ||
              !watchedAmount ||
              watchedAmount < 100
            }
            className={`rounded-2xl overflow-hidden shadow-lg ${
              verificationStatus !== 'success' || !watchedAmount || watchedAmount < 100
                ? 'opacity-50'
                : ''
            }`}
            style={{ elevation: 8 }}
          >
            <LinearGradient
              colors={['#7B2FF2', '#F357A8', '#FF6B9D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-5 items-center justify-center"
            >
              <View className="flex-row items-center">
                  <>
                    <Ionicons name="flash" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Pay ₦{totalAmount.toLocaleString()}
                    </Text>
                  </>
              </View>
              <Text className="text-white/80 text-sm mt-1">Instant electricity payment</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <View className="mt-4 bg-muted/30 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="bulb" size={16} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground ml-2">Quick Tips</Text>
            </View>
            <Text className="text-xs text-muted-foreground leading-4">
              • Ensure your meter number is correct before verification{'\n'}
              • {watchedIsPrepaid ? 'Prepaid' : 'Postpaid'} payments are processed instantly{'\n'}
              • You'll receive a confirmation SMS after successful payment
            </Text>
          </View>
        </View>
      </ScrollView>

      <ElectricityConfirmationModal
        isVisible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        electricityData={electricityData}
      />
    </SafeAreaView>
  );
};

export default React.memo(BuyElectricityScreen);

