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
import EducationTypeSelector from './education-type-selector';
import { formatNigerianNaira } from '@/utils/format-naira';

const electricitySchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  profileCode: z
    .string()
    .min(5, 'Profile code is required'),
  amount: z
    .number()
    .min(1, 'Amount is required'),
});

type ElectricityFormInputs = z.infer<typeof electricitySchema>;

const BuyEducationScreen = () => {
  const [isUTME, setIsUTME] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'waec' | 'jamb'>('waec');
  const { user, refetchAppConfig, loadingAppConfig, appConfig } = useSession();

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
      profileCode: '',
      amount: selectedProvider === "jamb" ? appConfig?.jamb_price : appConfig?.waec_price,
    },
  });

//   console.log("selectedProvider:", selectedProvider);

  const onSubmit = (data: ElectricityFormInputs) => {
    if (!selectedProvider) {
      Toast.show({ type: 'error', text1: 'Please select a provider.' });
      return;
    }

    const payload = {
       billersCode: data.profileCode,
            phone: data.phoneNumber,
            serviceID: selectedProvider === "jamb" ? "jamb" : "waec",
            variation_code:
                selectedProvider === "jamb"
                    ? isUTME
                        ? "utme"
                        : "de"
                    : "waecdirect",
            amount: data.amount,
    };

    console.log(' Payload:', payload);
    Toast.show({ type: 'success', text1: 'Submitted!', text2: 'Check console for payload.' });
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 ">
      <LoadingSpinner isPending={isPending} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="p-4"
        refreshControl={
          <RefreshControl
            refreshing={loadingAppConfig || false}
            onRefresh={refetchAppConfig}
            colors={[COLORS.light.primary]}
          />
        }
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      >
        {/* Provider */}
        <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
          <EducationTypeSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider as any}
          />
        </View>

        {/* Profile code  / Jamb type only for Jamb */}
        {
            selectedProvider === "jamb" && 
            (
                <>
                <View className="bg-card rounded-xl p-4 flex-row items-center justify-end gap-4 mb-4 shadow-sm py-5">
                  <Text className={`text-base font-semibold ${isUTME ? 'text-primary' : 'text-foreground'}`}>UTME</Text>
                  <TouchableOpacity
                      className={`w-10 h-6 rounded-full justify-center ${
                      isUTME === true
                          ? 'bg-primary'
                          : 'bg-primary'
                      }`}
                      onPress={() => setIsUTME(prev => !prev)}
                    >
                      <View
                        className={`w-4 h-4 rounded-full bg-card ${
                            isUTME === false
                            ? 'ml-auto mr-1'
                            : 'ml-1'
                        }`}
                      />
                    </TouchableOpacity>

                  <Text className={`text-base font-semibold ${!isUTME ? 'text-primary' : 'text-foreground'}`}>DE</Text>
                </View>

                <View className="bg-card rounded-xl p-4 mb-4 shadow-sm">
                <Text className="text-sm font-medium text-muted-foreground mb-2">👤 Profile Code:</Text>
                
                <Controller
                    control={control}
                    name="profileCode"
                    render={({ field: { onChange, value } }) => (
                    <TextInput
                        placeholder="Enter your profile code here."
                        value={value}
                        onChangeText={onChange}
                        className="border border-border rounded-lg px-4 py-4 text-sm"
                    />
                    )}
                />
                {errors.profileCode && (
                    <Text className="text-red-500 text-xs mt-1">{errors.profileCode.message}</Text>
                )}
                </View>
                </>

            )
        }

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
        <View className="bg-card flex flex-col gap-4 rounded-xl p-4 mb-4 shadow-sm">
         <Text className=' text-lg font-bold text-primary'>Amount to pay:</Text>
         <Text  className="border text-primary border-primary rounded-lg px-4 py-4 text-lg font-bold" >{selectedProvider === "jamb" ? formatNigerianNaira(4500) : formatNigerianNaira(3500)}</Text>
        {/* Continue Button */}

        </View>


       <View className="flex-1 justify-end pb-4">
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            className="rounded-2xl overflow-hidden"
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

export default BuyEducationScreen;


