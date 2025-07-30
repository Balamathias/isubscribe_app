import { useThemedColors } from '@/hooks/useThemedColors';
import { useResendOtp, useVerifyOtp } from '@/services/auth-hooks';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import IsubscribeLogo from './logo-isubscribe';

interface OtpInputProps {
  length: number;
  value: string;
  onChange: (text: string) => void;
  error?: string;
}

const OtpInput: React.FC<OtpInputProps> = ({ length, value, onChange, error }) => {
  const inputRefs = useRef<TextInput[]>([]);
  const otpDigits = value.padEnd(length, ' ').split('');
  const { colors } = useThemedColors();

  const handleTextChange = (text: string, index: number) => {
    let newOtp = value.split('');
    newOtp[index] = text;
    // Handle backspace
    if (text === '' && value.length > 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (text !== '' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    onChange(newOtp.join(''));
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && value.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View className="mb-6 w-full px-2">
      <View className="flex-row justify-between">
        {otpDigits.map((digit, index) => (
          <View
            key={index}
            className={`flex-1 aspect-square w-12 h-12 max-w-14 border-2 rounded-2xl items-center justify-center mx-1 ${
              error ? 'border-destructive bg-destructive/5' : 
              digit && digit !== ' ' ? 'border-primary bg-primary/5' : 'border-border bg-card'
            }`}
            style={{
              shadowColor: digit && digit !== ' ' ? '#7B2FF2' : '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: digit && digit !== ' ' ? 0.2 : 0.05,
              shadowRadius: 4,
              elevation: 2
            }}
          >
            <TextInput
              ref={ref => (inputRefs.current[index] = ref!) as any}
              className="text-foreground text-xl font-bold text-center w-full h-full"
              keyboardType="number-pad"
              maxLength={1}
              placeholderTextColor={colors.mutedForeground}
              onChangeText={(text) => handleTextChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              value={digit === ' ' ? '' : digit}
              autoFocus={index === 0}
              caretHidden={true}
              selectTextOnFocus
            />
            {digit && digit !== ' ' && (
              <View className="absolute inset-0 rounded-2xl items-center justify-center pointer-events-none">
                <View className="w-2 h-2 rounded-full bg-primary opacity-80" />
              </View>
            )}
          </View>
        ))}
      </View>
      {error && (
        <Text className="text-destructive text-xs mt-2 text-center font-medium px-2">{error}</Text>
      )}
    </View>
  );
};

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^[0-9]+$/, 'OTP must contain only digits'),
});

type VerifyOtpFormInputs = z.infer<typeof verifyOtpSchema>;

const VerifyOtpForm = () => {

  const { email } = useLocalSearchParams()
  const { mutate: verifyOTP, isPending } = useVerifyOtp()
  const { mutate: resendOTP, isPending: isResending } = useResendOtp()

  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<VerifyOtpFormInputs>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval>;
    if (resendTimer > 0) {
      timerInterval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timerInterval);
  }, [resendTimer]);

  const handleResendOtp = () => {
    resendOTP({ email: email as string }, {
      onSuccess: (data) => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'OTP resent successfully!',
        })
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: error?.message || 'Failed to resend OTP'
        })
      }
    })
    setResendTimer(60);
    setCanResend(false);
    setValue('otp', ''); // Clear OTP input on resend
  };

  const onSubmit = (data: VerifyOtpFormInputs) => {
    verifyOTP({
      otp: data?.otp,
      email:  email as string
    }, {
      onSuccess: (data) => {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Email verified successfully!',
        })
        router.replace('/(tabs)')
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: error?.message || 'Failed to verify OTP'
        })
      }
    })
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4 justify-center">
        {/* Header Section */}
        <View className="items-center mb-12">
          <IsubscribeLogo />
          
          {/* Icon with background */}
          <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 items-center justify-center mb-6 mt-8">
            <Ionicons name="mail-open-outline" size={32} color="#10b981" />
          </View>
          
          <Text className="text-foreground text-2xl font-bold mb-3">Check Your Email</Text>
          <Text className="text-muted-foreground text-center text-base leading-6 px-4 mb-2">
            We've sent a 6-digit verification code to
          </Text>
          <Text className="text-foreground font-semibold text-base">
            {email || 'your email'}
          </Text>
        </View>

        {/* OTP Input Section */}
        <View className="mb-8">
          <Text className="text-foreground text-sm font-semibold mb-4 text-center">
            Enter Verification Code
          </Text>
          <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, value } }) => (
              <OtpInput
                length={6}
                value={value}
                onChange={onChange}
                error={errors.otp?.message}
              />
            )}
          />
        </View>

        {/* Verify Button */}
        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)} 
          className="w-full rounded-2xl overflow-hidden mb-8 active:scale-98"
          disabled={isPending}
          style={{ 
            shadowColor: '#7B2FF2', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.3, 
            shadowRadius: 8,
            elevation: 8 
          }}
        >
          <LinearGradient
            colors={['#7B2FF2', '#F357A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 items-center justify-center rounded-2xl"
          >
            {isPending ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold text-lg ml-2">Verifying...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Verify Email</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Resend Section */}
        <View className="items-center mb-8">
          <Text className="text-muted-foreground text-base mb-3">Didn't receive the code?</Text>
          <TouchableOpacity 
            onPress={handleResendOtp} 
            disabled={!canResend || isResending}
            className={`px-6 py-3 rounded-xl border active:scale-95 ${
              canResend && !isResending 
                ? 'border-primary bg-primary/5' 
                : 'border-border bg-muted'
            }`}
          >
            {isResending ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#7B2FF2" size="small" />
                <Text className="text-primary font-semibold text-base ml-2">Sending...</Text>
              </View>
            ) : (
              <Text className={`font-semibold text-base ${
                canResend ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Back Navigation */}
        <View className="flex-row justify-center items-center">
          <Ionicons name="arrow-back-outline" size={18} color="#7B2FF2" />
          <TouchableOpacity onPress={() => router.back()} className="ml-2 active:scale-95">
            <Text className="text-primary font-semibold text-base">Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerifyOtpForm; 