import { COLORS } from '@/constants/colors';
import { useThemedColors } from '@/hooks/useThemedColors';
import {
  EducationService,
  VerifyEducationMerchantResponse,
} from '@/services/api';
import {
  useGetWalletBalance,
  useListEducationServices,
  useVerifyEducationMerchant,
} from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOut,
  Layout,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import StackHeader from '../header.stack';
import { useSession } from '../session-context';
import EducationConfirmationModal from './education-confirmation-modal';
import ProfileVerificationCard from './profile-verification-card';
import QuantitySelector from './quantity-selector';
import ServiceSelector from './service-selector';
import ServiceTypeTabs, { ServiceType } from './service-type-tabs';

const BuyEducationScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const appColors = COLORS[theme];
  const { colors } = useThemedColors();
  const { user, profile } = useSession();

  // State
  const [serviceType, setServiceType] = useState<ServiceType>('jamb');
  const [selectedService, setSelectedService] = useState<EducationService | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [profileId, setProfileId] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationData, setVerificationData] = useState<VerifyEducationMerchantResponse | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const verifyDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // API Hooks
  const { data: servicesData, isLoading: loadingServices } = useListEducationServices();
  const { data: walletData, isLoading: loadingBalance } = useGetWalletBalance();
  const { mutateAsync: verifyProfile, isPending: isVerifying } = useVerifyEducationMerchant();

  const walletBalance = walletData?.data;

  // Get services for current type
  const services = useMemo(() => {
    if (!servicesData?.data) return [];
    return servicesData.data[serviceType] || [];
  }, [servicesData, serviceType]);

  // Check if verification is required (JAMB/DE only)
  const requiresVerification = serviceType === 'jamb' || serviceType === 'de';

  // Calculate prices
  const basePrice = selectedService?.price || 0;
  const totalBasePrice = basePrice * quantity;
  const totalAmount = totalBasePrice;
  const dataBonus = totalAmount * 0.025; // 2.5% data bonus

  // Balance check
  const canAfford = useMemo(() => {
    if (!walletBalance || loadingBalance) return false;
    return walletBalance.balance >= totalAmount;
  }, [walletBalance, loadingBalance, totalAmount]);

  // Handle service type change
  const handleServiceTypeChange = (type: ServiceType) => {
    setServiceType(type);
    setSelectedService(null);
    setQuantity(1);
    setProfileId('');
    setVerificationData(null);
    setVerificationError(null);
  };

  // Handle service selection
  const handleServiceSelect = (service: EducationService) => {
    setSelectedService(service);
    // Re-verify if we have a profile ID
    if (requiresVerification && profileId.length >= 8) {
      handleProfileVerification(profileId, service);
    }
  };

  // Profile verification
  const handleProfileVerification = useCallback(
    async (id: string, service?: EducationService) => {
      const targetService = service || selectedService;
      if (!targetService || id.length < 8) {
        setVerificationData(null);
        setVerificationError(null);
        return;
      }

      // Clear existing timer
      if (verifyDebounceTimer.current) {
        clearTimeout(verifyDebounceTimer.current);
      }

      verifyDebounceTimer.current = setTimeout(async () => {
        try {
          setVerificationError(null);
          const result = await verifyProfile({
            serviceID: serviceType as 'jamb' | 'de',
            billersCode: id,
            variation_code: targetService.variation_code || '',
          });

          if (result.error || !result.data) {
            setVerificationError(result.message || 'Failed to verify Profile ID');
            setVerificationData(null);
          } else {
            setVerificationData(result.data);
            setVerificationError(null);
          }
        } catch (error: any) {
          setVerificationError(error.message || 'Failed to verify Profile ID');
          setVerificationData(null);
        }
      }, 600);
    },
    [selectedService, serviceType, verifyProfile]
  );

  // Handle profile ID change
  const handleProfileIdChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase();
    setProfileId(cleanValue);
    if (cleanValue.length >= 8 && selectedService) {
      handleProfileVerification(cleanValue);
    } else {
      setVerificationData(null);
      setVerificationError(null);
    }
  };

  // Handle phone change
  const handlePhoneChange = (value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');
    setPhone(cleanValue);
  };

  // Clear verification
  const handleClearVerification = () => {
    setVerificationData(null);
    setVerificationError(null);
    setProfileId('');
  };

  // Form submission
  const handleSubmit = () => {
    if (!selectedService) {
      Toast.show({ type: 'error', text1: 'Please select a service' });
      return;
    }

    if (requiresVerification && !verificationData) {
      Toast.show({ type: 'error', text1: 'Please verify your Profile ID' });
      return;
    }

    if (phone.length < 11) {
      Toast.show({ type: 'error', text1: 'Please enter a valid phone number' });
      return;
    }

    if (!canAfford && user) {
      Toast.show({ type: 'error', text1: 'Insufficient balance' });
      return;
    }

    if (!user) {
      Toast.show({ type: 'error', text1: 'Please login to continue' });
      return;
    }

    setIsModalVisible(true);
  };

  // Handle successful purchase
  const handlePurchaseSuccess = () => {
    setSelectedService(null);
    setQuantity(1);
    setProfileId('');
    setPhone('');
    setVerificationData(null);
    setVerificationError(null);
    setIsModalVisible(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (verifyDebounceTimer.current) {
        clearTimeout(verifyDebounceTimer.current);
      }
    };
  }, []);

  // Set phone from profile
  useEffect(() => {
    if (profile?.phone && !phone) {
      const formattedPhone = profile.phone.replace('+234', '0');
      setPhone(formattedPhone);
    }
  }, [profile, phone]);

  // Form validation
  const isFormValid = useMemo(() => {
    if (!selectedService) return false;
    if (phone.length < 11) return false;
    if (requiresVerification && !verificationData) return false;
    return true;
  }, [selectedService, phone, requiresVerification, verificationData]);

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <StackHeader title="Education" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Hero Header */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          className="mx-4 mt-3 rounded-2xl overflow-hidden"
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6', '#a855f7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-6 relative"
          >
            {/* Decorative circles */}
            <View className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <View className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <View className="absolute top-4 right-4">
              <Ionicons name="sparkles" size={24} color="rgba(255,255,255,0.3)" />
            </View>

            <View className="flex-row items-center">
              <View className="w-14 h-14 rounded-xl bg-white/20 items-center justify-center">
                <Ionicons name="school" size={28} color="white" />
              </View>
              <View className="ml-4">
                <Text className="text-2xl font-bold text-white">Education</Text>
                <Text className="text-sm text-white/80">WAEC, JAMB & DE PINs</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Quick Stats Grid */}
        <View className="flex-row gap-3 mx-4 mt-4">
          {/* Wallet Balance */}
          <Animated.View
            entering={FadeInLeft.delay(100).duration(400)}
            className="flex-1 p-4 rounded-2xl bg-card border border-border/30"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-blue-500/10 items-center justify-center">
                <Ionicons name="wallet" size={20} color="#3b82f6" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-muted-foreground">Balance</Text>
                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                  {loadingBalance ? '...' : formatNigerianNaira(walletBalance?.balance || 0)}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Data Bonus */}
          <Animated.View
            entering={FadeInRight.delay(150).duration(400)}
            className="flex-1 p-4 rounded-2xl bg-card border border-border/30"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-emerald-500/10 items-center justify-center">
                <Ionicons name="gift" size={20} color="#10b981" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-xs text-muted-foreground">Data Bonus</Text>
                <Text className="text-base font-bold text-emerald-500" numberOfLines={1}>
                  {walletBalance?.data_bonus || '0MB'}
                </Text>
              </View>
            </View>
          </Animated.View>
        </View>

        {/* Service Type Tabs */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(400)}
          className="mx-4 mt-4 p-5 rounded-2xl bg-card border border-border/30"
        >
          <View className="flex-row items-center mb-4">
            <Ionicons name="school" size={18} color="#3b82f6" />
            <Text className="text-base font-bold text-foreground ml-2">Select Service Type</Text>
          </View>
          <ServiceTypeTabs
            value={serviceType}
            onChange={handleServiceTypeChange}
            disabled={loadingServices}
          />
        </Animated.View>

        {/* Service Selection */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(400)}
          className="mx-4 mt-4 p-5 rounded-2xl bg-card border border-border/30"
        >
          <Text className="text-base font-bold text-foreground mb-4">Choose Service</Text>
          <ServiceSelector
            services={services}
            selectedService={selectedService}
            onSelect={handleServiceSelect}
            isLoading={loadingServices}
          />
        </Animated.View>

        {/* Details Section - Shows when service selected */}
        {selectedService && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            layout={Layout.springify()}
            className="mx-4 mt-4 p-5 rounded-2xl bg-card border border-border/30"
          >
            {/* Quantity Selector */}
            <View className="items-center mb-4">
              <QuantitySelector
                value={quantity}
                onChange={setQuantity}
                min={1}
                max={10}
              />
            </View>

            {/* Profile ID Input (JAMB/DE only) */}
            {requiresVerification && (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-muted-foreground mb-2">
                  Profile ID
                </Text>
                <View className="relative">
                  <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                    <Ionicons name="keypad" size={18} color={appColors.mutedForeground} />
                  </View>
                  <TextInput
                    placeholder="Enter your JAMB Profile ID"
                    value={profileId}
                    onChangeText={handleProfileIdChange}
                    placeholderTextColor={appColors.mutedForeground}
                    autoCapitalize="characters"
                    maxLength={20}
                    className={`bg-secondary/50 border rounded-xl pl-12 pr-12 py-4 text-base font-mono text-foreground ${verificationData ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border'
                      }`}
                  />
                  {isVerifying && (
                    <View className="absolute right-4 top-1/2 -translate-y-1/2">
                      <ActivityIndicator size="small" color={appColors.primary} />
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Verification Card */}
            {requiresVerification && (
              <View className="mb-4">
                <ProfileVerificationCard
                  verificationData={verificationData}
                  isVerifying={isVerifying}
                  error={verificationError}
                  onClear={handleClearVerification}
                />
              </View>
            )}

            {/* Phone Number Input */}
            <View>
              <Text className="text-sm font-semibold text-muted-foreground mb-2">
                Phone Number (for PIN notification)
              </Text>
              <View className="relative">
                <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                  <Ionicons name="call" size={18} color={appColors.mutedForeground} />
                </View>
                <TextInput
                  placeholder="08012345678"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholderTextColor={appColors.mutedForeground}
                  keyboardType="phone-pad"
                  maxLength={14}
                  className="bg-secondary/50 border border-border rounded-xl pl-12 pr-4 py-4 text-base text-foreground"
                />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Transaction Summary */}
        {selectedService && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(200)}
            layout={Layout.springify()}
            className="mx-4 mt-4"
          >
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.05)', 'rgba(139, 92, 246, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="p-5 rounded-2xl border border-blue-500/20"
            >
              <Text className="text-sm font-bold text-foreground mb-3">Transaction Summary</Text>
              <View className="gap-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">
                    {quantity} x {selectedService.name || selectedService.variation_code}
                  </Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatNigerianNaira(totalBasePrice)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Service Charge (0%)</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {formatNigerianNaira(0)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-sm text-muted-foreground">Data Bonus</Text>
                  <Text className="text-sm font-semibold text-emerald-500">
                    +{(dataBonus / 1000).toFixed(1)}MB
                  </Text>
                </View>
                <View className="h-px bg-border/50 my-2" />
                <View className="flex-row justify-between items-center">
                  <Text className="font-bold text-foreground">Total</Text>
                  <Text className="text-lg font-bold text-blue-500">
                    {formatNigerianNaira(totalAmount)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Insufficient Balance Warning */}
        {user && selectedService && !canAfford && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="mx-4 mt-4 p-3 bg-red-500/10 rounded-xl flex-row items-center"
          >
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
            <Text className="text-xs text-red-500 font-medium ml-2 flex-1">
              Insufficient balance. You need{' '}
              {formatNigerianNaira(totalAmount - (walletBalance?.balance || 0))} more.
            </Text>
          </Animated.View>
        )}

        {/* Submit Button */}
        <View className="mx-4 mt-6">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid || isVerifying || !user}
            className="rounded-2xl overflow-hidden shadow-lg"
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                !isFormValid || isVerifying || !user
                  ? ['#9ca3af', '#6b7280']
                  : ['#3b82f6', '#8b5cf6', '#a855f7']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-5 items-center justify-center"
            >
              <View className="flex-row items-center">
                {isVerifying ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-lg ml-2">Verifying...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="school" size={22} color="white" />
                    <Text className="text-white font-bold text-lg mx-2">Buy PIN</Text>
                    <Ionicons name="arrow-forward" size={20} color="white" />
                  </>
                )}
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Login prompt for guests */}
          {!user && (
            <Text className="text-center text-xs text-muted-foreground mt-3">
              Please login to purchase education PINs
            </Text>
          )}
        </View>

        {/* Confirmation Modal */}
        <EducationConfirmationModal
          isVisible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          serviceType={serviceType}
          service={selectedService}
          quantity={quantity}
          phone={phone}
          profileId={requiresVerification ? profileId : undefined}
          profileName={verificationData?.Customer_Name}
          totalAmount={totalAmount}
          basePrice={basePrice}
          dataBonus={dataBonus}
          onSuccess={handlePurchaseSuccess}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default BuyEducationScreen;
