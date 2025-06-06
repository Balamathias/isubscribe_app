import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const actions = [
  { name: 'Data', icon: 'wifi' },
  { name: 'Airtime', icon: 'call' },
  { name: 'Electricity', icon: 'bulb-outline' },
  { name: 'TV Cable', icon: 'tv' },
  { name: 'Education', icon: 'school' },
  { name: 'Inter-Send', icon: 'swap-vertical' },
  { name: 'Share & Earn', icon: 'gift' },
  { name: 'More', icon: 'ellipsis-horizontal' },
];

const QuickActions = () => {
  return (
    <View className="mt-6 bg-background p-4 rounded-xl shadow-sm flex flex-col gap-y-2 items-start">
      <View className="flex-row items-center mb-4">
        <Text className="text-foreground font-bold text-lg">Quick Actions</Text>
        <View className="w-2 h-2 rounded-full bg-primary ml-2" />
      </View>
      <View className="flex-row flex-wrap justify-between">
        {actions.map((action, index) => (
          <ActionItem key={index} action={action} />
        ))}
      </View>
    </View>
  )
}

interface ActionItemProps {
  action: { name: string; icon: any };
}

const ActionItem: React.FC<ActionItemProps> = ({ action }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle} className="flex flex-col w-1/4 items-center mb-4">
      <TouchableOpacity
        className="bg-[#F3EFFB] dark:bg-[#222] p-1 rounded-xl mb-2 items-center justify-center aspect-square w-10 h-10"
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Ionicons name={action.icon} size={20} color="#B294F8" />
      </TouchableOpacity>
      <Text className="text-foreground text-xs font-medium text-center">{action.name}</Text>
    </Animated.View>
  )
}

export default QuickActions