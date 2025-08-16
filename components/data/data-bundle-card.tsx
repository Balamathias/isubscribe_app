import { SuperPlansMB } from '@/services/api';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface DataBundleCardProps {
  bundle: SuperPlansMB;
  onSelectBundle: (bundle: SuperPlansMB) => void;
  isSelected: boolean;
  onPress: () => void;
  phoneNumber: string;
}

const DataBundleCard: React.FC<DataBundleCardProps> = ({
  bundle, onSelectBundle, isSelected, onPress, phoneNumber
}) => {
  const scale = useSharedValue(1);
  const { use_bonus } = useLocalSearchParams()

  React.useEffect(() => {
    scale.value = withTiming(isSelected ? 1.05 : 1, { duration: 200 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <TouchableOpacity onPress={() => {
        onSelectBundle(bundle);
        onPress();
    }} className="flex w-[31%]">
      <Animated.View
        style={animatedStyle}
        className={`bg-input rounded-xl rounded-tr-3xl p-4 items-center justify-center shadow-sm h-36 border-none relative`}
      >
        {use_bonus === 'true' && ((bundle?.price < 1000) && (bundle?.price > 10)) && (
          <View className="absolute -top-2 -right-2 bg-primary rounded-full p-1">
            <Ionicons name="gift" size={12} color="white" />
          </View>
        )}
        <Text className="text-foreground text-lg font-bold mb-1" numberOfLines={1}>{bundle?.quantity}</Text>
        <Text className="text-muted-foreground text-sm mb-2">{bundle?.duration === 'N/A' ? '' : bundle?.duration}</Text>
        <Text className={`text-primary text-xl font-bold mb-2 ${ use_bonus === 'true' ? 'text-[14px]' : ''}`}>{use_bonus === 'true' ? bundle?.data_bonus_price : formatNigerianNaira(bundle?.price)?.split('.')[0]}</Text>
        {bundle?.data_bonus && (
          <Text className="text-muted-foreground text-xs">+{bundle?.data_bonus}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default DataBundleCard;