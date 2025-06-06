import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface DataBundle {
  id: string;
  size: string;
  duration: string;
  price: number;
  bonusMb: number;
}

interface DataBundleCardProps {
  bundle: DataBundle;
  onSelectBundle: (bundle: DataBundle) => void;
  isSelected: boolean;
  onPress: () => void
}

const DataBundleCard: React.FC<DataBundleCardProps> = ({
  bundle, onSelectBundle, isSelected, onPress
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
        onSelectBundle(bundle)
        onPress()
    }} className="flex w-[31%]">
      <Animated.View
        style={animatedStyle}
        className={`bg-input rounded-xl rounded-tr-3xl p-4 items-center justify-center shadow-sm h-36
          ${isSelected ? 'border-2 border-primary' : 'border border-border'}`}
      >
        <Text className="text-foreground text-lg font-bold mb-1">{bundle.size}</Text>
        <Text className="text-muted-foreground text-sm mb-2">{bundle.duration}</Text>
        <Text className="text-primary text-xl font-bold mb-2">₦{bundle.price.toLocaleString()}</Text>
        {bundle.bonusMb > 0 && (
          <Text className="text-muted-foreground text-xs">+{bundle.bonusMb} MB</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default DataBundleCard; 