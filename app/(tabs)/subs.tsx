import Header from '@/components/transactions/header';
import { useThemedColors } from '@/hooks/useThemedColors';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const services = [
  {
    title: 'Buy Data',
    description: 'Purchase data bundles for all networks',
    icon: <Ionicons name="wifi" size={24} color="#10b981" />,
    bg: 'bg-green-500/15',
     href: '/services/data'
  },
  {
    title: 'Buy Airtime',
    description: 'Top up airtime for all networks',
    icon: <Ionicons name="call" size={24} color="#3b82f6" />,
    bg: 'bg-blue-500/15',
    href: '/services/airtime'
  },
  {
    title: 'TV Subscription',
    description: 'Pay for cable and satellite TV',
    icon: <Ionicons name="tv" size={24} color="#84cc16" />,
    bg: 'bg-lime-500/15',
     href: '/services/tv-cable'
  },
  {
    title: 'Electricity Bills',
    description: 'Pay electricity bills instantly',
    icon: <MaterialCommunityIcons name="lightbulb-on-outline" size={24} color="#f59e0b" />,
    bg: 'bg-yellow-500/15',
    href: '/services/electricity'
  },
  {
    title: 'Education',
    description: 'Pay for school services easily',
    icon: <Ionicons name="book" size={24} color="#f43f5e" />,
    bg: 'bg-rose-500/15',
    href: '/services/education'
  },
  {
    title: 'Share & Earn',
    description: 'Refer and earn commissions',
    icon: <FontAwesome5 name="share-alt" size={20} color="#6366f1" />,
    bg: 'bg-indigo-500/15',
    href: '/coming-soon'
  },
];

const Subs = () => {
  const router = useRouter()
  const { colors, theme } = useThemedColors()
  return (
    <View className={"flex-1 bg-background/80" + ` ${theme}`}>
      <Header title="All Subs" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className=' text-center text-2xl mt-3 text-primary font-bold'>Our Services</Text>
        <Text className=' text-center text-muted-foreground text-sm mt-3'>Choose from our comprehensive range of digital services</Text>
        <View className="flex-row flex-wrap justify-between mt-6">
          {services.map((service:any, index) => (
            <TouchableOpacity
              key={index}
              className={`w-[48%] rounded-2xl p-4 mb-4 ${service.bg}`}
              activeOpacity={0.8}
              onPress={() => router.push(service?.href)}

            >
              <View className={"mb-3"}>{service.icon}</View>
              <Text className={"font-bold text-base text-foreground"}>{service.title}</Text>
              <Text className="text-sm text-muted-foreground mt-1">{service.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default Subs;
