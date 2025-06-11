import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import BottomSheet from './ui/bottom-sheet';
import { formatNigerianNaira } from '@/utils/format-naira';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withSequence,
  withDelay,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

interface StatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  status: 'success' | 'error' | 'pending';
  amount?: number;
  size?: string;
  description?: string;
  onAction?: () => void;
  actionText?: string;
  quantity?: string,
  data_bonus?: string
}

const StatusModal: React.FC<StatusModalProps> = ({
  isVisible,
  onClose,
  status,
  amount,
  size,
  description,
  onAction,
  actionText = 'Done',
  data_bonus,
  quantity
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: '#11c028',
          title: 'Transaction Successful',
          gradient: ['#a13ae1', '#740faa']
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: '#ef4444',
          title: 'Transaction Failed',
          gradient: ['#ef4444', '#dc2626']
        };
      case 'pending':
        return {
          icon: 'time',
          color: '#f59e0b',
          title: 'Transaction Pending',
          gradient: ['#f59e0b', '#d97706']
        };
    }
  };

  const config = getStatusConfig();

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose}>
      <View className="flex items-center justify-center py-8">
        <Animated.View style={animatedStyle} className="mb-6">
          <View className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center">
            <Ionicons name={config?.icon as any} size={48} color={config?.color} />
          </View>
        </Animated.View>

        <Text className="text-foreground text-2xl font-bold mb-2">{config?.title}</Text>
        
        {description && (
          <Text className="text-muted-foreground text-center mb-6">{description}</Text>
        )}

        <View className="flex flex-col gap-6 w-full p-4">
          {(amount || size) && (
            <View className="rounded-xl w-full">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">Amount</Text>
                <Text className="text-foreground font-semibold">
                  {amount ? formatNigerianNaira(amount) : size}
                </Text>
              </View>
            </View>
          )}

          {quantity && (
            <View className="rounded-xl w-full">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">Quantity</Text>
                <Text className="text-foreground font-semibold">{quantity}</Text>
              </View>
            </View>
          )}

          {data_bonus && (
            <View className="rounded-xl w-full">
              <View className="flex-row justify-between items-center">
                <Text className="text-muted-foreground">Data Bonus</Text>
                <Text className="text-primary font-semibold">+{data_bonus}</Text>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="w-full rounded-xl py-4 overflow-hidden"
          onPress={onAction || onClose}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={config?.gradient as any || [COLORS.light.primary, COLORS.light.primary] as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute inset-0"
          />
          <Text className="text-white text-center font-bold text-lg">{actionText}</Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
};

export default StatusModal;
