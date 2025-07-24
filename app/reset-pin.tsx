import { useSession } from '@/components/session-context';
import StarryBackground from '@/components/starry-background';
import Header from '@/components/transactions/header';
import { COLORS } from '@/constants/colors';
import {
    useRequestPinResetOTP,
    useResetPinWithOTP,
    useVerifyPin,
    useVerifyResetPinOTP
} from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
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
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type ResetMethod = 'remember' | 'forgot' | null;
type Step = 'method' | 'verify-old' | 'new-pin' | 'otp-sent' | 'verify-otp' | 'reset-complete';

const ResetPinScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];
  const { user } = useSession();

  const [resetMethod, setResetMethod] = useState<ResetMethod>(null);
  const [currentStep, setCurrentStep] = useState<Step>('method');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState('');

  // Input refs for auto-focus
  const oldPinRefs = useRef<(TextInput | null)[]>([]);
  const newPinRefs = useRef<(TextInput | null)[]>([]);
  const confirmPinRefs = useRef<(TextInput | null)[]>([]);
  const otpRefs = useRef<(TextInput | null)[]>([]);

  // API hooks
  const verifyPinMutation = useVerifyPin();
  const requestOTPMutation = useRequestPinResetOTP();
  const verifyOTPMutation = useVerifyResetPinOTP();
  const resetPinMutation = useResetPinWithOTP();

  const handleMethodSelect = (method: ResetMethod) => {
    setResetMethod(method);
    
    if (method === 'remember') {
      setCurrentStep('verify-old');
    } else if (method === 'forgot') {
      handleSendOTP();
    }
  };

  const handleSendOTP = async () => {
    try {
      const response = await requestOTPMutation.mutateAsync();
      if (response.data) {
        setCurrentStep('otp-sent');
        Toast.show({
          type: 'success',
          text1: 'OTP Sent',
          text2: `Verification code sent to ${user?.email}`
        });
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && 'message' in response.error)
            ? response.error.message || 'Failed to send OTP'
            : 'Failed to send OTP';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send OTP'
      });
    }
  };

  const handleVerifyOldPin = async () => {
    if (oldPin.length !== 4) {
      Toast.show({
        type: 'warning',
        text1: 'Invalid PIN',
        text2: 'Please enter your 4-digit PIN'
      });
      return;
    }

    try {
      const response = await verifyPinMutation.mutateAsync({ pin: oldPin });
      if (response.data?.is_valid) {
        setCurrentStep('new-pin');
        Toast.show({
          type: 'success',
          text1: 'PIN Verified',
          text2: 'Now set your new PIN'
        });
      } else {
        throw new Error('Invalid PIN entered');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message || 'Invalid PIN entered'
      });
      setOldPin('');
      oldPinRefs.current[0]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Toast.show({
        type: 'warning',
        text1: 'Invalid OTP',
        text2: 'Please enter the 6-digit code'
      });
      return;
    }

    try {
      const response = await verifyOTPMutation.mutateAsync({ otp: otpCode });
      if (response.data) {
        setOtpToken(otpCode);
        setCurrentStep('new-pin');
        Toast.show({
          type: 'success',
          text1: 'OTP Verified',
          text2: 'Now set your new PIN'
        });
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && 'message' in response.error)
            ? response.error.message || 'Invalid OTP'
            : 'Invalid OTP';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message || 'Invalid OTP entered'
      });
      setOtpCode('');
      otpRefs.current[0]?.focus();
    }
  };

  const handleResetPin = async () => {
    if (newPin.length !== 4 || confirmPin.length !== 4) {
      Toast.show({
        type: 'warning',
        text1: 'Invalid PIN',
        text2: 'Please enter 4-digit PINs'
      });
      return;
    }

    if (newPin !== confirmPin) {
      Toast.show({
        type: 'error',
        text1: 'PIN Mismatch',
        text2: 'New PIN and confirmation must match'
      });
      setConfirmPin('');
      confirmPinRefs.current[0]?.focus();
      return;
    }

    try {
      const payload = resetMethod === 'forgot' 
        ? { otp: otpToken, new_pin: newPin, requires_otp: false }
        : { otp: '', new_pin: newPin, requires_otp: false };

      const response = await resetPinMutation.mutateAsync(payload);
      console.log('Reset PIN Response:', response);
      
      if (response.data) {
        setCurrentStep('reset-complete');
        Toast.show({
          type: 'success',
          text1: 'PIN Reset Successful',
          text2: 'Your transaction PIN has been updated'
        });
      } else {
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && 'message' in response.error)
            ? response.error.message || 'Failed to reset PIN'
            : 'Failed to reset PIN';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: error.message || 'Failed to reset PIN'
      });
    }
  };

  const renderPinInput = (
    pin: string,
    setPinValue: (value: string) => void,
    refs: React.MutableRefObject<(TextInput | null)[]>,
    label: string
  ) => {
    const handlePinChange = (value: string, index: number) => {
      const newPin = pin.split('');
      newPin[index] = value;
      const updatedPin = newPin.join('');
      setPinValue(updatedPin);

      if (value && index < 3) {
        refs.current[index + 1]?.focus();
      }
    };

    const handleKeyPress = (key: string, index: number) => {
      if (key === 'Backspace' && !pin[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    };

    return (
      <View className="mb-6">
        <Text className="text-foreground font-semibold text-base mb-3">{label}</Text>
        <View className="flex-row justify-center gap-3">
          {[0, 1, 2, 3].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => { refs.current[index] = ref; }}
              className="w-14 h-14 border-2 border-border rounded-xl text-center text-xl font-bold text-foreground bg-secondary/40"
              value={pin[index] || ''}
              onChangeText={(value) => handlePinChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              secureTextEntry
              selectTextOnFocus
            />
          ))}
        </View>
      </View>
    );
  };

  const renderOTPInput = () => {
    const handleOTPChange = (value: string, index: number) => {
      const newOTP = otpCode.split('');
      newOTP[index] = value;
      const updatedOTP = newOTP.join('');
      setOtpCode(updatedOTP);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    };

    const handleKeyPress = (key: string, index: number) => {
      if (key === 'Backspace' && !otpCode[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    };

    return (
      <View className="mb-6">
        <Text className="text-foreground font-semibold text-base mb-3">Enter 6-digit OTP</Text>
        <View className="flex-row justify-center gap-2">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TextInput
              key={index}
              ref={(ref) => { otpRefs.current[index] = ref; }}
              className="w-12 h-12 border-2 border-border rounded-xl text-center text-lg font-bold text-foreground bg-secondary/40"
              value={otpCode[index] || ''}
              onChangeText={(value) => handleOTPChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>
      </View>
    );
  };

  const renderMethodSelection = () => (
    <Animated.View entering={FadeIn} className="px-4">
      <View className="items-center mb-8">
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
          <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
        </View>
        <Text className="text-foreground text-2xl font-bold mb-2">Reset Transaction PIN</Text>
        <Text className="text-muted-foreground text-center text-base">
          Choose how you'd like to reset your PIN
        </Text>
      </View>

      <View className="gap-4">
        <TouchableOpacity
          onPress={() => handleMethodSelect('remember')}
          className="bg-secondary/50 border border-border rounded-xl p-6 shadow-none"
          disabled={verifyPinMutation.isPending}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
              <Ionicons name="key-outline" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold text-lg">I Remember My PIN</Text>
              <Text className="text-muted-foreground text-sm">
                Enter your current PIN to set a new one
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleMethodSelect('forgot')}
          className="bg-secondary/50 border border-border rounded-xl p-6 shadow-none"
          disabled={requestOTPMutation.isPending}
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-orange-100/30 dark:bg-orange-900/30 items-center justify-center mr-4">
              <Ionicons name="mail-outline" size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold text-lg">I Forgot My PIN</Text>
              <Text className="text-muted-foreground text-sm">
                Send verification code to your email
              </Text>
            </View>
            {requestOTPMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'method':
        return renderMethodSelection();

      case 'verify-old':
        return (
          <Animated.View entering={FadeInDown} className="px-4">
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Ionicons name="shield-checkmark-outline" size={22} color={colors.primary} />
              </View>
              <Text className="text-foreground text-xl font-bold mb-2">Verify Current PIN</Text>
              <Text className="text-muted-foreground text-center">
                Enter your current 4-digit transaction PIN
              </Text>
            </View>

            {renderPinInput(oldPin, setOldPin, oldPinRefs, 'Current PIN')}

            <TouchableOpacity
              onPress={handleVerifyOldPin}
              className={`bg-primary rounded-xl py-4 ${oldPin.length !== 4 ? 'opacity-50' : ''}`}
              disabled={oldPin.length !== 4 || verifyPinMutation.isPending}
            >
              {verifyPinMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">Verify PIN</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        );

      case 'otp-sent':
        return (
          <Animated.View entering={FadeInDown} className="px-4">
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-4">
                <Ionicons name="mail-open-outline" size={22} color="#10b981" />
              </View>
              <Text className="text-foreground text-xl font-bold mb-2">Check Your Email</Text>
              <Text className="text-muted-foreground text-center">
                We've sent a 6-digit verification code to
              </Text>
              <Text className="text-primary font-semibold">{user?.email}</Text>
            </View>

            {renderOTPInput()}

            <TouchableOpacity
              onPress={handleVerifyOTP}
              className={`bg-primary rounded-xl py-4 mb-4 ${otpCode.length !== 6 ? 'opacity-50' : ''}`}
              disabled={otpCode.length !== 6 || verifyOTPMutation.isPending}
            >
              {verifyOTPMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">Verify Code</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendOTP}
              className="py-3"
              disabled={requestOTPMutation.isPending}
            >
              <Text className="text-primary text-center font-medium">
                {requestOTPMutation.isPending ? 'Resending...' : 'Resend Code'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        );

      case 'new-pin':
        return (
          <Animated.View entering={FadeInDown} className="px-4">
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
                <Ionicons name="create-outline" size={22} color={colors.primary} />
              </View>
              <Text className="text-foreground text-xl font-bold mb-2">Set New PIN</Text>
              <Text className="text-muted-foreground text-center">
                Create a new 4-digit transaction PIN
              </Text>
            </View>

            {renderPinInput(newPin, setNewPin, newPinRefs, 'New PIN')}
            {renderPinInput(confirmPin, setConfirmPin, confirmPinRefs, 'Confirm New PIN')}

            <TouchableOpacity
              onPress={handleResetPin}
              className={`bg-primary rounded-xl py-4 ${
                newPin.length !== 4 || confirmPin.length !== 4 ? 'opacity-50' : ''
              }`}
              disabled={
                newPin.length !== 4 || confirmPin.length !== 4 || resetPinMutation.isPending
              }
            >
              {resetPinMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white text-center font-semibold text-lg">Reset PIN</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        );

      case 'reset-complete':
        return (
          <Animated.View entering={FadeInDown} className="px-4 items-center">
            <View className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-6">
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
            </View>
            <Text className="text-foreground text-2xl font-bold mb-4">PIN Reset Successful!</Text>
            <Text className="text-muted-foreground text-center text-base mb-8">
              Your transaction PIN has been successfully updated. You can now use your new PIN for transactions.
            </Text>

            <TouchableOpacity
              onPress={() => router.replace('/(tabs)/settings')}
              className="bg-primary rounded-xl py-4 px-8 w-full"
            >
              <Text className="text-white text-center font-semibold text-lg">Back to Settings</Text>
            </TouchableOpacity>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      <StarryBackground intensity="light">
        <Header title="Reset PIN" />
        
        <ScrollView 
          className="flex-1" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20, flexGrow: 1 }}
        >
          {renderStepContent()}
        </ScrollView>
      </StarryBackground>
    </SafeAreaView>
  );
};

export default ResetPinScreen;
