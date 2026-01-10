import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Toast from 'react-native-toast-message';

interface SocialLink {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  url: string;
}

const socialLinks: SocialLink[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'logo-twitter',
    color: '#1DA1F2',
    bgColor: 'rgba(29, 161, 242, 0.1)',
    url: 'https://x.com/isubscribe_ng',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'logo-facebook',
    color: '#1877F2',
    bgColor: 'rgba(24, 119, 242, 0.1)',
    url: 'https://facebook.com/isubscribe.ng',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'logo-instagram',
    color: '#E4405F',
    bgColor: 'rgba(228, 64, 95, 0.1)',
    url: 'https://instagram.com/isubscribe_ng',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: 'logo-whatsapp',
    color: '#25D366',
    bgColor: 'rgba(37, 211, 102, 0.1)',
    url: 'https://chat.whatsapp.com/FtUv7tE95Bt4vPbZ3DbNLS',
  },
];

const SocialHandles = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  const handleSocialLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        router.navigate(url as any);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to open URL',
      });
    }
  };

  return (
    <View className="py-8 mt-4">
      {/* Section Header */}
      <View className="items-center mb-6">
        <Text
          className="text-base font-semibold mb-1"
          style={{ color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}
        >
          Connect With Us
        </Text>
        <Text
          className="text-sm"
          style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }}
        >
          Follow us on social media
        </Text>
      </View>

      {/* Social Icons */}
      <View className="flex-row justify-center items-center mb-8">
        {socialLinks.map((link, index) => (
          <TouchableOpacity
            key={link.id}
            onPress={() => handleSocialLink(link.url)}
            activeOpacity={0.8}
            className="items-center"
            style={{ marginHorizontal: 10 }}
          >
            <View
              className="w-14 h-14 rounded-2xl items-center justify-center"
              style={{
                backgroundColor: isDark ? link.bgColor : link.bgColor,
                borderWidth: 1,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.03)',
              }}
            >
              <Ionicons name={link.icon} size={24} color={link.color} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Divider */}
      <View
        className="h-px mx-12 mb-6"
        style={{
          backgroundColor: isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.06)',
        }}
      />

      {/* Footer Links */}
      <View className="flex-row justify-center items-center flex-wrap">
        <TouchableOpacity
          onPress={() => router.push('/privacy')}
          className="px-3 py-1"
          activeOpacity={0.7}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: colors.primary }}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>

        <View
          className="w-1 h-1 rounded-full mx-2"
          style={{
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.3)'
              : 'rgba(0,0,0,0.2)',
          }}
        />

        <TouchableOpacity
          onPress={() => router.push('/about')}
          className="px-3 py-1"
          activeOpacity={0.7}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: colors.primary }}
          >
            About Us
          </Text>
        </TouchableOpacity>

        <View
          className="w-1 h-1 rounded-full mx-2"
          style={{
            backgroundColor: isDark
              ? 'rgba(255,255,255,0.3)'
              : 'rgba(0,0,0,0.2)',
          }}
        />

        <TouchableOpacity
          onPress={() => router.push('/terms')}
          className="px-3 py-1"
          activeOpacity={0.7}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: colors.primary }}
          >
            Terms
          </Text>
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <Text
        className="text-center text-xs mt-6"
        style={{ color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }}
      >
        © {new Date().getFullYear()} isubscribe. All rights reserved.
      </Text>
    </View>
  );
};

export default SocialHandles;
