import { TransactionItem, formatDate, getItemConfig } from '@/components/home/recent-transactions';
import { useSession } from '@/components/session-context';
import { COLORS } from '@/constants/colors';
import { getTransactions } from '@/services/api';
import { Tables } from '@/types/database';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { useInfiniteQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';

const TRANSACTIONS_PER_PAGE = 40;

const ListTransactions = () => {
  const { user } = useSession();

  const {
    data,
    isPending,
    isRefetching,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['transactions'],
    queryFn: ({ pageParam = 0 }) => getTransactions(TRANSACTIONS_PER_PAGE, pageParam * TRANSACTIONS_PER_PAGE),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
        if (lastPage?.next) {
          return parseInt(lastPage.next)
        }
        return undefined
      },
  });

  const transactions = data?.pages?.flatMap((page, index) => 
    (page.data || [])) || [];

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

  // if (isPending) {
  //   return (
  //     <View className="flex-1 items-center justify-center">
  //       <ActivityIndicator size="large" color={COLORS.light.primary} />
  //     </View>
  //   );
  // }


  if (isPending || isRefetching) {
  return (
    <View className="flex-1 px-4 py-6">
      {[...Array(20)].map((_, index) => (
        <SkeletonTransactionItem key={index} />
      ))}
    </View>
  );
}


  if (!user) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Ionicons name="log-in-outline" size={48} color="#6b7280" />
        <Text className="text-muted-foreground text-lg font-semibold mt-4 mb-2">Sign in to view transactions</Text>
        <TouchableOpacity 
          onPress={() => router.push('/auth/login')}
          className="bg-primary px-6 py-3 rounded-2xl flex flex-row gap-x-1 items-center"
        >
          <Ionicons name='log-in-outline' color={'white'} size={18} />
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color={COLORS.light.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-4">
            <Ionicons name="receipt-outline" size={48} color={COLORS.light.mutedForeground} />
            <Text className="text-muted-foreground text-lg font-semibold mt-4">No transactions found</Text>
          </View>
        }
      />
    </View>
  );
};

export default ListTransactions;



const SkeletonTransactionItem = () => {
  return (
    <View className="flex-row items-center space-x-4 mb-6 gap-3 w-full justify-between">
      <View className="w-10 h-10 rounded-full bg-gray-300/60 animate-pulse" />
      <View className="flex-1 space-y-2 gap-2 w-full">
        <View className="w-full h-4 bg-gray-300/60 rounded-md animate-pulse" />
        <View className="w-3/4 h-3 bg-gray-200/60 rounded-md animate-pulse" />
      </View>
    </View>
  );
};
