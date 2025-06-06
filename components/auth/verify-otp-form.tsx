import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
            ${error ? 'border-red-500' : 'border-secondary bg-input'}`}
        >
          <TextInput
            ref={ref => (inputRefs.current[index] = ref!) as any}
            className="text-foreground text-xl font-bold text-center w-full h-full"
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={(text) => handleTextChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            value={digit === ' ' ? '' : digit} // Clear placeholder space for actual input
            autoFocus={index === 0}
            caretHidden={true} // Hide caret to make it look like separate boxes
          />
        </View>
      ))}
      {error && <Text className="text-red-500 text-sm mt-1 ml-2 absolute -bottom-6 left-0">{error}</Text>}
    </View>
  );
};

const verifyOtpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^[0-9]+$/, 'OTP must contain only digits'),
});

type VerifyOtpFormInputs = z.infer<typeof verifyOtpSchema>;

const VerifyOtpForm = () => {
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { control, handleSubmit, formState: { errors }, setValue } = useForm<VerifyOtpFormInputs>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
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
    console.log('Resending OTP...');
    // Here you would trigger your resend OTP API call
    setResendTimer(60);
    setCanResend(false);
    setValue('otp', ''); // Clear OTP input on resend
  };

  const onSubmit = (data: VerifyOtpFormInputs) => {
    console.log('Verify OTP data:', data);
    // Here you would typically send data to your API backend for verification
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-4">
      <IsubscribeLogo />

      <View className="w-full max-w-sm items-center">
        <Text className="text-foreground text-2xl font-bold mb-4">Verify your phone number</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Enter the 6-digit code sent to your phone number
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

        <TouchableOpacity onPress={handleSubmit(onSubmit)} className="w-full rounded-xl overflow-hidden mt-4">
          <LinearGradient
            colors={['#7B2FF2', '#F357A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 items-center justify-center rounded-xl"
          >
            <Text className="text-white font-bold text-lg">Verify</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted-foreground text-base">Didn't receive code? </Text>
          <TouchableOpacity onPress={handleResendOtp} disabled={!canResend}>
            <Text className={`font-semibold text-base ${canResend ? 'text-primary' : 'text-gray-500'}`}>
              Resend {resendTimer > 0 ? `in ${resendTimer}s` : ''}
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