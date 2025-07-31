import { useThemedColors } from '@/hooks/useThemedColors';
import { formatNigerianNaira } from '@/utils/format-naira';
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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import ComingSoon from '../coming-soon';
import StackHeader from '../header.stack';
import { useSession } from '../session-context';
import BottomSheet from '../ui/bottom-sheet';
import LoadingSpinner from '../ui/loading-spinner';
import EducationTypeSelector from './education-type-selector';

const educationSchema = z.object({
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

type EducationFormInputs = z.infer<typeof educationSchema>;

const BuyEducationScreen = () => {
  const [isUTME, setIsUTME] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'waec' | 'jamb'>('waec');
  const { user, refetchAppConfig, loadingAppConfig, appConfig } = useSession();

  const { colors } = useThemedColors()
  const [comingSoon, setComingSoon] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
    trigger,
  } = useForm<EducationFormInputs>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      phoneNumber: user?.user_metadata?.phone || '',
      profileCode: '',
      amount: selectedProvider === "jamb" ? appConfig?.jamb_price : appConfig?.waec_price,
    },
  });

  const handleToggleExamType = () => {
    setIsUTME(prev => !prev);
  };

  const onSubmit = (data: EducationFormInputs) => {
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
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <StackHeader title={'Education'} />
      <LoadingSpinner isPending={isPending} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingVertical: 12, paddingBottom: 32 }}
      >
        
        {/* Education Provider Selection */}
        <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-3">
            <Ionicons name="school" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Select Examination</Text>
          </View>
          <EducationTypeSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider as any}
          />
        </View>

        {/* JAMB Type Selection - Only for JAMB */}
        {selectedProvider === "jamb" && (
          <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
            <View className="flex-row items-center mb-4">
              <Ionicons name="options" size={18} color={colors.primary} />
              <Text className="text-base font-semibold text-foreground ml-2">Exam Type</Text>
            </View>
            
            <View className="bg-muted/30 rounded-2xl p-1">
              <View className="flex-row items-center justify-center">
                <Text
                  onPress={handleToggleExamType}
                  className={`flex-1 py-3 px-4 rounded-xl text-center font-semibold ${
                    isUTME 
                      ? 'bg-primary shadow-sm text-white' 
                      : 'bg-transparent text-muted-foreground'
                  }`}
                >
                  UTME
                </Text>
                <Text
                  onPress={handleToggleExamType}
                  className={`flex-1 py-3 px-4 rounded-xl text-center font-semibold ${
                    !isUTME 
                      ? 'bg-primary shadow-sm text-white' 
                      : 'bg-transparent text-muted-foreground'
                  }`}
                >
                  Direct Entry
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Profile Code - Only for JAMB */}
        {selectedProvider === "jamb" && (
          <View className="bg-card rounded-2xl p-5 mb-4 shadow-sm border border-border/20">
            <View className="flex-row items-center mb-3">
              <Ionicons name="person" size={18} color={colors.primary} />
              <Text className="text-base font-semibold text-foreground ml-2">Profile Information</Text>
            </View>
            
            <Controller
              control={control}
              name="profileCode"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  placeholder="Enter your JAMB profile code"
                  value={value}
                  onChangeText={onChange}
                  placeholderTextColor={colors.mutedForeground}
                  className="bg-input border border-border rounded-xl px-4 py-4 text-base text-foreground font-medium"
                />
              )}
            />
            {errors.profileCode && (
              <View className="mt-2 flex-row items-center">
                <Ionicons name="alert-circle" size={16} color={colors.destructive} />
                <Text className="text-destructive text-sm ml-2">{errors.profileCode.message}</Text>
              </View>
            )}
          </View>
        )}

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
                placeholderTextColor={colors.mutedForeground}
                onChangeText={onChange}
                keyboardType="phone-pad"
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

        {/* Payment Amount */}
        <View className="bg-card rounded-2xl p-5 mb-6 shadow-sm border border-border/20">
          <View className="flex-row items-center mb-4">
            <Ionicons name="wallet" size={18} color={colors.primary} />
            <Text className="text-base font-semibold text-foreground ml-2">Payment Amount</Text>
          </View>
          
          <View className="bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl p-4 border border-primary/20">
            <Text className="text-sm font-semibold text-foreground mb-3">Fee Breakdown</Text>
            <View className="space-y-2">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground text-sm">
                  {selectedProvider === "jamb" ? "JAMB Registration Fee" : "WAEC Registration Fee"}
                </Text>
                <Text className="text-foreground font-semibold">
                  {selectedProvider === "jamb" ? formatNigerianNaira(4500) : formatNigerianNaira(3500)}
                </Text>
              </View>
              <View className="h-px bg-border my-2" />
              <View className="flex-row justify-between items-center">
                <Text className="text-foreground font-bold text-base">Total Amount</Text>
                <Text className="text-primary font-bold text-lg">
                  {selectedProvider === "jamb" ? formatNigerianNaira(4500) : formatNigerianNaira(3500)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Submit Button */}
        <View className="pt-4 pb-6 px-4">
          <TouchableOpacity
            onPress={() => setComingSoon(true)}
            disabled={isPending}
            className={`rounded-2xl overflow-hidden shadow-lg`}
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
                    <Ionicons name="school" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">
                      Pay {selectedProvider === "jamb" ? formatNigerianNaira(4500) : formatNigerianNaira(3500)}
                    </Text>
                  </>
                )}
              </View>
              {!isPending && (
                <Text className="text-white/80 text-sm mt-1">Instant exam registration</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <View className="mt-4 bg-muted/30 rounded-xl p-4">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text className="text-sm font-semibold text-foreground ml-2">Important Notes</Text>
            </View>
            <Text className="text-xs text-muted-foreground leading-4">
              • Ensure all information is correct before payment{'\n'}
              • {selectedProvider === "jamb" ? "JAMB profile code is required for registration" : "WAEC registration will be processed instantly"}{'\n'}
              • You'll receive confirmation via SMS and email
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

export default BuyEducationScreen;


