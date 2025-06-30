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
import { useSession } from '../session-context';
import { LinearGradient } from 'expo-linear-gradient';
import LoadingSpinner from '../ui/loading-spinner';
import TvPlanSelector from './tv-plan-selector';
import TvProviderSelector from './tv-provider-selector';

const electricitySchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  smartCardNumber: z
    .string()
    .min(5, 'Decoder number is required'),
  amount: z
    .string()
    .min(1, 'Amount is required'),
});

type ElectricityFormInputs = z.infer<typeof electricitySchema>;

const BuyTvCableScreen = () => {
  const [isPending, setIsPending] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
   const [selectedProviderId, setSelectedProviderId] = useState<string | null>('dstv');
    const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { user } = useSession();

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
      smartCardNumber: '',
      amount: '',
    },
  });


    const handleSelectProvider = (providerId: string) => {
    setSelectedProviderId(providerId);
  };

  const onSubmit = (data: ElectricityFormInputs) => {
    if (!selectedProvider) {
      Toast.show({ type: 'error', text1: 'Please select a provider.' });
      return;
    }

    const payload = {
            billersCode: data.smartCardNumber,
            phone: data.phoneNumber,
            serviceID: selectedProvider,
            variation_code: selectedPlan.variation_code,
            amount: selectedPlan.variation_amount,
       };

    console.log('Payload:', payload);
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
            refreshing={false}
            onRefresh={() => {
              // Handle refresh logic here
            }}
            colors={[COLORS.light.primary]}
          />
        }
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        {/* Provider */}
        <View className="bg-card rounded-xl p-1 mb-4 shadow-sm">
          <TvProviderSelector
           providers={providers}
           selectedProviderId={selectedProviderId}
           onSelectProvider={handleSelectProvider}
          />
        </View>

     

        {/* Meter Number */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <Text className="text-sm font-medium text-muted-foreground mb-2">📟 Decoder Number:</Text>
          <Controller
            control={control}
            name="smartCardNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter Decoder Number here."
                value={value}
                onChangeText={onChange}
                className="border border-border rounded-lg px-4 py-4 text-sm"
              />
            )}
          />
          {errors.smartCardNumber && (
            <Text className="text-red-500 text-xs mt-1">{errors.smartCardNumber.message}</Text>
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

         {/* Provider */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
         <TvPlanSelector
            selectedProviderId={selectedProviderId}
            plans={selectedProviderId === 'dstv' ? dstv_subscription : selectedProviderId === 'gotv' ? gotv_subscription : selectedProviderId === 'startimes' ? startimes_subscription :  selectedProviderId === 'showmax' ? showmax_subscription : []}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
           />

        </View>

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

export default BuyTvCableScreen;



export const providers = [
    { id: 'dstv', name: 'DSTV', logo: require('../../assets/services/tv-cables/ds-tv-logo.jpg') },
    { id: 'gotv', name: 'GOTV', logo: require('../../assets/services/tv-cables/go-tv-logo.png') },
    { id: 'startimes', name: 'Star Times', logo: require('../../assets/services/tv-cables/star-times-logo.png') },
    { id: 'showmax', name: 'ShowMax', logo: require('../../assets/services/tv-cables/show-max-logo.png') },
];






export const startimes_subscription = [
    { "variation_code": "nova", "name": "Nova - 900 Naira - 1 Month", "variation_amount": "900.00", "fixedPrice": "Yes", "cashBack": "₦9.00" },
    { "variation_code": "basic", "name": "Basic - 1,700 Naira - 1 Month", "variation_amount": "1700.00", "fixedPrice": "Yes", "cashBack": "₦17.00" },
    { "variation_code": "smart", "name": "Smart - 2,200 Naira - 1 Month", "variation_amount": "2200.00", "fixedPrice": "Yes", "cashBack": "₦22.00" },
    { "variation_code": "classic", "name": "Classic - 2,500 Naira - 1 Month", "variation_amount": "2500.00", "fixedPrice": "Yes", "cashBack": "₦25.00" },
    { "variation_code": "super", "name": "Super - 4,200 Naira - 1 Month", "variation_amount": "4200.00", "fixedPrice": "Yes", "cashBack": "₦42.00" },
    { "variation_code": "nova-weekly", "name": "Nova - 300 Naira - 1 Week", "variation_amount": "300.00", "fixedPrice": "Yes", "cashBack": "₦3.00" },
    { "variation_code": "basic-weekly", "name": "Basic - 600 Naira - 1 Week", "variation_amount": "600.00", "fixedPrice": "Yes", "cashBack": "₦6.00" },
    { "variation_code": "smart-weekly", "name": "Smart - 700 Naira - 1 Week", "variation_amount": "700.00", "fixedPrice": "Yes", "cashBack": "₦7.00" },
    { "variation_code": "classic-weekly", "name": "Classic - 1200 Naira - 1 Week", "variation_amount": "1200.00", "fixedPrice": "Yes", "cashBack": "₦12.00" },
    { "variation_code": "super-weekly", "name": "Super - 1,500 Naira - 1 Week", "variation_amount": "1500.00", "fixedPrice": "Yes", "cashBack": "₦15.00" },
    { "variation_code": "nova-daily", "name": "Nova - 90 Naira - 1 Day", "variation_amount": "90.00", "fixedPrice": "Yes", "cashBack": "₦0.90" },
    { "variation_code": "basic-daily", "name": "Basic - 160 Naira - 1 Day", "variation_amount": "160.00", "fixedPrice": "Yes", "cashBack": "₦1.60" },
    { "variation_code": "smart-daily", "name": "Smart - 200 Naira - 1 Day", "variation_amount": "200.00", "fixedPrice": "Yes", "cashBack": "₦2.00" },
    { "variation_code": "classic-daily", "name": "Classic - 320 Naira - 1 Day", "variation_amount": "320.00", "fixedPrice": "Yes", "cashBack": "₦3.20" },
    { "variation_code": "super-daily", "name": "Super - 400 Naira - 1 Day", "variation_amount": "400.00", "fixedPrice": "Yes", "cashBack": "₦4.00" },
    { "variation_code": "ewallet", "name": "ewallet Amount", "variation_amount": "0.00", "fixedPrice": "Yes", "cashBack": "₦0.00" }
];




export const dstv_subscription = [
    { "variation_code": "dstv-padi", "name": "DStv Padi N1,850", "variation_amount": "1850.00", "fixedPrice": "Yes", "cashBack": "₦18.50" },
    { "variation_code": "dstv-yanga", "name": "DStv Yanga N2,565", "variation_amount": "2565.00", "fixedPrice": "Yes", "cashBack": "₦25.65" },
    { "variation_code": "dstv-confam", "name": "Dstv Confam N4,615", "variation_amount": "4615.00", "fixedPrice": "Yes", "cashBack": "₦46.15" },
    { "variation_code": "dstv79", "name": "DStv Compact N7,900", "variation_amount": "7900.00", "fixedPrice": "Yes", "cashBack": "₦79.00" },
    { "variation_code": "dstv3", "name": "DStv Premium N18,400", "variation_amount": "18400.00", "fixedPrice": "Yes", "cashBack": "₦184.00" },
    { "variation_code": "dstv6", "name": "DStv Asia N6,200", "variation_amount": "6200.00", "fixedPrice": "Yes", "cashBack": "₦62.00" },
    { "variation_code": "dstv7", "name": "DStv Compact Plus N12,400", "variation_amount": "12400.00", "fixedPrice": "Yes", "cashBack": "₦124.00" },
    { "variation_code": "dstv9", "name": "DStv Premium-French N25,550", "variation_amount": "25550.00", "fixedPrice": "Yes", "cashBack": "₦255.50" },
    { "variation_code": "dstv10", "name": "DStv Premium-Asia N20,500", "variation_amount": "20500.00", "fixedPrice": "Yes", "cashBack": "₦205.00" },
    { "variation_code": "confam-extra", "name": "DStv Confam + ExtraView N7,115", "variation_amount": "7115.00", "fixedPrice": "Yes", "cashBack": "₦71.15" },
    { "variation_code": "yanga-extra", "name": "DStv Yanga + ExtraView N5,065", "variation_amount": "5065.00", "fixedPrice": "Yes", "cashBack": "₦50.65" },
    { "variation_code": "padi-extra", "name": "DStv Padi + ExtraView N4,350", "variation_amount": "4350.00", "fixedPrice": "Yes", "cashBack": "₦43.50" },
    { "variation_code": "com-asia", "name": "DStv Compact + Asia N14,100", "variation_amount": "14100.00", "fixedPrice": "Yes", "cashBack": "₦141.00" },
    { "variation_code": "dstv30", "name": "DStv Compact + Extra View N10,400", "variation_amount": "10400.00", "fixedPrice": "Yes", "cashBack": "₦104.00" },
    { "variation_code": "com-frenchtouch", "name": "DStv Compact + French Touch N10,200", "variation_amount": "10200.00", "fixedPrice": "Yes", "cashBack": "₦102.00" },
    { "variation_code": "dstv33", "name": "DStv Premium - Extra View N20,900", "variation_amount": "20900.00", "fixedPrice": "Yes", "cashBack": "₦209.00" },
    { "variation_code": "dstv40", "name": "DStv Compact Plus - Asia N18,600", "variation_amount": "18600.00", "fixedPrice": "Yes", "cashBack": "₦186.00" },
    { "variation_code": "com-frenchtouch-extra", "name": "DStv Compact + French Touch + ExtraView N12,700", "variation_amount": "12700.00", "fixedPrice": "Yes", "cashBack": "₦127.00" },
    { "variation_code": "com-asia-extra", "name": "DStv Compact + Asia + ExtraView N16,600", "variation_amount": "16600.00", "fixedPrice": "Yes", "cashBack": "₦166.00" },
    { "variation_code": "dstv43", "name": "DStv Compact Plus + French Plus N20,500", "variation_amount": "20500.00", "fixedPrice": "Yes", "cashBack": "₦205.00" },
    { "variation_code": "complus-frenchtouch", "name": "DStv Compact Plus + French Touch N14,700", "variation_amount": "14700.00", "fixedPrice": "Yes", "cashBack": "₦147.00" },
    { "variation_code": "dstv45", "name": "DStv Compact Plus - Extra View N14,900", "variation_amount": "14900.00", "fixedPrice": "Yes", "cashBack": "₦149.00" },
    { "variation_code": "complus-french-extraview", "name": "DStv Compact Plus + FrenchPlus + Extra View N23,000", "variation_amount": "23000.00", "fixedPrice": "Yes", "cashBack": "₦230.00" },
    { "variation_code": "dstv47", "name": "DStv Compact + French Plus N16,000", "variation_amount": "16000.00", "fixedPrice": "Yes", "cashBack": "₦160.00" },
    { "variation_code": "dstv48", "name": "DStv Compact Plus + Asia + ExtraView N21,100", "variation_amount": "21100.00", "fixedPrice": "Yes", "cashBack": "₦211.00" },
    { "variation_code": "dstv61", "name": "DStv Premium + Asia + Extra View N23,000", "variation_amount": "23000.00", "fixedPrice": "Yes", "cashBack": "₦230.00" },
    { "variation_code": "dstv62", "name": "DStv Premium + French + Extra View N28,050", "variation_amount": "28050.00", "fixedPrice": "Yes", "cashBack": "₦280.50" },
    { "variation_code": "hdpvr-access-service", "name": "DStv HDPVR Access Service N2,500", "variation_amount": "2500.00", "fixedPrice": "Yes", "cashBack": "₦25.00" },
    { "variation_code": "frenchplus-addon", "name": "DStv French Plus Add-on N8,100", "variation_amount": "8100.00", "fixedPrice": "Yes", "cashBack": "₦81.00" },
    { "variation_code": "asia-addon", "name": "DStv Asian Add-on N6,200", "variation_amount": "6200.00", "fixedPrice": "Yes", "cashBack": "₦62.00" },
    { "variation_code": "frenchtouch-addon", "name": "DStv French Touch Add-on N2,300", "variation_amount": "2300.00", "fixedPrice": "Yes", "cashBack": "₦23.00" },
    { "variation_code": "extraview-access", "name": "ExtraView Access N2,500", "variation_amount": "2500.00", "fixedPrice": "Yes", "cashBack": "₦25.00" },
    { "variation_code": "french11", "name": "DStv French 11 N3,260", "variation_amount": "3260.00", "fixedPrice": "Yes", "cashBack": "₦32.60" }
];




export const gotv_subscription = [
    { "variation_code": "gotv-lite", "name": "GOtv Lite N410", "variation_amount": "410.00", "fixedPrice": "Yes", "cashBack": "₦4.10" },
    { "variation_code": "gotv-max", "name": "GOtv Max N3,600", "variation_amount": "3600.00", "fixedPrice": "Yes", "cashBack": "₦36.00" },
    { "variation_code": "gotv-jolli", "name": "GOtv Jolli N2,460", "variation_amount": "2460.00", "fixedPrice": "Yes", "cashBack": "₦24.60" },
    { "variation_code": "gotv-jinja", "name": "GOtv Jinja N1,640", "variation_amount": "1640.00", "fixedPrice": "Yes", "cashBack": "₦16.40" },
    { "variation_code": "gotv-lite-3months", "name": "GOtv Lite (3 Months) N1,080", "variation_amount": "1080.00", "fixedPrice": "Yes", "cashBack": "₦10.80" },
    { "variation_code": "gotv-lite-1year", "name": "GOtv Lite (1 Year) N3,180", "variation_amount": "3180.00", "fixedPrice": "Yes", "cashBack": "₦31.80" }
];




export const showmax_subscription = [
    { "variation_code": "full", "name": "Full - N2,900", "variation_amount": "2900.00", "fixedPrice": "Yes", "cashBack": "₦29.00" },
    { "variation_code": "mobile_only", "name": "Mobile Only - N1,450", "variation_amount": "1450.00", "fixedPrice": "Yes", "cashBack": "₦14.50" },
    { "variation_code": "sports_full", "name": "Sports Full - N6,300", "variation_amount": "6300.00", "fixedPrice": "Yes", "cashBack": "₦63.00" },
    { "variation_code": "sports_mobile_only", "name": "Sports Mobile Only - N3,200", "variation_amount": "3200.00", "fixedPrice": "Yes", "cashBack": "₦32.00" }
];
