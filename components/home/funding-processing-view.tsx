import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useThemedColors } from '@/hooks/useThemedColors';
import { formatNigerianNaira } from '@/utils/format-naira';

interface FundingProcessingViewProps {
  amount: number;
}

/**
 * Shows processing status while polling for transaction completion
 */
const FundingProcessingView: React.FC<FundingProcessingViewProps> = ({
  amount,
}) => {
  const { colors } = useThemedColors();

  return (
    <View className="items-center justify-center py-8">
      {/* Animated Loader */}
      <View
        className="w-20 h-20 rounded-full items-center justify-center mb-6 bg-primary/20"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>

      {/* Title */}
      <Text className="text-foreground text-xl font-bold text-center mb-2">
        Processing Payment
      </Text>

      {/* Description */}
      <Text className="text-muted-foreground text-sm text-center mb-4 px-8">
        Please wait while we confirm your payment
      </Text>

      {/* Amount Being Funded */}
      <View className="bg-muted/20 rounded-xl px-6 py-3 mt-2">
        <Text className="text-muted-foreground text-xs text-center mb-1">
          Funding Amount
        </Text>
        <Text className="text-foreground font-bold text-lg text-center">
          {formatNigerianNaira(amount)}
        </Text>
      </View>

      {/* Info Text */}
      <View className="flex-row items-center mt-6">
        <View
          className="w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: colors.primary }}
        />
        <Text className="text-muted-foreground text-xs">
          This usually takes a few seconds
        </Text>
      </View>
    </View>
  );
};

export default FundingProcessingView;
