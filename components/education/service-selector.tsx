import { COLORS } from '@/constants/colors';
import { EducationService } from '@/services/api';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface ServiceSelectorProps {
  services: EducationService[];
  selectedService: EducationService | null;
  onSelect: (service: EducationService) => void;
  isLoading?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ServiceCard: React.FC<{
  service: EducationService;
  isSelected: boolean;
  onPress: () => void;
  colors: typeof COLORS.light;
  index: number;
}> = ({ service, isSelected, onPress, colors, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(300)}
    >
      <AnimatedTouchable
        style={animatedStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        className={`p-4 rounded-xl border ${
          isSelected
            ? 'bg-blue-500/10 border-blue-500'
            : 'bg-secondary/30 border-border/40'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text
              className={`font-semibold text-sm ${
                isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'
              }`}
              numberOfLines={2}
            >
              {service.name}
            </Text>
            <Text className="text-muted-foreground text-xs mt-1">
              {formatNigerianNaira(service.price)} per PIN
            </Text>
          </View>
          <View
            className={`w-6 h-6 rounded-full items-center justify-center ${
              isSelected ? 'bg-blue-500' : 'bg-secondary border border-border'
            }`}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const LoadingSkeleton: React.FC = () => {
  return (
    <View className="gap-y-3">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="p-4 rounded-xl bg-secondary/30 border border-border/20"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-3">
              <View className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
              <View className="h-3 w-1/2 bg-secondary rounded animate-pulse mt-2" />
            </View>
            <View className="w-6 h-6 rounded-full bg-secondary animate-pulse" />
          </View>
        </View>
      ))}
    </View>
  );
};

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedService,
  onSelect,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  if (isLoading) {
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color={colors.primary} />
        <Text className="text-center text-muted-foreground text-sm mt-2">
          Loading services...
        </Text>
      </View>
    );
  }

  if (!services || services.length === 0) {
    return (
      <View className="py-6 items-center">
        <Ionicons name="alert-circle-outline" size={32} color={colors.mutedForeground} />
        <Text className="text-muted-foreground text-sm mt-2 text-center">
          No services available for this category
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-y-3">
      {services.map((service, index) => (
        <ServiceCard
          key={service.id || service.variation_code}
          service={service}
          isSelected={selectedService?.id === service.id || selectedService?.variation_code === service.variation_code}
          onPress={() => onSelect(service)}
          colors={colors}
          index={index}
        />
      ))}
    </View>
  );
};

export default ServiceSelector;
