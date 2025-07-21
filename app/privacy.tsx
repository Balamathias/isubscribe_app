import StarryBackground from '@/components/starry-background';
import Header from '@/components/transactions/header';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const PrivacyScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const sections = [
    {
      title: 'Information We Collect',
      content: `We collect information you provide directly to us, such as when you create an account, make a transaction, or contact us for support. This includes:

• Personal information (name, email, phone number)
• Transaction history and payment information
• Device information and usage data
• Location data (with your permission)
• Customer service communications`
    },
    {
      title: 'How We Use Your Information',
      content: `We use the information we collect to:

• Provide and maintain our services
• Process transactions and send confirmations
• Send important notifications about your account
• Improve our services and user experience
• Prevent fraud and ensure security
• Comply with legal obligations`
    },
    {
      title: 'Information Sharing',
      content: `We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:

• With service providers who help us operate our business
• When required by law or legal process
• To protect our rights or the safety of our users
• With your explicit consent
• In connection with a business transfer or acquisition`
    },
    {
      title: 'Data Security',
      content: `We implement industry-standard security measures to protect your information:

• Bank-level encryption for all data transmission
• Secure storage of personal and financial information
• Regular security audits and monitoring
• Two-factor authentication options
• Biometric authentication support`
    },
    {
      title: 'Your Rights',
      content: `You have the right to:

• Access your personal information
• Correct or update your information
• Delete your account and associated data
• Opt-out of marketing communications
• Request data portability
• Lodge a complaint with regulatory authorities`
    },
    {
      title: 'Data Retention',
      content: `We retain your information for as long as necessary to provide our services and comply with legal obligations. Transaction records are kept for regulatory compliance, while account information is deleted upon account closure (unless required by law).`
    },
    {
      title: 'Contact Us',
      content: `If you have questions about this Privacy Policy or our data practices, please contact us:

Email: privacy@isubscribe.ng
Phone: +234 704 959 7498
Address: Abuja, Nigeria

We will respond to your inquiry within 30 days.`
    }
  ];

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      <StarryBackground intensity="light">
        <Header title={'Privacy Policy'} />

        <ScrollView 
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.delay(200)} className="mb-6">
            <View className="bg-primary/10 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
                <Text className="text-foreground font-bold text-lg ml-2">Your Privacy Matters</Text>
              </View>
              <Text className="text-muted-foreground text-sm leading-6">
                At isubscribe, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
              </Text>
            </View>
            <Text className="text-muted-foreground text-xs">
              Last updated: January 15, 2025
            </Text>
          </Animated.View>

          {sections.map((section, index) => (
            <Animated.View
              key={section.title}
              entering={FadeIn.delay(300 + index * 100)}
              className="mb-6"
            >
              <View className="bg-secondary/80 rounded-xl p-4 border border-border">
                <Text className="text-foreground font-bold text-base mb-3">
                  {section.title}
                </Text>
                <Text className="text-muted-foreground text-sm leading-6">
                  {section.content}
                </Text>
              </View>
            </Animated.View>
          ))}

          <Animated.View entering={FadeIn.delay(1000)} className="mb-8">
            <View className="bg-secondary rounded-xl p-4">
              <Text className="text-center text-muted-foreground text-xs">
                This Privacy Policy is effective as of the last updated date above and will remain in effect except with respect to any changes in its provisions in the future.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </StarryBackground>
    </SafeAreaView>
  );
};

export default PrivacyScreen;
