import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { memo, useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Action {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  color: string;
}

const actions: Action[] = [
  { name: 'Data', icon: 'cellular', href: `/services/data`, color: '#10b981' },
  { name: 'Airtime', icon: 'call', href: `/services/airtime`, color: '#3b82f6' },
  { name: 'Electricity', icon: 'bulb', href: `/services/electricity`, color: '#f59e0b' },
  { name: 'TV Cable', icon: 'tv', href: `/services/tv-cable`, color: '#8b5cf6' },
  { name: 'Education', icon: 'school', href: `/services/education`, color: '#ec4899' },
  { name: 'Transfer', icon: 'swap-horizontal', href: `/coming-soon`, color: '#06b6d4' },
  { name: 'Referral', icon: 'gift', href: `/coming-soon`, color: '#6366f1' },
  { name: 'More', icon: 'grid', href: `/subs`, color: '#64748b' },
];

const QuickActions = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    actions.forEach((a) => {
      try {
        // @ts-ignore types allow only string; our hrefs are strings
        router.prefetch?.(a.href);
      } catch { }
    });
  }, []);

  return (
    <View
      className="mt-5 p-4 rounded-3xl"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-5">
        <View className="flex-row items-center">
          <Text
            className="font-bold text-base"
            style={{ color: isDark ? '#fff' : '#111' }}
          >
            Quick Actions
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/subs' as any)}
        >
          <Text
            className="text-xs font-medium"
            style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
          >
            See all
          </Text>
        </TouchableOpacity>
      </View>

      {/* Actions Grid */}
      <View className="flex-row flex-wrap">
        {actions.map((action) => (
          <MemoActionItem key={action.href + action.name} action={action} />
        ))}
      </View>
    </View>
  );
};

interface ActionItemProps {
  action: Action;
}

const ActionItem: React.FC<ActionItemProps> = ({ action }) => {
  const scale = useSharedValue(1);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.92, { damping: 20, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 250 });
  }, [scale]);

  const go = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    router.push(action.href as any);
  }, [action.href]);

  return (
    <Animated.View style={animatedStyle} className="w-1/4 items-center mb-4">
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={go}
        className="items-center"
      >
        {/* Icon Container */}
        <View
          className="w-12 h-12 rounded-2xl items-center justify-center mb-2"
          style={{
            backgroundColor: action.color + (isDark ? '20' : '15'),
          }}
        >
          <Ionicons name={action.icon} size={22} color={action.color} />
        </View>

        {/* Label */}
        <Text
          className="text-[11px] font-medium text-center"
          style={{
            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
          }}
          numberOfLines={1}
        >
          {action.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const MemoActionItem = memo(ActionItem);

export default QuickActions;