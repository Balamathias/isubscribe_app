import { useThemedColors } from '@/hooks/useThemedColors';
import { TVProviders } from '@/types/utils';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import ComingSoon from '../coming-soon';
import StackHeader from '../header.stack';
import { useSession } from '../session-context';
import BottomSheet from '../ui/bottom-sheet';
import LoadingSpinner from '../ui/loading-spinner';
import TvPlanSelector from './tv-plan-selector';
import TvProviderSelector, { Provider } from './tv-provider-selector';

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
  const [selectedProviderId, setSelectedProviderId] = useState<TVProviders>('dstv');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  const { user, tvServices } = useSession();
  const colors = useThemedColors().colors

  const [comingSoon, setComingSoon] = useState(false);

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


    const handleSelectProvider = (providerId: TVProviders) => {
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
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <StackHeader title={'TV & Cable'} />
      <LoadingSpinner isPending={isPending} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 32 }}
      >
        
        {/* TV Provider Selection */}
        <TvProviderSelector
          providers={providers}
          selectedProviderId={selectedProviderId}
          onSelectProvider={handleSelectProvider}
        />

        {/* Decoder Number */}
        <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-3">
            <Ionicons name="hardware-chip" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Decoder Information</Text>
          </View>
          <Controller
            control={control}
            name="smartCardNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter decoder/smart card number"
                value={value}
                onChangeText={onChange}
                placeholderTextColor={colors.mutedForeground}
                className="bg-input border border-border rounded-xl px-4 py-4 text-base text-foreground font-medium"
                keyboardType="numeric"
              />
            )}
          />
          {errors.smartCardNumber && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text className="text-destructive text-sm ml-2">{errors.smartCardNumber.message}</Text>
            </View>
          )}
        </View>

        {/* Phone Number */}
        <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-3">
            <Ionicons name="call" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Contact Information</Text>
          </View>
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="Enter phone number"
                value={value}
                onChangeText={onChange}
                keyboardType="phone-pad"
                placeholderTextColor={colors.mutedForeground}
                className="bg-input border border-border rounded-xl px-4 py-4 text-base text-foreground font-medium"
              />
            )}
          />
          {errors.phoneNumber && (
            <View className="mt-2 flex-row items-center">
              <Ionicons name="alert-circle" size={16} color={colors.destructive} />
              <Text className="text-destructive text-sm ml-2">{errors.phoneNumber.message}</Text>
            </View>
          )}
        </View>

        {/* Subscription Plan */}
        <View className="bg-card rounded-2xl p-5 mb-6 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-4">
            <Ionicons name="list" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Subscription Plan</Text>
          </View>
          <TvPlanSelector
            selectedProviderId={selectedProviderId}
            plans={tvServices?.[selectedProviderId] || []}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
          />
          
          {selectedPlan && (
            <View className="mt-4 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl p-4 border border-primary/20">
              <Text className="text-sm font-semibold text-foreground mb-3">Plan Details</Text>
              <View className="space-y-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground text-sm">Plan Name</Text>
                  <Text className="text-foreground font-semibold">{selectedPlan.name}</Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground text-sm">Amount</Text>
                  <Text className="text-primary font-bold text-lg">₦{parseFloat(selectedPlan.amount || '0').toLocaleString()}</Text>
                </View>
                {selectedPlan.cashback && (
                  <View className="flex-row justify-between items-center">
                    <Text className="text-muted-foreground text-sm">Cashback</Text>
                    <Text className="text-green-600 font-semibold">₦{parseFloat(selectedPlan.cashback || '0').toLocaleString()} eqv.</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Submit Button */}
        <View className="pt-4 pb-6 px-4">
          <TouchableOpacity
            onPress={() => setComingSoon(true)}
            activeOpacity={0.8}
            disabled={!selectedPlan || isPending}
            className={`rounded-2xl overflow-hidden shadow-lg ${
              !selectedPlan || isPending ? 'opacity-50' : ''
            }`}
            style={{ elevation: 8 }}
          >
            <LinearGradient
              colors={['#7B2FF2', '#F357A8', '#FF6B9D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-5 items-center justify-center"
            >
              <View className="flex-row items-center">
                {isPending ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-lg ml-2">Processing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="tv" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      {selectedPlan ? `Pay ₦${parseFloat(selectedPlan?.amount || '0').toLocaleString()}` : 'Select Plan to Continue'}
                    </Text>
                  </>
                )}
              </View>
              {!isPending && (
                <Text className="text-white/80 text-sm mt-1">Instant TV subscription</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <View className="mt-4 bg-muted/30 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground ml-2">Quick Tips</Text>
            </View>
            <Text className="text-xs text-muted-foreground leading-4">
              • Ensure your decoder number is correct{'\n'}
              • Subscription will be activated instantly{'\n'}
              • You'll receive an SMS confirmation after payment
            </Text>
          </View>
        </View>

        <BottomSheet
          isVisible={comingSoon}
          onClose={() => setComingSoon(false)}
          title="Feature Coming Soon"
        >
          <ComingSoon />
        </BottomSheet>

      </ScrollView>
    </SafeAreaView>
  );
};

export default BuyTvCableScreen;



export const providers: Provider[] = [
    { id: 'dstv', name: 'DSTV', logo: require('../../assets/services/tv-cables/ds-tv-logo.jpg') },
    { id: 'gotv', name: 'GOTV', logo: require('../../assets/services/tv-cables/go-tv-logo.png') },
    { id: 'startimes', name: 'Star Times', logo: require('../../assets/services/tv-cables/star-times-logo.png') },
    { id: 'showmax', name: 'ShowMax', logo: require('../../assets/services/tv-cables/show-max-logo.png') },
];
