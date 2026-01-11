import { formatDataAmount } from '@/utils';
import { formatNigerianNaira } from '@/utils/format-naira';
import React from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface Airtime {
  id: string;
  size: string;
  price: number;
  bonusMb: number;
}

interface AirtimeCardProps {
  plan: Airtime;
  onSelectPlan: (plan: Airtime) => void;
  isSelected: boolean;
  onPress: () => void;
  phoneNumber: string;
}

const AirtimeCard: React.FC<AirtimeCardProps> = ({
  plan,
  onSelectPlan,
  isSelected,
  onPress,
  phoneNumber,
}) => {
  const scale = useSharedValue(1);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.02 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const hasBonus = plan.bonusMb > 0 && plan.price >= 100;

  return (
    <TouchableOpacity
      onPress={() => {
        onSelectPlan(plan);
        onPress();
      }}
      activeOpacity={0.85}
      className="w-[31%]"
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            backgroundColor: isSelected
              ? colors.primary
              : isDark
                ? 'rgba(255,255,255,0.04)'
                : '#f8f8f8',
            borderWidth: isSelected ? 0 : 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            borderRadius: 20,
            padding: 16,
            height: 110,
            alignItems: 'center',
            justifyContent: 'center',
          },
        ]}
      >
        {/* Selected Checkmark */}
        {isSelected && (
          <View
            className="absolute top-2 right-2 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
          >
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}

        {/* Price Display */}
        <Text
          className="text-xl font-bold mb-1"
          style={{
            color: isSelected ? '#fff' : isDark ? '#fff' : '#111',
          }}
        >
          ₦{plan.price.toLocaleString()}
        </Text>

        {/* Bonus Badge */}
        {hasBonus && (
          <View
            className="px-2 py-0.5 rounded-full mt-1"
            style={{
              backgroundColor: isSelected
                ? 'rgba(255,255,255,0.2)'
                : isDark
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(34,197,94,0.1)',
            }}
          >
            <Text
              className="text-[10px] font-semibold"
              style={{
                color: isSelected ? '#fff' : '#22c55e',
              }}
            >
              +{formatDataAmount(plan.price * 0.01)}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AirtimeCard;