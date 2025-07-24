import { Tables } from '@/types/database';
import { EVENT_TYPE } from '@/utils/events';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  useSharedValue,
  withSequence
} from 'react-native-reanimated';
import { useSession } from '../session-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';

interface TransactionItemProps {
  icon: string;
  iconColor: string;
  title: string;
  date: string;
  status: string;
  amount: string;
  type: string | null;
  data_bonus?: string;
  id: number
}

const TransactionSkeleton = () => {
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
      className="bg-card p-4 rounded-xl mb-3 flex-row items-center justify-between shadow-sm"
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full bg-muted mr-3" />
        <View>
          <View className="w-32 h-4 bg-muted rounded-md mb-2" />
          <View className="w-24 h-3 bg-muted rounded-md" />
        </View>
      </View>
      <View className="items-end">
        <View className="w-16 h-5 bg-muted rounded-full mb-2" />
        <View className="w-20 h-4 bg-muted rounded-md" />
      </View>
    </Animated.View>
  );
};


const SkeletonTransactionItem = () => {
  return (
    <View className="flex-row items-center space-x-4 mb-6 gap-3 w-full justify-between">
      <View className="w-10 h-10 rounded-full bg-gray-300 animate-pulse" />
      <View className="flex-1 space-y-2 gap-2 w-full">
        <View className="w-full h-4 bg-gray-300 rounded-md animate-pulse" />
        <View className="w-3/4 h-3 bg-gray-200 animate-pulse" />
      </View>
    </View>
  );
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  icon, iconColor, title, date, status, amount, type, data_bonus, id
}) => {
  return (
    <TouchableOpacity 
        activeOpacity={0.7} 
        className="bg-card p-4 rounded-xl mb-3 flex-row items-center justify-between shadow-sm"
        onPress={() => router.push({
          pathname: '/transactions/[id]',
          params: { id }
      })}
    >
      <View className="flex-row items-center">
        <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: iconColor + '20' }}>
          <Ionicons name={icon as any} size={20} color={iconColor} />
        </View>
        <View>
          <Text className="text-foreground font-semibold text-base">{title}</Text>
          <Text className="text-muted-foreground text-xs">{date}</Text>
        </View>
      </View>
      <View className="items-end">
        <View className={`px-3 py-1 rounded-full ${
          status === 'success' ? 'bg-green-100 dark:bg-green-900' :
          status === 'failed' ? 'bg-red-100 dark:bg-red-900' :
          status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900' :
          'bg-gray-100 dark:bg-gray-900'
        }`}>
          <Text className={`text-xs font-medium capitalize ${
            status === 'success' ? 'text-green-600 dark:text-green-300' :
            status === 'failed' ? 'text-red-600 dark:text-red-300' :
            status === 'pending' ? 'text-yellow-600 dark:text-yellow-300' :
            'text-gray-600 dark:text-gray-300'
          }`}>{status}</Text>
        </View>
        <Text className="text-foreground font-semibold text-sm mt-1">{type === 'cashback' ? (data_bonus || amount) : amount }</Text>
      </View>
    </TouchableOpacity>
  );
};

interface TransactionProps {
  
}

