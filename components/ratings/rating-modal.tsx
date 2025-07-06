import { COLORS } from '@/constants/colors';
import { useCreateRating } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
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
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ]
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.3, { duration: 200 }),
      withSpring(1, { duration: 200 })
    );
    rotation.value = withSequence(
      withSpring(15, { duration: 100 }),
      withSpring(-15, { duration: 100 }),
      withSpring(0, { duration: 100 })
    );
    
    setTimeout(() => {
      runOnJS(onPress)();
    }, animationDelay);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View style={animatedStyle}>
        <Ionicons 
          name={filled ? "star" : "star-outline"} 
          size={40} 
          color={filled ? "#d1a806" : "#c9cacd"} 
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

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Toast.show({
        type: 'error',
        text1: 'Rating Required',
        text2: 'Please select a rating before submitting'
      });
      return;
    }

    if (!comment.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Comment Required',
        text2: 'Please add a comment about your experience'
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
          text1: 'Thank you!',
          text2: 'Your rating has been submitted successfully'
        });
        
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
        text1: 'Submission Failed',
        text2: error.message || 'Please try again later'
      });
    }
  };

  const getRatingText = (ratingValue: number) => {
    switch (ratingValue) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Rate your experience";
    }
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title="Rate Your Experience"
    >
      <View className="flex-1 py-4">
        <View className="items-center mb-8">
          <View className="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/90 items-center justify-center mb-4">
            <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
          </View>
          <Text className="text-foreground text-xl font-bold mb-2">
            {transactionTitle} Successful!
          </Text>
          <Text className="text-muted-foreground text-center">
            How was your experience? Your feedback helps us improve our service.
          </Text>
        </View>

        <View className="items-center mb-6">
          <Text className="text-foreground text-lg font-semibold mb-4">
            {getRatingText(hoveredRating || rating)}
          </Text>
          <View className="flex-row space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <AnimatedStar
                key={star}
                index={star}
                filled={star <= (hoveredRating || rating)}
                onPress={() => handleStarPress(star)}
                animationDelay={star * 50}
              />
            ))}
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-foreground font-medium mb-2">
            Tell us more about your experience
          </Text>
          <TextInput
            className="border border-input rounded-xl p-4 text-foreground min-h-[100px]"
            placeholder="Share your thoughts about the transaction process, speed, ease of use, etc."
            placeholderTextColor={colors.mutedForeground}
            multiline
            textAlignVertical="top"
            value={comment}
            onChangeText={setComment}
            maxLength={500}
          />
          <Text className="text-muted-foreground text-xs mt-1 text-right">
            {comment.length}/500
          </Text>
        </View>

        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={onClose}
            className="flex-1 py-4 rounded-xl border border-border"
            disabled={isPending}
          >
            <Text className="text-foreground text-center font-semibold">
              Skip
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSubmit}
            className="flex-1 py-4 rounded-xl overflow-hidden"
            disabled={isPending || rating === 0}
          >
            <LinearGradient
              colors={rating === 0 ? ['#E5E7EB', '#E5E7EB'] : ['#7B2FF2', '#F357A8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute inset-0"
            />
            <View className="flex-row items-center justify-center">
              {isPending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="white" />
                  <Text className="text-white font-semibold ml-2">Submit</Text>
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
