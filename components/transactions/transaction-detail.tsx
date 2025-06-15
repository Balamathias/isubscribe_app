import React, { useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Share, Platform, Alert } from 'react-native';
import { useGetTransaction } from '@/services/account-hooks';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { format } from 'date-fns';
import Header from './header';
import ViewShot from 'react-native-view-shot';

const TransactionDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];
  const viewShotRef = useRef<ViewShot>(null);

  const { data, isLoading } = useGetTransaction(id as string);

  const transaction = data?.data;

  const handleShareReceipt = async () => {
    try {
      if (!viewShotRef.current) return;
  
      const uri = await viewShotRef?.current?.capture?.();
  
      if (!uri) {
        Alert.alert('Error', 'Could not capture the receipt. Try again.');
        return;
      }
  
      const shareOptions: any = {
        title: 'Transaction Receipt',
        message: `Transaction Receipt for ${transaction?.title}`,
      };
  
      if (Platform.OS === 'android') {
        shareOptions.url = 'file://' + uri;
      } else {
        shareOptions.url = uri;
      }
  
      await Share.share(shareOptions);
    } catch (error) {
      console.error('Error sharing receipt:', error);
      Alert.alert(
        'Error',
        'Failed to share receipt. Please try again later.'
      );
    }
  };
  

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Ionicons name="receipt-outline" size={48} color="#6b7280" />
        <Text className="text-foreground text-lg font-semibold mt-4 mb-2">Transaction Not Found</Text>
        <Text className="text-muted-foreground text-center">
          We couldn't find the transaction you're looking for. It may have been deleted or you may not have permission to view it.
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-xl flex flex-row gap-x-1 items-center mt-6"
        >
          <Ionicons name='arrow-back' color={'white'} size={18} />
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return '#11c028';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return colors.primary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'checkmark-circle';
      case 'failed':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="p-4">
          <Header title={transaction.title} />

          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9, result: 'tmpfile' }}>
            <View>
              <View className="items-center mb-8">
                <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4">
                  <Ionicons 
                    name={getStatusIcon(transaction?.status || '')} 
                    size={40} 
                    color={getStatusColor(transaction?.status || '')} 
                  />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-2">
                  {formatNigerianNaira(transaction?.amount || 0)}
                </Text>
                <Text className="text-muted-foreground capitalize">
                  {transaction.status}
                </Text>
              </View>

              <View className="space-y-6">
                <View className="bg-card rounded-xl p-6">
                  <Text className="text-lg font-semibold text-foreground mb-8">
                    Transaction Details
                  </Text>
                  
                  <View className="flex flex-col gap-6">
                    {transaction.transaction_id && <View className="flex-row justify-between items-center">
                      <Text className="text-muted-foreground text-sm">Reference</Text>
                      <Text className="text-foreground font-medium">{transaction.transaction_id}</Text>
                    </View>}

                    <View className="flex-row justify-between items-center">
                      <Text className="text-muted-foreground text-sm">Transaction ID</Text>
                      <Text className="text-foreground font-medium">{transaction.id}</Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-muted-foreground text-sm">Date</Text>
                      <Text className="text-foreground font-medium">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </Text>
                    </View>

                    <View className="flex-row justify-between items-center">
                      <Text className="text-muted-foreground text-sm">Amount</Text>
                      <Text className="text-foreground font-medium">{formatNigerianNaira(transaction.amount || 0)}</Text>
                    </View>

                    {transaction.meta_data && typeof transaction.meta_data === 'object' && 'quantity' in transaction.meta_data && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-muted-foreground text-sm">Quantity</Text>
                        <Text className="text-foreground font-medium">{String(transaction.meta_data.quantity)}</Text>
                      </View>
                    )}

                    {transaction.meta_data && typeof transaction.meta_data === 'object' && 'data_bonus' in transaction.meta_data && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-muted-foreground text-sm">Data Bonus</Text>
                        <Text className="text-foreground font-medium">{String(transaction.meta_data.data_bonus)}</Text>
                      </View>
                    )}

                    {transaction.meta_data && typeof transaction.meta_data === 'object' && 'phone' in transaction.meta_data && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-muted-foreground text-sm">Phone Number</Text>
                        <Text className="text-foreground font-medium">{String(transaction.meta_data.phone)}</Text>
                      </View>
                    )}

                    {transaction.meta_data && typeof transaction.meta_data === 'object' && 'network' in transaction.meta_data && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-muted-foreground text-sm">Network</Text>
                        <Text className="text-foreground font-medium">{String(transaction.meta_data.network)}</Text>
                      </View>
                    )}

                    {transaction.description && (
                      <View className="flex-row justify-between items-start">
                        <Text className="text-muted-foreground text-sm">Description</Text>
                        <Text className="text-foreground font-medium flex-1 text-right ml-4">{transaction.description}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </ViewShot>
        </View>
      </ScrollView>

      <View className="p-4">
        <TouchableOpacity
          className="w-full rounded-xl py-4 overflow-hidden"
          activeOpacity={0.7}
          onPress={handleShareReceipt}
        >
          <LinearGradient
            colors={[colors.primary, colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="absolute inset-0"
          />
          <Text className="text-white text-center font-bold text-lg">
            Share Receipt
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TransactionDetail;