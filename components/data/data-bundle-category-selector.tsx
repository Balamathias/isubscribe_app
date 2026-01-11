import { COLORS } from '@/constants/colors';
import React from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface DataBundleCategorySelectorProps {
  activeCategory: 'Super' | 'Best' | 'Regular';
  onSelectCategory: (category: 'Super' | 'Best' | 'Regular') => void;
}

const categories = [
  { id: 'Best' as const, name: 'Best', emoji: '⭐' },
  { id: 'Super' as const, name: 'Super', emoji: '🚀' },
  { id: 'Regular' as const, name: 'Regular', emoji: '📱' },
];

const CategoryTab: React.FC<{
  category: (typeof categories)[0];
  isSelected: boolean;
  onPress: () => void;
  isDark: boolean;
  colors: typeof COLORS.light;
}> = ({ category, isSelected, onPress, isDark, colors }) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(isSelected ? 1.02 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-1 py-3 rounded-xl items-center"
      style={{
        backgroundColor: isSelected
          ? colors.primary
          : 'transparent',
      }}
    >
      <Animated.View style={animatedStyle} className="flex-row items-center">
        <Text className="mr-1.5 text-base">{category.emoji}</Text>
        <Text
          className="font-semibold text-sm"
          style={{
            color: isSelected
              ? '#fff'
              : isDark
                ? 'rgba(255,255,255,0.5)'
                : 'rgba(0,0,0,0.4)',
          }}
        >
          {category.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const DataBundleCategorySelector: React.FC<DataBundleCategorySelectorProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  return (
    <View
      className="w-full mt-5 p-1.5 rounded-2xl"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f5f5f5',
      }}
    >
      <View className="flex-row">
        {categories.map((category) => (
          <CategoryTab
            key={category.id}
            category={category}
            isSelected={activeCategory === category.id}
            onPress={() => onSelectCategory(category.id)}
            isDark={isDark}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
};

export default DataBundleCategorySelector;
