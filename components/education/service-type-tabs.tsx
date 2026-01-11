import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export type ServiceType = 'jamb' | 'waec' | 'de';

interface ServiceTypeTabsProps {
  value: ServiceType;
  onChange: (type: ServiceType) => void;
  disabled?: boolean;
}

interface TabConfig {
  id: ServiceType;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const TABS: TabConfig[] = [
  {
    id: 'jamb',
    label: 'JAMB',
    description: 'UTME Registration',
    icon: 'school',
  },
  {
    id: 'waec',
    label: 'WAEC',
    description: 'Result Checker',
    icon: 'document-text',
  },
  {
    id: 'de',
    label: 'Direct Entry',
    description: 'DE Registration',
    icon: 'book',
  },
];

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ServiceTypeTab: React.FC<{
  tab: TabConfig;
  isSelected: boolean;
  onPress: () => void;
  disabled?: boolean;
  colors: typeof COLORS.light;
}> = ({ tab, isSelected, onPress, disabled, colors }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedTouchable
      style={animatedStyle}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.7}
      className={`flex-1 p-3 rounded-xl items-center justify-center ${
        isSelected
          ? 'bg-blue-500'
          : 'bg-secondary/50 border border-border/40'
      } ${disabled ? 'opacity-50' : ''}`}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${
          isSelected ? 'bg-white/20' : 'bg-background'
        }`}
      >
        <Ionicons
          name={tab.icon}
          size={20}
          color={isSelected ? 'white' : colors.primary}
        />
      </View>
      <Text
        className={`font-semibold text-sm ${
          isSelected ? 'text-white' : 'text-foreground'
        }`}
      >
        {tab.label}
      </Text>
      <Text
        className={`text-xs mt-0.5 text-center ${
          isSelected ? 'text-white/80' : 'text-muted-foreground'
        }`}
        numberOfLines={1}
      >
        {tab.description}
      </Text>
    </AnimatedTouchable>
  );
};

const ServiceTypeTabs: React.FC<ServiceTypeTabsProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-row gap-2"
    >
      {TABS.map((tab) => (
        <ServiceTypeTab
          key={tab.id}
          tab={tab}
          isSelected={value === tab.id}
          onPress={() => onChange(tab.id)}
          disabled={disabled}
          colors={colors}
        />
      ))}
    </Animated.View>
  );
};

export default ServiceTypeTabs;
