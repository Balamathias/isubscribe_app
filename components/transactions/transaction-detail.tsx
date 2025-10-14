import { COLORS } from '@/constants/colors';
import { useGetTransaction } from '@/services/api-hooks';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Platform, ScrollView, Share, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const pins: string[] = (transaction?.meta_data && typeof transaction.meta_data === 'object' && !Array.isArray(transaction.meta_data) && 'pins' in transaction.meta_data) ? transaction.meta_data.pins as string[] : [];
  const cards: { Serial: string, Pin: string }[] = (transaction?.meta_data && typeof transaction.meta_data === 'object' && !Array.isArray(transaction.meta_data) && 'cards' in transaction.meta_data) ? transaction.meta_data.cards as { Serial: string, Pin: string }[] : [];

  const captureReceipt = async (): Promise<string | null> => {
    if (!viewShotRef.current) return null;
    const uri = await viewShotRef.current.capture?.();
    return uri || null;
  };

  const shareImage = async (localPath: string) => {
    try {
      let shareUri = localPath;
      if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(localPath);
        if (contentUri) shareUri = contentUri;
      }
      await Share.share({
        url: shareUri,
        message: `Transaction Receipt`,
        title: 'Transaction Receipt'
      });
    } catch (e) {
      throw e;
    }
  };

  const saveToGallery = async (localPath: string) => {
    try {
      // Use the share API instead of requesting media permissions
      // This opens the system share dialog where users can save to Files/Photos
      await shareImage(localPath);
      Toast.show({
        type: 'info',
        text1: 'Choose destination',
        text2: 'Select where to save your receipt'
      });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: e?.message || 'Try again' });
    }
  };

  const handleShareReceipt = async () => {
    if (!transaction) {
      Alert.alert('Error', 'Receipt not ready.');
      return;
    }
    setIsCapturing(true);
    try {
      const uri = await captureReceipt();
      if (!uri) throw new Error('Capture failed');
      await shareImage(uri);
    } catch (e) {
      Alert.alert('Share Failed', 'Unable to share receipt.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSaveReceipt = async () => {
    if (!transaction) return;
    setIsCapturing(true);
    try {
      const uri = await captureReceipt();
      if (!uri) throw new Error('Capture failed');
      await saveToGallery(uri);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: e?.message || 'Try again' });
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
      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <Header title={"Transaction Details"} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-card rounded-3xl p-10 items-center border border-border/50">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="text-foreground font-medium mt-5">Loading transaction details...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!transaction) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <Header title={"Transaction Details"} />
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-card rounded-3xl p-10 items-center border border-border/50">
            <View className="w-20 h-20 rounded-full items-center justify-center mb-5" style={{ backgroundColor: `${colors.mutedForeground}15` }}>
              <Ionicons name="receipt-outline" size={32} color={colors.mutedForeground} />
            </View>
            <Text className="text-foreground text-xl font-bold mb-3">Transaction Not Found</Text>
            <Text className="text-muted-foreground text-center text-sm leading-6 mb-7">
              We couldn't find the transaction you're looking for. It may have been deleted or you may not have permission to view it.
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.8}
              className="rounded-2xl overflow-hidden"
            >
              <LinearGradient
                colors={[colors.primary, '#e65bf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-8 py-4 flex-row items-center"
              >
                <Ionicons name='arrow-back' color={'white'} size={20} />
                <Text className="text-white font-semibold ml-2.5 text-base">Go Back</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
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
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <Header title={transaction.title} />
      
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Status Card */}
        <View className="px-5 pt-6">
          <View className="bg-card rounded-3xl p-8 mb-5 border border-border/50">
            <View className="items-center">
              <View
                className="w-24 h-24 rounded-full items-center justify-center mb-5"
                style={{ backgroundColor: `${getStatusColor(transaction?.status || '')}15` }}
              >
                <Ionicons
                  name={getStatusIcon(transaction?.status || '')}
                  size={44}
                  color={getStatusColor(transaction?.status || '')}
                />
              </View>

              <Text className="text-4xl font-bold text-foreground mb-3" style={{ letterSpacing: -0.5 }}>
                {(transaction?.type === 'cashback' && transaction.meta_data && typeof transaction.meta_data === 'object' && 'data_bonus' in transaction.meta_data)
                  ? String(transaction?.meta_data?.data_bonus)
                  : formatNigerianNaira(transaction?.amount || 0)
                }
              </Text>

              <View
                className="px-5 py-2.5 rounded-full"
                style={{ backgroundColor: `${getStatusColor(transaction?.status || '')}15` }}
              >
                <Text
                  className="font-semibold capitalize text-sm tracking-wide"
                  style={{ color: getStatusColor(transaction?.status || '') }}
                >
                  {transaction.status}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Details Card */}
        <View className="px-5">
          <View className="bg-card rounded-3xl p-6 mb-5 border border-border/50">
            <View className="flex-row items-center mb-5">
              <View className="w-10 h-10 rounded-full items-center justify-center">
                <Ionicons name="document-text" size={20} color={colors.primary} />
              </View>
              <Text className="text-lg font-bold text-foreground ml-3">Transaction Details</Text>
            </View>

            <View className="space-y-4">
              {transaction.transaction_id && (
                <View className="flex-row justify-between items-center py-3">
                  <Text className="text-muted-foreground text-sm font-medium">Reference</Text>
                  <Text className="text-foreground font-semibold text-right flex-1 ml-4" numberOfLines={1}>
                    {transaction.transaction_id}
                  </Text>
                </View>
              )}

              <View className="h-px bg-border/30" />

              <View className="flex-row justify-between items-center py-3">
                <Text className="text-muted-foreground text-sm font-medium">Transaction ID</Text>
                <Text className="text-foreground font-semibold">{transaction.id}</Text>
              </View>

              <View className="h-px bg-border/30" />

              <View className="flex-row justify-between items-center py-3">
                <Text className="text-muted-foreground text-sm font-medium">Date & Time</Text>
                <Text className="text-foreground font-semibold">
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                </Text>
              </View>

              <View className="h-px bg-border/30" />

              <View className="flex-row justify-between items-center py-3">
                <Text className="text-muted-foreground text-sm font-medium">Amount</Text>
                <Text className="text-foreground font-bold text-lg">{formatNigerianNaira(transaction.amount || 0)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Service Details Card - Only show if meta_data exists */}
        {transaction.meta_data && typeof transaction.meta_data === 'object' && (
          <View className="px-5">
            <View className="bg-card rounded-3xl p-6 mb-5 border border-border/50">
              <View className="flex-row items-center mb-5">
                <View className="w-10 h-10 rounded-full items-center justify-center">
                  <Ionicons name="information-circle" size={20} color={colors.primary} />
                </View>
                <Text className="text-lg font-bold text-foreground ml-3">Service Details</Text>
              </View>
              
              <View className="space-y-4">
                {'phone' in transaction.meta_data && (
                  <>
                    <View className="flex-row justify-between items-center py-3">
                      <Text className="text-muted-foreground text-sm font-medium">Phone Number</Text>
                      <Text className="text-foreground font-semibold">{String(transaction.meta_data.phone)}</Text>
                    </View>
                    <View className="h-px bg-border/30" />
                  </>
                )}

                {'network' in transaction.meta_data && (
                  <>
                    <View className="flex-row justify-between items-center py-3">
                      <Text className="text-muted-foreground text-sm font-medium">Network</Text>
                      <Text className="text-foreground font-semibold capitalize">{String(transaction.meta_data.network)}</Text>
                    </View>
                    <View className="h-px bg-border/30" />
                  </>
                )}

                {'quantity' in transaction.meta_data && (
                  <>
                    <View className="flex-row justify-between items-center py-3">
                      <Text className="text-muted-foreground text-sm font-medium">Quantity</Text>
                      <Text className="text-foreground font-semibold">{String(transaction.meta_data.quantity)}</Text>
                    </View>
                    <View className="h-px bg-border/30" />
                  </>
                )}

                {'data_bonus' in transaction.meta_data && (
                  <>
                    <View className="flex-row justify-between items-center py-3">
                      <Text className="text-muted-foreground text-sm font-medium">Data Bonus</Text>
                      <Text className="text-foreground font-semibold">{String(transaction.meta_data.data_bonus)}</Text>
                    </View>
                    <View className="h-px bg-border/30" />
                  </>
                )}

                {'token' in transaction.meta_data && (
                  <View className="bg-muted/20 rounded-2xl p-4 mt-2 border border-border/30">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-muted-foreground text-sm font-medium">Token</Text>
                      <TouchableOpacity
                        onPress={() => {
                          Clipboard.setStringAsync(String((transaction?.meta_data as any)?.token));
                          Toast.show({ type: 'success', text1: 'Token copied!' });
                        }}
                        className="flex-row items-center px-3 py-2 rounded-xl"
                       
                      >
                        <Ionicons name="copy" size={14} color={colors.primary} />
                        <Text className="text-primary text-xs font-semibold ml-1.5">Copy</Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-foreground font-mono text-sm leading-5" numberOfLines={3}>
                      {String(transaction?.meta_data?.formatted_token || transaction?.meta_data?.token)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Description Card - Only show if description exists */}
        {transaction.description && (
          <View className="px-5">
            <View className="bg-card rounded-3xl p-6 mb-5 border border-border/50">
              <View className="flex-row items-center mb-4">
                <View className="w-10 h-10 rounded-full items-center justify-center">
                  <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
                </View>
                <Text className="text-lg font-bold text-foreground ml-3">Description</Text>
              </View>
              <Text className="text-foreground leading-6 text-sm">{transaction.description}</Text>
            </View>
          </View>
        )}

        {/* Education Results Card - Show pins and cards when available */}
        {(pins.length > 0 || cards.length > 0) && (
          <View className="px-5">
            <View className="bg-card rounded-3xl p-6 mb-5 border border-border/50">
              <View className="flex-row items-center mb-5">
                <View className="w-10 h-10 rounded-full items-center justify-center">
                  <Ionicons name="school" size={20} color={colors.primary} />
                </View>
                <Text className="text-lg font-bold text-foreground ml-3">Education Results</Text>
              </View>
              
              {/* UTME/JAMB Pins */}
              {pins.length > 0 && (
                <View className="mb-6">
                  <Text className="text-muted-foreground text-sm font-semibold mb-4 uppercase tracking-wide">JAMB Pins</Text>
                  {pins.map((pin, index) => (
                    <View key={index} className="bg-muted/20 rounded-2xl p-4 mb-3 border border-border/30">
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-foreground font-semibold text-base">{`Pin ${index + 1}`}</Text>
                          <Text className="text-muted-foreground text-xs mt-0.5">Tap to copy</Text>
                        </View>
                        <TouchableOpacity
                          onPress={async () => {
                            await Clipboard.setStringAsync(pin);
                            Toast.show({
                              type: 'success',
                              text1: 'Pin copied!',
                              text2: `Pin ${index + 1} copied to clipboard`
                            });
                          }}
                          activeOpacity={0.7}
                          className="flex-row items-center px-3 py-2 rounded-xl"
                         
                        >
                          <Text className="text-primary font-bold text-lg mr-2">{pin}</Text>
                          <Ionicons name="copy-outline" size={16} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* WAEC Cards */}
              {cards.length > 0 && (
                <View>
                  <Text className="text-muted-foreground text-sm font-semibold mb-4 uppercase tracking-wide">WAEC Cards</Text>
                  {cards.map((card, index) => (
                    <View key={index} className="bg-muted/20 rounded-2xl p-4 mb-3 border border-border/30">
                      <Text className="text-foreground font-semibold text-base mb-4">{`Card ${index + 1}`}</Text>

                      {/* Serial Number */}
                      <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-border/20">
                        <Text className="text-muted-foreground text-sm font-medium">Serial Number</Text>
                        <TouchableOpacity
                          onPress={async () => {
                            await Clipboard.setStringAsync(card.Serial);
                            Toast.show({
                              type: 'success',
                              text1: 'Serial copied!',
                              text2: 'Serial number copied to clipboard'
                            });
                          }}
                          activeOpacity={0.7}
                          className="flex-row items-center px-3 py-2 rounded-xl"
                         
                        >
                          <Text className="text-primary font-bold text-base mr-2">{card.Serial}</Text>
                          <Ionicons name="copy-outline" size={14} color={colors.primary} />
                        </TouchableOpacity>
                      </View>

                      {/* Pin */}
                      <View className="flex-row justify-between items-center">
                        <Text className="text-muted-foreground text-sm font-medium">Pin</Text>
                        <TouchableOpacity
                          onPress={async () => {
                            await Clipboard.setStringAsync(card.Pin);
                            Toast.show({
                              type: 'success',
                              text1: 'Pin copied!',
                              text2: 'Pin copied to clipboard'
                            });
                          }}
                          activeOpacity={0.7}
                          className="flex-row items-center px-3 py-2 rounded-xl"
                         
                        >
                          <Text className="text-primary font-bold text-base mr-2">{card.Pin}</Text>
                          <Ionicons name="copy-outline" size={14} color={colors.primary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Info note */}
              <View className="rounded-2xl p-4 mt-2 border border-primary/20" style={{ backgroundColor: `${colors.primary}08` }}>
                <View className="flex-row items-center">
                  <Ionicons name="information-circle" size={18} color={colors.primary} />
                  <Text className="text-primary text-xs font-medium ml-2 flex-1">
                    Keep these credentials safe and secure for exam registration
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Receipt Section - Hidden from user but captured for sharing */}
        <ViewShot 
          ref={viewShotRef} 
          options={{ 
            format: 'png', 
            quality: 1.0,
            result: 'tmpfile',
            width: width - 32,
            height: undefined,
          }}
          style={{ position: 'absolute', left: -9999 }}
        >
          <View style={{ 
            padding: 20,
            minHeight: 600,
            backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
            width: width - 32
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

        {/* Action Buttons */}
        <View className="px-5 gap-y-3">
          <TouchableOpacity
            className="w-full rounded-3xl overflow-hidden"
            activeOpacity={0.8}
            onPress={handleShareReceipt}
            disabled={isCapturing}
          >
            <LinearGradient
              colors={['#7B2FF2', '#a865f5', '#FF6B9D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-5 items-center justify-center"
            >
              <View className="flex-row items-center">
                {isCapturing ? (
                  <>
                    <ActivityIndicator color="white" size="small" />
                    <Text className="text-white font-bold text-base ml-2">Preparing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="share" size={22} color="white" />
                    <Text className="text-white font-bold text-base ml-2.5">Share Receipt</Text>
                  </>
                )}
              </View>
              {!isCapturing && (
                <Text className="text-white/70 text-xs mt-1.5">Send without saving</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full rounded-3xl py-5 bg-card border border-border/50"
            activeOpacity={0.8}
            onPress={handleSaveReceipt}
            disabled={isCapturing}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="download" size={22} color={colors.primary} />
              <Text className="text-primary font-bold text-base ml-2.5">
                {isCapturing ? 'Saving...' : 'Save to Gallery'}
              </Text>
            </View>
            {!isCapturing && (
              <Text className="text-muted-foreground text-xs text-center mt-1.5">
                Save using system share options
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full rounded-3xl py-5 bg-card border border-border/50"
            activeOpacity={0.8}
            onPress={handleCopyTransactionDetails}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="copy" size={22} color={colors.primary} />
              <Text className="text-primary font-bold text-base ml-2.5">Copy Details</Text>
            </View>
            <Text className="text-muted-foreground text-xs text-center mt-1.5">Copy to clipboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetail;