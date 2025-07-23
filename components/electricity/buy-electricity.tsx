import { COLORS } from '@/constants/colors';
import { useVerifyMerchant } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import PhoneNumberInput from '../data/phone-number-input';
import { useSession } from '../session-context';
import LoadingSpinner from '../ui/loading-spinner';
import ElectricityConfirmationModal from './electricity-confirmation-modal';
import ProviderSelector from './provider-selector';
import { useThemedColors } from '@/hooks/useThemedColors';

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
});

type ElectricityFormInputs = z.infer<typeof electricitySchema>;

const BuyElectricityScreen = () => {
  const [isPrepaid, setIsPrepaid] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | number | null>(8);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [customerInfo, setCustomerInfo] = useState<any>(null);
  
  const { user, refetchElectricityServices, loadingElectricityServices, walletBalance, electricityServices } = useSession();

  const { mutateAsync: verifyMerchant, isPending: isVerifyingMeter } = useVerifyMerchant();
  const { colors } = useThemedColors()

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
    },
  });

  const watchedAmount = watch('amount');
  const watchedMeterNumber = watch('meterNumber');

  // Calculate commission (10% of the amount)
  const commissionRate = 0.1; // 10%
  const commissionAmount = watchedAmount * commissionRate;
  const totalAmount = watchedAmount + commissionAmount;

  const handleVerifyMeter = async () => {
    if (!selectedProvider || !watchedMeterNumber || watchedMeterNumber.length < 5) {
      Toast.show({ type: 'error', text1: 'Please enter a valid meter number and select a provider.' });
      return;
    }

    const selectedProviderData = electricityServices?.find(p => p.id === selectedProvider);
    
    if (!selectedProviderData?.service_id) {
      Toast.show({ type: 'error', text1: 'Invalid provider selected.' });
      return;
    }

    setVerificationStatus('loading');
    setCustomerInfo(null);

    try {
      const result = await verifyMerchant({
        type: isPrepaid ? 'prepaid' : 'postpaid',
        billersCode: watchedMeterNumber,
        serviceID: selectedProviderData.service_id
      });

      if (result.data && !result.data.WrongBillersCode) {
        setVerificationStatus('success');
        setCustomerInfo(result.data);
        Toast.show({ 
          type: 'success', 
          text1: 'Meter verified successfully!',
          text2: `Customer: ${result.data.Customer_Name}`
        });
      } else {
        setVerificationStatus('error');
        setCustomerInfo(null);
        Toast.show({ 
          type: 'error', 
          text1: 'Meter verification failed',
          text2: result.data?.WrongBillersCode ? 'Invalid meter number' : result.message || 'Unknown error'
        });
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setCustomerInfo(null);
      Toast.show({ 
        type: 'error', 
        text1: 'Verification failed',
        text2: error?.message || 'Please try again'
      });
    }
  };

  React.useEffect(() => {
    setVerificationStatus('idle');
    setCustomerInfo(null);
  }, [watchedMeterNumber, selectedProvider, isPrepaid]);

  const onSubmit = (data: ElectricityFormInputs) => {
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
  };

  const handleSelectContact = (phoneNumber: string) => {
    setValue('phoneNumber', phoneNumber);
    trigger('phoneNumber');
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1">
      <LoadingSpinner isPending={isPending} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="p-4"
        refreshControl={
          <RefreshControl
            refreshing={loadingElectricityServices || false}
            onRefresh={refetchElectricityServices}
            colors={[COLORS.light.primary]}
          />
        }
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider}
          />
        </View>

        <View className="bg-card rounded-xl p-4 py-5 flex-row items-center justify-end gap-4 mb-4 shadow-sm">
          <Text className={`text-base font-semibold ${isPrepaid ? 'text-primary' : 'text-foreground'}`}>Prepaid</Text>
          <TouchableOpacity
            className={`w-10 h-6 rounded-full justify-center bg-primary`}
            onPress={() => setIsPrepaid(prev => !prev)}
          >
            <View
              className={`w-4 h-4 rounded-full bg-card ${
                isPrepaid === false
                  ? 'ml-auto mr-1'
                  : 'ml-1'
              }`}
            />
          </TouchableOpacity>
          <Text className={`text-base font-semibold ${!isPrepaid ? 'text-primary' : 'text-foreground'}`}>Postpaid</Text>
        </View>

        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-muted-foreground mb-2">📟 Meter Number:</Text>
          <View className="flex-row items-center gap-2">
            <Controller
              control={control}
              name="meterNumber"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Enter Meter Number here."
                  value={value}
                  placeholderTextColor={colors.mutedForeground}
                  onChangeText={onChange}
                  className="flex-1 border border-border rounded-lg px-4 py-4 text-sm text-foreground"
                />
              )}
            />
            <TouchableOpacity
              onPress={handleVerifyMeter}
              disabled={isVerifyingMeter || !watchedMeterNumber || watchedMeterNumber.length < 5}
              className={`px-4 py-4 rounded-2xl ${
                isVerifyingMeter || !watchedMeterNumber || watchedMeterNumber.length < 5
                  ? 'bg-primary/50'
                  : 'bg-primary'
              }`}
            >
              {isVerifyingMeter ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-medium text-sm">Verify</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Verification Status */}
          {verificationStatus !== 'idle' && (
            <View className={`mt-3 p-3 rounded-lg flex-row items-center ${
              verificationStatus === 'success' ? 'bg-green-500/10' : 
              verificationStatus === 'error' ? 'bg-red-500/10' :
              'bg-blue-500/10'
            }`}>
              <Ionicons 
                name={
                  verificationStatus === 'success' ? 'checkmark-circle' :
                  verificationStatus === 'error' ? 'close-circle' :
                  'information-circle'
                }
                size={20}
                color={
                  verificationStatus === 'success' ? '#10B981' :
                  verificationStatus === 'error' ? '#EF4444' :
                  '#3B82F6'
                }
              />
              <View className="ml-2 flex-1">
                {verificationStatus === 'success' && customerInfo && (
                  <>
                    <Text className="text-green-800 dark:text-green-500 font-medium text-sm">✓ Meter Verified</Text>
                    <Text className="text-green-700 dark:text-green-300 text-sm mt-1">
                      Customer: {customerInfo.Customer_Name}
                    </Text>
                    {customerInfo.Address && (
                      <Text className="text-green-600 dark:text-green-300 text-xs mt-1">
                        Address: {customerInfo.Address}
                      </Text>
                    )}
                    {customerInfo.Outstanding > 0 && (
                      <Text className="text-orange-600 dark:text-orange-300 text-xs mt-1">
                        Outstanding: ₦{customerInfo.Outstanding.toLocaleString()}
                      </Text>
                    )}
                  </>
                )}
                {verificationStatus === 'error' && (
                  <>
                    <Text className="text-red-800 dark:text-destructive font-medium text-sm">✗ Verification Failed</Text>
                    <Text className="text-red-700 dark:text-destructive text-sm mt-1">
                      Please check the meter number and try again
                    </Text>
                  </>
                )}
                {verificationStatus === 'loading' && (
                  <Text className="text-blue-800 dark:text-blue-400 font-medium text-sm">Verifying meter...</Text>
                )}
              </View>
            </View>
          )}
          
          {errors.meterNumber && (
            <Text className="text-destructive text-xs mt-1">{errors.meterNumber.message}</Text>
          )}
        </View>

        {/* Phone Number */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <PhoneNumberInput
                className="border !border-primary text-sm"
                value={value}
                onChange={onChange}
                error={errors.phoneNumber?.message}
                onSelectContact={handleSelectContact}
              />
            )}
          />
        </View>

        {/* Amount */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-muted-foreground mb-2">💰 Amount:</Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter Amount here"
                keyboardType="numeric"
                value={value ? value.toString() : ''}
                placeholderTextColor={colors.mutedForeground}
                onChangeText={(text) => {
                  const numericValue = parseFloat(text) || 0;
                  onChange(numericValue);
                }}
                className="border border-border rounded-lg px-4 py-4 text-center text-xl font-semibold text-foreground"
              />
            )}
          />
          
          {/* Commission Breakdown */}
          {watchedAmount > 0 && (
            <View className="mt-3 p-3 bg-secondary rounded-lg">
              <View className="flex-row justify-between mb-1">
                <Text className="text-muted-foreground text-sm">Amount</Text>
                <Text className="text-foreground text-sm">₦{watchedAmount.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between mb-1">
                <Text className="text-muted-foreground text-sm">Charges (10%)</Text>
                <Text className="text-foreground text-sm">₦{commissionAmount.toLocaleString()}</Text>
              </View>
              <View className="border-t border-border mt-2 pt-2">
                <View className="flex-row justify-between">
                  <Text className="text-foreground font-semibold text-base">Total</Text>
                  <Text className="text-primary font-bold text-base">₦{totalAmount.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          )}
          
          {customerInfo?.Min_Purchase_Amount && (
            <Text className="text-muted-foreground text-xs mt-1">
              Minimum purchase: ₦{customerInfo.Min_Purchase_Amount.toLocaleString()}
            </Text>
          )}
          {errors.amount && (
            <Text className="text-destructive text-xs mt-1">{errors.amount.message}</Text>
          )}
        </View>

        {/* Continue Button */}
        <View className="flex-1 justify-end pb-4">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="rounded-2xl overflow-hidden"
            disabled={
              isPending || 
              // (walletBalance?.balance || 0) < totalAmount || 
              verificationStatus !== 'success'
            }
          >
            <LinearGradient
              colors={['#7B2FF2', '#F357A8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 items-center justify-center rounded-md"
            >
              {isPending ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Continue</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ElectricityConfirmationModal
        isVisible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        electricityData={{
          serviceID: selectedProvider!,
          meterNumber: getValues('meterNumber'),
          phoneNumber: getValues('phoneNumber'),
          amount: getValues('amount'),
          commissionAmount: commissionAmount,
          totalAmount: totalAmount,
          isPrepaid: isPrepaid,
          customerInfo: customerInfo
        }}
      />
    </SafeAreaView>
  );
};

export default BuyElectricityScreen;

