import { useSession } from '@/components/session-context';
import StarryBackground from '@/components/starry-background';
import Header from '@/components/transactions/header';
import { APP_VERSION } from '@/constants';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Linking, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AboutScreen = () => {
  const colorScheme = useColorScheme();
  const { appConfig } = useSession()
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const features = [
    { icon: 'phone-portrait', title: 'Airtime & Data' },
    { icon: 'flash', title: 'Electricity Bills' },
    { icon: 'tv', title: 'TV & Cable' },
    { icon: 'school', title: 'Education' }
  ];

  const socialLinks = [
    { icon: 'logo-twitter', url: 'https://twitter.com/isubscribe_ng' },
    { icon: 'logo-instagram', url: 'https://instagram.com/isubscribe_ng' },
    { icon: 'logo-facebook', url: 'https://facebook.com/isubscribe' },
    { icon: 'mail', url: 'mailto:hello@isubscribe.ng' }
  ];

  const openUrl = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening URL:', error);
    }
  };

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      <StarryBackground intensity="light">
        <Header title={'About isubscribe'} />

        <ScrollView 
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View entering={FadeInDown.duration(600)} className="items-center mb-8">
            <View className="bg-primary/5 rounded-2xl p-6 w-full">
              <View className="items-center">
                <Image 
                  source={require('@/assets/images/logo-icon.png')}
                  className="w-20 h-20 mb-4"
                  resizeMode="contain"
                />
                <Text className="text-foreground font-bold text-2xl mb-2">isubscribe</Text>
                <Text className="text-muted-foreground text-center text-sm leading-6">
                  Your trusted partner for digital services and bill payments in Nigeria
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Mission */}
          <Animated.View entering={FadeInDown.duration(600).delay(200)} className="mb-8">
            <View className="bg-secondary/70 rounded-xl p-4 border border-border">
              <Text className="text-foreground font-bold text-lg mb-2">Our Mission</Text>
              <Text className="text-muted-foreground text-sm leading-6">
                To simplify digital transactions and bill payments for Nigerians by providing a secure, 
                reliable, and user-friendly platform that saves time and offers exceptional value.
              </Text>
            </View>
          </Animated.View>

          {/* Services Grid */}
          <Animated.View entering={FadeInDown.duration(600).delay(400)} className="mb-8">
            <Text className="text-foreground font-bold text-lg mb-4">Our Services</Text>
            <View className="flex-row flex-wrap justify-between">
              {features.map((feature, index) => (
                <View
                  key={feature.title}
                  className="bg-secondary/70 rounded-xl p-4 border border-border w-[48%] mb-3 items-center"
                >
                  <View className="bg-primary/10 rounded-full p-3 mb-2">
                    <Ionicons name={feature.icon as any} size={24} color={colors.primary} />
                  </View>
                  <Text className="text-foreground font-medium text-sm text-center">
                    {feature.title}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.duration(600).delay(600)} className="mb-8">
            <View className="bg-primary/5 rounded-xl p-6">
              <Text className="text-foreground font-bold text-lg mb-4 text-center">
                Trusted by Thousands
              </Text>
              <View className="flex-row justify-around">
                <View className="items-center">
                  <Text className="text-primary font-bold text-xl">50K+</Text>
                  <Text className="text-muted-foreground text-xs">Users</Text>
                </View>
                <View className="items-center">
                  <Text className="text-primary font-bold text-xl">1M+</Text>
                  <Text className="text-muted-foreground text-xs">Transactions</Text>
                </View>
                <View className="items-center">
                  <Text className="text-primary font-bold text-xl">99.9%</Text>
                  <Text className="text-muted-foreground text-xs">Uptime</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Contact */}
          <Animated.View entering={FadeInDown.duration(600).delay(800)} className="mb-8">
            <View className="bg-secondary/70 rounded-xl p-4 border border-border">
              <Text className="text-foreground font-bold text-lg mb-3">Get in Touch</Text>
              <Text className="text-muted-foreground text-sm mb-2">📧 hello@isubscribe.ng</Text>
              <Text className="text-muted-foreground text-sm mb-2">📞 +234 704 959 7498</Text>
              <Text className="text-muted-foreground text-sm mb-4">📍 Abuja, Nigeria</Text>
              
              <View className="flex-row justify-center gap-x-4">
                {socialLinks.map((social) => (
                  <TouchableOpacity
                    key={social.icon}
                    onPress={() => openUrl(social.url)}
                    className="bg-primary/10 rounded-full p-3"
                  >
                    <Ionicons name={social.icon as any} size={20} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Version */}
          <Animated.View entering={FadeInDown.duration(600).delay(1000)} className="mb-8">
            <View className="bg-secondary rounded-xl p-4">
              <Text className="text-center text-muted-foreground text-xs">
                Version {appConfig?.app_version || APP_VERSION} • Built with ❤️ in Nigeria
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </StarryBackground>
    </SafeAreaView>
  );
};

export default AboutScreen;
