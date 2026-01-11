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
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import ViewShot from 'react-native-view-shot';
import Header from './header';

const { width } = Dimensions.get('window');

// Detail Row Component for cleaner code
const DetailRow = ({
  label,
  value,
  isDark,
  valueStyle,
  copyable,
  onCopy,
  numberOfLines = 1,
}: {
  label: string;
  value: string;
  isDark: boolean;
  valueStyle?: object;
  copyable?: boolean;
  numberOfLines?: number | 'auto';
  onCopy?: () => void;
}) => (
  <View className="flex-row justify-between items-center py-3.5">
    <Text
      className="text-sm"
      style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
    >
      {label}
    </Text>
    <View className="flex-row items-center flex-1 justify-end ml-4">
      <Text
        className="font-semibold text-sm"
        style={[{ color: isDark ? '#fff' : '#111' }, valueStyle]}
        numberOfLines={numberOfLines === 'auto' ? undefined : numberOfLines}
      >
        {value}
      </Text>
      {copyable && (
        <TouchableOpacity onPress={onCopy} activeOpacity={0.7} className="ml-2">
          <Ionicons
            name="copy-outline"
            size={14}
            color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)'}
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const TransactionDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];
  const viewShotRef = useRef<ViewShot>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const { data, isLoading } = useGetTransaction(id as string);
  const transaction = data?.data;

  const pins: string[] =
    transaction?.meta_data &&
      typeof transaction.meta_data === 'object' &&
      !Array.isArray(transaction.meta_data) &&
      'pins' in transaction.meta_data
      ? (transaction.meta_data.pins as string[])
      : [];

  const cards: { Serial: string; Pin: string }[] =
    transaction?.meta_data &&
      typeof transaction.meta_data === 'object' &&
      !Array.isArray(transaction.meta_data) &&
      'cards' in transaction.meta_data
      ? (transaction.meta_data.cards as { Serial: string; Pin: string }[])
      : [];

  const captureReceipt = async (): Promise<string | null> => {
    try {
      if (!viewShotRef.current?.capture) return null;
      return await viewShotRef.current.capture();
    } catch {
      return null;
    }
  };

  const shareImage = async (localPath: string) => {
    try {
      let shareUri = localPath;
      if (Platform.OS === 'android') {
        try {
          const contentUri = await FileSystem.getContentUriAsync(localPath);
          if (contentUri) shareUri = contentUri;
        } catch { }
      }

      const shareOptions =
        Platform.OS === 'ios'
          ? { url: shareUri, title: 'Transaction Receipt' }
          : { url: shareUri, message: 'Transaction Receipt from iSubscribe', title: 'Transaction Receipt' };

      return await Share.share(shareOptions);
    } catch (error) {
      throw error;
    }
  };

  const saveToGallery = async (localPath: string) => {
    try {
      await shareImage(localPath);
      Toast.show({
        type: 'info',
        text1: 'Choose destination',
        text2: 'Select where to save your receipt',
      });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Save failed', text2: e?.message || 'Try again' });
    }
  };

  const handleShareReceipt = async () => {
    if (!transaction || !viewShotRef.current) {
      Alert.alert('Error', 'Receipt not ready. Please try again.');
      return;
    }

    setIsCapturing(true);
    try {
      const uri = await captureReceipt();
      if (!uri) throw new Error('Failed to capture receipt');
      await shareImage(uri);
      Toast.show({ type: 'success', text1: 'Success', text2: 'Receipt shared successfully' });
    } catch (error: any) {
      Alert.alert('Share Failed', error.message || 'Unable to share receipt.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCopyTransactionDetails = async () => {
    if (!transaction) return;

    const transactionDetails = [
      `🧾 TRANSACTION RECEIPT`,
      `--------------------------------`,
      `Amount: ${formatNigerianNaira(transaction.amount || 0)}`,
      `Status: ${(transaction.status || 'pending').toUpperCase()}`,
      `Date: ${format(new Date(transaction.created_at), 'MMM dd, yyyy, hh:mm a')}`,
      ``,
      `Reference: ${transaction.transaction_id || 'N/A'}`,
      `ID: ${transaction.id}`,
      ``,
      transaction.description ? `Description: ${transaction.description}` : null,
      transaction.meta_data && typeof transaction.meta_data === 'object' && 'phone' in transaction.meta_data
        ? `Phone: ${transaction.meta_data.phone}`
        : null,
      transaction.meta_data && typeof transaction.meta_data === 'object' && 'network' in transaction.meta_data
        ? `Network: ${transaction.meta_data.network}`
        : null,
      transaction.meta_data && typeof transaction.meta_data === 'object' && 'token' in transaction.meta_data
        ? `Token: ${transaction.meta_data.token}`
        : null,
      ``,
      `Powered by iSubscribe`,
    ]
      .filter(Boolean)
      .join('\n');

    await Clipboard.setStringAsync(transactionDetails);
    Toast.show({ type: 'success', text1: 'Copied!', text2: 'Transaction details copied to clipboard' });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return '#22c55e';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return colors.primary;
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
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

  const getStatusGradient = (status: string): [string, string] => {
    switch (status?.toLowerCase()) {
      case 'success':
        return ['#22c55e', '#16a34a'];
      case 'failed':
        return ['#ef4444', '#dc2626'];
      case 'pending':
        return ['#f59e0b', '#d97706'];
      default:
        return [colors.primary, '#a855f7'];
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <Header title="Transaction Details" />
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="rounded-3xl p-10 items-center"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              className="font-medium mt-5 text-sm"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
            >
              Loading transaction details...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Not found state
  if (!transaction) {
    return (
      <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
        <Header title="Transaction Details" />
        <View className="flex-1 items-center justify-center px-6">
          <View
            className="rounded-3xl p-10 items-center"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-5"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
            >
              <Ionicons
                name="receipt-outline"
                size={32}
                color={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.25)'}
              />
            </View>
            <Text className="text-xl font-bold mb-3" style={{ color: isDark ? '#fff' : '#111' }}>
              Transaction Not Found
            </Text>
            <Text
              className="text-center text-sm leading-6 mb-7"
              style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
            >
              We couldn't find this transaction. It may have been deleted.
            </Text>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.9} className="rounded-2xl overflow-hidden">
              <LinearGradient
                colors={[colors.primary, '#a855f7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="px-8 py-4 flex-row items-center"
              >
                <Ionicons name="arrow-back" color="white" size={18} />
                <Text className="text-white font-semibold ml-2 text-base">Go Back</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(transaction.status || '');

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <Header title="Receipt" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Status Hero Card */}
        <View className="px-5 pt-5">
          <View
            className="rounded-3xl overflow-hidden mb-5"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            {/* Status Gradient Header */}
            <View
              className="py-8 items-center"
            >
              <View className="w-16 h-16 rounded-full bg-white/20 items-center justify-center mb-4"
                style={{
                  backgroundColor: getStatusColor(transaction?.status || '') +
                    '20'
                }}
              >
                <Ionicons name={getStatusIcon(transaction.status || '')} size={32} color={getStatusColor(transaction.status || '')} />
              </View>
              <Text className="text-3xl font-bold text-white mb-2" style={{ letterSpacing: -0.5 }}>
                {transaction?.type === 'cashback' &&
                  transaction.meta_data &&
                  typeof transaction.meta_data === 'object' &&
                  'data_bonus' in transaction.meta_data
                  ? String(transaction.meta_data.data_bonus)
                  : formatNigerianNaira(transaction.amount || 0)}
              </Text>
              <View className="px-4 py-1.5 rounded-full bg-white/20"
                style={{
                  backgroundColor: getStatusColor(transaction?.status || '') +
                    '20'
                }}
              >
                <Text className="text-white font-semibold text-sm capitalize" style={{ color: getStatusColor(transaction?.status || '') }}>{transaction.status}</Text>
              </View>
            </View>

            {/* Quick Info */}
            <View className="p-5 flex-row">
              <View className="flex-1 items-center">
                <Text
                  className="text-[11px] mb-1"
                  style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
                >
                  Date
                </Text>
                <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                </Text>
              </View>
              <View
                className="w-px"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
              />
              <View className="flex-1 items-center">
                <Text
                  className="text-[11px] mb-1"
                  style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
                >
                  Time
                </Text>
                <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                  {format(new Date(transaction.created_at), 'hh:mm a')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Details Card */}
        <View className="px-5">
          <View
            className="rounded-3xl p-5 mb-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-9 h-9 rounded-xl items-center justify-center mr-3"
              >
                <Ionicons name="receipt-outline" size={18} color={colors.primary} />
              </View>
              <Text className="text-base font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                Transaction Details
              </Text>
            </View>

            <View
              className="rounded-2xl px-4"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
            >
              {transaction.transaction_id && (
                <>
                  <DetailRow
                    label="Reference"
                    value={transaction.transaction_id}
                    isDark={isDark}
                    copyable
                    onCopy={() => {
                      Clipboard.setStringAsync(transaction.transaction_id!);
                      Toast.show({ type: 'success', text1: 'Copied!' });
                    }}
                  />
                  <View
                    className="h-px"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                  />
                </>
              )}
              <DetailRow label="Transaction ID" value={String(transaction.id)} isDark={isDark} />
              <View
                className="h-px"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
              />
              <DetailRow
                label="Amount"
                value={formatNigerianNaira(transaction.amount || 0)}
                isDark={isDark}
                valueStyle={{ color: colors.primary, fontWeight: '700' }}
              />
            </View>
          </View>
        </View>

        {/* Service Details Card */}
        {transaction.meta_data && typeof transaction.meta_data === 'object' && (
          <View className="px-5">
            <View
              className="rounded-3xl p-5 mb-4"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <View className="flex-row items-center mb-4">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: '#3b82f6' + '15' }}
                >
                  <Ionicons name="information-circle-outline" size={18} color="#3b82f6" />
                </View>
                <Text className="text-base font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                  Service Details
                </Text>
              </View>

              <View
                className="rounded-2xl px-4"
                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
              >
                {'phone' in transaction.meta_data && (
                  <>
                    <DetailRow label="Phone Number" value={String(transaction.meta_data.phone)} isDark={isDark} />
                    <View
                      className="h-px"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                    />
                  </>
                )}
                {'network' in transaction.meta_data && (
                  <>
                    <DetailRow
                      label="Network"
                      value={String(transaction.meta_data.network).toUpperCase()}
                      isDark={isDark}
                    />
                    <View
                      className="h-px"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                    />
                  </>
                )}
                {'quantity' in transaction.meta_data && (
                  <>
                    <DetailRow label="Quantity" value={String(transaction.meta_data.quantity)} isDark={isDark} />
                    <View
                      className="h-px"
                      style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                    />
                  </>
                )}
                {'data_bonus' in transaction.meta_data && (
                  <DetailRow
                    label="Data Bonus"
                    value={String(transaction.meta_data.data_bonus)}
                    isDark={isDark}
                    valueStyle={{ color: '#22c55e' }}
                  />
                )}

                {'meter_number' in transaction.meta_data && (
                  <DetailRow
                    label="Meter Number"
                    value={String(transaction.meta_data.meter_number)}
                    isDark={isDark}
                    valueStyle={{ color: '#53ee23' }}
                  />
                )}

                {'provider_name' in transaction.meta_data && (
                  <DetailRow
                    label="Provider"
                    value={String(transaction.meta_data.provider_name)}
                    isDark={isDark}
                  />
                )}

                {'customer_address' in transaction.meta_data && (
                  <DetailRow
                    label="Address"
                    value={String(transaction.meta_data.customer_address)}
                    isDark={isDark}
                    valueStyle={{ color: '#e2d55e' }}
                    numberOfLines={'auto'}
                  />
                )}
              </View>

              {/* Token Display */}
              {'token' in transaction.meta_data && (
                <View
                  className="rounded-2xl p-4 mt-4"
                  style={{
                    backgroundColor: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
                    borderWidth: 1,
                    borderColor: 'rgba(245,158,11,0.2)',
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <Ionicons name="key" size={14} color="#f59e0b" />
                      <Text className="text-amber-600 text-xs font-semibold ml-1.5">Electricity Token</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        Clipboard.setStringAsync(String((transaction.meta_data as any)?.token));
                        Toast.show({ type: 'success', text1: 'Token copied!' });
                      }}
                      activeOpacity={0.7}
                      className="flex-row items-center px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: 'rgba(245,158,11,0.15)' }}
                    >
                      <Ionicons name="copy" size={12} color="#f59e0b" />
                      <Text className="text-amber-600 text-xs font-semibold ml-1">Copy</Text>
                    </TouchableOpacity>
                  </View>
                  <Text
                    className="font-mono text-base leading-6"
                    style={{ color: isDark ? '#fff' : '#111' }}
                    selectable
                  >
                    {String((transaction.meta_data as any)?.formatted_token || (transaction.meta_data as any)?.token)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Description Card */}
        {transaction.description && (
          <View className="px-5">
            <View
              className="rounded-3xl p-5 mb-4"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: '#8b5cf6' + '15' }}
                >
                  <Ionicons name="chatbubble-outline" size={16} color="#8b5cf6" />
                </View>
                <Text className="text-base font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                  Description
                </Text>
              </View>
              <Text className="text-sm leading-6" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}>
                {transaction.description}
              </Text>
            </View>
          </View>
        )}

        {/* Education Results Card */}
        {(pins.length > 0 || cards.length > 0) && (
          <View className="px-5">
            <View
              className="rounded-3xl p-5 mb-4"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              }}
            >
              <View className="flex-row items-center mb-5">
                <View
                  className="w-9 h-9 rounded-xl items-center justify-center mr-3"
                  style={{ backgroundColor: '#ec4899' + '15' }}
                >
                  <Ionicons name="school-outline" size={18} color="#ec4899" />
                </View>
                <Text className="text-base font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                  Education Results
                </Text>
              </View>

              {/* JAMB Pins */}
              {pins.length > 0 && (
                <View className="mb-5">
                  <Text
                    className="text-xs font-semibold mb-3 uppercase tracking-wide"
                    style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
                  >
                    JAMB Pins
                  </Text>
                  {pins.map((pin, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={async () => {
                        await Clipboard.setStringAsync(pin);
                        Toast.show({ type: 'success', text1: 'Pin copied!', text2: `Pin ${index + 1} copied` });
                      }}
                      activeOpacity={0.85}
                      className="rounded-2xl p-4 mb-2 flex-row justify-between items-center"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      }}
                    >
                      <View>
                        <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                          Pin {index + 1}
                        </Text>
                        <Text
                          className="text-xs mt-0.5"
                          style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
                        >
                          Tap to copy
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Text className="font-bold text-base mr-2" style={{ color: colors.primary }}>
                          {pin}
                        </Text>
                        <Ionicons name="copy-outline" size={14} color={colors.primary} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* WAEC Cards */}
              {cards.length > 0 && (
                <View>
                  <Text
                    className="text-xs font-semibold mb-3 uppercase tracking-wide"
                    style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
                  >
                    WAEC Cards
                  </Text>
                  {cards.map((card, index) => (
                    <View
                      key={index}
                      className="rounded-2xl p-4 mb-2"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderWidth: 1,
                        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                      }}
                    >
                      <Text className="font-semibold text-sm mb-3" style={{ color: isDark ? '#fff' : '#111' }}>
                        Card {index + 1}
                      </Text>
                      <TouchableOpacity
                        onPress={async () => {
                          await Clipboard.setStringAsync(card.Serial);
                          Toast.show({ type: 'success', text1: 'Serial copied!' });
                        }}
                        activeOpacity={0.85}
                        className="flex-row justify-between items-center mb-2 pb-2"
                        style={{
                          borderBottomWidth: 1,
                          borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                        }}
                      >
                        <Text
                          className="text-sm"
                          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                        >
                          Serial
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="font-bold text-sm mr-2" style={{ color: colors.primary }}>
                            {card.Serial}
                          </Text>
                          <Ionicons name="copy-outline" size={12} color={colors.primary} />
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={async () => {
                          await Clipboard.setStringAsync(card.Pin);
                          Toast.show({ type: 'success', text1: 'Pin copied!' });
                        }}
                        activeOpacity={0.85}
                        className="flex-row justify-between items-center"
                      >
                        <Text
                          className="text-sm"
                          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                        >
                          Pin
                        </Text>
                        <View className="flex-row items-center">
                          <Text className="font-bold text-sm mr-2" style={{ color: colors.primary }}>
                            {card.Pin}
                          </Text>
                          <Ionicons name="copy-outline" size={12} color={colors.primary} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* Info note */}
              <View
                className="rounded-xl p-3 mt-3 flex-row items-center"
                style={{ backgroundColor: colors.primary + '10' }}
              >
                <Ionicons name="information-circle" size={16} color={colors.primary} />
                <Text className="text-xs font-medium ml-2 flex-1" style={{ color: colors.primary }}>
                  Keep these credentials safe for exam registration
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Hidden Receipt for ViewShot */}
        <ViewShot
          ref={viewShotRef}
          options={{ format: 'png', quality: 1.0, result: 'tmpfile' }}
          style={{ position: 'absolute', left: 0, top: -10000, width: width - 32 }}
        >
          <View style={{ padding: 20, minHeight: 600, backgroundColor: '#ffffff', width: width - 32 }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#7B2FF2', marginBottom: 8 }}>isubscribe</Text>
              <Text style={{ color: '#666', fontSize: 14 }}>Transaction Receipt</Text>
              <Text style={{ color: '#999', fontSize: 12 }}>{format(new Date(), 'MMM dd, yyyy HH:mm')}</Text>
            </View>

            <View style={{ alignItems: 'center', marginBottom: 32 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#F5F5F5',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name={getStatusIcon(transaction?.status || '')} size={40} color={statusColor} />
              </View>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 8 }}>
                {transaction?.type === 'cashback' &&
                  transaction.meta_data &&
                  typeof transaction.meta_data === 'object' &&
                  'data_bonus' in transaction.meta_data
                  ? String(transaction.meta_data.data_bonus)
                  : formatNigerianNaira(transaction?.amount || 0)}
              </Text>
              <Text style={{ color: '#666', textTransform: 'capitalize' }}>{transaction.status}</Text>
            </View>

            <View style={{ gap: 24 }}>
              <View style={{ backgroundColor: '#F9F9F9', borderRadius: 12, padding: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: '#000', marginBottom: 24 }}>
                  Transaction Details
                </Text>
                <View style={{ gap: 16 }}>
                  {transaction.transaction_id && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ color: '#666', fontSize: 14 }}>Reference</Text>
                      <Text
                        style={{ color: '#000', fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 16 }}
                        numberOfLines={1}
                      >
                        {transaction.transaction_id}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Transaction ID</Text>
                    <Text style={{ color: '#000', fontWeight: '500' }}>{transaction.id}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Date</Text>
                    <Text style={{ color: '#000', fontWeight: '500' }}>
                      {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ color: '#666', fontSize: 14 }}>Amount</Text>
                    <Text style={{ color: '#000', fontWeight: '500' }}>
                      {formatNigerianNaira(transaction.amount || 0)}
                    </Text>
                  </View>
                  {transaction.meta_data &&
                    typeof transaction.meta_data === 'object' &&
                    'token' in transaction.meta_data && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 14 }}>Token</Text>
                        <Text
                          style={{ color: '#000', fontWeight: '500', flex: 1, textAlign: 'right', marginLeft: 16 }}
                          numberOfLines={2}
                        >
                          {String(
                            (transaction.meta_data as any)?.formatted_token || (transaction.meta_data as any)?.token
                          )}
                        </Text>
                      </View>
                    )}
                </View>
              </View>
            </View>

            <View style={{ marginTop: 32, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0' }}>
              <Text style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>Thank you for using isubscribe</Text>
              <Text style={{ textAlign: 'center', color: '#666', fontSize: 12 }}>support@isubscribe.ng</Text>
            </View>
          </View>
        </ViewShot>

        {/* Action Buttons */}
        <View className="px-5 pt-4 gap-y-3">
          <TouchableOpacity
            onPress={handleCopyTransactionDetails}
            activeOpacity={0.9}
            className="rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={[colors.primary, '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="py-4 flex-row items-center justify-center"
            >
              <Ionicons name="copy-outline" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Copy Details</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareReceipt}
            activeOpacity={0.85}
            className="rounded-2xl py-4 flex-row items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <Ionicons name="share-outline" size={20} color={isDark ? '#fff' : '#111'} />
            <Text className="font-semibold text-base ml-2" style={{ color: isDark ? '#fff' : '#111' }}>
              Share Receipt
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetail;