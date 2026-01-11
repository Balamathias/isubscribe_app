import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Clipboard, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import BottomSheet from '../ui/bottom-sheet';
import RatingModal from '../ratings/rating-modal';

interface ElectricityStatusModalProps {
  isVisible: boolean;
  onClose: () => void;
  status: 'success' | 'error' | 'pending';
  amount?: number;
  token?: string;
  formattedToken?: string;
  dataBonus?: string;
  customerName?: string;
  meterNumber?: string;
  providerName?: string;
  error?: string;
}

const ElectricityStatusModal: React.FC<ElectricityStatusModalProps> = ({
  isVisible,
  onClose,
  status,
  amount,
  token,
  formattedToken,
  dataBonus,
  customerName,
  meterNumber,
  providerName,
  error,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  // Check if token is valid (at least 10 digits)
  const hasValidToken = useMemo(() => {
    if (!token) return false;
    const clean = token.replace(/\D/g, '');
    return clean.length >= 10;
  }, [token]);

  // Format token for display
  const displayToken = useMemo(() => {
    if (formattedToken && formattedToken !== 'N/A') return formattedToken;
    if (!token) return null;

    const clean = token.replace(/\D/g, '');
    if (clean.length >= 20) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}`;
    } else if (clean.length >= 16) {
      return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12)}`;
    } else if (clean.length >= 10) {
      return clean;
    }
    return null;
  }, [token, formattedToken]);

  React.useEffect(() => {
    if (isVisible) {
      scale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );
      opacity.value = withTiming(1, { duration: 300 });
      setTokenCopied(false);
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
          title: 'Payment Successful',
          description: hasValidToken
            ? 'Your electricity token has been generated successfully.'
            : 'Payment successful! Your token will be sent to your phone via SMS.',
          gradient: ['#f59e0b', '#ef4444'] as const,
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: '#ef4444',
          title: 'Payment Failed',
          description: error || 'Something went wrong. Please try again.',
          gradient: ['#ef4444', '#dc2626'] as const,
        };
      case 'pending':
        return {
          icon: 'time',
          color: '#f59e0b',
          title: 'Payment Processing',
          description: 'Your token will be sent to your phone once confirmed.',
          gradient: ['#f59e0b', '#d97706'] as const,
        };
    }
  };

  const config = getStatusConfig();

  const handleClose = () => {
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setString(text);
      Toast.show({ type: 'success', text1: 'Token copied to clipboard!' });
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Failed to copy' });
    }
  };

  const handleRateExperience = () => {
    setShowRatingModal(true);
  };

  return (
    <>
      <BottomSheet isVisible={isVisible} onClose={handleClose} title={config?.title}>
        <View className="flex items-center justify-center py-4">
          {/* Status Icon */}
          <Animated.View style={animatedStyle} className="mb-4">
            <View className={`w-20 h-20 rounded-full items-center justify-center ${
              status === 'success' ? 'bg-amber-500/10' :
              status === 'error' ? 'bg-red-500/10' :
              'bg-amber-500/10'
            }`}>
              <Ionicons name={config?.icon as any} size={40} color={config?.color} />
            </View>
          </Animated.View>

          {/* Description */}
          <Text className="text-muted-foreground text-center mb-4 text-sm px-4">
            {config?.description}
          </Text>

          {/* Content Section */}
          <View className="w-full space-y-3">
            {/* Token Display (Success Only with valid token) */}
            {status === 'success' && hasValidToken && displayToken && (
              <View className="mx-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="flash" size={16} color="#f59e0b" />
                  <Text className="text-amber-600 dark:text-amber-400 text-xs font-semibold ml-2">
                    Your Electricity Token
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => copyToClipboard(token!)}
                  activeOpacity={0.7}
                  className={`w-full flex-row items-center justify-between p-3 rounded-xl ${
                    tokenCopied ? 'bg-emerald-500/10' : 'bg-background'
                  }`}
                >
                  <Text className="font-mono font-bold text-lg text-foreground tracking-wider flex-1">
                    {displayToken}
                  </Text>
                  <View className={`w-8 h-8 rounded-lg items-center justify-center ml-2 ${
                    tokenCopied ? 'bg-emerald-500/20' : 'bg-secondary'
                  }`}>
                    <Ionicons
                      name={tokenCopied ? 'checkmark' : 'copy-outline'}
                      size={16}
                      color={tokenCopied ? '#10B981' : colors.mutedForeground}
                    />
                  </View>
                </TouchableOpacity>
                <Text className="mt-2 text-xs text-center text-muted-foreground">
                  Tap to copy token to clipboard
                </Text>
              </View>
            )}

            {/* Token via SMS notice (when no token in response) */}
            {status === 'success' && !hasValidToken && (
              <View className="mx-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
                    <Ionicons name="chatbubble-ellipses" size={20} color="#3b82f6" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-sm font-semibold text-foreground">Token sent via SMS</Text>
                    <Text className="text-xs text-muted-foreground mt-0.5">
                      Check your phone for the electricity token
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Details Section */}
            <View className="px-4 space-y-2">
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

              {/* Customer Name */}
              {customerName && status === 'success' && (
                <View className="bg-secondary/30 rounded-xl p-3">
                  <View className="flex-row items-center">
                    <Ionicons name="person-outline" size={16} color={colors.mutedForeground} />
                    <Text className="text-muted-foreground text-sm ml-2 flex-1">Customer</Text>
                    <Text className="text-foreground font-semibold text-sm" numberOfLines={1}>
                      {customerName}
                    </Text>
                  </View>
                </View>
              )}

              {/* Meter Number */}
              {meterNumber && status === 'success' && (
                <View className="bg-secondary/30 rounded-xl p-3">
                  <View className="flex-row items-center">
                    <Ionicons name="keypad-outline" size={16} color={colors.mutedForeground} />
                    <Text className="text-muted-foreground text-sm ml-2 flex-1">Meter Number</Text>
                    <Text className="text-foreground font-mono font-semibold text-sm">
                      {meterNumber}
                    </Text>
                  </View>
                </View>
              )}

              {/* Provider */}
              {providerName && status === 'success' && (
                <View className="bg-secondary/30 rounded-xl p-3">
                  <View className="flex-row items-center">
                    <Ionicons name="flash" size={16} color="#f59e0b" />
                    <Text className="text-muted-foreground text-sm ml-2 flex-1">Provider</Text>
                    <Text className="text-foreground font-semibold text-sm">
                      {providerName}
                    </Text>
                  </View>
                </View>
              )}

              {/* Data Bonus */}
              {dataBonus && status === 'success' && (
                <View className="bg-secondary/30 rounded-xl p-3">
                  <View className="flex-row items-center">
                    <Ionicons name="gift" size={16} color="#10B981" />
                    <Text className="text-muted-foreground text-sm ml-2 flex-1">Data Bonus Earned</Text>
                    <Text className="text-emerald-500 font-semibold text-sm">
                      +{dataBonus}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View className="px-4 pt-4 space-y-3">
              {status === 'success' ? (
                <>
                  <TouchableOpacity
                    className="w-full rounded-xl py-4 overflow-hidden"
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={config?.gradient as any || ['#f59e0b', '#ef4444']}
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
                    colors={config?.gradient as any || ['#ef4444', '#dc2626']}
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
      </BottomSheet>

      <RatingModal
        isVisible={showRatingModal}
        onClose={() => {
          setShowRatingModal(false);
          handleClose();
        }}
        transactionTitle="Electricity Purchase"
      />
    </>
  );
};

export default ElectricityStatusModal;
