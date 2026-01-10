import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface FundingMethodSelectorProps {
  onSelectCheckout: () => void;
  onSelectCreateAccount: () => void;
}

/**
 * Shows two funding options for users without virtual accounts:
 * 1. Fund Now - Instant funding via Monnify (Card/Bank/USSD)
 * 2. Create Virtual Account - Generate dedicated account for bank transfers
 */
const FundingMethodSelector: React.FC<FundingMethodSelectorProps> = ({
  onSelectCheckout,
  onSelectCreateAccount,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  return (
    <View>
      {/* Header - Minimal */}
      <View className="items-center mb-6">
        <Text
          className="text-xl font-bold text-center mb-1"
          style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
        >
          Fund Your Wallet
        </Text>
        <Text
          className="text-sm text-center"
          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
        >
          Choose your preferred method
        </Text>
      </View>

      {/* Options Container */}
      <View className="gap-y-3">
        {/* Fund Now Option - Primary */}
        <TouchableOpacity
          onPress={onSelectCheckout}
          activeOpacity={0.85}
          className="rounded-2xl overflow-hidden"
          style={{
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 6,
          }}
        >
          <View className="p-5">
            <View className="flex-row items-center">
              {/* Icon */}
              <View
                className="w-11 h-11 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Ionicons name="flash" size={22} color="#ffffff" />
              </View>

              {/* Text */}
              <View className="flex-1">
                <Text className="text-white font-bold text-base">
                  Fund Now
                </Text>
                <Text className="text-white/70 text-xs mt-0.5">
                  Card, Bank Transfer, or USSD
                </Text>
              </View>

              {/* Arrow */}
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <Ionicons name="arrow-forward" size={16} color="#ffffff" />
              </View>
            </View>

            {/* Payment Methods Pills */}
            <View className="flex-row items-center mt-4 gap-x-2">
              {['Card', 'Bank', 'USSD'].map((method) => (
                <View
                  key={method}
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <Text className="text-white/90 text-[10px] font-medium">
                    {method}
                  </Text>
                </View>
              ))}
              <View className="flex-1" />
              <Text className="text-white/60 text-[10px]">Instant</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center py-1">
          <View
            className="flex-1 h-px"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
          />
          <Text
            className="text-xs mx-4 font-medium"
            style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}
          >
            or
          </Text>
          <View
            className="flex-1 h-px"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
          />
        </View>

        {/* Create Virtual Account Option - Secondary */}
        <TouchableOpacity
          onPress={onSelectCreateAccount}
          activeOpacity={0.8}
          className="rounded-2xl p-5"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <View className="flex-row items-center">
            {/* Icon */}
            <View
              className="w-11 h-11 rounded-xl items-center justify-center mr-4"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
              }}
            >
              <Ionicons
                name="business-outline"
                size={22}
                color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}
              />
            </View>

            {/* Text */}
            <View className="flex-1">
              <Text
                className="font-bold text-base"
                style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
              >
                Virtual Account
              </Text>
              <Text
                className="text-xs mt-0.5"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
              >
                Get a dedicated bank account
              </Text>
            </View>

            {/* Arrow */}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
            />
          </View>

          {/* Info Note */}
          <View
            className="flex-row items-center mt-4 pt-3"
            style={{
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={12}
              color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}
            />
            <Text
              className="text-[10px] ml-1.5"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
            >
              BVN or NIN verification required
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FundingMethodSelector;
