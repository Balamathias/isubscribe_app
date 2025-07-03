import { COLORS } from '@/constants/colors';
import { useGetTransaction } from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Platform, ScrollView, Share, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Toast from 'react-native-toast-message';
import ViewShot from 'react-native-view-shot';
import Header from './header';

const TransactionDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];
  const viewShotRef = useRef<ViewShot>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const { width } = Dimensions.get('window');

  const { data, isLoading } = useGetTransaction(id as string);

  const transaction = data?.data;

  const handleShareReceipt = async () => {
    if (!viewShotRef.current || !transaction) {
      Alert.alert('Error', 'Receipt not ready for sharing. Please try again.');
      return;
    }

    setIsCapturing(true);

    try {
      const uri = await viewShotRef?.current?.capture?.();
      
      if (!uri) {
        throw new Error('Failed to capture receipt');
      }

      if (Platform.OS === 'ios') {
        await Share.share({
          url: uri,
          title: 'Transaction Receipt',
          message: `Transaction Receipt for ${transaction.title}`,
        });
      } else {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        
        if (status === 'granted') {
          const asset = await MediaLibrary.createAssetAsync(uri);
          
          await Share.share({
            url: asset.uri,
            title: 'Transaction Receipt',
            message: `Transaction Receipt for ${transaction.title}`,
          });
          
          Toast.show({
            type: 'success',
            text1: 'Receipt saved',
            text2: 'Receipt has been saved to your gallery'
          });
        } else {
          await Share.share({
            url: uri,
            title: 'Transaction Receipt',
            message: `Transaction Receipt for ${transaction.title}`,
          });
        }
      }

    } catch (error) {
      console.error('Error sharing receipt:', error);
      Alert.alert(
        'Sharing Failed',
        'Unable to share receipt. You can copy the transaction details instead.',
        [
          {
            text: 'Copy Details',
            onPress: handleCopyTransactionDetails
          },
          {
            text: 'OK',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyTransactionDetails = async () => {
    if (!transaction) return;

    const transactionDetails = `
Transaction Receipt
------------------
ID: ${transaction.id}
${transaction.transaction_id ? `Reference: ${transaction.transaction_id}` : ''}
Amount: ${formatNigerianNaira(transaction.amount || 0)}
Status: ${transaction.status}
Date: ${format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
${transaction.description ? `Description: ${transaction.description}` : ''}
${transaction.meta_data && typeof transaction.meta_data === 'object' && 'phone' in transaction.meta_data ? `Phone: ${transaction.meta_data.phone}` : ''}
    `.trim();

    await Clipboard.setStringAsync(transactionDetails);
    Toast.show({
      type: 'success',
      text1: 'Copied!',
      text2: 'Transaction details copied to clipboard'
    });
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
          We {"couldn't"} find the transaction {"you're"} looking for. It may have been deleted or you may not have permission to view it.
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
        <View className="p-4 py-0">
          <Header title={transaction.title} />

          <ViewShot 
            ref={viewShotRef} 
            options={{ 
              format: 'png', 
              quality: 1.0,
              result: 'tmpfile',
              width: width - 32,
              height: undefined,
            }}
            style={{ backgroundColor: colors.background }}
          >
            <View style={{ 
              backgroundColor: colors.background, 
              padding: 20,
              minHeight: 600
            }}>
              <View className="items-center mb-6">
                <Text className="text-2xl font-bold text-primary mb-2">isubscribe</Text>
                <Text className="text-muted-foreground text-sm">Transaction Receipt</Text>
                <Text className="text-muted-foreground text-xs">
                  {format(new Date(), 'MMM dd, yyyy HH:mm')}
                </Text>
              </View>

              <View className="items-center mb-8">
                <View className="w-20 h-20 rounded-full bg-secondary items-center justify-center mb-4">
                  <Ionicons 
                    name={getStatusIcon(transaction?.status || '')} 
                    size={40} 
                    color={getStatusColor(transaction?.status || '')} 
                  />
                </View>
                <Text className="text-2xl font-bold text-foreground mb-2">
                  {(transaction?.type === 'cashback' && transaction.meta_data && typeof transaction.meta_data === 'object' && 'data_bonus' in transaction.meta_data) ? String(transaction?.meta_data?.data_bonus) : formatNigerianNaira(transaction?.amount || 0)}
                </Text>
                <Text className="text-muted-foreground capitalize">
                  {transaction.status}
                </Text>
              </View>

              <View className="space-y-6">
                <View className="bg-card rounded-xl p-6">
                  <Text className="text-lg font-semibold text-foreground mb-6">
                    Transaction Details
                  </Text>
                  
                  <View className="flex flex-col gap-4">
                    {transaction.transaction_id && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-muted-foreground text-sm">Reference</Text>
                        <Text className="text-foreground font-medium text-right flex-1 ml-4" numberOfLines={1}>
                          {transaction.transaction_id}
                        </Text>
                      </View>
                    )}

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

                    {transaction.meta_data && typeof transaction.meta_data === 'object' && 'token' in transaction.meta_data && (
                      <View className="flex-row justify-between items-center">
                        <Text className="text-muted-foreground text-sm">Token</Text>
                        <Text className="text-foreground font-medium text-right flex-1 ml-4" numberOfLines={2}>
                          {String(transaction?.meta_data?.formatted_token || transaction?.meta_data?.token)}
                        </Text>
                      </View>
                    )}

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

              <View className="mt-8 pt-4 border-t border-border">
                <Text className="text-center text-muted-foreground text-xs">
                  Thank you for using isubscribe
                </Text>
                <Text className="text-center text-muted-foreground text-xs">
                  For support, contact us at support@isubscribe.ng
                </Text>
              </View>
            </View>
          </ViewShot>

          {transaction.meta_data && typeof transaction.meta_data === 'object' && 'token' in transaction.meta_data && (
            <TouchableOpacity
              onPress={() => {
                Clipboard.setStringAsync(String((transaction?.meta_data as any)?.token));
                Toast.show({ type: 'success', text1: 'Token copied to clipboard!' });
              }}
              activeOpacity={0.7}
              className="mt-4 p-4 bg-card rounded-xl flex-row items-center justify-center"
            >
              <Ionicons name="copy-outline" size={20} color={colors.primary} />
              <Text className="text-primary font-medium ml-2">Copy Token</Text>
            </TouchableOpacity>
          )}
        </View>
        <View className="p-4 space-y-2 flex gap-y-4">
          <TouchableOpacity
            className="w-full rounded-xl py-4 overflow-hidden"
            activeOpacity={0.7}
            onPress={handleShareReceipt}
            disabled={isCapturing}
          >
            <LinearGradient
              colors={[colors.primary, '#e65bf8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute inset-0"
            />
            <View className="flex-row items-center justify-center">
              {isCapturing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Ionicons name="share-outline" size={20} color="white" />
              )}
              <Text className="text-white font-bold text-lg ml-2">
                {isCapturing ? 'Preparing...' : 'Share Receipt'}
              </Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="w-full rounded-xl py-4 border border-primary"
            activeOpacity={0.7}
            onPress={handleCopyTransactionDetails}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="copy-outline" size={20} color={colors.primary} />
              <Text className="text-primary font-bold text-lg ml-2">
                Copy Details
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

    </View>
  );
};

export default TransactionDetail;