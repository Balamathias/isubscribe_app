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
  View
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring
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
  animationDelay = 0 
}: { 
  index: number; 
  filled: boolean; 
  onPress: () => void; 
  animationDelay?: number;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.2, { duration: 150 }),
      withSpring(1, { duration: 150 })
    );
    
    setTimeout(() => {
      runOnJS(onPress)();
    }, animationDelay);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8} className="p-1">
      <Animated.View style={animatedStyle}>
        <Ionicons 
          name={filled ? "star" : "star-outline"} 
          size={36} 
          color={filled ? "#FFD700" : "#D1D5DB"} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const RatingModal: React.FC<RatingModalProps> = ({
  isVisible,
  onClose,
  transactionTitle = "Transaction"
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

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
        text2: 'Select at least one star'
      });
      return;
    }

    try {
      const result = await createRating({
        rating,
        comment: comment.trim()
      });

      if (result.data) {
        Toast.show({
          type: 'success',
          text1: 'Thank you! 🙏',
          text2: 'Your feedback helps us improve'
        });

        queryClient.invalidateQueries({
          queryKey: [QUERY_KEYS.listRatings]
        })
        
        // Reset form
        setRating(0);
        setComment('');
        onClose();
      } else {
        throw new Error(result.message || 'Failed to submit rating');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Submission failed',
        text2: 'Please try again'
      });
    }
  };

  const getRatingEmoji = (ratingValue: number) => {
    switch (ratingValue) {
      case 1: return "😞";
      case 2: return "😐";
      case 3: return "🙂";
      case 4: return "😊";
      case 5: return "🤩";
      default: return "😊";
    }
  };

  const getRatingText = (ratingValue: number) => {
    switch (ratingValue) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "How was your experience?";
    }
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title=""
    >
      <View className="flex-1 py-2">
        {/* Header Section */}
        <View className="items-center mb-8">
          <Text className="text-4xl mb-3">✨</Text>
          <Text className="text-foreground text-xl font-bold mb-2">
            Rate Your Experience
          </Text>
          <Text className="text-muted-foreground text-center text-sm px-4">
            Help us improve by sharing your feedback
          </Text>
        </View>

        {/* Rating Section */}
        <View className="items-center mb-8">
          <View className="flex-row items-center mb-4">
            <Text className="text-3xl mr-3">
              {getRatingEmoji(hoveredRating || rating)}
            </Text>
            <Text className="text-foreground text-lg font-semibold">
              {getRatingText(hoveredRating || rating)}
            </Text>
          </View>
          
          <View className="flex-row space-x-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <AnimatedStar
                key={star}
                index={star}
                filled={star <= (hoveredRating || rating)}
                onPress={() => handleStarPress(star)}
                animationDelay={star * 30}
              />
            ))}
          </View>
        </View>

        {/* Comment Section */}
        <View className="mb-8">
          <Text className="text-foreground font-medium mb-3 text-center">
            💬 Share your thoughts <Text className="text-muted-foreground text-sm">(optional)</Text>
          </Text>
          <TextInput
            className="border border-border rounded-2xl p-4 text-foreground bg-card"
            placeholder="Tell us what made your experience great or how we can improve..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={300}
            style={{ minHeight: 80 }}
          />
          {comment.length > 0 && (
            <Text className="text-muted-foreground text-xs mt-2 text-right">
              {comment.length}/300
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-x-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 py-4 rounded-2xl border border-border/50"
            disabled={isPending}
          >
            <Text className="text-muted-foreground text-center font-medium">
              Skip
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSubmit}
            className="flex-2 py-4 rounded-2xl overflow-hidden px-4"
            disabled={isPending || rating === 0}
            style={{ opacity: rating === 0 ? 0.5 : 1 }}
          >
            <LinearGradient
              colors={rating === 0 ? ['#6B7280', '#6B7280'] : ['#7B2FF2', '#F357A8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute inset-0"
            />
            <View className="flex-row items-center justify-center">
              {isPending ? (
                <>
                  <ActivityIndicator color="white" size="small" />
                  <Text className="text-white font-semibold ml-2">Submitting...</Text>
                </>
              ) : (
                <>
                  <Text className="text-white font-semibold">Submit Rating</Text>
                  <Text className="text-white ml-2">🚀</Text>
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
