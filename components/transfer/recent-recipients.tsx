import { COLORS } from '@/constants/colors';
import { RecentTransferRecipient } from '@/services/api';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface RecentRecipientsProps {
  recipients: RecentTransferRecipient[];
  onSelect: (recipient: RecentTransferRecipient) => void;
  isLoading?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getFirstName = (name: string): string => {
  const parts = name.trim().split(' ');
  const firstName = parts[0];
  return firstName.length > 8 ? firstName.slice(0, 7) + '...' : firstName;
};

const RecipientItem: React.FC<{
  recipient: RecentTransferRecipient;
  onPress: () => void;
  colors: typeof COLORS.light;
  index: number;
}> = ({ recipient, onPress, colors, index }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View entering={FadeIn.delay(index * 80).duration(300)}>
      <AnimatedTouchable
        style={animatedStyle}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        className="items-center mr-4"
      >
        {recipient.avatar ? (
          <View className="w-14 h-14 rounded-full bg-secondary overflow-hidden">
            <Animated.Image
              source={{ uri: recipient.avatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        ) : (
          <View
            className="w-14 h-14 rounded-full items-center justify-center bg-primary/20"
          >
            <Text
              className="text-lg font-bold"
              style={{ color: colors.primary }}
            >
              {getInitials(recipient.full_name)}
            </Text>
          </View>
        )}
        <Text
          className="text-foreground text-xs mt-2 font-medium text-center"
          numberOfLines={1}
        >
          {getFirstName(recipient.full_name)}
        </Text>
      </AnimatedTouchable>
    </Animated.View>
  );
};

const LoadingSkeleton: React.FC = () => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    >
      {[1, 2, 3, 4].map((i) => (
        <View key={i} className="items-center mr-4">
          <View className="w-14 h-14 rounded-full bg-secondary animate-pulse" />
          <View className="h-3 w-10 bg-secondary rounded animate-pulse mt-2" />
        </View>
      ))}
    </ScrollView>
  );
};

const RecentRecipients: React.FC<RecentRecipientsProps> = ({
  recipients,
  onSelect,
  isLoading = false,
}) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!recipients || recipients.length === 0) {
    return null;
  }

  return (
    <View>
      <Text className="text-muted-foreground text-sm font-medium mb-3 px-4">
        Recent
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {recipients.map((recipient, index) => (
          <RecipientItem
            key={recipient.id}
            recipient={recipient}
            onPress={() => onSelect(recipient)}
            colors={colors}
            index={index}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default RecentRecipients;
