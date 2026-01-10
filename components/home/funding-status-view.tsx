import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';
import { formatNigerianNaira } from '@/utils/format-naira';

interface FundingStatusViewProps {
  status: 'success' | 'failed';
  amount: number;
  error?: string;
  onDone: () => void;
  onRetry?: () => void;
}

/**
 * Shows success or failure result after funding attempt
 */
const FundingStatusView: React.FC<FundingStatusViewProps> = ({
  status,
  amount,
  error,
  onDone,
  onRetry,
}) => {
  const { colors } = useThemedColors();
  const isSuccess = status === 'success';

  return (
    <View className="items-center justify-center py-6">
      {/* Status Icon */}
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-4"
        style={{
          backgroundColor: isSuccess ? '#10B98120' : '#EF444420',
        }}
      >
        <Ionicons
          name={isSuccess ? 'checkmark-circle' : 'close-circle'}
          size={48}
          color={isSuccess ? '#10B981' : '#EF4444'}
        />
      </View>

      {/* Title */}
      <Text className="text-foreground text-xl font-bold text-center mb-2">
        {isSuccess ? 'Wallet Funded!' : 'Funding Failed'}
      </Text>

      {/* Description */}
      <Text className="text-muted-foreground text-sm text-center mb-4 px-4">
        {isSuccess
          ? `${formatNigerianNaira(amount)} has been added to your wallet`
          : error || 'Something went wrong. Please try again.'}
      </Text>

      {/* Amount Card (Success only) */}
      {isSuccess && (
        <View className="bg-muted/20 rounded-xl px-8 py-4 mb-6">
          <View className="flex-row items-center justify-center">
            <Ionicons name="wallet" size={20} color={colors.primary} />
            <Text className="text-primary font-bold text-2xl ml-2">
              +{formatNigerianNaira(amount)}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View className="w-full px-4 mt-2">
        {isSuccess ? (
          // Success - Single "Done" button
          <TouchableOpacity
            onPress={onDone}
            activeOpacity={0.8}
            className="overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={['#740faa', '#a13ae1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 flex-row items-center justify-center"
            >
              <Ionicons name="checkmark" size={20} color="#fff" />
              <Text className="text-white font-semibold text-base ml-2">
                Done
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          // Failed - "Try Again" and "Go Back" buttons
          <View className="space-y-3">
            {onRetry && (
              <TouchableOpacity
                onPress={onRetry}
                activeOpacity={0.8}
                className="overflow-hidden rounded-2xl"
              >
                <LinearGradient
                  colors={['#740faa', '#a13ae1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 flex-row items-center justify-center"
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Try Again
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onDone}
              activeOpacity={0.7}
              className="py-4 rounded-2xl border border-border flex-row items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
              <Text className="text-foreground font-semibold text-base ml-2">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default FundingStatusView;
