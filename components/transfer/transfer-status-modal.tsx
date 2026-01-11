import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
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

interface TransferStatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  status: 'success' | 'error' | 'pending';
  amount?: number;
  balanceAfter?: number;
  transactionId?: string;
  recipientName?: string;
  error?: string;
}

const TransferStatusModal: React.FC<TransferStatusModalProps> = ({
  isVisible,
  onClose,
  status,
  amount,
  balanceAfter,
  transactionId,
  recipientName,
  error,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isVisible) {
      scale.value = withSequence(withSpring(1.2), withSpring(1));
      opacity.value = withTiming(1, { duration: 300 });
      setCopied(false);
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
          color: '#10b981',
          title: 'Transfer Successful',
          description: recipientName
            ? `Your transfer to ${recipientName} was successful.`
            : 'Your money has been sent successfully.',
          gradient: ['#10b981', '#059669'] as const,
        };
      case 'error':
        return {
          icon: 'close-circle' as const,
          color: '#ef4444',
          title: 'Transfer Failed',
          description: error || 'Something went wrong. Please try again.',
          gradient: ['#ef4444', '#dc2626'] as const,
        };
      case 'pending':
        return {
          icon: 'time' as const,
          color: '#f59e0b',
          title: 'Processing',
          description: 'Your transfer is being processed. Please wait.',
          gradient: ['#f59e0b', '#d97706'] as const,
        };
    }
  };

  const config = getStatusConfig();

  const copyTransactionId = async () => {
    if (transactionId) {
      try {
        await Clipboard.setString(transactionId);
        Toast.show({ type: 'success', text1: 'Transaction ID copied!' });
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (e) {
        Toast.show({ type: 'error', text1: 'Failed to copy' });
      }
    }
  };

  const handleViewReceipt = () => {
    if (transactionId) {
      onClose();
      router.push(`/transactions/${transactionId}`);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleRateExperience = () => {
    setShowRatingModal(true);
  };

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
              {/* Transaction ID */}
              {status === 'success' && transactionId && (
                <TouchableOpacity
                  onPress={copyTransactionId}
                  activeOpacity={0.7}
                  className="mx-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-muted-foreground text-xs mb-1">Transaction ID</Text>
                      <Text className="font-mono font-semibold text-sm text-foreground">
                        {transactionId}
                      </Text>
                    </View>
                    <View
                      className={`w-8 h-8 rounded-lg items-center justify-center ${
                        copied ? 'bg-emerald-500/20' : 'bg-secondary'
                      }`}
                    >
                      <Ionicons
                        name={copied ? 'checkmark' : 'copy-outline'}
                        size={16}
                        color={copied ? '#10B981' : colors.mutedForeground}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Details Section */}
              <View className="px-4 gap-y-2">
                {/* Recipient */}
                {recipientName && status === 'success' && (
                  <View className="bg-secondary/30 rounded-xl p-3">
                    <View className="flex-row items-center">
                      <Ionicons name="person" size={16} color={colors.mutedForeground} />
                      <Text className="text-muted-foreground text-sm ml-2 flex-1">Recipient</Text>
                      <Text className="text-foreground font-semibold text-sm" numberOfLines={1}>
                        {recipientName}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Amount */}
                {amount !== undefined && (
                  <View className="bg-secondary/30 rounded-xl p-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-muted-foreground text-sm">Amount Sent</Text>
                      <Text className="text-foreground font-semibold text-base">
                        {formatNigerianNaira(amount)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Fee */}
                {status === 'success' && (
                  <View className="bg-secondary/30 rounded-xl p-3">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-muted-foreground text-sm">Transaction Fee</Text>
                      <Text className="text-emerald-500 font-semibold text-sm">Free</Text>
                    </View>
                  </View>
                )}

                {/* New Balance */}
                {balanceAfter !== undefined && status === 'success' && (
                  <View className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Ionicons name="wallet" size={16} color="#3b82f6" />
                        <Text className="text-muted-foreground text-sm ml-2">New Balance</Text>
                      </View>
                      <Text className="text-blue-500 font-bold text-base">
                        {formatNigerianNaira(balanceAfter)}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              <View className="px-4 pt-4 gap-y-3">
                {status === 'success' ? (
                  <>
                    {transactionId && (
                      <TouchableOpacity
                        className="w-full rounded-xl py-4 overflow-hidden"
                        onPress={handleViewReceipt}
                        activeOpacity={0.7}
                      >
                        <LinearGradient
                          colors={config?.gradient || ['#10b981', '#059669']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="absolute inset-0"
                        />
                        <View className="flex-row items-center justify-center">
                          <Ionicons name="receipt-outline" size={20} color="white" />
                          <Text className="text-white text-center font-bold text-lg ml-2">
                            View Receipt
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

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

                    <TouchableOpacity
                      className="w-full rounded-xl py-4 bg-secondary/50"
                      onPress={handleClose}
                      activeOpacity={0.7}
                    >
                      <Text className="text-foreground text-center font-bold text-lg">Done</Text>
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
        transactionTitle="Money Transfer"
      />
    </>
  );
};

export default TransferStatusModal;
