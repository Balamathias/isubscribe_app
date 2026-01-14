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
import { Ionicons } from '@expo/vector-icons';

const buyAirtimeSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
  customAirtimeAmount: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === '') return true;
        const num = Number(val);
        return !isNaN(num) && num > 0;
      },
      { message: 'Please enter a valid amount' }
    ),
});

type BuyAirtimeFormInputs = z.infer<typeof buyAirtimeSchema>;

const BuyAirtimeScreen = () => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>('mtn');
  const [selectedPlanPrice, setSelectedPlanPrice] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { user } = useSession();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  const {
    control,
    watch,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    trigger,
  } = useForm<BuyAirtimeFormInputs>({
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

  const handleCardPress = () => {
    setIsModalVisible(true);
  };

  const handleCustomAmountChange = (text: string) => {
    setSelectedPlanPrice(null);
    setValue('customAirtimeAmount', text, { shouldValidate: true });
  };

  const handleAirtimeCardPress = async (plan: Airtime) => {
    const isValidPhoneNumber = await trigger('phoneNumber');

    if (isValidPhoneNumber) {
      handleCardPress();
    } else {
      if (errors.phoneNumber?.message) {
        Toast.show({ type: 'error', text1: errors.phoneNumber.message });
      } else {
        Toast.show({
          type: 'warning',
          text1: 'Please provide a valid phone number to continue.',
        });
      }
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const onSubmit = (data: BuyAirtimeFormInputs) => {
    if (!selectedNetworkId) {
      Toast.show({ type: 'error', text1: 'Please select a network.' });
      return;
    }

    const customAmountNum = Number(data.customAirtimeAmount);
    let finalAmount: number | null = selectedPlanPrice;

    if (data.customAirtimeAmount && !isNaN(customAmountNum) && customAmountNum > 0) {
      finalAmount = customAmountNum;
    }

    if (!finalAmount || finalAmount <= 0) {
      Toast.show({
        text1: 'Please select an airtime plan or enter a valid custom amount.',
        type: 'info',
      });
      return;
    }
  };

  const customAmountNum = Number(getValues('customAirtimeAmount'));
  const finalAmountForModal =
    getValues('customAirtimeAmount') && !isNaN(customAmountNum) && customAmountNum > 0
      ? customAmountNum
      : selectedPlanPrice;

  const isCustomAmountValid =
    customAmountNum >= 50 && customAmountNum <= 50000 && !errors.customAirtimeAmount;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background h-full">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4">
        {/* Phone Number Input Section */}
        <View
          className="rounded-2xl p-4 mb-4"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          }}
        >
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <PhoneNumberInput
                value={value}
                onChange={(e) => {
                  onChange(e);
                  setValue('phoneNumber', e);
                }}
                error={errors.phoneNumber?.message}
                onSelectContact={(number) => {
                  setValue('phoneNumber', number);
                }}
              />
            )}
          />
        </View>

        {/* Network Selector */}
        <NetworkSelector
          networks={networks}
          selectedNetworkId={selectedNetworkId}
          onSelectNetwork={handleSelectNetwork}
          phoneNumber={watch('phoneNumber')}
        />

        {/* Quick Plans Section */}
        <View className="mt-6 mb-4">
          <View className="flex-row items-center mb-4">
            <Text className="font-bold text-base" style={{ color: isDark ? '#fff' : '#111' }}>
              Quick Select
            </Text>
          </View>

          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <View className="flex-row flex-wrap gap-3">
              {quickPlans?.map((planPrice) => (
                <AirtimeCard
                  phoneNumber={getValues('phoneNumber')}
                  key={planPrice}
                  plan={{
                    bonusMb: planPrice * 0.02,
                    id: String(planPrice),
                    price: planPrice,
                    size: String(planPrice),
                  }}
                  onSelectPlan={handleSelectPlan}
                  isSelected={selectedPlanPrice === planPrice && !getValues('customAirtimeAmount')}
                  onPress={() =>
                    handleAirtimeCardPress({
                      bonusMb: planPrice * 0.02,
                      id: String(planPrice),
                      price: planPrice,
                      size: String(planPrice),
                    })
                  }
                />
              ))}
            </View>
          </View>
        </View>

        {/* Custom Amount Section */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          }}
        >
          <Controller
            control={control}
            name="customAirtimeAmount"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text
                  className="font-semibold text-sm mb-3"
                  style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
                >
                  Or enter custom amount
                </Text>
                <TextInput
                  className="w-full px-4 py-4 rounded-xl text-base"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    color: isDark ? '#fff' : '#111',
                    borderWidth: 1,
                    borderColor:
                      value && isCustomAmountValid
                        ? colors.primary
                        : isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                  }}
                  placeholder="Enter amount (₦50 - ₦50,000)"
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                  keyboardType="numeric"
                  value={value}
                  onChangeText={(text) => {
                    onChange(text);
                    handleCustomAmountChange(text);
                  }}
                  onFocus={() => setSelectedPlanPrice(null)}
                />
                {errors.customAirtimeAmount && (
                  <Text className="text-red-500 text-xs mt-2 ml-1">
                    {errors.customAirtimeAmount.message}
                  </Text>
                )}
              </View>
            )}
          />

          {/* Buy Button */}
          <TouchableOpacity
            className="mt-4 rounded-2xl overflow-hidden"
            onPress={async () => {
              const isValidPhoneNumber = await trigger('phoneNumber');
              const isValidCustomAmount = await trigger('customAirtimeAmount');

              if (isValidPhoneNumber && isValidCustomAmount) {
                const customAmountValue = Number(getValues('customAirtimeAmount'));
                if (customAmountValue >= 50 && customAmountValue <= 50000) {
                  handleCardPress();
                }
              } else {
                if (errors.phoneNumber?.message) {
                  Toast.show({ type: 'error', text1: errors.phoneNumber.message });
                } else if (errors.customAirtimeAmount?.message) {
                  Toast.show({ type: 'error', text1: errors.customAirtimeAmount.message });
                } else {
                  Toast.show({
                    type: 'warning',
                    text1: 'Please provide a valid phone number and amount.',
                  });
                }
              }
            }}
            activeOpacity={0.9}
            disabled={!isCustomAmountValid}
          >
            <LinearGradient
              colors={
                isCustomAmountValid
                  ? [colors.primary, '#a855f7']
                  : isDark
                    ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']
                    : ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.08)']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text
                className="text-base font-bold"
                style={{
                  color: isCustomAmountValid
                    ? '#fff'
                    : isDark
                      ? 'rgba(255,255,255,0.4)'
                      : 'rgba(0,0,0,0.3)',
                }}
              >
                {!getValues('customAirtimeAmount')
                  ? 'Enter amount above'
                  : !isCustomAmountValid
                    ? '₦50 - ₦50,000 only'
                    : `Buy ${formatNigerianNaira(customAmountNum)}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View className="h-6" />

        {/* Details Modal */}
        <AirtimeDetailsModal
          networkId={selectedNetworkId || 'mtn'}
          isVisible={isModalVisible}
          onClose={closeModal}
          phoneNumber={getValues('phoneNumber')}
          selectedPlan={
            finalAmountForModal
              ? {
                id: String(finalAmountForModal),
                price: finalAmountForModal,
                size: String(finalAmountForModal),
                bonusMb: finalAmountForModal * 0.01,
              }
              : null
          }
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

export const quickPlans = [50, 100, 200, 500, 1000, 2000];

export default BuyAirtimeScreen;