const EmptyState = ({ isAuthenticated, colors }: { isAuthenticated: boolean, colors: any }) => {
  if (!isAuthenticated) {
    return (
      <View className="bg-card shadow-sm p-6 rounded-xl items-center justify-center">
        <Ionicons name="log-in-outline" size={48} color="#6b7280" />
        <Text className="text-muted-foreground text-lg font-semibold mt-4 mb-2">Sign in to view transactions</Text>
        <Text className="text-muted-foreground text-center mb-4 hidden">
          Please sign in to your account to view your transaction history
        </Text>
        <TouchableOpacity 
          onPress={() => router.push('/auth/login')}
          className="bg-primary px-6 py-3 rounded-2xl flex flex-row gap-x-1 items-center overflow-hidden"
        >
          <LinearGradient
                          colors={[colors.primary, '#e65bf8']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="absolute inset-0 rounded-2xl"
                                    />
          <Ionicons name='log-in-outline' color={'white'} size={18} />
          <Text className="text-white font-semibold">Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-card p-6 rounded-xl items-center justify-center">
      <Ionicons name="receipt-outline" size={48} color="#6b7280" />
      <Text className="text-foreground text-lg font-semibold mt-4 mb-2">No transactions yet</Text>
      <Text className="text-muted-foreground text-center">
        Your transaction history will appear here once you start making transactions
      </Text>
    </View>
  );
};

const RecentTransactions = ({}: TransactionProps) => {
  const { user, latestTransactions: loadedTransactions, loadingTransactions } = useSession();
    const colorScheme = useColorScheme()
    const theme = colorScheme === 'dark' ? 'dark' : 'light'
    const colors = COLORS[theme]

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-foreground font-bold text-lg">Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push(`/history`)}>
          <Text className="text-primary font-semibold text-sm">See All</Text>
        </TouchableOpacity>
      </View>
      <View>
        {loadingTransactions ? (
          Array(3).fill(0).map((_, index) => (
            <SkeletonTransactionItem key={index} />
          ))
        ) : !loadedTransactions || loadedTransactions.length === 0 ? (
          <EmptyState isAuthenticated={!!user} colors={colors} />
        ) : (
          loadedTransactions.map((item) => (
            <TransactionItem
              key={item.id}
              icon={getItemConfig(item).icon}
              iconColor={getItemConfig(item).iconColor}
              title={item.title || ''}
              date={formatDate(item.created_at)}
              status={item.status || ''}
              amount={formatNigerianNaira(item?.amount || 0)}
              type={item.type}
              data_bonus={(item?.meta_data as any)?.data_bonus}
              id={item.id}
            />
          ))
        )}
      </View>
    </View>
  );
};

export default RecentTransactions;

export const formatDate = (date: string) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear().toString().slice(-2);
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12;

  return `${day}/${month}/${year}, ${formattedHours}:${minutes} ${ampm}`;
};

export const getItemConfig = (item: Tables<'history'>) => {
  if (item.type === EVENT_TYPE.airtime_topup) {
    return {
      icon: 'wifi',
      iconColor: '#328fcd'
    }
  }

  if (item.type === EVENT_TYPE.data_topup) {
    return {
      icon: 'phone-portrait',
      iconColor: '#32CD32'
    }
  }

  if (item.type === EVENT_TYPE.tv_topup) {
    return {
      icon: 'tv',
      iconColor: '#FF6347'
    }
  }

  if (item.type === EVENT_TYPE.meter_topup) {
    return {
      icon: 'bulb',
      iconColor: '#f3df07'
    }
  }

  if (item.type === EVENT_TYPE.education_topup) {
    return {
      icon: 'school',
      iconColor: '#4169E1'
    }
  }

  if (item.type === EVENT_TYPE.wallet_fund) {
    return {
      icon: 'wallet',
      iconColor: '#FF6347'
    }
  }

  if (item.type === EVENT_TYPE.debit_funds) {
    return {
      icon: 'cash-outline',
      iconColor: '#FF6347'
    }
  }

  if (item.type === EVENT_TYPE.wallet_fund_failed) {
    return {
      icon: 'close-circle',
      iconColor: '#FF0000'
    }
  }

  if (item.type === EVENT_TYPE.cashback) {
    return {
      icon: 'gift',
      iconColor: '#FF6347'
    }
  }

  if (item.type === EVENT_TYPE.reverse_transaction) {
    return {
      icon: 'refresh',
      iconColor: '#FF6347'
    }
  }

  if (item.type === EVENT_TYPE.money_transfer) {
    return {
      icon: 'swap-horizontal',
      iconColor: '#4169E1'
    }
  }

  // Default case
  return {
    icon: 'help-circle',
    iconColor: '#808080'
  }
}