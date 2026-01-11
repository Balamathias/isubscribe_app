import BottomSheet from '@/components/ui/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSession } from './session-context';
import LoadingSpinner from './ui/loading-spinner';

interface PinPadProps {
  isVisible: boolean;
  onClose: () => void;
  handler: (pin: string) => Promise<boolean | void>;
  title?: string;
  description?: string;
  loadingText?: string;
  successMessage?: string;
  errorMessage?: string;
  pinLength?: number;
  onSuccess?: () => void;
  onError?: () => void;
}

const AnimatedDot = ({
  filled,
  error,
  success,
  colors,
  isDark,
}: {
  filled: boolean;
  error: boolean;
  success: boolean;
  colors: typeof COLORS.light;
  isDark: boolean;
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (filled) {
      scale.value = withSequence(withSpring(1.3, { damping: 8 }), withSpring(1, { damping: 10 }));
    }
  }, [filled]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getColor = () => {
    if (error) return '#ef4444';
    if (success) return '#22c55e';
    if (filled) return colors.primary;
    return isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  };

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          width: 16,
          height: 16,
          borderRadius: 8,
          marginHorizontal: 8,
          backgroundColor: getColor(),
          borderWidth: filled || error || success ? 0 : 1,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
        },
      ]}
    />
  );
};

const NumberButton = ({
  num,
  onPress,
  disabled,
  colors,
  isDark,
}: {
  num: number | string;
  onPress: () => void;
  disabled: boolean;
  colors: typeof COLORS.light;
  isDark: boolean;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  if (num === -1) {
    return <View className="w-1/3 aspect-square" />;
  }

  if (num === -2) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className="w-1/3 aspect-square items-center justify-center"
        activeOpacity={0.7}
      >
        <Animated.View
          style={animatedStyle}
          className="w-14 h-14 rounded-full items-center justify-center"
        >
          <Ionicons name="backspace-outline" size={28} color={isDark ? '#fff' : '#111'} />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      className="w-1/3 aspect-square items-center justify-center mt-1"
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
          },
        ]}
      >
        <Text
          className="text-2xl font-semibold"
          style={{ color: isDark ? '#fff' : '#111' }}
        >
          {num}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const PinPad: React.FC<PinPadProps> = ({
  isVisible,
  onClose,
  handler,
  title = 'Enter your PIN',
  description = 'Please enter your transaction PIN to proceed.',
  loadingText = 'Verifying PIN...',
  successMessage = 'PIN verified successfully!',
  errorMessage = 'Incorrect PIN. Please try again.',
  pinLength = 4,
  onSuccess,
  onError,
}) => {
  const [pin, setPin] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const { profile } = useSession();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  const hasPin = profile?.pin !== null && profile?.pin !== undefined;

  useEffect(() => {
    if (pin.length === pinLength) {
      handlePinVerification();
    }
  }, [pin]);

  // Reset state when modal opens
  useEffect(() => {
    if (isVisible) {
      setPin('');
      setError('');
      setIsSuccess(false);
    }
  }, [isVisible]);

  const handleKeyPress = (key: string) => {
    if (isLoading) return;

    if (key === 'delete') {
      setPin((prevPin) => prevPin.slice(0, -1));
      setError('');
      setIsSuccess(false);
    } else if (pin.length < pinLength) {
      setPin((prevPin) => prevPin + key);
      setError('');
      setIsSuccess(false);
    }
  };

  const handlePinVerification = async () => {
    setIsLoading(true);
    setError('');
    setIsSuccess(false);
    try {
      const handlerResult = await handler(pin);

      if (handlerResult === undefined || handlerResult === true) {
        setIsSuccess(true);
        onSuccess?.();
        setTimeout(() => onClose(), 500);
      } else {
        setError(errorMessage);
        onError?.();
      }
    } catch {
      setError('An error occurred during verification.');
      onError?.();
    } finally {
      setIsLoading(false);
      setPin('');
    }
  };

  const handleForgotPin = () => {
    onClose();
    router.push('/reset-pin');
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose} title="">
      <LoadingSpinner isPending={isLoading} />

      <View className="items-center pb-4">
        {/* Header */}
        <View className="items-center mb-6">
          <View
            className="w-14 h-14 rounded-full items-center justify-center mb-4 bg-primary/15"
          >
            <Ionicons name="lock-closed" size={24} color={colors.primary} />
          </View>
          <Text className="text-lg font-bold mb-1" style={{ color: isDark ? '#fff' : '#111' }}>
            {title}
          </Text>
          <Text
            className="text-center text-sm px-8"
            style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
          >
            {description}
          </Text>
        </View>

        {/* PIN Dots */}
        <View className="flex-row justify-center mb-4">
          {[...Array(pinLength)].map((_, index) => (
            <AnimatedDot
              key={index}
              filled={pin.length > index}
              error={!!error}
              success={isSuccess}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>

        {/* Status Messages */}
        {error ? (
          <View className="flex-row items-center mb-4 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-xs ml-1.5" style={{ color: '#ef4444' }}>{error}</Text>
          </View>
        ) : isSuccess ? (
          <View className="flex-row items-center mb-4 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
            <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
            <Text className="text-xs ml-1.5" style={{ color: '#22c55e' }}>{successMessage}</Text>
          </View>
        ) : (
          <View className="h-8 mb-4" />
        )}

        {/* Forgot PIN Link */}
        <TouchableOpacity onPress={handleForgotPin} className="mb-4" activeOpacity={0.7}>
          <Text className="text-sm font-medium" style={{ color: colors.primary }}>
            {hasPin ? 'Forgot PIN?' : 'Set up your PIN'}
          </Text>
        </TouchableOpacity>

        {/* Number Pad */}
        <View className="w-full flex-row flex-wrap px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 0, -2].map((num) => (
            <NumberButton
              key={num}
              num={num}
              onPress={() => handleKeyPress(num === -2 ? 'delete' : String(num))}
              disabled={isLoading}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>
      </View>
    </BottomSheet>
  );
};

export default PinPad;
