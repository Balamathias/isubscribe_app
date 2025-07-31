import StackHeader from '@/components/header.stack';
import { useSession } from '@/components/session-context';
import { useThemedColors } from '@/hooks/useThemedColors';
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
  Animated,
  ScrollView,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

type ResetMethod = 'remember' | 'forgot' | null;
type Step = 'method' | 'verify-old' | 'new-pin' | 'otp-sent' | 'verify-otp' | 'reset-complete';

const ResetPinScreen = () => {
  const { user } = useSession();
  const { theme, colors } = useThemedColors();

  const [resetMethod, setResetMethod] = useState<ResetMethod>(null);
  const [currentStep, setCurrentStep] = useState<Step>('method');
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState('');

  // Animation values
  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;

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

  const animateShake = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const animateTransition = () => {
    Animated.parallel([
      Animated.timing(fadeAnimation, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(scaleAnimation, { toValue: 0.95, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(fadeAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scaleAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  const handleMethodSelect = (method: ResetMethod) => {
    animateTransition();
    setResetMethod(method);
    
    setTimeout(() => {
      if (method === 'remember') {
        setCurrentStep('verify-old');
        setTimeout(() => oldPinRefs.current[0]?.focus(), 300);
      } else if (method === 'forgot') {
        handleSendOTP();
      }
    }, 200);
  };

  const handleSendOTP = async () => {
    try {
      const response = await requestOTPMutation.mutateAsync();
      if (response.data) {
        animateTransition();
        setTimeout(() => {
          setCurrentStep('otp-sent');
          setTimeout(() => otpRefs.current[0]?.focus(), 300);
        }, 200);
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
      animateShake();
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to send OTP'
      });
    }
  };

  const handleVerifyOldPin = async () => {
    if (oldPin.length !== 4) {
      animateShake();
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
        animateTransition();
        setTimeout(() => {
          setCurrentStep('new-pin');
          setTimeout(() => newPinRefs.current[0]?.focus(), 300);
        }, 200);
        Toast.show({
          type: 'success',
          text1: 'PIN Verified',
          text2: 'Now set your new PIN'
        });
      } else {
        throw new Error('Invalid PIN entered');
      }
    } catch (error: any) {
      animateShake();
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message || 'Invalid PIN entered'
      });
      setOldPin('');
      setTimeout(() => oldPinRefs.current[0]?.focus(), 100);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      animateShake();
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
        animateTransition();
        setTimeout(() => {
          setCurrentStep('new-pin');
          setTimeout(() => newPinRefs.current[0]?.focus(), 300);
        }, 200);
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
      animateShake();
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message || 'Invalid OTP entered'
      });
      setOtpCode('');
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleResetPin = async (confirmedPin?: string) => {
    // Use the passed confirmedPin if available, otherwise use state
    const confirmPinToUse = confirmedPin || confirmPin;
    
    // Since we're using progressive PIN entry, we only validate when both are actually set
    if (newPin.length !== 4) {
      animateShake();
      Toast.show({
        type: 'warning',
        text1: 'Invalid PIN',
        text2: 'Please complete your new PIN'
      });
      return;
    }

    if (confirmPinToUse.length !== 4) {
      animateShake();
      Toast.show({
        type: 'warning',
        text1: 'Invalid PIN',
        text2: 'Please complete PIN confirmation'
      });
      return;
    }

    if (newPin !== confirmPinToUse) {
      animateShake();
      Toast.show({
        type: 'error',
        text1: 'PIN Mismatch',
        text2: 'New PIN and confirmation must match'
      });
      setConfirmPin('');
      setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
      return;
    }

    try {
      const payload = resetMethod === 'forgot' 
        ? { otp: otpToken, new_pin: newPin, requires_otp: false }
        : { otp: '', new_pin: newPin, requires_otp: false };

      console.log('Reset PIN payload:', payload); // Debug log

      const response = await resetPinMutation.mutateAsync(payload);
      
      console.log('Reset PIN response:', response); // Debug log
      
      if (response.data) {
        animateTransition();
        setTimeout(() => setCurrentStep('reset-complete'), 200);
        Toast.show({
          type: 'success',
          text1: 'PIN Reset Successful',
          text2: 'Your transaction PIN has been updated'
        });
        
        // Auto-navigate back to settings after showing success message
        setTimeout(() => {
          router.replace('/(tabs)/settings');
        }, 3000);
      } else {
        console.log('Reset PIN failed - no data:', response); // Debug log
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : (response.error && typeof response.error === 'object' && 'message' in response.error)
            ? response.error.message || 'Failed to reset PIN'
            : 'Failed to reset PIN';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.log('Reset PIN error:', error); // Debug log
      animateShake();
      Toast.show({
        type: 'error',
        text1: 'Reset Failed',
        text2: error.message || 'Failed to reset PIN'
      });
      
      // Reset the confirm PIN so user can try again
      setConfirmPin('');
      setTimeout(() => confirmPinRefs.current[0]?.focus(), 100);
    }
  };

  const renderPinInputs = (
    pin: string,
    setPinValue: (value: string) => void,
    refs: React.MutableRefObject<(TextInput | null)[]>,
    autoFocus: boolean = false
  ) => {
    const handlePinChange = (value: string, index: number) => {
      const newPin = pin.split('');
      newPin[index] = value;
      const updatedPin = newPin.join('');
      setPinValue(updatedPin);

      // Auto-focus next input
      if (value && index < 3) {
        refs.current[index + 1]?.focus();
      }

      // Handle completion based on current step and PIN state
      if (updatedPin.length === 4) {
        if (currentStep === 'new-pin') {
          // If we're setting new PIN and it's complete, transition to confirm
          if (refs === newPinRefs) {
            setTimeout(() => {
              animateTransition();
              setTimeout(() => confirmPinRefs.current[0]?.focus(), 300);
            }, 200);
          }
          // If we're confirming PIN and it's complete, and newPin is also complete, submit
          else if (refs === confirmPinRefs && newPin.length === 4) {
            setTimeout(() => handleResetPin(updatedPin), 200);
          }
        }
      }
    };

    const handleKeyPress = (key: string, index: number) => {
      if (key === 'Backspace') {
        if (!pin[index] && index > 0) {
          refs.current[index - 1]?.focus();
        }
      }
    };

    return (
      <Animated.View 
        style={{ 
          transform: [
            { translateX: shakeAnimation },
            { scale: scaleAnimation }
          ],
          opacity: fadeAnimation
        }}
        className="flex-row justify-center gap-4 mb-8"
      >
        {[0, 1, 2, 3].map((index) => (
          <View key={index} className="relative">
            <TextInput
              ref={(ref) => { refs.current[index] = ref; }}
              className={`w-14 h-14 rounded-2xl text-center text-2xl font-bold border-2 ${
                pin[index] 
                  ? 'border-primary bg-primary/5 text-foreground' 
                  : 'border-border bg-card text-muted-foreground'
              }`}
              value={pin[index] || ''}
              onChangeText={(value) => handlePinChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              secureTextEntry
              selectTextOnFocus
              autoFocus={index === 0 && autoFocus}
            />
            {pin[index] && (
              <View className="absolute inset-0 rounded-2xl bg-primary/10 items-center justify-center">
                <View className="w-3 h-3 rounded-full bg-primary" />
              </View>
            )}
          </View>
        ))}
      </Animated.View>
    );
  };

  const renderOTPInputs = () => {
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
      <Animated.View 
        style={{ 
          transform: [
            { translateX: shakeAnimation },
            { scale: scaleAnimation }
          ],
          opacity: fadeAnimation
        }}
        className="flex-row justify-center gap-3 mb-8"
      >
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TextInput
            key={index}
            ref={(ref) => { otpRefs.current[index] = ref; }}
            className={`w-12 h-14 rounded-2xl text-center text-xl font-bold border-2 ${
              otpCode[index] 
                ? 'border-primary bg-primary/5 text-foreground' 
                : 'border-border bg-card text-muted-foreground'
            }`}
            value={otpCode[index] || ''}
            onChangeText={(value) => handleOTPChange(value, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="numeric"
            maxLength={1}
            selectTextOnFocus
            autoFocus={index === 0}
          />
        ))}
      </Animated.View>
    );
  };

  const renderMethodSelection = () => (
    <View className="gap-y-3">
      <View className="items-center mb-12">
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
          <Ionicons name="lock-closed" size={32} color={colors.primary} />
        </View>
        <Text className="text-foreground text-2xl font-bold mb-2">Reset Transaction PIN</Text>
        <Text className="text-muted-foreground text-center text-base leading-6">
          Choose how you'd like to reset your PIN
        </Text>
      </View>

      <View className="gap-4 px-4">
        <Text
          onPress={() => handleMethodSelect('remember')}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border/20"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center mr-4">
              <Ionicons name="key" size={20} color={colors.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-foreground font-semibold text-lg">I Remember My PIN</Text>
              <Text className="text-muted-foreground text-sm">
                Enter your current PIN to set a new one
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </View>
        </Text>

        <Text
          onPress={() => handleMethodSelect('forgot')}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border/20"
        >
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-orange-100/30 dark:bg-orange-900/30 items-center justify-center mr-4">
              <Ionicons name="mail" size={20} color="#f97316" />
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
        </Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'method':
        return renderMethodSelection();

      case 'verify-old':
        return (
          <View className="gap-y-3">
            <View className="items-center mb-12">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
                <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
              </View>
              <Text className="text-foreground text-2xl font-bold mb-2">Verify Current PIN</Text>
              <Text className="text-muted-foreground text-center text-base leading-6">
                Enter your current 4-digit transaction PIN
              </Text>
            </View>
            {renderPinInputs(oldPin, setOldPin, oldPinRefs, true)}
            <View className="px-4">
              <Text
                onPress={handleVerifyOldPin}
                className={`text-center py-5 rounded-2xl font-bold text-lg ${
                  oldPin.length === 4 && !verifyPinMutation.isPending
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {verifyPinMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  'Verify PIN'
                )}
              </Text>
            </View>
          </View>
        );

      case 'otp-sent':
        return (
          <View className="gap-y-3">
            <View className="items-center mb-12">
              <View className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-6">
                <Ionicons name="mail-open" size={32} color="#10b981" />
              </View>
              <Text className="text-foreground text-2xl font-bold mb-2">Check Your Email</Text>
              <Text className="text-muted-foreground text-center text-base leading-6">
                We've sent a 6-digit verification code to{'\n'}
                <Text className="text-primary font-semibold">{user?.email}</Text>
              </Text>
            </View>
            {renderOTPInputs()}
            <View className="px-4 gap-4">
              <Text
                onPress={handleVerifyOTP}
                className={`text-center py-5 rounded-2xl font-bold text-lg ${
                  otpCode.length === 6 && !verifyOTPMutation.isPending
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {verifyOTPMutation.isPending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  'Verify Code'
                )}
              </Text>
              <Text
                onPress={handleSendOTP}
                className="text-primary text-center font-medium py-3"
              >
                {requestOTPMutation.isPending ? 'Resending...' : 'Resend Code'}
              </Text>
            </View>
          </View>
        );

      case 'new-pin':
        return (
          <View className="gap-y-3">
            <View className="items-center mb-12">
              <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
                <Ionicons name="create" size={32} color={colors.primary} />
              </View>
              <Text className="text-foreground text-2xl font-bold mb-2">
                {newPin.length < 4 ? 'Create New PIN' : 'Confirm New PIN'}
              </Text>
              <Text className="text-muted-foreground text-center text-base leading-6">
                {newPin.length < 4 
                  ? 'Set a 4-digit PIN to secure your transactions'
                  : 'Re-enter your PIN to confirm and complete setup'
                }
              </Text>
            </View>
            
            {/* Show New PIN input when newPin is not complete */}
            {newPin.length < 4 ? (
              renderPinInputs(newPin, setNewPin, newPinRefs, true)
            ) : (
              /* Show Confirm PIN input when newPin is complete */
              renderPinInputs(confirmPin, setConfirmPin, confirmPinRefs, true)
            )}
          </View>
        );

      case 'reset-complete':
        return (
          <Animated.View
            style={{ opacity: fadeAnimation, transform: [{ scale: scaleAnimation }] }}
            className="items-center"
          >
            <View className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 items-center justify-center mb-8">
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>
            <Text className="text-foreground text-2xl font-bold mb-4">PIN Reset Successful!</Text>
            <Text className="text-muted-foreground text-center text-base mb-8 leading-6">
              Your transaction PIN has been successfully updated. You can now use your new PIN for transactions.
            </Text>
            
            <View className="px-4 w-full gap-4">
              <Text
                onPress={() => router.replace('/(tabs)/settings')}
                className="bg-primary text-white text-center font-bold text-lg py-5 rounded-2xl"
              >
                Back to Settings
              </Text>
              
              <Text
                onPress={() => {
                  // Reset all state to start over
                  setCurrentStep('method');
                  setResetMethod(null);
                  setOldPin('');
                  setNewPin('');
                  setConfirmPin('');
                  setOtpCode('');
                  setOtpToken('');
                  animateTransition();
                }}
                className="bg-card border border-border text-foreground text-center font-medium text-lg py-5 rounded-2xl"
              >
                Reset Another PIN
              </Text>
            </View>
          </Animated.View>
        );

      default:
        return null;
    }
  };

  const handleGoBack = () => {
    if (currentStep === 'verify-old' || currentStep === 'otp-sent') {
      animateTransition();
      setTimeout(() => {
        setCurrentStep('method');
        setOldPin('');
        setOtpCode('');
      }, 200);
    } else if (currentStep === 'new-pin') {
      animateTransition();
      setTimeout(() => {
        if (resetMethod === 'remember') {
          setCurrentStep('verify-old');
        } else {
          setCurrentStep('otp-sent');
        }
        setNewPin('');
        setConfirmPin('');
      }, 200);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      {/* Header */}
      <StackHeader 
        title="Reset PIN"
        onBackPress={handleGoBack}
      />

      <ScrollView 
        className="flex-1 px-6" 
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        showsVerticalScrollIndicator={false}
      >
        {/* Content */}
        <View className="flex-1 justify-center">
          {renderStepContent()}
        </View>

        {/* Loading State */}
        {(verifyPinMutation.isPending || requestOTPMutation.isPending || verifyOTPMutation.isPending || resetPinMutation.isPending) && currentStep !== 'reset-complete' && (
          <View className="absolute inset-0 bg-background/80 items-center justify-center">
            <View className="bg-card rounded-2xl p-6 items-center shadow-lg border border-border">
              <ActivityIndicator size="large" color={colors.primary} />
              <Text className="text-foreground font-semibold text-lg mt-4">
                {verifyPinMutation.isPending && 'Verifying PIN...'}
                {requestOTPMutation.isPending && 'Sending OTP...'}
                {verifyOTPMutation.isPending && 'Verifying OTP...'}
                {resetPinMutation.isPending && 'Resetting PIN...'}
              </Text>
              <Text className="text-muted-foreground text-sm">Please wait</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPinScreen;
