import DataBundleCard from '@/components/data/data-bundle-card';
import DataBundleCategorySelector from '@/components/data/data-bundle-category-selector';
import DataBundleDetailsModal from '@/components/data/data-bundle-details-modal';
import NetworkSelector from '@/components/data/network-selector';
import PhoneNumberInput from '@/components/data/phone-number-input';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import * as z from 'zod';
import Toast from 'react-native-toast-message';
import AirtimeCard from './airtime-card';
import Header from './header';
import AirtimeDetailsModal from './airtime-detail-modal';

const buyDataSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9]+$/, 'Phone number must contain only digits'),
});

type BuyDataFormInputs = z.infer<typeof buyDataSchema>;

const BuyAirtimeScreen = () => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>('mtn');
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue, getValues } = useForm<BuyDataFormInputs>({
    resolver: zodResolver(buyDataSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  const handleSelectNetwork = (networkId: string) => {
    setSelectedNetworkId(networkId);
    // Optionally, reset selectedPlan if network changes
    setSelectedPlan(null);
  };

  const handleSelectPlan = (bundle: any) => {
    setSelectedPlan(bundle);
  };

  const handleCardPress = (bundle: any) => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const handlePhoneNumberChange = (text: string) => {
    setValue('phoneNumber', text);
  };

  const onSubmit = (data: BuyDataFormInputs) => {
    if (!selectedNetworkId) {
      alert('Please select a network.');
      return;
    }
    if (!selectedPlan) {
      Toast.show({text1: 'Please select a data bundle.', type: 'info'});
      return;
    }

    const payload = {
      phoneNumber: data.phoneNumber,
      networkId: selectedNetworkId,
      dataBundle: selectedPlan,
    };
    console.log('Buy Data Payload:', payload);
    alert('Data purchase initiated! Check console for payload.');
  };

  return (
    <View className="flex-1 bg-background h-full">
      <Header />
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1 p-4">

        <Controller
          control={control}
          name="phoneNumber"
          render={({ field: { onChange, value } }) => (
            <PhoneNumberInput
              value={value}
              onChange={onChange}
              error={errors.phoneNumber?.message}
              onSelectContact={(number) => {
                setValue('phoneNumber', number);
              }}
            />
          )}
        />

        <NetworkSelector
          networks={networks}
          selectedNetworkId={selectedNetworkId}
          onSelectNetwork={handleSelectNetwork}
        />

        <Text className="text-foreground text-xl font-bold mt-8 mb-4 ml-2">Quick Plans</Text>
        <View className="flex flex-1 flex-row flex-wrap gap-x-3 gap-y-3 pb-6">
          {quickPlans.map((plan) => (
            <AirtimeCard
              phoneNumber={getValues('phoneNumber')}
              key={plan}
              plan={{
                bonusMb: (plan * 0.02),
                id: String(plan),
                price: plan,
                size: String(plan),
              }}
              onSelectPlan={handleSelectPlan}
              isSelected={selectedPlan === plan}
              onPress={() => handleCardPress(plan)}
            />
          ))}
        </View>

        <AirtimeDetailsModal
            networkId={selectedNetworkId || 'mtn'}
            isVisible={isModalVisible}
            onClose={closeModal}
            phoneNumber={getValues('phoneNumber')}
            selectedPlan={selectedPlan}
            onSubmit={handleSubmit(onSubmit)}
        />
      </ScrollView>

    </View>
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
    5000
]
    

export default BuyAirtimeScreen; 