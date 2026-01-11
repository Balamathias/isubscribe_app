import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { LinearGradient } from 'expo-linear-gradient';

interface FundingMethodSelectorProps {
  onSelectCheckout: () => void;
  onSelectCreateAccount: () => void;
}

const FundingMethodSelector: React.FC<FundingMethodSelectorProps> = ({
  onSelectCheckout,
  onSelectCreateAccount,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  // Subtle entrance animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* Header */}
      <View className="items-center mb-8">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
        >
          <Ionicons name="wallet" size={26} color={colors.primary} />
        </View>
        <Text
          className="text-2xl font-bold text-center"
          style={{ color: isDark ? '#ffffff' : '#111' }}
        >
          Add Money
        </Text>
        <Text
          className="text-sm text-center mt-1"
          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
        >
          Select a funding method
        </Text>
      </View>

      {/* Options */}
      <View className="gap-y-4">
        {/* Primary Option - Fund Now */}
        <TouchableOpacity
          onPress={onSelectCheckout}
          activeOpacity={0.9}
          className="rounded-3xl overflow-hidden"
          style={{
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.35,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          <LinearGradient
            colors={isDark ? ['#8B5CF6', '#7C3AED'] : ['#8B5CF6', '#7C3AED']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5"
          >
            {/* Main Content */}
            <View className="flex-row items-center">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Ionicons name="wallet" size={24} color="#fff" />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-white font-bold text-lg mr-2">
                    Quick Fund
                  </Text>
                  <View
                    className="px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
                  >
                    <Text className="text-white text-[10px] font-semibold">
                      INSTANT
                    </Text>
                  </View>
                </View>
                <Text className="text-white/80 text-sm mt-1">
                  Pay with card, transfer, or USSD
                </Text>
              </View>

              <View
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </View>
            </View>

            {/* Payment Icons */}
            <View className="flex-row items-center mt-5 pt-4 border-t border-white/20">
              <View className="flex-row items-center flex-1">
                {[
                  { icon: 'card', label: 'Card' },
                  { icon: 'swap-horizontal', label: 'Transfer' },
                  { icon: 'keypad', label: 'USSD' },
                ].map((item, index) => (
                  <View
                    key={item.label}
                    className="flex-row items-center mr-5"
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={14}
                      color="rgba(255,255,255,0.8)"
                    />
                    <Text className="text-white/70 text-xs ml-1.5 font-medium">
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
              <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.6)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center py-2">
          <View
            className="flex-1 h-px"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
          />
          <View
            className="w-8 h-8 rounded-full items-center justify-center mx-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)' }}
            >
              OR
            </Text>
          </View>
          <View
            className="flex-1 h-px"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
          />
        </View>

        {/* Secondary Option - Virtual Account */}
        <TouchableOpacity
          onPress={onSelectCreateAccount}
          activeOpacity={0.85}
          className="rounded-3xl p-5"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fafafa',
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          }}
        >
          <View className="flex-row items-center">
            <View
              className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <Ionicons
                name="business"
                size={22}
                color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}
              />
            </View>

            <View className="flex-1">
              <Text
                className="font-bold text-base"
                style={{ color: isDark ? '#fff' : '#111' }}
              >
                Virtual Account
              </Text>
              <Text
                className="text-sm mt-0.5"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
              >
                Get your own bank account number
              </Text>
            </View>

            <View
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}
              />
            </View>
          </View>

          {/* Requirements Note */}
          <View
            className="flex-row items-center mt-4 pt-4"
            style={{
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <View
              className="flex-row items-center px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.08)',
              }}
            >
              <Ionicons name="finger-print" size={12} color="#fbbf24" />
              <Text
                className="text-[11px] ml-1.5 font-medium"
                style={{ color: '#fbbf24' }}
              >
                Requires BVN/NIN
              </Text>
            </View>
            <View className="flex-1" />
            <Text
              className="text-[11px]"
              style={{ color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)' }}
            >
              One-time setup
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default FundingMethodSelector;
