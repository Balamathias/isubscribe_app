import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';
import IsubscribeLogo from './logo-isubscribe';
import { useResendOtp, useVerifyOtp } from '@/services/auth-hooks';
import Toast from 'react-native-toast-message';
import { useThemedColors } from '@/hooks/useThemedColors';

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
    <View className="flex-row justify-between mb-4">
      {otpDigits.map((digit, index) => (
        <View
          key={index}
          className={`w-12 h-12 border rounded-xl items-center justify-center mx-1
            ${error ? 'border-destructive' : 'border-secondary bg-input'}`}
        >
          <TextInput
            ref={ref => (inputRefs.current[index] = ref!) as any}
            className="text-foreground text-xl font-bold text-center w-full h-full"
            keyboardType="number-pad"
            maxLength={1}
            placeholderTextColor={colors.mutedForeground}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            value={digit === ' ' ? '' : digit} // Clear placeholder space for actual input
            autoFocus={index === 0}
            caretHidden={true} // Hide caret to make it look like separate boxes
          />
        </View>
      ))}
      {error && <Text className="text-destructive text-sm mt-1 ml-2 absolute -bottom-6 left-0">{error}</Text>}
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
        router.replace('/auth/onboarding')
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
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-4">
      <IsubscribeLogo />

      <View className="w-full max-w-sm items-center">
        <Text className="text-foreground text-2xl font-bold mb-4">Verify your Email</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Enter the 6-digit code sent to your Email
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

        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)} 
          className="w-full rounded-xl overflow-hidden mt-4"
          disabled={isPending}
        >
          <LinearGradient
            colors={['#7B2FF2', '#F357A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 items-center justify-center rounded-xl"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Verify</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted-foreground text-base">Didn't receive code? </Text>
          <TouchableOpacity 
            onPress={handleResendOtp} 
            disabled={!canResend || isResending}
          >
            <Text className={`font-semibold text-base ${canResend ? 'text-primary' : 'text-gray-500'}`}>
              {isResending ? (
                <ActivityIndicator color="#7B2FF2" />
              ) : (
                `Resend ${resendTimer > 0 ? `in ${resendTimer}s` : ''}`
              )}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} className="items-center mt-8">
          <Text className="text-primary font-semibold text-base">Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default VerifyOtpForm; 