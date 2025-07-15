import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const actions = [
  { name: 'Data', icon: 'wifi-outline', href: `/services/data` },
  { name: 'Airtime', icon: 'call-outline', href: `/services/airtime` },
  { name: 'Electricity', icon: 'bulb-outline', href: `/services/electricity` },
  { name: 'TV Cable', icon: 'tv-outline', href: `/services/tv-cable` },
  { name: 'Education', icon: 'school-outline', href: `/services/education` },
  { name: 'Inter-Send', icon: 'swap-vertical-outline', href: `/coming-soon` },
  { name: 'Share & Earn', icon: 'gift-outline', href: `/coming-soon` },
  { name: 'More', icon: 'ellipsis-horizontal-outline', href: `/subs` },
];

const QuickActions = () => {
  return (
    <View className="mt-6 bg-background p-4 rounded-xl shadow-sm flex flex-col gap-y-2 items-start">
      <View className="flex-row items-center mb-4">
        <Text className="text-foreground font-bold text-lg" style={{fontFamily: 'Poppins'}}>Quick Actions</Text>
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
  action: { name: string; icon: any, href: any };
}

const ActionItem: React.FC<ActionItemProps> = ({ action }) => {
  const scale = useSharedValue(1);
  const colorScheme = useColorScheme()

  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = COLORS[theme]

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
        className="bg-[#F3EFFB] dark:bg-secondary p-1 rounded-xl mb-2 items-center justify-center aspect-square w-10 h-10"
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => router.push(action?.href)}
      >
        <Ionicons name={action.icon} size={20} color={colors.primary} />
      </TouchableOpacity>
      <Text className="text-foreground text-xs font-medium text-center">{action.name}</Text>
    </Animated.View>
  )
}

export default QuickActions