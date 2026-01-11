import { COLORS } from '@/constants/colors';
import { VerifyEducationMerchantResponse } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface ProfileVerificationCardProps {
  verificationData: VerifyEducationMerchantResponse | null;
  isVerifying: boolean;
  error: string | null;
  onClear: () => void;
}

const ProfileVerificationCard: React.FC<ProfileVerificationCardProps> = ({
  verificationData,
  isVerifying,
  error,
  onClear,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  // Verifying state
  if (isVerifying) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
            <ActivityIndicator size="small" color="#3b82f6" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Verifying Profile ID...
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              Please wait while we verify your details
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  // Error state
  if (error) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="p-4 rounded-xl bg-red-500/10 border border-red-500/30"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-red-500/20 items-center justify-center">
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
              Verification Failed
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
              {error}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClear}
            className="w-8 h-8 rounded-full bg-red-500/20 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  // Success state
  if (verificationData?.Customer_Name) {
    return (
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
      >
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-emerald-500/20 items-center justify-center">
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Profile Verified
            </Text>
            <Text className="text-foreground font-medium text-sm mt-0.5" numberOfLines={1}>
              {verificationData.Customer_Name}
            </Text>
            {verificationData.Address && (
              <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                {verificationData.Address}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={onClear}
            className="w-8 h-8 rounded-full bg-emerald-500/20 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={16} color="#10b981" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  return null;
};

export default ProfileVerificationCard;
