import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, useColorScheme, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

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
      <View style={{ alignItems: 'center', marginBottom: 32 }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
          }}
        >
          <Ionicons name="wallet" size={26} color={colors.primary} />
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: '700',
            textAlign: 'center',
            color: isDark ? '#ffffff' : '#111',
          }}
        >
          Add Money
        </Text>
        <Text
          style={{
            fontSize: 14,
            textAlign: 'center',
            marginTop: 4,
            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
          }}
        >
          Select a funding method
        </Text>
      </View>

      {/* Options */}
      <View style={{ gap: 16 }}>
        {/* Primary Option - Quick Fund */}
        <TouchableOpacity
          onPress={onSelectCheckout}
          activeOpacity={0.8}
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            padding: 20,
            shadowColor: colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Ionicons name="flash" size={22} color="#fff" />
            </View>

            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 17 }}>
                  Quick Fund
                </Text>
                <View
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 6,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                    INSTANT
                  </Text>
                </View>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 }}>
                Card, transfer, or USSD
              </Text>
            </View>

            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 4 }}>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
          />
          <Text
            style={{
              marginHorizontal: 16,
              fontSize: 12,
              fontWeight: '500',
              color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)',
            }}
          >
            OR
          </Text>
          <View
            style={{
              flex: 1,
              height: 1,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            }}
          />
        </View>

        {/* Secondary Option - Virtual Account */}
        <TouchableOpacity
          onPress={onSelectCreateAccount}
          activeOpacity={0.7}
          style={{
            borderRadius: 16,
            padding: 20,
            backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#fff',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <Ionicons
                name="business-outline"
                size={22}
                color={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 17,
                  color: isDark ? '#fff' : '#111',
                }}
              >
                Virtual Account
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  marginTop: 2,
                  color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                }}
              >
                Get your own bank account number
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}
            />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default FundingMethodSelector;
