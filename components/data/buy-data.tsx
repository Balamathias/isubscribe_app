import DataBundleCard from '@/components/data/data-bundle-card';
import DataBundleCategorySelector from '@/components/data/data-bundle-category-selector';
import DataBundleDetailsModal from '@/components/data/data-bundle-details-modal';
import NetworkSelector from '@/components/data/network-selector';
import PhoneNumberInput from '@/components/data/phone-number-input';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { RefreshControl, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import Header from './header';
import { useSession } from '../session-context';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const buyDataSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[0-9]+$/, 'Phone number must contain only digits'),
});

type BuyDataFormInputs = z.infer<typeof buyDataSchema>;

const BuyDataScreen = () => {
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>('mtn');
  const [activeCategory, setActiveCategory] = useState<'Super' | 'Best' | 'Regular'>('Best');
  const [selectedDataBundle, setSelectedDataBundle] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedBundleDetails, setSelectedBundleDetails] = useState<any | null>(null);

  const { user, dataPlans, refetchDataPlans, loadingDataPlans, refetchBeneficiaries } = useSession();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    trigger,
    watch,
  } = useForm<BuyDataFormInputs>({
    resolver: zodResolver(buyDataSchema),
    defaultValues: {
      phoneNumber: user?.user_metadata?.phone || '',
    },
  });

  const handleSelectNetwork = (networkId: string) => {
    setSelectedNetworkId(networkId);
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
        Toast.show({ type: 'warning', text1: 'Please provide a valid phone number.' });
      }
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedBundleDetails(null);
  };

  const onSubmit = (data: BuyDataFormInputs) => {
    if (!selectedNetworkId) {
      Toast.show({ type: 'error', text1: 'Please select a network.' });
      return;
    }
    if (!selectedDataBundle) {
      Toast.show({ type: 'error', text1: 'Please select a data bundle.' });
      return;
    }
  };

  const bundles = ((dataPlans?.[activeCategory] || []) as any)?.filter(
    (plan: any) =>
      plan?.network === (selectedNetworkId === '9mobile' ? 'etisalat' : selectedNetworkId)
  );

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background h-full">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 p-4"
        refreshControl={
          <RefreshControl
            refreshing={loadingDataPlans}
            onRefresh={refetchDataPlans}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Phone Number Input */}
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

        {/* Category Selector */}
        <DataBundleCategorySelector
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
        />

        {/* Bundles Section */}
        <View className="mt-6 mb-4">
          <Text
            className="font-bold text-base mb-4"
            style={{ color: isDark ? '#fff' : '#111' }}
          >
            {activeCategory} Bundles
          </Text>

          <View
            className="rounded-2xl p-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            {!bundles || bundles.length === 0 ? (
              /* Empty State */
              <View className="py-8 items-center justify-center">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center mb-4"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  }}
                >
                  <Ionicons
                    name="cellular-outline"
                    size={28}
                    color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
                  />
                </View>
                <Text
                  className="text-base font-semibold mb-1"
                  style={{ color: isDark ? '#fff' : '#111' }}
                >
                  No bundles available
                </Text>
                <Text
                  className="text-sm text-center mb-4 px-4"
                  style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}
                >
                  {selectedNetworkId
                    ? `No ${activeCategory.toLowerCase()} bundles for ${selectedNetworkId.toUpperCase()}`
                    : 'Select a network to view bundles'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    refetchDataPlans();
                    refetchBeneficiaries?.();
                  }}
                  activeOpacity={0.8}
                  className="px-5 py-2.5 rounded-xl flex-row items-center"
                  style={{ backgroundColor: colors.primary + '15' }}
                  disabled={loadingDataPlans}
                >
                  <Ionicons
                    name="refresh"
                    size={16}
                    color={colors.primary}
                    style={{ marginRight: 6 }}
                  />
                  <Text className="font-semibold text-sm" style={{ color: colors.primary }}>
                    {loadingDataPlans ? 'Refreshing...' : 'Refresh'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* Bundles Grid */
              <View className="flex-row flex-wrap gap-3">
                {bundles.map((bundle: any) => (
                  <DataBundleCard
                    key={`${bundle.id}-${activeCategory}`}
                    bundle={bundle}
                    onSelectBundle={handleSelectBundle}
                    isSelected={selectedDataBundle?.id === bundle.id}
                    onPress={() => handleBundleCardPress(bundle)}
                    phoneNumber={getValues('phoneNumber')}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        <View className="h-6" />

        {/* Details Modal */}
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