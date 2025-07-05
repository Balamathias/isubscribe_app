import BottomSheet from '@/components/ui/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface PinPadProps {
  isVisible: boolean;
  onClose: () => void;
  handler: (pin: string) => Promise<boolean | void>; // Handler function for PIN verification
  title?: string;
  description?: string;
  loadingText?: string;
  successMessage?: string;
  errorMessage?: string;
  pinLength?: number; // Default to 4
  onSuccess?: () => void;
  onError?: () => void;
}

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

  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  useEffect(() => {
    if (pin.length === pinLength) {
      handlePinVerification();
    }
  }, [pin]);

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

      if ((handlerResult === undefined || handlerResult === true)) {
        setIsSuccess(true);
        onSuccess?.();
        setTimeout(() => onClose(), 500);
      } else {
        setError(errorMessage);
        onError?.();
      }
    } catch (err) {
      console.error('PIN verification error:', err);
      setError('An error occurred during verification.');
      onError?.();
    } finally {
      setIsLoading(false);
      setPin('');
    }
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose} title={title}>
      <View className="flex flex-col items-center justify-center p-4 w-full relative">
        <Text className="text-muted-foreground text-center mb-6">{description}</Text>

        <View className="flex-row justify-center mb-6">
          {[...Array(pinLength)].map((_, index) => (
            <View
              key={index}
              className={`w-4 h-4 rounded-full mx-2 border ${pin.length > index ? 'bg-primary border-primary' : 'bg-secondary border-secondary'}`}
              style={{ borderColor: colors.border, backgroundColor: pin.length > index ? colors.primary : colors.secondary }}
            />
          ))}
        </View>

        {error ? (
          <Text className="text-destructive text-center mb-4">{error}</Text>
        ) : isSuccess ? (
          <Text className="text-primary text-center mb-4">{successMessage}</Text>
        ) : null}

        {isLoading && (
          <View className='bg-transparent inset-0 absolute flex justify-center items-center z-10 right-0 left-0 bottom-0 top-0'>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground mt-2">{loadingText}</Text>
          </View>
        )}

        <View className="flex w-full flex-row flex-wrap">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, -1, 0, -2].map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => handleKeyPress(num === -2 ? 'delete' : String(num))}
              className="w-1/3 p-4 items-center justify-center"
              style={{ aspectRatio: 1 }}
              disabled={isLoading}
            >
              {num === -1 ? (
                <View />
              ) : num === -2 ? (
                <Ionicons name="backspace-outline" size={30} color={colors.foreground} />
              ) : (
                <Text className="text-muted-foreground text-3xl font-bold">{num}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({

});

export default PinPad;
