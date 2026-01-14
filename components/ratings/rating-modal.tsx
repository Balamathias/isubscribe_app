import { COLORS } from '@/constants/colors';
import { QUERY_KEYS, useCreateRating } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import BottomSheet from '../ui/bottom-sheet';

interface RatingModalProps {
  isVisible: boolean;
  onClose: () => void;
  transactionTitle?: string;
}

const AnimatedStar = ({
  index,
  filled,
  onPress,
}: {
  index: number;
  filled: boolean;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  const handlePress = () => {
    scale.value = withSequence(withSpring(1.3, { damping: 8 }), withSpring(1, { damping: 10 }));
    rotation.value = withSequence(withSpring(-10), withSpring(10), withSpring(0));
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} className="p-1.5">
      <Animated.View style={animatedStyle}>
        <Ionicons
          name={filled ? 'star' : 'star-outline'}
          size={40}
          color={filled ? '#FFD700' : '#9ca3af'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const RatingModal: React.FC<RatingModalProps> = ({
  isVisible,
  onClose,
  transactionTitle = 'Transaction',
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  const { mutateAsync: createRating, isPending } = useCreateRating();
  const queryClient = useQueryClient();

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Please rate your experience',
        text2: 'Select at least one star',
      });
      return;
    }

    try {
      const result = await createRating({
        rating,
        comment: comment.trim(),
      });

      if (result.data) {
        Toast.show({
          type: 'success',
          text1: 'Thank you! 🙏',
          text2: 'Your feedback helps us improve',
        });

        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.listRatings],
        });

        setRating(0);
        setComment('');
        onClose();
      } else {
        throw new Error(result.message || 'Failed to submit rating');
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Submission failed',
        text2: 'Please try again',
      });
    }
  };

  const getRatingEmoji = (ratingValue: number) => {
    switch (ratingValue) {
      case 1:
        return '😞';
      case 2:
        return '😐';
      case 3:
        return '🙂';
      case 4:
        return '😊';
      case 5:
        return '🤩';
      default:
        return '⭐';
    }
  };

  const getRatingText = (ratingValue: number) => {
    switch (ratingValue) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent!';
      default:
        return 'Tap to rate';
    }
  };

  const getRatingColor = (ratingValue: number) => {
    switch (ratingValue) {
      case 1:
        return '#ef4444';
      case 2:
        return '#f59e0b';
      case 3:
        return '#eab308';
      case 4:
        return '#22c55e';
      case 5:
        return '#10b981';
      default:
        return isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';
    }
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={onClose} title="">
      <View className="py-2">
        {/* Header Section */}
        <View className="items-center mb-6">
          <View
            className="w-16 h-16 rounded-full items-center justify-center mb-4"
            style={{ backgroundColor: isDark ? 'rgba(255,215,0,0.1)' : 'rgba(255,215,0,0.15)' }}
          >
            <Text className="text-3xl">{getRatingEmoji(rating)}</Text>
          </View>
          <Text className="text-xl font-bold mb-1" style={{ color: isDark ? '#fff' : '#111' }}>
            Rate Your Experience
          </Text>
          <Text
            className="text-center text-sm"
            style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
          >
            Your feedback helps us improve
          </Text>
        </View>

        {/* Stars Section */}
        <View
          className="rounded-2xl p-5 mb-5 items-center"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          }}
        >
          {/* Rating Text */}
          <Text
            className="text-lg font-semibold mb-4"
            style={{ color: getRatingColor(rating) }}
          >
            {getRatingText(rating)}
          </Text>

          {/* Stars Row */}
          <View className="flex-row items-center justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <AnimatedStar
                key={star}
                index={star}
                filled={star <= rating}
                onPress={() => handleStarPress(star)}
              />
            ))}
          </View>
        </View>

        {/* Comment Section */}
        <View className="mb-5">
          <View className="flex-row items-center mb-3">
            <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
              Share your thoughts
            </Text>
            <Text
              className="text-xs ml-1"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
            >
              (optional)
            </Text>
          </View>
          <View
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              borderWidth: 1,
              borderColor: comment.length > 0
                ? colors.primary + '50'
                : isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.04)',
            }}
          >
            <TextInput
              className="p-4 text-sm"
              style={{
                color: isDark ? '#fff' : '#111',
                minHeight: 90,
              }}
              placeholder="What did you like or how can we improve?"
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
              multiline
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
              maxLength={300}
            />
          </View>
          {comment.length > 0 && (
            <Text
              className="text-xs mt-2 text-right"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
            >
              {comment.length}/300
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-x-3">
          <TouchableOpacity
            onPress={onClose}
            disabled={isPending}
            activeOpacity={0.85}
            className="flex-1 py-4 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <Text className="font-semibold" style={{ color: isDark ? '#fff' : '#111' }}>
              Maybe Later
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isPending || rating === 0}
            activeOpacity={0.9}
            className="flex-[1.5] py-4 rounded-2xl overflow-hidden"
            style={{ opacity: rating === 0 ? 0.5 : 1 }}
          >
            <LinearGradient
              colors={
                rating === 0
                  ? isDark
                    ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)']
                    : ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.08)']
                  : [colors.primary, '#a855f7']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            />
            <View className="flex-row items-center justify-center">
              {isPending ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-bold ml-2">Submitting...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={16} color={rating === 0 ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)') : '#fff'} />
                  <Text
                    className="font-bold ml-2"
                    style={{
                      color: rating === 0 ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)') : '#fff',
                    }}
                  >
                    Submit
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheet>
  );
};

export default RatingModal;
