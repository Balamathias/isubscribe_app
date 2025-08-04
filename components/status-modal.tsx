import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import BottomSheet from './ui/bottom-sheet';

import { Clipboard } from 'react-native';
import Toast from 'react-native-toast-message';
import RatingModal from './ratings/rating-modal';

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
  data_bonus?: string,
  transaction?: any;
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
  quantity,
  transaction
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const UTMEPins: string[] = transaction?.pins || [];
  const WAECCards: { Serial: string, Pin: string }[] = transaction?.cards || [];

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

  const handleClose = () => {
    onClose();
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      handleClose();
    }
  };

  const handleRateExperience = () => {
    setShowRatingModal(true);
  };

  return (
    <>
      <BottomSheet isVisible={isVisible} onClose={handleClose}>
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

            {transaction?.token && (
              <View className="rounded-xl w-full">
                <View className="flex-row justify-between items-center">
                  <Text className="text-muted-foreground">Transaction Token</Text>
                  <TouchableOpacity
                    onPress={() => {
                      Clipboard.setString(transaction.token);
                      Toast.show({ type: 'success', text1: 'Token copied to clipboard!' });
                    }}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-2"
                  >
                    <Text className="text-foreground font-bold text-lg">{transaction.formatted_token}</Text>
                    <Ionicons name="copy-outline" size={16} color={colors.foreground} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {status === 'success' && (
                <>
                {UTMEPins.length > 0 && (
                  <View className="rounded-xl w-full">
                  <Text className="text-muted-foreground mb-2">UTME Pins</Text>
                  {UTMEPins.map((pin, index) => (
                    <View key={index} className="flex-row justify-between items-center mb-2">
                    <Text className="text-foreground font-semibold">{`Pin ${index + 1}`}</Text>
                    <TouchableOpacity
                      onPress={() => {
                      Clipboard.setString(pin);
                      Toast.show({ type: 'success', text1: 'Pin copied to clipboard!' });
                      }}
                      activeOpacity={0.7}
                    >
                      <Text className="text-primary font-semibold">{pin}</Text>
                    </TouchableOpacity>
                    </View>
                  ))}
                  </View>
                )}

                {WAECCards.length > 0 && (
                  <View className="rounded-xl w-full">
                  <Text className="text-muted-foreground mb-2">WAEC Cards</Text>
                  {WAECCards.map((card, index) => (
                    <View key={index} className="mb-3">
                    <Text className="text-foreground font-semibold mb-2">{`Card ${index + 1}`}</Text>
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-muted-foreground">Serial</Text>
                      <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(card.Serial);
                        Toast.show({ type: 'success', text1: 'Serial copied to clipboard!' });
                      }}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-1"
                      >
                      <Text className="text-primary font-semibold">{card.Serial}</Text>
                      <Ionicons name="copy-outline" size={14} color="#7B2FF2" />
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-muted-foreground">Pin</Text>
                      <TouchableOpacity
                      onPress={() => {
                        Clipboard.setString(card.Pin);
                        Toast.show({ type: 'success', text1: 'Pin copied to clipboard!' });
                      }}
                      activeOpacity={0.7}
                      className="flex-row items-center gap-1"
                      >
                      <Text className="text-primary font-semibold">{card.Pin}</Text>
                      <Ionicons name="copy-outline" size={14} color="#7B2FF2" />
                      </TouchableOpacity>
                    </View>
                    </View>
                  ))}
                  </View>
                )}
                </>
            )}

          </View>

          {/* Action Buttons - Show both for successful transactions */}
          {status === 'success' ? (
            <View className="w-full flex gap-y-3">
              <TouchableOpacity
                className="w-full rounded-xl py-4 overflow-hidden"
                onPress={handleAction}
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

              <TouchableOpacity
                className="w-full rounded-xl py-4 border border-primary bg-transparent"
                onPress={handleRateExperience}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-center">
                  <Ionicons name="star-outline" size={20} color="#7B2FF2" />
                  <Text className="text-primary text-center font-bold text-lg ml-2">
                    Rate Experience
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="w-full rounded-xl py-4 overflow-hidden"
              onPress={handleAction}
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
          )}
        </View>
      </BottomSheet>

      <RatingModal
        isVisible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false)
          handleClose();
        }}
        transactionTitle={transaction?.title || 'Transaction'}
      />
    </>
  );
};

export default StatusModal;
