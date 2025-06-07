import { formatNigerianNaira } from '@/utils/format-naira';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

interface Airtime {
  id: string;
  size: string;
  price: number;
  bonusMb: number;
}

interface AirtimeCardProps {
  plan: Airtime;
  onSelectPlan: (plan: Airtime) => void;
  isSelected: boolean;
  onPress: () => void,
  phoneNumber: string
}

const AirtimeCard: React.FC<AirtimeCardProps> = ({
  plan, onSelectPlan, isSelected, onPress, phoneNumber
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
        if (phoneNumber) {
            onSelectPlan(plan)
            onPress()
        } else {
            Toast.show({
                type: 'info',
                text1: `Please provide your Phone Number to continue.`
            })
        }
    }} className="flex w-[31%]">
      <Animated.View
        style={animatedStyle}
        className={`bg-input rounded-xl rounded-tr-3xl p-4 items-center justify-center shadow-sm h-36
          ${isSelected ? 'border-2 border-primary' : 'border border-border'}`}
      >
        <Text className="text-foreground text-lg font-bold mb-1">{plan.size}</Text>
        <Text className="text-primary text-xl font-bold mb-2">{formatNigerianNaira(plan.price).split('.')[0]}</Text>
        {plan.bonusMb > 0 && (
          <Text className="text-muted-foreground text-xs">+{plan.bonusMb} MB</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AirtimeCard; 