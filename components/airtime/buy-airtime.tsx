import NetworkSelector from '@/components/data/network-selector';
import PhoneNumberInput from '@/components/data/phone-number-input';
import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import AirtimeCard, { Airtime } from './airtime-card';
import AirtimeDetailsModal from './airtime-detail-modal';
import Header from './header';
import { useSession } from '../session-context';
import { SafeAreaView } from 'react-native-safe-area-context';

const buyAirtimeSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  customAirtimeAmount: z.string().optional().refine(val => {
    if (val === undefined || val === '') return true; // Allow empty
    const num = Number(val);
    return !isNaN(num) && num > 0;
  }, { message: 'Please enter a valid amount' }),
});

type BuyAirtimeFormInputs = z.infer<typeof buyAirtimeSchema>;

const BuyAirtimeScreen = () => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>('mtn');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { user } = useSession()

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const { control, watch, handleSubmit, formState: { errors }, setValue, getValues, trigger } = useForm<BuyAirtimeFormInputs>({
    resolver: zodResolver(buyAirtimeSchema),
    defaultValues: {
      phoneNumber: user?.user_metadata?.phone || '',
      customAirtimeAmount: '',
    },
  });

  const handleSelectNetwork = (networkId: string) => {
    setSelectedNetworkId(networkId);
    setSelectedPlanPrice(null);
    setValue('customAirtimeAmount', '');
  };

  const handleSelectPlan = (plan: Airtime) => {
    setSelectedPlanPrice(plan.price);
    setValue('customAirtimeAmount', '');
  };

  const handleCardPress = (plan: Airtime) => {
    setIsModalVisible(true);
  };

  const handleCustomAmountChange = (text: string) => {
    setSelectedPlanPrice(null); 
    setValue('customAirtimeAmount', text, { shouldValidate: true }); 
  };

  const handleAirtimeCardPress = async (plan: Airtime) => {
    const isValidPhoneNumber = await trigger('phoneNumber');
    
    if (isValidPhoneNumber) {
      handleCardPress(plan);
    } else {
      if (errors.phoneNumber?.message) {
        Toast.show({ type: 'error', text1: errors.phoneNumber.message });
      } else {
        Toast.show({ type: 'warning', text1: 'Please provide a valid phone number to continue.' });
      }
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handlePhoneNumberChange = (text: string) => {
    setValue('phoneNumber', text);
  };

  const onSubmit = (data: BuyAirtimeFormInputs) => {
    if (!selectedNetworkId) {
      alert('Please select a network.');
      return;
    }

    const customAmountNum = Number(data.customAirtimeAmount);
    let finalAmount: number | null = selectedPlanPrice;

    if (data.customAirtimeAmount && !isNaN(customAmountNum) && customAmountNum > 0) {
        finalAmount = customAmountNum;
    }

    if (!finalAmount || finalAmount <= 0) {
      Toast.show({text1: 'Please select an airtime plan or enter a valid custom amount.', type: 'info'});
      return;
    }

    const payload = {
      phoneNumber: data.phoneNumber,
      networkId: selectedNetworkId,
      airtimeAmount: finalAmount,
    };
    console.log('Buy Airtime Payload:', payload);
    alert('Airtime purchase initiated! Check console for payload.');
  };

  const customAmountNum = Number(getValues('customAirtimeAmount'));
  const finalAmountForModal = (getValues('customAirtimeAmount') && !isNaN(customAmountNum) && customAmountNum > 0)
    ? customAmountNum
    : selectedPlanPrice;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background/50 h-full">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4">
       
       <View className=' bg-background p-4 py-1 rounded-xl shadow-sm mb-4'>
        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, value } }) => (
            <PhoneNumberInput
              value={value}
              onChange={(e) => {
                onChange(e)
                setValue('phoneNumber', e)
              }}
              error={errors.phoneNumber?.message}
              onSelectContact={(number) => {
                setValue('phoneNumber', number);
              }}
            />
          )}
        />

       </View>

        <NetworkSelector
          networks={networks}
          selectedNetworkId={selectedNetworkId}
          onSelectNetwork={handleSelectNetwork}
          phoneNumber={watch('phoneNumber')}
        />

        <Text className="text-foreground text-xl font-bold mt-8 mb-4 ml-2">Quick Plans</Text>
        <View className="flex flex-1 flex-row flex-wrap gap-x-3 gap-y-3 pb-6 bg-background p-4 rounded-xl shadow-sm mb-6">
          {quickPlans?.map((planPrice) => (
            <AirtimeCard
              phoneNumber={getValues('phoneNumber')}
              key={planPrice}
              plan={{
                bonusMb: (planPrice * 0.02),
                id: String(planPrice),
                price: planPrice,
                size: String(planPrice),
              }}
              onSelectPlan={handleSelectPlan}
              isSelected={selectedPlanPrice === planPrice && !getValues('customAirtimeAmount')}
              onPress={() => handleAirtimeCardPress({
                bonusMb: (planPrice * 0.02),
                id: String(planPrice),
                price: planPrice,
                size: String(planPrice),
              })}
            />
          ))}
        </View>

        <View className=' bg-background p-4 py-1 rounded-xl shadow-sm mb-4'>
          <Controller
            control={control}
            name="customAirtimeAmount"
            render={({ field: { onChange, value } }) => (
              <View className="mb-4">
                <Text className="text-foreground text-xl font-medium mb-4 ml-2">Enter Amount</Text>
                <TextInput
                  className="w-full p-5 rounded-xl bg-input text-foreground text-base"
                  placeholder="Enter amount (e.g., 250)"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    handleCustomAmountChange(text);
                  }}
                  onFocus={() => setSelectedPlanPrice(null)}
                />
                {errors.customAirtimeAmount && (
                  <Text className="text-destructive text-sm mt-1 ml-2">{errors.customAirtimeAmount.message}</Text>
                )}
              </View>
            )}
          />

          <TouchableOpacity
              className="rounded-full py-4 items-center overflow-hidden bg-primary flex flex-row justify-center gap-x-1 mb-4 mt-auto"
              onPress={async () => {
                  const isValidPhoneNumber = await trigger('phoneNumber');
                  const isValidCustomAmount = await trigger('customAirtimeAmount');

                  if (isValidPhoneNumber && isValidCustomAmount) {
                      const customAmountValue = Number(getValues('customAirtimeAmount'));
                      if (customAmountValue > 0) {
                          handleCardPress({
                              bonusMb: (customAmountValue * 0.02),
                              id: String(customAmountValue),
                              price: customAmountValue,
                              size: String(customAmountValue),
                          });
                      }
                  } else {
                    if (errors.phoneNumber?.message) {
                      Toast.show({ type: 'error', text1: errors.phoneNumber.message });
                    } else if (errors.customAirtimeAmount?.message) {
                      Toast.show({ type: 'error', text1: errors.customAirtimeAmount.message });
                    } else {
                      Toast.show({ type: 'warning', text1: 'Please provide a valid phone number and custom amount to continue.' });
                    }
                  }
              }}
              activeOpacity={0.5}
              disabled={!getValues('customAirtimeAmount') || !!errors.customAirtimeAmount || Number(getValues('customAirtimeAmount')) < 50 || Number(getValues('customAirtimeAmount')) > 50000}
          >
              <LinearGradient
                  colors={[colors.primary, '#e65bf8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute inset-0"
              />
              <Text className="text-primary-foreground text-lg font-bold">
                  {Number(getValues('customAirtimeAmount')) < 50 || Number(getValues('customAirtimeAmount')) > 50000 
                      ? 'Between ₦50 - ₦50,000'
                      : `Buy ${formatNigerianNaira(customAmountNum)}`
                  }
              </Text>
          </TouchableOpacity>

        </View>


        <View className='mt-5' />

        <AirtimeDetailsModal
            networkId={selectedNetworkId || 'mtn'}
            isVisible={isModalVisible}
            onClose={closeModal}
            phoneNumber={getValues('phoneNumber')}
            selectedPlan={finalAmountForModal ? { id: String(finalAmountForModal), price: finalAmountForModal, size: String(finalAmountForModal), bonusMb: finalAmountForModal * 0.01 } : null}
            onSubmit={handleSubmit(onSubmit)}
        />
      </ScrollView>

    </SafeAreaView>
  );
};


export const networks = [
    { id: 'mtn', name: 'MTN', logo: require('../../assets/services/mtn.png') },
    { id: 'glo', name: 'GLO', logo: require('../../assets/services/glo.png') },
    { id: 'airtel', name: 'Airtel', logo: require('../../assets/services/airtel.png') },
    { id: '9mobile', name: '9MOBILE', logo: require('../../assets/services/9mobile.png') },
];

export const quickPlans = [
    50,
    100,
    200,
    500,
    1000,
    2000,
]
    

export default BuyAirtimeScreen; 