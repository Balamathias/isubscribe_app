import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import { COLORS } from '@/constants/colors';
import ProviderSelector from './provider-selector';
import { useSession } from '../session-context';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingSpinner from '../ui/loading-spinner';

const electricitySchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  meterNumber: z
    .string()
    .min(5, 'Meter number is required'),
  amount: z
    .string()
    .min(1, 'Amount is required'),
});

type ElectricityFormInputs = z.infer<typeof electricitySchema>;

const BuyElectricityScreen = () => {
  const [isPrepaid, setIsPrepaid] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>('abuja');
  const { user, refetchDataPlans, loadingDataPlans } = useSession();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<ElectricityFormInputs>({
    resolver: zodResolver(electricitySchema),
    defaultValues: {
      phoneNumber: user?.user_metadata?.phone || '',
      meterNumber: '',
      amount: '',
    },
  });

  const onSubmit = (data: ElectricityFormInputs) => {
    if (!selectedProvider) {
      Toast.show({ type: 'error', text1: 'Please select a provider.' });
      return;
    }

    const payload = {
            billersCode: data.meterNumber,
            phone: data.phoneNumber,
            serviceID:selectedProvider,
            variation_code:isPrepaid ? 'prepaid' : 'postpaid',
            amount: data.amount,
    };

    console.log(' Payload:', payload);
    Toast.show({ type: 'success', text1: 'Submitted!', text2: 'Check console for payload.' });
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1">
      <LoadingSpinner isPending={isPending} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="p-4"
        refreshControl={
          <RefreshControl
            refreshing={loadingDataPlans}
            onRefresh={refetchDataPlans}
            colors={[COLORS.light.primary]}
          />
        }
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        
        {/* Provider */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider}
          />
        </View>

        {/* Prepaid / Postpaid Toggle */}
        <View className="bg-card rounded-xl p-4 py-5 flex-row items-center justify-end gap-4 mb-4 shadow-sm">
          <Text className={`text-base font-semibold ${isPrepaid ? 'text-primary' : 'text-foreground'}`}>Prepaid</Text>
          <TouchableOpacity
            className={`w-10 h-6 rounded-full justify-center ${
              isPrepaid === true
                ? 'bg-primary'
                : 'bg-primary'
            }`}
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

        {/* Meter Number */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-muted-foreground mb-2">📟 Meter Number:</Text>
          <Controller
            control={control}
            name="meterNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter Meter Number here."
                value={value}
                onChangeText={onChange}
                className="border border-border rounded-lg px-4 py-4 text-sm"
              />
            )}
          />
          {errors.meterNumber && (
            <Text className="text-red-500 text-xs mt-1">{errors.meterNumber.message}</Text>
          )}
        </View>

        {/* Phone Number */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-muted-foreground mb-2">📞 Phone Number:</Text>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter Phone Number here."
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                className="border border-border rounded-lg px-4 py-4 text-sm"
              />
            )}
          />
          {errors.phoneNumber && (
            <Text className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</Text>
          )}
        </View>

        {/* Amount */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <TextInput
            placeholder="₦ Enter Amount here"
            keyboardType="numeric"
            onChangeText={text => setValue('amount', text)}
            className="border border-border rounded-lg px-4 py-4 text-center text-base font-medium"
          />
          {errors.amount && (
            <Text className="text-red-500 text-xs mt-1">{errors.amount.message}</Text>
          )}
        </View>

        {/* Continue Button */}
      <View className="flex-1 justify-end pb-4">
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="rounded-full overflow-hidden"
        >
          <LinearGradient
            colors={['#7B2FF2', '#F357A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 items-center justify-center rounded-md"
          >
            {isPending ? (
              <ActivityIndicator color="card" />
            ) : (
              <Text className="text-card font-bold text-lg">Continue</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuyElectricityScreen;

