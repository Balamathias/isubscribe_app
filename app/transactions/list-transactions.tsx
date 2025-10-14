import { TransactionItem, formatDate, getItemConfig } from '@/components/home/recent-transactions';
import { useSession } from '@/components/session-context';
import { COLORS } from '@/constants/colors';
import { getTransactions } from '@/services/api';
import { Tables } from '@/types/database';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

const TRANSACTIONS_PER_PAGE = 30;

const ListTransactions = () => {
  const { user } = useSession();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const {
    data,
    isPending,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isError
  } = useInfiniteQuery({
    queryKey: ['transactions'],
    queryFn: ({ pageParam = 0 }) => getTransactions(TRANSACTIONS_PER_PAGE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If there's no data or the count is less than the limit, no more pages
      if (!lastPage?.data || lastPage.data.length < TRANSACTIONS_PER_PAGE) {
        return undefined;
      }
      // Calculate the next offset based on all pages loaded so far
      const totalLoaded = allPages.reduce((sum, page) => sum + (page?.data?.length || 0), 0);
      return totalLoaded;
    },
  });

  const transactions = data?.pages?.flatMap((page) => page?.data || []) || [];

  const renderItem = ({ item }: { item: Tables<'history'> }) => (
    <TransactionItem
      icon={getItemConfig(item).icon}
      iconColor={getItemConfig(item).iconColor}
      title={item.title || ''}
      date={formatDate(item.created_at)}
      status={item.status || ''}
      amount={formatNigerianNaira(item.amount || 0)}
      type={item.type}
      data_bonus={(item?.meta_data as any)?.data_bonus}
      id={item.id}
    />
  );

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isPending) {
    return (
      <View className="flex-1 px-5 py-6 bg-background">
        {[...Array(10)].map((_, index) => (
          <SkeletonTransactionItem key={index} colors={colors} />
        ))}
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <View className="bg-card rounded-3xl p-10 items-center border border-border/50 max-w-md">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: `${colors.mutedForeground}15` }}
          >
            <Ionicons name="log-in-outline" size={36} color={colors.mutedForeground} />
          </View>
          <Text className="text-foreground text-xl font-bold mb-3">Sign in Required</Text>
          <Text className="text-muted-foreground text-center text-sm leading-6 mb-7">
            Please sign in to your account to view your transaction history
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.8}
            className="rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={[colors.primary, '#e65bf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="px-8 py-4 flex-row items-center"
            >
              <Ionicons name='log-in-outline' color={'white'} size={20} />
              <Text className="text-white font-semibold ml-2.5 text-base">Sign In</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <View className="bg-card rounded-3xl p-10 items-center border border-border/50 max-w-md">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-5"
            style={{ backgroundColor: `${colors.mutedForeground}15` }}
          >
            <Ionicons name="alert-circle-outline" size={36} color={colors.mutedForeground} />
          </View>
          <Text className="text-foreground text-xl font-bold mb-3">Unable to Load</Text>
          <Text className="text-muted-foreground text-center text-sm leading-6 mb-7">
            We couldn't load your transactions. Please try again.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            activeOpacity={0.8}
            className="bg-card border border-border/50 rounded-2xl px-8 py-4"
          >
            <Text className="text-primary font-semibold text-base">Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={{
          padding: 20,
          flexGrow: 1
        }}
        refreshing={isRefetching}
        onRefresh={refetch}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-6 items-center">
              <ActivityIndicator size="small" color={colors.primary} />
              <Text className="text-muted-foreground text-xs mt-3">Loading more...</Text>
            </View>
          ) : hasNextPage ? (
            <TouchableOpacity
              onPress={handleEndReached}
              className="py-4 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-primary font-semibold text-sm">Load More</Text>
            </TouchableOpacity>
          ) : transactions.length > 0 ? (
            <View className="py-6 items-center">
              <View className="h-px w-20 bg-border/50 mb-3" />
              <Text className="text-muted-foreground text-xs">You've reached the end</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isPending && !isRefetching ? (
            <View className="flex-1 items-center justify-center py-20">
              <View className="bg-card rounded-3xl p-10 items-center border border-border/50 max-w-md mx-auto">
                <View
                  className="w-20 h-20 rounded-full items-center justify-center mb-5"
                  style={{ backgroundColor: `${colors.mutedForeground}15` }}
                >
                  <Ionicons name="receipt-outline" size={36} color={colors.mutedForeground} />
                </View>
                <Text className="text-foreground text-xl font-bold mb-3">No Transactions</Text>
                <Text className="text-muted-foreground text-center text-sm leading-6">
                  Your transaction history will appear here once you start making transactions
                </Text>
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default ListTransactions;

const SkeletonTransactionItem = ({ colors }: { colors: any }) => {
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className="bg-card rounded-3xl p-5 mb-4 flex-row items-center justify-between border border-border/50"
    >
      <View className="flex-row items-center flex-1">
        <View
          className="w-12 h-12 rounded-full mr-4"
          style={{ backgroundColor: `${colors.mutedForeground}15` }}
        />
        <View className="flex-1">
          <View
            className="h-4 rounded-md mb-2"
            style={{ backgroundColor: `${colors.mutedForeground}15`, width: '70%' }}
          />
          <View
            className="h-3 rounded-md"
            style={{ backgroundColor: `${colors.mutedForeground}10`, width: '40%' }}
          />
        </View>
      </View>
      <View className="items-end">
        <View
          className="h-6 rounded-full mb-2"
          style={{ backgroundColor: `${colors.mutedForeground}15`, width: 60 }}
        />
        <View
          className="h-4 rounded-md"
          style={{ backgroundColor: `${colors.mutedForeground}10`, width: 50 }}
        />
      </View>
    </Animated.View>
  );
};
