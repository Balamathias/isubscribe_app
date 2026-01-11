import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 10,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const numberScale = useSharedValue(1);
  const numberOpacity = useSharedValue(1);
  const minusScale = useSharedValue(1);
  const plusScale = useSharedValue(1);

  const isMinReached = value <= min;
  const isMaxReached = value >= max;

  useEffect(() => {
    // Animate number when value changes
    numberScale.value = withSequence(
      withTiming(1.2, { duration: 100 }),
      withSpring(1)
    );
    numberOpacity.value = withSequence(
      withTiming(0.5, { duration: 50 }),
      withTiming(1, { duration: 100 })
    );
  }, [value]);

  const numberAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberScale.value }],
    opacity: numberOpacity.value,
  }));

  const minusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: minusScale.value }],
  }));

  const plusAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: plusScale.value }],
  }));

  const handleDecrement = () => {
    if (!isMinReached && !disabled) {
      minusScale.value = withSequence(
        withSpring(0.85),
        withSpring(1)
      );
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (!isMaxReached && !disabled) {
      plusScale.value = withSequence(
        withSpring(0.85),
        withSpring(1)
      );
      onChange(value + 1);
    }
  };

  return (
    <View className="items-center py-4">
      <Text className="text-muted-foreground text-sm mb-3">Quantity</Text>
      <View className="flex-row items-center justify-center">
        {/* Minus Button */}
        <AnimatedTouchable
          style={minusAnimatedStyle}
          onPress={handleDecrement}
          disabled={isMinReached || disabled}
          activeOpacity={0.7}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isMinReached || disabled
              ? 'bg-secondary/50 opacity-50'
              : 'bg-blue-500'
          }`}
        >
          <Ionicons
            name="remove"
            size={24}
            color={isMinReached || disabled ? colors.mutedForeground : 'white'}
          />
        </AnimatedTouchable>

        {/* Number Display */}
        <Animated.View
          style={numberAnimatedStyle}
          className="w-24 items-center justify-center mx-4"
        >
          <Text className="text-4xl font-bold text-foreground">
            {value}
          </Text>
          <Text className="text-muted-foreground text-sm mt-1">
            {value === 1 ? 'pin' : 'pins'}
          </Text>
        </Animated.View>

        {/* Plus Button */}
        <AnimatedTouchable
          style={plusAnimatedStyle}
          onPress={handleIncrement}
          disabled={isMaxReached || disabled}
          activeOpacity={0.7}
          className={`w-12 h-12 rounded-full items-center justify-center ${
            isMaxReached || disabled
              ? 'bg-secondary/50 opacity-50'
              : 'bg-blue-500'
          }`}
        >
          <Ionicons
            name="add"
            size={24}
            color={isMaxReached || disabled ? colors.mutedForeground : 'white'}
          />
        </AnimatedTouchable>
      </View>

      {/* Min/Max indicator */}
      <Text className="text-muted-foreground text-xs mt-3">
        Min: {min} | Max: {max}
      </Text>
    </View>
  );
};

export default QuantitySelector;
