import { SuperPlansMB } from '@/services/accounts';
import { formatNigerianNaira } from '@/utils/format-naira';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
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
        className={`bg-input rounded-xl rounded-tr-3xl p-4 items-center justify-center shadow-sm h-36
          ${isSelected ? 'border-2 border-border' : 'border border-border'}`}
      >
        <Text className="text-foreground text-lg font-bold mb-1">{bundle?.quantity}</Text>
        <Text className="text-muted-foreground text-sm mb-2">{bundle?.duration}</Text>
        <Text className="text-primary text-xl font-bold mb-2">{formatNigerianNaira(bundle?.price)}</Text>
        {bundle?.data_bonus && (
          <Text className="text-muted-foreground text-xs">+{bundle?.data_bonus}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default DataBundleCard; 