import { useThemedColors } from '@/hooks/useThemedColors';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface DataBundleCategorySelectorProps {
  activeCategory: 'Super' | 'Best' | 'Regular';
  onSelectCategory: (category: 'Super' | 'Best' | 'Regular') => void;
}

const DataBundleCategorySelector: React.FC<DataBundleCategorySelectorProps> = ({
  activeCategory, onSelectCategory
}) => {
  const categories = [
    { id: 'Best' as const, name: 'Best', emoji: '⭐' },
    { id: 'Super' as const, name: 'Super', emoji: '🚀' },
    { id: 'Regular' as const, name: 'Regular', emoji: '📱' },
  ];

  const colors = useThemedColors().colors

  return (
    <View className="w-full mt-6 bg-card rounded-xl">
      <View className="flex-row rounded-xl overflow-hidden">
        {categories.map((category) => {
          const isSelected = activeCategory === category.id;
          const scale = useSharedValue(1);

          React.useEffect(() => {
            scale.value = withTiming(isSelected ? 1.05 : 1, { duration: 200 });
          }, [isSelected]);

          const animatedStyle = useAnimatedStyle(() => ({
            transform: [{ scale: scale.value }],
          }));

          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onSelectCategory(category.id)}
              className={`flex-1 items-center py-4 rounded-xl ${isSelected ? 'bg-primary/10' : ''}`}
            >
              <Animated.View style={animatedStyle} className="flex-row items-center">
                <Text className="mr-2 text-xl">
                  {category.emoji}
                </Text>
                <Text
                  className={`font-semibold text-base
                    ${isSelected ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {category.name}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default DataBundleCategorySelector;
