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
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
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
      provider: selectedProvider,
      meterType: isPrepaid ? 'prepaid' : 'postpaid',
      phoneNumber: data.phoneNumber,
      meterNumber: data.meterNumber,
      amount: data.amount,
    };

    console.log('Electricity Purchase Payload:', payload);
    Toast.show({ type: 'success', text1: 'Submitted!', text2: 'Check console for payload.' });
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-[#f5f2ff] ">
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
      >
        
        {/* Provider */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider}
          />
        </View>

        {/* Prepaid / Postpaid Toggle */}
        <View className="bg-white rounded-xl p-4 flex-row items-center justify-end gap-4 mb-4 shadow-sm">
          <Text className="text-base font-semibold text-gray-800">Prepaid</Text>
          {/* <Switch
            value={!isPrepaid}
            onValueChange={() => setIsPrepaid(prev => !prev)}
            trackColor={{ false: '#ccc', true: '#a855f7' }}
            thumbColor="#fff"
          /> */}
           <TouchableOpacity
                className={`w-10 h-6 rounded-full justify-center ${
                  isPrepaid === true
                    ? 'bg-purple-600'
                    : 'bg-purple-600'
                }`}
                onPress={() => setIsPrepaid(prev => !prev)}
              >
                <View
                  className={`w-4 h-4 rounded-full bg-white ${
                    isPrepaid === false
                      ? 'ml-auto mr-1'
                      : 'ml-1'
                  }`}
                />
             </TouchableOpacity>
          <Text className="text-base font-semibold text-gray-800">Postpaid</Text>
        </View>

        {/* Meter Number */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-gray-700 mb-2">📟 Meter Number:</Text>
          <Controller
            control={control}
            name="meterNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter Meter Number here."
                value={value}
                onChangeText={onChange}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            )}
          />
          {errors.meterNumber && (
            <Text className="text-red-500 text-xs mt-1">{errors.meterNumber.message}</Text>
          )}
        </View>

        {/* Phone Number */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-gray-700 mb-2">📞 Phone Number:</Text>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter Phone Number here."
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm"
              />
            )}
          />
          {errors.phoneNumber && (
            <Text className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</Text>
          )}
        </View>

        {/* Amount */}
        <View className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <TextInput
            placeholder="₦ Enter Amount here"
            keyboardType="numeric"
            onChangeText={text => setValue('amount', text)}
            className="border border-gray-300 rounded-lg px-4 py-3 text-center text-base font-medium"
          />
          {errors.amount && (
            <Text className="text-red-500 text-xs mt-1">{errors.amount.message}</Text>
          )}
        </View>

        {/* Continue Button */}
       <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          className="rounded-full mt-6 overflow-hidden"
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
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuyElectricityScreen;



export const networks = [
    { id: 'mtn', name: 'MTN', logo: require('../../assets/services/mtn.png') },
    { id: 'glo', name: 'GLO', logo: require('../../assets/services/glo.png') },
    { id: 'airtel', name: 'Airtel', logo: require('../../assets/services/airtel.png') },
    { id: '9mobile', name: '9MOBILE', logo: require('../../assets/services/9mobile.png') },
];

export const dataBundles = {
    Super: [
        { id: 'super-1gb-1day', size: '1GB', duration: '1 Day', price: 245, bonusMb: 3.41 },
        { id: 'super-2gb-1day', size: '2GB', duration: '1 Day', price: 385, bonusMb: 6.83 },
        { id: 'super-3.5gb-2days', size: '3.5GB', duration: '2 Days', price: 650, bonusMb: 20.48 },
        { id: 'super-15gb-7days', size: '15GB', duration: '7 Days', price: 2700, bonusMb: 51.21 },
        { id: 'super-200mb-30days', size: '200MB', duration: '30 Days', price: 120, bonusMb: 3.41 },
        { id: 'super-500mb-30days', size: '500MB', duration: '30 Days', price: 235, bonusMb: 3.41 },
        { id: 'super-1gb-30days', size: '1GB', duration: '30 Days', price: 470, bonusMb: 6.83 },
        { id: 'super-2gb-30days', size: '2GB', duration: '30 Days', price: 950, bonusMb: 13.66 },
        { id: 'super-3gb-30days', size: '3GB', duration: '30 Days', price: 1390, bonusMb: 20.48 },
        { id: 'super-5gb-30days', size: '5GB', duration: '30 Days', price: 2300, bonusMb: 17.07 },
        { id: 'super-10gb-30days', size: '10GB', duration: '30 Days', price: 4600, bonusMb: 34.14 },
    ],
    Best: [
        { id: 'best-10gb-30days', size: '10GB', duration: '30days', price: 4600, bonusMb: 145.09 },
        { id: 'best-1.5gb-30days', size: '1.5GB', duration: '30days', price: 326, bonusMb: 9.59 },
        { id: 'best-2.5gb-30days', size: '2.5GB', duration: '30days', price: 513, bonusMb: 15.98 },
        { id: 'best-750mb-1day', size: '750MB', duration: '1day', price: 222, bonusMb: 6.38 },
        { id: 'best-10gb-7days', size: '10GB', duration: '7days', price: 2100, bonusMb: 63.84 },
        { id: 'best-1gb-30days', size: '1GB', duration: '30days', price: 460, bonusMb: 14.51 },
        { id: 'best-500mb-30days', size: '500MB', duration: '30days', price: 250, bonusMb: 7.27 },
        { id: 'best-2gb-30days', size: '2GB', duration: '30days', price: 925, bonusMb: 29.02 },
        { id: 'best-3gb-30days', size: '3GB', duration: '30days', price: 1380, bonusMb: 43.53 },
        { id: 'best-5gb-30days', size: '5GB', duration: '30days', price: 2350, bonusMb: 72.55 },
        { id: 'best-200mb-14days', size: '200MB', duration: '14days', price: 180, bonusMb: 5.12 },
        { id: 'best-1gb-3days', size: '1GB', duration: '3days', price: 325, bonusMb: 9.46 },
        { id: 'best-1gb-7days', size: '1GB', duration: '7days', price: 365, bonusMb: 11.03 },
    ],
    Regular: [
        { id: 'reg-1gb-1day', size: '1GB', duration: '1 Day', price: 250, bonusMb: 0 },
        { id: 'reg-2gb-1day', size: '2GB', duration: '1 Day', price: 400, bonusMb: 0 },
    ],
};
    

// export default BuyElectricityScreen; 