import StarryBackground from '@/components/starry-background';
import Header from '@/components/transactions/header';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, useColorScheme, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const TermsScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const sections = [
    {
      title: 'Acceptance of Terms',
      content: `By accessing and using the isubscribe mobile application and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.

These terms constitute a legally binding agreement between you and isubscribe regarding your use of the service.`
    },
    {
      title: 'Service Description',
      content: `isubscribe provides digital payment services including but not limited to:

• Airtime and data purchases for all Nigerian networks
• Electricity bill payments with meter verification
• Cable TV subscription services
• Educational service payments
• Other utility bill payment services

We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.`
    },
    {
      title: 'User Account and Responsibilities',
      content: `To use our services, you must:

• Be at least 18 years old or have parental consent
• Provide accurate and complete registration information
• Maintain the security of your account credentials
• Notify us immediately of any unauthorized use
• Use the service only for lawful purposes
• Not share your account with others

You are responsible for all activities that occur under your account.`
    },
    {
      title: 'Payment Terms',
      content: `• All transactions are processed in Nigerian Naira (₦)
• Payment is due immediately upon service request
• We accept bank transfers, debit cards, and other approved payment methods
• Transaction fees may apply and will be clearly displayed
• Refunds are processed according to our refund policy
• Failed transactions will be refunded within 24-48 hours

You agree to pay all charges incurred by you or any users of your account.`
    },
    {
      title: 'Service Limitations',
      content: `• Services are subject to availability from third-party providers
• Transaction limits may apply based on regulatory requirements
• Some services may not be available in certain locations
• We may refuse service at our discretion
• Delivery times are estimates and may vary
• Technical issues may occasionally affect service availability

We are not liable for delays or failures caused by third-party service providers.`
    },
    {
      title: 'Prohibited Activities',
      content: `You agree not to:

• Use the service for illegal activities or money laundering
• Attempt to circumvent security measures
• Share false or misleading information
• Use automated systems to access the service
• Interfere with other users' use of the service
• Violate any applicable laws or regulations
• Use the service to harm others or commit fraud

Violation of these terms may result in account suspension or termination.`
    },
    {
      title: 'Privacy and Data Protection',
      content: `We are committed to protecting your privacy and personal data in accordance with:

• Nigerian Data Protection Regulation (NDPR)
• International data protection standards
• Our comprehensive Privacy Policy

Your personal information is collected, used, and protected as outlined in our Privacy Policy, which forms an integral part of these terms.`
    },
    {
      title: 'Disclaimers and Limitations',
      content: `• Services are provided "as is" without warranties
• We do not guarantee uninterrupted or error-free service
• Our liability is limited to the amount of the specific transaction
• We are not responsible for third-party service provider issues
• Internet connectivity issues are beyond our control
• Market fluctuations may affect service pricing

Your use of the service is at your own risk.`
    },
    {
      title: 'Dispute Resolution',
      content: `In case of disputes:

• Contact our customer support team first
• We will attempt to resolve issues within 7 business days
• Unresolved disputes may be subject to mediation
• Nigerian law governs these terms and any disputes
• Abuja courts have exclusive jurisdiction

We encourage good faith efforts to resolve disputes amicably.`
    },
    {
      title: 'Termination',
      content: `Either party may terminate this agreement:

• You may close your account at any time
• We may suspend or terminate accounts for terms violations
• Upon termination, you remain liable for outstanding charges
• Certain provisions survive termination (payment obligations, etc.)
• Account closure does not affect completed transactions

Termination notices will be provided where legally required.`
    },
    {
      title: 'Changes to Terms',
      content: `We reserve the right to modify these terms at any time:

• Changes will be posted in the app and on our website
• Continued use constitutes acceptance of modified terms
• Material changes will be communicated with 30 days notice
• You may terminate your account if you disagree with changes

Your use of the service after changes indicates acceptance.`
    },
    {
      title: 'Contact Information',
      content: `For questions about these terms or our services:

Email: legal@isubscribe.ng
Phone: +234 704 959 7498
Address: Abuja, Nigeria

Customer Support:
Email: support@isubscribe.ng
In-app chat support available 24/7

We aim to respond to all inquiries within 24 hours.`
    }
  ];

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      <StarryBackground intensity="light">
        {/* Header */}
        <Header title={'Terms of Service'} />

        <ScrollView 
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction */}
          <Animated.View entering={FadeIn.delay(200)} className="mb-6">
            <View className="bg-primary/10 rounded-xl p-4 mb-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="document-text" size={24} color={colors.primary} />
                <Text className="text-foreground font-bold text-lg ml-2">Terms of Service</Text>
              </View>
              <Text className="text-muted-foreground text-sm leading-6">
                Please read these terms and conditions carefully before using the isubscribe application. 
                By using our service, you agree to be bound by these terms.
              </Text>
            </View>
            <Text className="text-muted-foreground text-xs">
              Last updated: January 15, 2025 • Effective Date: January 1, 2025
            </Text>
          </Animated.View>

          {/* Important Notice */}
          <Animated.View entering={FadeIn.delay(300)} className="mb-6">
            <View className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="warning" size={20} color="#f97316" />
                <Text className="text-orange-600 dark:text-orange-400 font-semibold ml-2">
                  Important Notice
                </Text>
              </View>
              <Text className="text-orange-700 dark:text-orange-300 text-sm">
                These terms include important information about your rights and obligations. 
                Please ensure you understand them before proceeding.
              </Text>
            </View>
          </Animated.View>

          {/* Sections */}
          {sections.map((section, index) => (
            <Animated.View
              key={section.title}
              entering={FadeIn.delay(400 + index * 50)}
              className="mb-6"
            >
              <View className="bg-secondary/80 rounded-xl p-4 border border-border">
                <Text className="text-foreground font-bold text-base mb-3">
                  {index + 1}. {section.title}
                </Text>
                <Text className="text-muted-foreground text-sm leading-6">
                  {section.content}
                </Text>
              </View>
            </Animated.View>
          ))}

          {/* Agreement Confirmation */}
          <Animated.View entering={FadeIn.delay(1000)} className="mb-6">
            <View className="bg-green-500/10 border border-border rounded-xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text className="text-green-600 dark:text-green-400 font-semibold ml-2">
                  Agreement Confirmation
                </Text>
              </View>
              <Text className="text-green-700 dark:text-green-300 text-sm">
                By continuing to use isubscribe, you acknowledge that you have read, 
                understood, and agree to be bound by these terms and conditions.
              </Text>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View entering={FadeIn.delay(1200)} className="mb-8">
            <View className="bg-secondary rounded-xl p-4">
              <Text className="text-center text-muted-foreground text-xs">
                These Terms & Conditions are governed by the laws of the Federal Republic of Nigeria. 
                Any disputes will be resolved in accordance with Nigerian law.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </StarryBackground>
    </SafeAreaView>
  );
};

export default TermsScreen;
