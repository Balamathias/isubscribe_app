import { COLORS } from '@/constants/colors';
import { TransferRecipient } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface RecipientPreviewProps {
  recipient: TransferRecipient;
  onClear: () => void;
}

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const RecipientPreview: React.FC<RecipientPreviewProps> = ({
  recipient,
  onClear,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="flex-row items-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30"
    >
      {/* Avatar */}
      {recipient.avatar ? (
        <View className="w-12 h-12 rounded-full overflow-hidden">
          <Image
            source={{ uri: recipient.avatar }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>
      ) : (
        <View
          className="w-12 h-12 rounded-full items-center justify-center bg-primary/20"
        >
          <Text
            className="text-base font-bold"
            style={{ color: colors.primary }}
          >
            {getInitials(recipient.full_name)}
          </Text>
        </View>
      )}

      {/* User Info */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center">
          <Text className="text-foreground font-semibold text-base" numberOfLines={1}>
            {recipient.full_name}
          </Text>
          {recipient.is_verified && (
            <View className="ml-2 bg-blue-500 rounded-full p-0.5">
              <Ionicons name="shield-checkmark" size={12} color="white" />
            </View>
          )}
        </View>
        {recipient.username && (
          <Text className="text-muted-foreground text-xs">
            @{recipient.username}
          </Text>
        )}
        <View className="flex-row items-center mt-1">
          {recipient.email_masked && (
            <Text className="text-muted-foreground text-xs">
              {recipient.email_masked}
            </Text>
          )}
          {recipient.email_masked && recipient.phone_masked && (
            <Text className="text-muted-foreground text-xs mx-1">•</Text>
          )}
          {recipient.phone_masked && (
            <Text className="text-muted-foreground text-xs">
              {recipient.phone_masked}
            </Text>
          )}
        </View>
      </View>

      {/* Clear Button */}
      <TouchableOpacity
        onPress={onClear}
        activeOpacity={0.7}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={24} color={colors.mutedForeground} />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default RecipientPreview;
