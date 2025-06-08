import DataBundleCard from '@/components/data/data-bundle-card';
import DataBundleCategorySelector from '@/components/data/data-bundle-category-selector';
import DataBundleDetailsModal from '@/components/data/data-bundle-details-modal';
import NetworkSelector from '@/components/data/network-selector';
import PhoneNumberInput from '@/components/data/phone-number-input';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import Header from './header';
import { useSession } from '../session-context';

const buyDataSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[0-9]+$/, 'Phone number must contain only digits'),
});

type BuyDataFormInputs = z.infer<typeof buyDataSchema>;

const BuyDataScreen = () => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>('mtn');
  const [activeCategory, setActiveCategory] = useState<'Super' | 'Best' | 'Regular'>('Best');
  const [selectedDataBundle, setSelectedDataBundle] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBundleDetails, setSelectedBundleDetails] = useState<any | null>(null);

  const { user, dataPlans} = useSession()

  const { control, handleSubmit, formState: { errors }, setValue, getValues, trigger } = useForm<BuyDataFormInputs>({
    resolver: zodResolver(buyDataSchema),
    defaultValues: {
      phoneNumber: user?.user_metadata?.phone || '',
    },
  });


  const handleSelectNetwork = (networkId: string) => {
    setSelectedNetworkId(networkId);
    // Optionally, reset selectedDataBundle if network changes
    setSelectedDataBundle(null);
  };

  const handleSelectCategory = (category: 'Super' | 'Best' | 'Regular') => {
    setActiveCategory(category);
    setSelectedDataBundle(null);
  };

  const handleSelectBundle = (bundle: any) => {
    setSelectedDataBundle(bundle);
  };

  const handleCardPress = (bundle: any) => {
    setSelectedBundleDetails(bundle);
    setIsModalVisible(true);
  };

  const handleBundleCardPress = async (bundle: any) => {
    const isValid = await trigger('phoneNumber');
    
    if (isValid) {
      handleCardPress(bundle);
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
    setSelectedBundleDetails(null);
  };

  const handlePhoneNumberChange = (text: string) => {
    setValue('phoneNumber', text);
  };

  const onSubmit = (data: BuyDataFormInputs) => {
    if (!selectedNetworkId) {
      alert('Please select a network.');
      return;
    }
    if (!selectedDataBundle) {
      alert('Please select a data bundle.');
      return;
    }

    const payload = {
      phoneNumber: data.phoneNumber,
      networkId: selectedNetworkId,
      dataBundle: selectedDataBundle,
    };
    console.log('Buy Data Payload:', payload);
    alert('Data purchase initiated! Check console for payload.');
  };

  const currentBundles = dataBundles[activeCategory] || [];

  const bundles = (dataPlans?.[activeCategory] || [])?.filter(plan => plan?.network === (selectedNetworkId === '9mobile' ? 'etisalat' : selectedNetworkId))

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

        <NetworkSelector
          networks={networks}
          selectedNetworkId={selectedNetworkId}
          onSelectNetwork={handleSelectNetwork}
        />

        <DataBundleCategorySelector
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        <Text className="text-foreground text-xl font-bold mt-8 mb-4 ml-2">{activeCategory} Bundles</Text>
        <View className="flex flex-1 flex-row flex-wrap gap-x-3 gap-y-3 pb-6">
          {bundles?.map((bundle: any) => (
            <DataBundleCard
              key={bundle.id}
              bundle={bundle}
              onSelectBundle={handleSelectBundle}
              isSelected={selectedDataBundle?.id === bundle.id}
              onPress={() => handleBundleCardPress(bundle)}
              phoneNumber={getValues('phoneNumber')}
            />
          ))}
        </View>

        <DataBundleDetailsModal
            isVisible={isModalVisible}
            onClose={closeModal}
            selectedBundleDetails={selectedBundleDetails}
            onSubmit={handleSubmit(onSubmit)}
            networkId={selectedNetworkId || 'mtn'}
            phoneNumber={getValues('phoneNumber')}
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
    

export default BuyDataScreen; 