import DataBundleCard from '@/components/data/data-bundle-card';
import DataBundleCategorySelector from '@/components/data/data-bundle-category-selector';
import DataBundleDetailsModal from '@/components/data/data-bundle-details-modal';
import NetworkSelector from '@/components/data/network-selector';
import PhoneNumberInput from '@/components/data/phone-number-input';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import Header from './header';
import { useSession } from '../session-context';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuickDataBuy from './quick-data-buy';

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

  const { user, dataPlans, refetchDataPlans, loadingDataPlans, refetchBeneficiaries } = useSession()

  const { control, handleSubmit, formState: { errors }, setValue, getValues, trigger, watch } = useForm<BuyDataFormInputs>({
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

  const bundles = ((dataPlans?.[activeCategory] || []) as any)?.filter((plan: any) => plan?.network === (selectedNetworkId === '9mobile' ? 'etisalat' : selectedNetworkId))

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background/40 h-full">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={loadingDataPlans}
            onRefresh={refetchDataPlans}
            colors={[COLORS.light.primary]}
          />
        }
      >

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

        <DataBundleCategorySelector
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* <QuickDataBuy /> */}

        <Text className="text-foreground text-xl font-bold mt-8 mb-4 ml-2">{activeCategory} Bundles</Text>
        <View className="flex flex-1 flex-row flex-wrap gap-x-3 gap-y-3 pb-6 bg-background p-4 rounded-xl shadow-sm mb-6">
          {!bundles || bundles.length === 0 ? (
            <View className="w-full bg-card p-6 rounded-xl items-center justify-center">
              <Ionicons name="wifi-outline" size={48} color={COLORS.light.mutedForeground} />
              <Text className="text-foreground text-lg font-semibold mt-4 mb-2">No bundles available</Text>
              <Text className="text-muted-foreground text-center">
                {selectedNetworkId ?
                  `No ${activeCategory.toLowerCase()} bundles available for ${selectedNetworkId.toUpperCase()}, or refresh.` :
                  'Please select a network to view available bundles, or refresh.'
                }
              </Text>
              <TouchableOpacity
                onPress={() => {
                  refetchDataPlans();
                  refetchBeneficiaries?.();
                }}
                className="mt-4 bg-primary/10 px-4 py-2 rounded-lg flex-row items-center justify-center"
                disabled={loadingDataPlans}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color={COLORS.light.primary}
                  style={{ marginRight: 8 }}
                />
                <Text className="text-primary font-medium">
                  {loadingDataPlans ? 'Refreshing...' : 'Refresh'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            bundles.map((bundle: any) => (
              <DataBundleCard
                key={`${bundle.id}-${activeCategory}`}
                bundle={bundle}
                onSelectBundle={handleSelectBundle}
                isSelected={selectedDataBundle?.id === bundle.id}
                onPress={() => handleBundleCardPress(bundle)}
                phoneNumber={getValues('phoneNumber')}
              />
            ))
          )}
        </View>

        <DataBundleDetailsModal
          isVisible={isModalVisible}
          onClose={closeModal}
          selectedBundleDetails={selectedBundleDetails}
          onSubmit={handleSubmit(onSubmit)}
          networkId={selectedNetworkId || 'mtn'}
          phoneNumber={getValues('phoneNumber')}
          category={activeCategory.toLowerCase()}
        />
      </ScrollView>

    </SafeAreaView>
  );
};


export const networks = [
  { id: 'mtn', name: 'MTN', logo: require('@/assets/services/mtn.png') },
  { id: 'glo', name: 'GLO', logo: require('@/assets/services/glo.png') },
  { id: 'airtel', name: 'Airtel', logo: require('@/assets/services/airtel.png') },
  { id: '9mobile', name: '9MOBILE', logo: require('@/assets/services/9mobile.png') },
];


export default BuyDataScreen; 