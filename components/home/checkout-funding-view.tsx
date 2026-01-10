import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useThemedColors } from '@/hooks/useThemedColors';
import { formatNigerianNaira } from '@/utils/format-naira';

interface CheckoutFundingViewProps {
  onBack: () => void;
  onProceed: (amount: number) => void;
  isLoading?: boolean;
}

// Quick amount options
const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000];

// Amount limits
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 1000000;

/**
 * Amount entry form for wallet funding via Monnify checkout
 */
const CheckoutFundingView: React.FC<CheckoutFundingViewProps> = ({
  onBack,
  onProceed,
  isLoading = false,
}) => {
  const { colors } = useThemedColors();
  const [amount, setAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Format display value with thousand separators
  const displayValue = amount ? Number(amount).toLocaleString() : '';

  // Handle amount input
  const handleAmountChange = useCallback((text: string) => {
    // Remove non-numeric characters
    const numericValue = text.replace(/[^0-9]/g, '');
    setAmount(numericValue);
    setError(null);
  }, []);

  // Handle quick amount selection
  const handleQuickAmount = useCallback((value: number) => {
    setAmount(String(value));
    setError(null);
  }, []);

  // Validate and submit
  const handleProceed = useCallback(() => {
    const numAmount = Number(amount);

    if (!numAmount || numAmount < MIN_AMOUNT) {
      setError(`Minimum amount is ${formatNigerianNaira(MIN_AMOUNT)}`);
      return;
    }

    if (numAmount > MAX_AMOUNT) {
      setError(`Maximum amount is ${formatNigerianNaira(MAX_AMOUNT)}`);
      return;
    }

    onProceed(numAmount);
  }, [amount, onProceed]);

  const numAmount = Number(amount);
  const isValid = numAmount >= MIN_AMOUNT && numAmount <= MAX_AMOUNT;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header with Back Button */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={onBack}
            disabled={isLoading}
            className="w-10 h-10 rounded-full bg-muted/30 items-center justify-center mr-3"
          >
            <Ionicons name="arrow-back" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-foreground font-semibold text-lg">
              Fund Wallet
            </Text>
            <Text className="text-muted-foreground text-xs">
              Enter amount to fund
            </Text>
          </View>
        </View>

        {/* Quick Amount Chips */}
        <View className="mb-4">
          <Text className="text-muted-foreground text-xs font-medium mb-2">
            Quick Select
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {QUICK_AMOUNTS.map((amt) => {
              const isSelected = amount === String(amt);
              return (
                <TouchableOpacity
                  key={amt}
                  onPress={() => handleQuickAmount(amt)}
                  disabled={isLoading}
                  className={`px-4 py-2 rounded-xl ${
                    isSelected ? 'bg-primary' : 'bg-muted/30'
                  }`}
                >
                  <Text
                    className={`font-semibold text-sm ${
                      isSelected ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    {amt >= 1000 ? `${amt / 1000}K` : amt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Amount Input */}
        <View className="mb-4">
          <Text className="text-muted-foreground text-xs font-medium mb-2">
            Or enter custom amount
          </Text>
          <View
            className={`flex-row items-center bg-muted/20 rounded-2xl px-4 h-16 ${
              error ? 'border-2 border-red-500' : 'border border-border'
            }`}
          >
            <Text className="text-foreground font-bold text-2xl mr-1">
              ₦
            </Text>
            <TextInput
              value={displayValue}
              onChangeText={handleAmountChange}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              editable={!isLoading}
              className="flex-1 text-foreground font-bold text-2xl text-center"
              style={{ color: colors.foreground }}
            />
          </View>
          {error && (
            <View className="flex-row items-center mt-2">
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <Text className="text-red-500 text-xs ml-1">{error}</Text>
            </View>
          )}
        </View>

        {/* Summary */}
        {isValid && (
          <View className="bg-muted/20 rounded-2xl p-4 mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-muted-foreground text-sm">Amount</Text>
              <Text className="text-foreground font-semibold">
                {formatNigerianNaira(numAmount)}
              </Text>
            </View>
            <View className="h-px bg-border my-2" />
            <View className="flex-row justify-between items-center">
              <Text className="text-muted-foreground text-sm">You will receive</Text>
              <Text className="text-primary font-bold text-lg">
                {formatNigerianNaira(numAmount)}
              </Text>
            </View>
          </View>
        )}

        {/* Payment Methods Info */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          <View className="flex-row items-center px-3 py-1.5 bg-muted/20 rounded-full">
            <Ionicons name="card-outline" size={12} color={colors.mutedForeground} />
            <Text className="text-muted-foreground text-xs ml-1">Card</Text>
          </View>
          <View className="flex-row items-center px-3 py-1.5 bg-muted/20 rounded-full">
            <Ionicons name="swap-horizontal-outline" size={12} color={colors.mutedForeground} />
            <Text className="text-muted-foreground text-xs ml-1">Bank Transfer</Text>
          </View>
          <View className="flex-row items-center px-3 py-1.5 bg-muted/20 rounded-full">
            <Ionicons name="keypad-outline" size={12} color={colors.mutedForeground} />
            <Text className="text-muted-foreground text-xs ml-1">USSD</Text>
          </View>
        </View>

        {/* Fund Button */}
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!amount || numAmount < MIN_AMOUNT || isLoading}
          activeOpacity={0.8}
          className="overflow-hidden rounded-2xl"
        >
          <LinearGradient
            colors={
              !amount || numAmount < MIN_AMOUNT || isLoading
                ? ['#9ca3af', '#9ca3af']
                : ['#740faa', '#a13ae1']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 flex-row items-center justify-center"
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  Initializing...
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="card-outline" size={20} color="#fff" />
                <Text className="text-white font-semibold text-base ml-2">
                  {isValid ? `Fund ${formatNigerianNaira(numAmount)}` : 'Enter Amount'}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CheckoutFundingView;
