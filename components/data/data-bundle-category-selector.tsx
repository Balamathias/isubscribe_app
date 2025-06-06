import { Ionicons } from '@expo/vector-icons';
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
    { id: 'Best' as const, name: 'Best', icon: 'star-outline' },
    { id: 'Super' as const, name: 'Super', icon: 'shield-outline' },
    { id: 'Regular' as const, name: 'Regular', icon: 'time-outline' },
  ];

  return (
    <View className="w-full mt-4 bg-secondary rounded-xl">
      <View className="flex-row bg-input rounded-xl overflow-hidden">
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
              className={`flex-1 items-center py-3 rounded-xl ${isSelected ? 'bg-primary/10' : ''}`}
            >
              <Animated.View style={animatedStyle} className="flex-row items-center">
                <Ionicons
                  name={category.icon as any}
                  size={20}
                  className="mr-2"
                  color={isSelected ? '#7B2FF2' : '#666'}
                />
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