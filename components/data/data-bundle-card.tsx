import { SuperPlansMB } from '@/services/api';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS } from '@/constants/colors';

interface DataBundleCardProps {
  bundle: SuperPlansMB;
  onSelectBundle: (bundle: SuperPlansMB) => void;
  isSelected: boolean;
  onPress: () => void;
  phoneNumber: string;
}

const DataBundleCard: React.FC<DataBundleCardProps> = ({
  bundle,
  onSelectBundle,
  isSelected,
  onPress,
  phoneNumber,
}) => {
  const scale = useSharedValue(1);
  const { use_bonus } = useLocalSearchParams();
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

  const isBonusEligible = use_bonus === 'true' && bundle?.price < 1000 && bundle?.price > 10;
  const hasDataBonus = bundle?.data_bonus && bundle.data_bonus !== '0MB';

  return (
    <TouchableOpacity
      onPress={() => {
        onSelectBundle(bundle);
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
            padding: 14,
            height: 130,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          },
        ]}
      >
        {/* Bonus Gift Badge */}
        {isBonusEligible && (
          <View
            className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full items-center justify-center"
            style={{
              backgroundColor: '#22c55e',
              shadowColor: '#22c55e',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="gift" size={12} color="#fff" />
          </View>
        )}

        {/* Selected Checkmark */}
        {isSelected && (
          <View
            className="absolute top-2 right-2 w-5 h-5 rounded-full items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
          >
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}

        {/* Data Size */}
        <Text
          className="text-lg font-bold mb-0.5"
          style={{ color: isSelected ? '#fff' : isDark ? '#fff' : '#111' }}
          numberOfLines={1}
        >
          {bundle?.quantity}
        </Text>

        {/* Duration */}
        {bundle?.duration && bundle.duration !== 'N/A' && (
          <Text
            className="text-xs mb-2"
            style={{
              color: isSelected
                ? 'rgba(255,255,255,0.7)'
                : isDark
                  ? 'rgba(255,255,255,0.45)'
                  : 'rgba(0,0,0,0.4)',
            }}
          >
            {bundle.duration}
          </Text>
        )}

        {/* Price */}
        <Text
          className={`font-bold mb-1 ${use_bonus === 'true' ? 'text-sm' : 'text-lg'}`}
          style={{ color: isSelected ? '#fff' : colors.primary }}
        >
          {use_bonus === 'true'
            ? bundle?.data_bonus_price
            : formatNigerianNaira(bundle?.price)?.split('.')[0]}
        </Text>

        {/* Data Bonus Badge */}
        {hasDataBonus && (
          <View
            className="px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: isSelected
                ? 'rgba(255,255,255,0.2)'
                : isDark
                  ? 'rgba(34,197,94,0.15)'
                  : 'rgba(34,197,94,0.1)',
            }}
          >
            <Text
              className="text-[9px] font-semibold"
              style={{ color: isSelected ? '#fff' : '#22c55e' }}
            >
              +{bundle.data_bonus}
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default DataBundleCard;