import Header from '@/components/transactions/header';
import { COLORS } from '@/constants/colors';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const services = [
  {
    title: 'Buy Data',
    description: 'Purchase data bundles for all networks',
    iconName: 'wifi',
    iconType: 'ionicons',
    iconColor: '#10b981',
    bg: '#10b981',
    href: '/services/data'
  },
  {
    title: 'Buy Airtime',
    description: 'Top up airtime for all networks',
    iconName: 'call',
    iconType: 'ionicons',
    iconColor: '#3b82f6',
    bg: '#3b82f6',
    href: '/services/airtime'
  },
  {
    title: 'TV Subscription',
    description: 'Pay for cable and satellite TV',
    iconName: 'tv',
    iconType: 'ionicons',
    iconColor: '#84cc16',
    bg: '#84cc16',
    href: '/services/tv-cable'
  },
  {
    title: 'Electricity Bills',
    description: 'Pay electricity bills instantly',
    iconName: 'lightbulb-on-outline',
    iconType: 'material',
    iconColor: '#f59e0b',
    bg: '#f59e0b',
    href: '/services/electricity'
  },
  {
    title: 'Education',
    description: 'Pay for school services easily',
    iconName: 'book',
    iconType: 'ionicons',
    iconColor: '#f43f5e',
    bg: '#f43f5e',
    href: '/services/education'
  },
  {
    title: 'Share & Earn',
    description: 'Refer and earn commissions',
    iconName: 'share-alt',
    iconType: 'fontawesome',
    iconColor: '#6366f1',
    bg: '#6366f1',
    href: '/coming-soon'
  },
];

const Subs = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const renderIcon = (service: any) => {
    const iconProps = {
      size: 24,
      color: service.iconColor
    };

    if (service.iconType === 'ionicons') {
      return <Ionicons name={service.iconName as any} {...iconProps} />;
    } else if (service.iconType === 'material') {
      return <MaterialCommunityIcons name={service.iconName as any} {...iconProps} />;
    } else if (service.iconType === 'fontawesome') {
      return <FontAwesome5 name={service.iconName as any} size={20} color={service.iconColor} />;
    }
  };

  return (
    <SafeAreaView edges={['bottom']} className={`flex-1 bg-background ${theme}`}>
      <Header title="All Services" />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mb-8 items-center">
          <View className="w-16 h-16 rounded-full items-center justify-center mb-4 bg-primary/10">
            <Ionicons name="grid-outline" size={32} color={colors.primary} />
          </View>
          <Text className="text-center text-2xl text-foreground font-bold mb-2">
            Our Services
          </Text>
          <Text className="text-center text-muted-foreground text-sm leading-6 px-4">
            Choose from our comprehensive range of digital services
          </Text>
        </View>

        {/* Services Grid */}
        <View className="flex-row flex-wrap justify-between">
          {services.map((service, index) => (
            <TouchableOpacity
              key={index}
              className="w-[48%] mb-4"
              activeOpacity={0.7}
              onPress={() => router.push(service?.href as any)}
            >
              <View
                className="rounded-3xl p-5 border border-border/50"
                style={{ backgroundColor: colors.card }}
              >
                {/* Icon Container */}
                <View
                  className="w-14 h-14 rounded-full items-center justify-center mb-4"
                  style={{
                    backgroundColor: service.iconColor + '15'
                  }}
                >
                  {renderIcon(service)}
                </View>

                {/* Text Content */}
                <View className="flex-1">
                  <Text className="font-bold text-base text-foreground mb-2">
                    {service.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground leading-5">
                    {service.description}
                  </Text>
                </View>

                {/* Arrow Indicator */}
                <View className="flex-row items-center mt-3">
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={colors.mutedForeground}
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Subs;
