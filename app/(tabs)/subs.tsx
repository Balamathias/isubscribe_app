import TabHeader from '@/components/ui/tab-header';
import { useThemedColors } from '@/hooks/useThemedColors';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Service {
  title: string;
  description: string;
  iconName: string;
  iconType: 'ionicons' | 'material' | 'fontawesome';
  iconColor: string;
  href: string;
  badge?: string;
}

const services: Service[] = [
  {
    title: 'Data Bundles',
    description: 'MTN, Airtel, Glo & 9mobile',
    iconName: 'cellular',
    iconType: 'ionicons',
    iconColor: '#10b981',
    href: '/services/data',
  },
  {
    title: 'Airtime',
    description: 'Instant top-up, all networks',
    iconName: 'call',
    iconType: 'ionicons',
    iconColor: '#3b82f6',
    href: '/services/airtime',
  },
  {
    title: 'Electricity',
    description: 'Prepaid & Postpaid meters',
    iconName: 'flash',
    iconType: 'ionicons',
    iconColor: '#f59e0b',
    href: '/services/electricity',
  },
  {
    title: 'Education',
    description: 'WAEC, JAMB, Scratch cards',
    iconName: 'school',
    iconType: 'ionicons',
    iconColor: '#ec4899',
    href: '/services/education',
  },
  {
    title: 'Send Money',
    description: 'To isubscribe users.',
    iconName: 'send',
    iconType: 'ionicons',
    iconColor: '#aa4899',
    href: '/services/transfer',
  },
  {
    title: 'Cable TV',
    description: 'DSTV, GOtv, Startimes',
    iconName: 'tv',
    iconType: 'ionicons',
    iconColor: '#8b5cf6',
    href: '/services/tv-cable',
  },
  {
    title: 'Referrals',
    description: 'Invite friends & earn',
    iconName: 'gift',
    iconType: 'ionicons',
    iconColor: '#6366f1',
    href: '/coming-soon',
    badge: 'Soon',
  },
];

const Subs = () => {
  const router = useRouter();
  const { colors, theme } = useThemedColors();
  const isDark = theme === 'dark';

  // Staggered animation for cards
  const animatedValues = useRef(services.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, animations).start();
  }, [animatedValues]);

  const renderIcon = (service: Service) => {
    const iconProps = {
      size: service.iconType === 'fontawesome' ? 20 : 24,
      color: '#fff',
    };

    if (service.iconType === 'ionicons') {
      return <Ionicons name={service.iconName as any} {...iconProps} />;
    } else if (service.iconType === 'material') {
      return <MaterialCommunityIcons name={service.iconName as any} {...iconProps} />;
    } else if (service.iconType === 'fontawesome') {
      return <FontAwesome5 name={service.iconName as any} {...iconProps} />;
    }
  };

  return (
    <SafeAreaView edges={['bottom']} className={`flex-1 bg-background ${isDark ? 'dark' : 'light'}`}>
      <TabHeader title="Services" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="mb-8">
          <Text
            className="text-3xl font-bold mb-2"
            style={{ color: isDark ? '#fff' : '#111' }}
          >
            What do you need?
          </Text>
          <Text
            className="text-base"
            style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
          >
            Quick payments for all your bills
          </Text>
        </View>

        {/* Services Grid */}
        <View className="flex-row flex-wrap justify-between">
          {services.map((service, index) => {
            const animatedStyle = {
              opacity: animatedValues[index],
              transform: [
                {
                  translateY: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
                {
                  scale: animatedValues[index].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1],
                  }),
                },
              ],
            };

            return (
              <Animated.View key={index} style={[{ width: '48%', marginBottom: 16 }, animatedStyle]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => router.push(service.href as any)}
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                    borderRadius: 24,
                    padding: 20,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Badge */}
                  {service.badge && (
                    <View
                      className="absolute top-3 right-3 px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: service.iconColor }}
                    >
                      <Text className="text-white text-[9px] font-bold uppercase">
                        {service.badge}
                      </Text>
                    </View>
                  )}

                  {/* Icon */}
                  <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
                    style={{
                      backgroundColor: service.iconColor,
                      shadowColor: service.iconColor,
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    {renderIcon(service)}
                  </View>

                  {/* Content */}
                  <Text
                    className="font-bold text-base mb-1"
                    style={{ color: isDark ? '#fff' : '#111' }}
                  >
                    {service.title}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)',
                      lineHeight: 16,
                    }}
                  >
                    {service.description}
                  </Text>

                  {/* Arrow */}
                  <View className="flex-row items-center justify-end mt-4">
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                      }}
                    >
                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Help Section */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/help' as any)}
          className="mt-4 rounded-2xl p-5 flex-row items-center"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          }}
        >
          <View
            className="w-11 h-11 rounded-xl items-center justify-center mr-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <Ionicons
              name="help-circle-outline"
              size={22}
              color={isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)'}
            />
          </View>
          <View className="flex-1">
            <Text
              className="font-semibold text-sm"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              Need Help?
            </Text>
            <Text
              className="text-xs mt-0.5"
              style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}
            >
              Contact our support team
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Subs;
