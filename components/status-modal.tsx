import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import RatingModal from './ratings/rating-modal';
import BottomSheet from './ui/bottom-sheet';

interface StatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  status: 'success' | 'error' | 'pending';
  amount?: number;
  size?: string;
  description?: string;
  onAction?: () => void;
  actionText?: string;
  quantity?: string;
  data_bonus?: string;
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
  transaction,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const UTMEPins: string[] = transaction?.pins || [];
  const WAECCards: { Serial: string; Pin: string }[] = transaction?.cards || [];

  React.useEffect(() => {
    if (isVisible) {
      scale.value = withSequence(withSpring(1.2, { damping: 10 }), withSpring(1, { damping: 12 }));
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: '#22c55e',
          bgColor: 'rgba(34,197,94,0.1)',
          title: 'Transaction Successful',
          gradient: ['#22c55e', '#16a34a'] as const,
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: '#ef4444',
          bgColor: 'rgba(239,68,68,0.1)',
          title: 'Transaction Failed',
          gradient: ['#ef4444', '#dc2626'] as const,
        };
      case 'pending':
        return {
          icon: 'time' as const,
          color: '#f59e0b',
          bgColor: 'rgba(245,158,11,0.1)',
          title: 'Transaction Pending',
          gradient: ['#f59e0b', '#d97706'] as const,
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

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({ type: 'success', text1: `${label} copied!` });
  };

  return (
    <>
      <BottomSheet isVisible={isVisible} onClose={handleClose} title="">
        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[500px]">
          <View className="items-center pb-4">
            {/* Status Icon */}
            <Animated.View style={animatedStyle} className="mb-4">
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: config?.bgColor }}
              >
                <Ionicons name={config?.icon} size={44} color={config?.color} />
              </View>
            </Animated.View>

            {/* Title */}
            <Text className="text-xl font-bold mb-1" style={{ color: isDark ? '#fff' : '#111' }}>
              {config?.title}
            </Text>

            {/* Description */}
            {description && (
              <Text
                className="text-center text-sm mb-4 px-4"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
              >
                {description}
              </Text>
            )}

            {/* Details Card */}
            {(amount || size || quantity || data_bonus || transaction?.token) && (
              <View
                className="w-full rounded-2xl p-4 mb-4"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }}
              >
                {/* Amount */}
                {(amount || size) && (
                  <View className="flex-row justify-between items-center py-2.5">
                    <Text
                      className="text-sm"
                      style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                    >
                      Amount
                    </Text>
                    <Text className="font-bold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                      {amount ? formatNigerianNaira(amount) : size}
                    </Text>
                  </View>
                )}

                {/* Quantity */}
                {quantity && (
                  <>
                    <View
                      className="h-px"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                    />
                    <View className="flex-row justify-between items-center py-2.5">
                      <Text
                        className="text-sm"
                        style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                      >
                        Quantity
                      </Text>
                      <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                        {quantity}
                      </Text>
                    </View>
                  </>
                )}

                {/* Data Bonus */}
                {data_bonus && (
                  <>
                    <View
                      className="h-px"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                    />
                    <View className="flex-row justify-between items-center py-2.5">
                      <Text
                        className="text-sm"
                        style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                      >
                        Data Bonus
                      </Text>
                      <Text className="font-semibold text-sm" style={{ color: '#22c55e' }}>
                        +{data_bonus}
                      </Text>
                    </View>
                  </>
                )}

                {/* Token */}
                {transaction?.token && (
                  <>
                    <View
                      className="h-px"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                    />
                    <View className="py-2.5">
                      <View className="flex-row justify-between items-center mb-2">
                        <Text
                          className="text-sm"
                          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                        >
                          Token
                        </Text>
                        <TouchableOpacity
                          onPress={() => copyToClipboard(transaction.token, 'Token')}
                          activeOpacity={0.7}
                          className="flex-row items-center px-2 py-1 rounded-lg"
                          style={{ backgroundColor: colors.primary + '15' }}
                        >
                          <Ionicons name="copy" size={12} color={colors.primary} />
                          <Text className="text-xs font-medium ml-1" style={{ color: colors.primary }}>
                            Copy
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text
                        className="font-mono font-bold text-base"
                        style={{ color: isDark ? '#fff' : '#111' }}
                        selectable
                      >
                        {transaction.formatted_token || transaction.token}
                      </Text>
                    </View>
                  </>
                )}
              </View>
            )}

            {/* UTME Pins */}
            {status === 'success' && UTMEPins.length > 0 && (
              <View
                className="w-full rounded-2xl p-4 mb-4"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons name="key" size={16} color={colors.primary} />
                  <Text className="font-semibold text-sm ml-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    UTME Pins
                  </Text>
                </View>
                {UTMEPins.map((pin, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => copyToClipboard(pin, `Pin ${index + 1}`)}
                    activeOpacity={0.85}
                    className="flex-row justify-between items-center py-2.5 px-3 rounded-xl mb-2"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  >
                    <Text className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
                      Pin {index + 1}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="font-bold text-sm mr-2" style={{ color: colors.primary }}>
                        {pin}
                      </Text>
                      <Ionicons name="copy-outline" size={14} color={colors.primary} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* WAEC Cards */}
            {status === 'success' && WAECCards.length > 0 && (
              <View
                className="w-full rounded-2xl p-4 mb-4"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                }}
              >
                <View className="flex-row items-center mb-3">
                  <Ionicons name="card" size={16} color={colors.primary} />
                  <Text className="font-semibold text-sm ml-2" style={{ color: isDark ? '#fff' : '#111' }}>
                    WAEC Cards
                  </Text>
                </View>
                {WAECCards.map((card, index) => (
                  <View
                    key={index}
                    className="rounded-xl p-3 mb-2"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  >
                    <Text className="font-semibold text-xs mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                      Card {index + 1}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(card.Serial, 'Serial')}
                      activeOpacity={0.85}
                      className="flex-row justify-between items-center py-1.5"
                    >
                      <Text className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
                        Serial
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="font-bold text-xs mr-1.5" style={{ color: colors.primary }}>
                          {card.Serial}
                        </Text>
                        <Ionicons name="copy-outline" size={12} color={colors.primary} />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(card.Pin, 'Pin')}
                      activeOpacity={0.85}
                      className="flex-row justify-between items-center py-1.5"
                    >
                      <Text className="text-xs" style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}>
                        Pin
                      </Text>
                      <View className="flex-row items-center">
                        <Text className="font-bold text-xs mr-1.5" style={{ color: colors.primary }}>
                          {card.Pin}
                        </Text>
                        <Ionicons name="copy-outline" size={12} color={colors.primary} />
                      </View>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View className="w-full gap-y-3">
              {status === 'success' ? (
                <>
                  <TouchableOpacity
                    className="rounded-2xl overflow-hidden"
                    onPress={handleAction}
                    activeOpacity={0.9}
                  >
                    <LinearGradient
                      colors={config?.gradient || [colors.primary, colors.primary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Text className="text-white font-bold text-base">{actionText}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="rounded-2xl py-4 flex-row items-center justify-center"
                    onPress={handleRateExperience}
                    activeOpacity={0.85}
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                  >
                    <Ionicons name="star" size={18} color="#f59e0b" />
                    <Text className="font-semibold text-sm ml-2" style={{ color: isDark ? '#fff' : '#111' }}>
                      Rate Experience
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  className="rounded-2xl overflow-hidden"
                  onPress={handleAction}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={config?.gradient || [colors.primary, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Text className="text-white font-bold text-base">{actionText}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </BottomSheet>

      <RatingModal
        isVisible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          handleClose();
        }}
        transactionTitle={transaction?.title || 'Transaction'}
      />
    </>
  );
};

export default StatusModal;
