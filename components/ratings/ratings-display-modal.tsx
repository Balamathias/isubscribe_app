import { useListRatings } from '@/services/api-hooks';
import { Tables } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import Avatar from '../ui/avatar';
import BottomSheet from '../ui/bottom-sheet';

interface RatingsDisplayModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <View className="flex-row">
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= rating ? "star" : "star-outline"}
          size={size}
          color={star <= rating ? "#FFD700" : "#E5E7EB"}
        />
      ))}
    </View>
  );
};

const RatingCard = ({ item, index }: { item: Tables<'ratings'> & { profile: Tables<'profile'> }; index: number }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      scale.value = withSpring(1, { duration: 500 });
      opacity.value = withSpring(1, { duration: 500 });
    }, delay);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }));

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "Unknown";
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <View className="bg-card rounded-xl p-4 mb-3">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Avatar size={40} fallback={item?.profile?.full_name?.at(0)?.toUpperCase()} source={ item?.profile?.avatar ? { uri: item?.profile?.avatar as string }: undefined } />
            <View className="ml-3 flex-1">
              <Text className="text-foreground font-semibold text-base">
                { item?.profile?.full_name }
              </Text>
              <View className="flex-row items-center mt-1">
                <StarRating rating={item.rating || 0} size={14} />
                <Text className={`ml-2 text-sm font-medium ${getRatingColor(item.rating || 0)}`}>
                  {getRatingText(item.rating || 0)}
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {item.comment && (
          <View className="rounded-lg p-3">
            <Text className="text-foreground text-sm leading-relaxed">
              {item.comment}
            </Text>
          </View>
        )}

        <View className="flex-row items-center justify-between mt-3 border-t border-input" />
      </View>
    </Animated.View>
  );
};

const EmptyState = () => (
  <View className="items-center justify-center py-12 px-4">
    <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-4">
      <Ionicons name="star-outline" size={32} color="#6B7280" />
    </View>
    <Text className="text-foreground text-lg font-semibold mb-2">
      No Ratings Yet
    </Text>
    <Text className="text-muted-foreground text-center px-8">
      Be the first to rate your experience with our service
    </Text>
  </View>
);

const RatingsDisplayModal: React.FC<RatingsDisplayModalProps> = ({
  isVisible,
  onClose
}) => {
  const { data, isPending, refetch } = useListRatings();

  const ratings = data?.data || [];

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + (rating.rating || 0), 0);
    return (sum / ratings.length).toFixed(1);
  };

  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(rating => {
      if (rating.rating && rating.rating >= 1 && rating.rating <= 5) {
        counts[rating.rating as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const ratingCounts = getRatingCounts();
  const averageRating = calculateAverageRating();

  const renderHeader = () => (
    <View className="bg-secondary rounded-xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <View className="items-center">
          <Text className="text-foreground text-3xl font-bold">
            {averageRating}
          </Text>
          <StarRating rating={Math.round(parseFloat(averageRating as string))} size={20} />
          <Text className="text-muted-foreground text-sm mt-1">
            {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
          </Text>
        </View>
        
        <View className="flex-1 ml-6">
          {[5, 4, 3, 2, 1].map((star) => (
            <View key={star} className="flex-row items-center mb-1">
              <Text className="text-muted-foreground text-xs w-2">
                {star}
              </Text>
              <Ionicons name="star" size={12} color="#FFD700" />
              <View className="flex-1 bg-muted rounded-full h-2 mx-2">
                <View 
                  className="bg-primary rounded-full h-2"
                  style={{
                    width: `${ratings.length > 0 ? (ratingCounts[star as keyof typeof ratingCounts] / ratings.length) * 100 : 0}%`
                  }}
                />
              </View>
              <Text className="text-muted-foreground text-xs w-6">
                {ratingCounts[star as keyof typeof ratingCounts]}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => <EmptyState />;

  const renderLoading = () => (
    <View className="flex-1 items-center justify-center py-12">
      <ActivityIndicator size="large" color="#7B2FF2" />
      <Text className="text-muted-foreground mt-2">Loading reviews...</Text>
    </View>
  );

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title="Customer Reviews"
    >
      <View style={{ minHeight: 450 }}>
        {isPending ? (
          renderLoading()
        ) : (
          <FlatList
            data={ratings}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <RatingCard item={item} index={index} />
            )}
            ListHeaderComponent={ratings.length > 0 ? renderHeader : null}
            ListEmptyComponent={renderEmpty}
            nestedScrollEnabled
            showsVerticalScrollIndicator={true}
            bounces={true}
            scrollEnabled={true}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={isPending}
                onRefresh={refetch}
                colors={['#7B2FF2']}
              />
            }
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 20
            }}
            removeClippedSubviews={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </View>
    </BottomSheet>
  );
};

export default RatingsDisplayModal;
