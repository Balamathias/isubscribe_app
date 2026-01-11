import { COLORS } from '@/constants/colors';
import { EducationCard } from '@/services/api';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Clipboard, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import BottomSheet from '../ui/bottom-sheet';
import RatingModal from '../ratings/rating-modal';
import { ServiceType } from './service-type-tabs';

interface EducationStatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  status: 'success' | 'error' | 'pending';
  serviceType: ServiceType;
  serviceName?: string;
  quantity: number;
  amount?: number;
  pins?: string[];
  cards?: EducationCard[];
  dataBonus?: number;
  phone?: string;
  error?: string;
}

const EducationStatusModal: React.FC<EducationStatusModalProps> = ({
  isVisible,
  onClose,
  status,
  serviceType,
  serviceName,
  quantity,
  amount,
  pins,
  cards,
  dataBonus,
  phone,
  error,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (isVisible) {
      scale.value = withSequence(withSpring(1.2), withSpring(1));
      opacity.value = withTiming(1, { duration: 300 });
      setCopiedIndex(null);
    } else {
      scale.value = withSpring(0);
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getServiceTypeLabel = () => {
    switch (serviceType) {
      case 'jamb':
        return 'JAMB';
      case 'waec':
        return 'WAEC';
      case 'de':
        return 'Direct Entry';
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: '#10b981',
          title: 'Purchase Successful',
          description:
            serviceType === 'waec'
              ? 'Your WAEC result checker cards have been generated.'
              : `Your ${getServiceTypeLabel()} PIN${quantity > 1 ? 's have' : ' has'} been generated.`,
          gradient: ['#3b82f6', '#8b5cf6'] as const,
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: '#ef4444',
          title: 'Purchase Failed',
          description: error || 'Something went wrong. Please try again.',
          gradient: ['#ef4444', '#dc2626'] as const,
        };
      case 'pending':
        return {
          icon: 'time' as const,
          color: '#f59e0b',
          title: 'Processing',
          description: 'Your request is being processed. Please wait.',
          gradient: ['#f59e0b', '#d97706'] as const,
        };
    }
  };

  const config = getStatusConfig();

  const copyToClipboard = async (text: string, index?: number) => {
    try {
      await Clipboard.setString(text);
      Toast.show({ type: 'success', text1: 'Copied to clipboard!' });
      if (index !== undefined) {
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to copy' });
    }
  };

  const copyAllPins = async () => {
    if (pins && pins.length > 0) {
      const allPins = pins.join('\n');
      await copyToClipboard(allPins);
    }
  };

  const copyAllCards = async () => {
    if (cards && cards.length > 0) {
      const allCards = cards
        .map((card, i) => `Card ${i + 1}:\nSerial: ${card.Serial}\nPIN: ${card.Pin}`)
        .join('\n\n');
      await copyToClipboard(allCards);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleRateExperience = () => {
    setShowRatingModal(true);
  };

  const hasPins = pins && pins.length > 0;
  const hasCards = cards && cards.length > 0;

  return (
    <>
      <BottomSheet isVisible={isVisible} onClose={handleClose} title={config?.title}>
        <ScrollView className="max-h-[500px]" showsVerticalScrollIndicator={false}>
          <View className="flex items-center justify-center py-4">
            {/* Status Icon */}
            <Animated.View style={animatedStyle} className="mb-4">
              <View
                className={`w-20 h-20 rounded-full items-center justify-center ${
                  status === 'success'
                    ? 'bg-emerald-500/10'
                    : status === 'error'
                    ? 'bg-red-500/10'
                    : 'bg-amber-500/10'
                }`}
              >
                <Ionicons name={config?.icon} size={40} color={config?.color} />
              </View>
            </Animated.View>

            {/* Description */}
            <Text className="text-muted-foreground text-center mb-4 text-sm px-4">
              {config?.description}
            </Text>

            {/* Content Section */}
            <View className="w-full gap-y-3">
              {/* PIN Display (JAMB/DE) */}
              {status === 'success' && hasPins && (
                <View className="mx-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="key" size={16} color="#3b82f6" />
                      <Text className="text-blue-600 dark:text-blue-400 text-xs font-semibold ml-2">
                        Your {getServiceTypeLabel()} PIN{pins.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                    {pins.length > 1 && (
                      <TouchableOpacity
                        onPress={copyAllPins}
                        className="flex-row items-center bg-blue-500/20 px-2 py-1 rounded-lg"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="copy-outline" size={12} color="#3b82f6" />
                        <Text className="text-blue-600 dark:text-blue-400 text-xs ml-1">
                          Copy All
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="gap-y-2">
                    {pins.map((pin, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => copyToClipboard(pin, index)}
                        activeOpacity={0.7}
                        className={`w-full flex-row items-center justify-between p-3 rounded-xl ${
                          copiedIndex === index ? 'bg-emerald-500/10' : 'bg-background'
                        }`}
                      >
                        <View className="flex-1">
                          {pins.length > 1 && (
                            <Text className="text-muted-foreground text-xs mb-1">
                              PIN {index + 1}
                            </Text>
                          )}
                          <Text className="font-mono font-bold text-base text-foreground tracking-wider">
                            {pin}
                          </Text>
                        </View>
                        <View
                          className={`w-8 h-8 rounded-lg items-center justify-center ml-2 ${
                            copiedIndex === index ? 'bg-emerald-500/20' : 'bg-secondary'
                          }`}
                        >
                          <Ionicons
                            name={copiedIndex === index ? 'checkmark' : 'copy-outline'}
                            size={16}
                            color={copiedIndex === index ? '#10B981' : colors.mutedForeground}
                          />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="mt-2 text-xs text-center text-muted-foreground">
                    Tap to copy PIN to clipboard
                  </Text>
                </View>
              )}

              {/* Card Display (WAEC) */}
              {status === 'success' && hasCards && (
                <View className="mx-4 p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                  <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center">
                      <Ionicons name="card" size={16} color="#8b5cf6" />
                      <Text className="text-purple-600 dark:text-purple-400 text-xs font-semibold ml-2">
                        Your WAEC Card{cards.length > 1 ? 's' : ''}
                      </Text>
                    </View>
                    {cards.length > 1 && (
                      <TouchableOpacity
                        onPress={copyAllCards}
                        className="flex-row items-center bg-purple-500/20 px-2 py-1 rounded-lg"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="copy-outline" size={12} color="#8b5cf6" />
                        <Text className="text-purple-600 dark:text-purple-400 text-xs ml-1">
                          Copy All
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <View className="gap-y-3">
                    {cards.map((card, index) => (
                      <View
                        key={index}
                        className="p-3 rounded-xl bg-background border border-border/20"
                      >
                        {cards.length > 1 && (
                          <Text className="text-muted-foreground text-xs mb-2 font-semibold">
                            Card {index + 1}
                          </Text>
                        )}

                        {/* Serial */}
                        <TouchableOpacity
                          onPress={() => copyToClipboard(card.Serial, index * 2)}
                          activeOpacity={0.7}
                          className={`flex-row items-center justify-between p-2 rounded-lg mb-2 ${
                            copiedIndex === index * 2 ? 'bg-emerald-500/10' : 'bg-secondary/50'
                          }`}
                        >
                          <View className="flex-1">
                            <Text className="text-muted-foreground text-xs">Serial Number</Text>
                            <Text className="font-mono font-semibold text-sm text-foreground">
                              {card.Serial}
                            </Text>
                          </View>
                          <Ionicons
                            name={copiedIndex === index * 2 ? 'checkmark' : 'copy-outline'}
                            size={14}
                            color={copiedIndex === index * 2 ? '#10B981' : colors.mutedForeground}
                          />
                        </TouchableOpacity>

                        {/* PIN */}
                        <TouchableOpacity
                          onPress={() => copyToClipboard(card.Pin, index * 2 + 1)}
                          activeOpacity={0.7}
                          className={`flex-row items-center justify-between p-2 rounded-lg ${
                            copiedIndex === index * 2 + 1 ? 'bg-emerald-500/10' : 'bg-secondary/50'
                          }`}
                        >
                          <View className="flex-1">
                            <Text className="text-muted-foreground text-xs">PIN</Text>
                            <Text className="font-mono font-semibold text-sm text-foreground">
                              {card.Pin}
                            </Text>
                          </View>
                          <Ionicons
                            name={copiedIndex === index * 2 + 1 ? 'checkmark' : 'copy-outline'}
                            size={14}
                            color={copiedIndex === index * 2 + 1 ? '#10B981' : colors.mutedForeground}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <Text className="mt-2 text-xs text-center text-muted-foreground">
                    Tap to copy Serial or PIN to clipboard
                  </Text>
                </View>
              )}

              {/* No PIN/Card notice */}
              {status === 'success' && !hasPins && !hasCards && (
                <View className="mx-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                      <Ionicons name="chatbubble-ellipses" size={20} color="#3b82f6" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        Details sent via SMS
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">
                        Check your phone for your {getServiceTypeLabel()} details
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Details Section */}
              <View className="px-4 gap-y-2">
                {/* Service Type */}
                {serviceName && status === 'success' && (
                  <View className="bg-secondary/30 rounded-xl p-3">
                    <View className="flex-row items-center">
                      <Ionicons name="school" size={16} color="#3b82f6" />
                      <Text className="text-muted-foreground text-sm ml-2 flex-1">Service</Text>
                      <Text className="text-foreground font-semibold text-sm" numberOfLines={1}>
                        {serviceName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Quantity */}
                {quantity > 0 && status === 'success' && (
                  <View className="bg-secondary/30 rounded-xl p-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="layers" size={16} color={colors.mutedForeground} />
                        <Text className="text-muted-foreground text-sm ml-2">Quantity</Text>
                      </View>
                      <Text className="text-foreground font-semibold text-sm">
                        {quantity} {quantity === 1 ? 'PIN' : 'PINs'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Amount */}
                {amount !== undefined && (
                  <View className="bg-secondary/30 rounded-xl p-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-muted-foreground text-sm">Amount Paid</Text>
                      <Text className="text-foreground font-semibold text-base">
                        {formatNigerianNaira(amount)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Phone */}
                {phone && status === 'success' && (
                  <View className="bg-secondary/30 rounded-xl p-3">
                    <View className="flex-row items-center">
                      <Ionicons name="call" size={16} color={colors.mutedForeground} />
                      <Text className="text-muted-foreground text-sm ml-2 flex-1">Phone</Text>
                      <Text className="text-foreground font-mono font-semibold text-sm">
                        {phone}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Data Bonus */}
                {dataBonus !== undefined && dataBonus > 0 && status === 'success' && (
                  <View className="bg-secondary/30 rounded-xl p-3">
                    <View className="flex-row items-center">
                      <Ionicons name="gift" size={16} color="#10B981" />
                      <Text className="text-muted-foreground text-sm ml-2 flex-1">
                        Data Bonus Earned
                      </Text>
                      <Text className="text-emerald-500 font-semibold text-sm">
                        +{formatNigerianNaira(dataBonus)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View className="px-4 pt-4 gap-y-3">
                {status === 'success' ? (
                  <>
                    <TouchableOpacity
                      className="w-full rounded-xl py-4 overflow-hidden"
                      onPress={handleClose}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={config?.gradient || ['#3b82f6', '#8b5cf6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="absolute inset-0"
                      />
                      <Text className="text-white text-center font-bold text-lg">Done</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="w-full rounded-xl py-4 border border-border/40 bg-transparent"
                      onPress={handleRateExperience}
                      activeOpacity={0.7}
                    >
                      <View className="flex-row items-center justify-center">
                        <Ionicons name="star" size={20} color="#f2ae2f" />
                        <Text className="text-primary text-center font-bold text-lg ml-2">
                          Rate Experience
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    className="w-full rounded-xl py-4 overflow-hidden"
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={config?.gradient || ['#ef4444', '#dc2626']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      className="absolute inset-0"
                    />
                    <Text className="text-white text-center font-bold text-lg">
                      {status === 'pending' ? 'Close' : 'Try Again'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
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
        transactionTitle="Education Purchase"
      />
    </>
  );
};

export default EducationStatusModal;
