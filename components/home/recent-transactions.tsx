import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TransactionItemProps {
  icon: string;
  iconColor: string;
  title: string;
  date: string;
  status: string;
  amount: string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  icon, iconColor, title, date, status, amount
}) => {
  return (
    <TouchableOpacity 
        activeOpacity={0.7} 
        className="bg-card p-4 rounded-xl mb-3 flex-row items-center justify-between shadow-sm"
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
        <View className="bg-green-100 dark:bg-green-900 px-3 py-1 rounded-full">
          <Text className="text-green-600 dark:text-green-300 text-xs font-medium capitalize">{status}</Text>
        </View>
        <Text className="text-foreground font-semibold text-sm mt-1">{amount}</Text>
      </View>
    </TouchableOpacity>
  );
};

const RecentTransactions = () => {
  const transactions = [
    {
      type: 'transaction',
      icon: 'gift',
      iconColor: '#FF6347',
      title: 'Data Bonus',
      date: '05/06/25, 7:10 pm.',
      status: 'success',
      amount: '11.03 MB',
    },
    {
      type: 'transaction',
      icon: 'phone-portrait',
      iconColor: '#32CD32',
      title: 'Data Subscription',
      date: '05/06/25, 7:10 pm.',
      status: 'success',
      amount: '₦365.00',
    },
    {
      type: 'transaction',
      icon: 'gift',
      iconColor: '#FF6347',
      title: 'Data Bonus',
      date: '04/06/25, 10:16 pm.',
      status: 'success',
      amount: '11.03 MB',
    },
  ];

  return (
    <View className="mt-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-foreground font-bold text-lg">Recent Transactions</Text>
        <TouchableOpacity>
          <Text className="text-primary font-semibold text-sm">See All</Text>
        </TouchableOpacity>
      </View>
      <View>
        {transactions.map((item, index) => (
          item.type === 'transaction' ? (
            <TransactionItem
              key={index}
              icon={item.icon}
              iconColor={item.iconColor}
              title={item.title}
              date={item.date}
              status={item.status}
              amount={item.amount}
            />
          ) : null
        ))}
      </View>
    </View>
  );
};

export default RecentTransactions;