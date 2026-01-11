import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, useColorScheme } from 'react-native';
import { useGetRecentDataPurchases, useProcessTransaction, useVerifyPin, useGetWalletBalance } from '@/services/api-hooks';
import { useSession } from '@/components/session-context';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { formatNigerianNaira } from '@/utils/format-naira';
import BottomSheet from '@/components/ui/bottom-sheet';
import PinPad from '@/components/pin-pad';
import StatusModal from '@/components/status-modal';
import LoadingSpinner from '@/components/ui/loading-spinner';
import { RecentDataPurchase } from '@/services/api';
import { router } from 'expo-router';

const NETWORK_LOGOS: Record<string, any> = {
    mtn: require('@/assets/services/mtn.png'),
    glo: require('@/assets/services/glo.png'),
    airtel: require('@/assets/services/airtel.png'),
    '9mobile': require('@/assets/services/9mobile.png'),
    etisalat: require('@/assets/services/9mobile.png'),
};

const NETWORK_COLORS: Record<string, string> = {
    mtn: '#FFCC00',
    glo: '#00A651',
    airtel: '#E40000',
    '9mobile': '#006B53',
    etisalat: '#006B53',
};

const QuickDataBuy = () => {
    const { data: recentPurchasesResponse, isLoading } = useGetRecentDataPurchases();
    const { mutateAsync: processTransaction, isPending: isProcessing, data: transactionData, error: transactionError } = useProcessTransaction();
    const { data: walletData } = useGetWalletBalance();
    const balance = walletData?.data?.balance || 0;
    const { mutateAsync: verifyPinMutation } = useVerifyPin();
    const { refetchBalance, refetchTransactions } = useSession();
    const { authenticate, isBiometricEnabled } = useLocalAuth();

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = COLORS[isDark ? 'dark' : 'light'];

    const [selectedPurchase, setSelectedPurchase] = useState<RecentDataPurchase | null>(null);
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [isPinPadVisible, setPinPadVisible] = useState(false);
    const [isStatusModalVisible, setStatusModalVisible] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    const insufficientFunds = selectedPurchase ? balance < selectedPurchase.amount : false;
    const purchases = recentPurchasesResponse?.data || [];

    if (!isLoading && purchases.length === 0) {
        return null;
    }

    const handleSelect = (purchase: RecentDataPurchase) => {
        setSelectedPurchase(purchase);
        setConfirmModalVisible(true);
    };

    const processPurchase = async () => {
        if (!selectedPurchase) return;

        const payload = {
            phone: selectedPurchase.phone,
            payment_method: 'wallet',
            category: selectedPurchase.category,
            plan_id: selectedPurchase.plan_id,
            channel: 'data_bundle',
        };

        setConfirmModalVisible(false);

        await processTransaction(payload, {
            onSuccess: (data) => {
                setStatusModalVisible(true);
                if (data?.data?.status === 'success' || data?.data?.status === 'pending') {
                    refetchBalance();
                    refetchTransactions();
                }
            },
            onError: () => {
                setStatusModalVisible(true);
            },
        });
    };

    const handlePinSubmit = async (pin: string) => {
        setLoadingText('Verifying PIN...');
        try {
            const pinRequest = await verifyPinMutation({ pin });
            if (pinRequest?.data?.is_valid) {
                setLoadingText('Verified');
                return true;
            } else {
                setLoadingText('Verification failed');
                return false;
            }
        } catch {
            setLoadingText('Verification failed');
            return false;
        }
    };

    const handleConfirmPurchase = async () => {
        if (!selectedPurchase) return;

        if (isBiometricEnabled) {
            setConfirmModalVisible(false);
            try {
                const authenticated = await authenticate();
                if (authenticated) {
                    await processPurchase();
                } else {
                    setPinPadVisible(true);
                }
            } catch {
                setPinPadVisible(true);
            }
        } else {
            setConfirmModalVisible(false);
            setPinPadVisible(true);
        }
    };

    // Loading skeleton
    if (isLoading) {
        return (
            <View className="mb-5 mt-4">
                <View className="flex-row items-center justify-between mb-4">
                    <View
                        className="h-5 w-28 rounded-lg"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
                    />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {[1, 2, 3].map((i) => (
                        <View
                            key={i}
                            className="w-[150px] h-[130px] mr-3 rounded-2xl"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}
                        />
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View className="mb-5 mt-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <Ionicons name="flash" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text className="font-bold text-base" style={{ color: isDark ? '#fff' : '#111' }}>
                        Quick Buy
                    </Text>
                </View>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => router.push('/services/data' as any)}
                >
                    <Text
                        className="text-xs font-medium"
                        style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
                    >
                        Buy new
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Cards */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 16 }}
            >
                {purchases.map((purchase) => {
                    const networkColor = NETWORK_COLORS[purchase.network.toLowerCase()] || colors.primary;

                    return (
                        <TouchableOpacity
                            key={purchase.id}
                            onPress={() => handleSelect(purchase)}
                            activeOpacity={0.85}
                            className="w-[155px] mr-3 rounded-2xl p-4"
                            style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            }}
                        >
                            {/* Top Row - Logo & Network Badge */}
                            <View className="flex-row items-center justify-between mb-3">
                                <View
                                    className="w-9 h-9 rounded-xl items-center justify-center overflow-hidden"
                                    style={{ backgroundColor: '#fff' }}
                                >
                                    <Image
                                        source={NETWORK_LOGOS[purchase.network.toLowerCase()] || NETWORK_LOGOS.mtn}
                                        style={{ width: 28, height: 28 }}
                                        resizeMode="contain"
                                    />
                                </View>
                                <View
                                    className="px-2 py-1 rounded-full"
                                    style={{ backgroundColor: networkColor + '15' }}
                                >
                                    <Text
                                        className="text-[9px] font-bold uppercase"
                                        style={{ color: networkColor }}
                                    >
                                        {purchase.network}
                                    </Text>
                                </View>
                            </View>

                            {/* Plan Info */}
                            <View className="mb-3">
                                <Text
                                    className="font-bold text-sm mb-0.5"
                                    style={{ color: isDark ? '#fff' : '#111' }}
                                    numberOfLines={1}
                                >
                                    {purchase.meta_data?.plan_name || purchase.plan_name || 'Data Plan'}
                                </Text>
                                <Text
                                    className="text-[11px]"
                                    style={{ color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)' }}
                                    numberOfLines={1}
                                >
                                    {purchase.phone}
                                </Text>
                            </View>

                            {/* Bottom Row - Price & Arrow */}
                            <View className="flex-row items-center justify-between">
                                <Text className="font-bold text-sm" style={{ color: colors.primary }}>
                                    {formatNigerianNaira(purchase.amount)}
                                </Text>
                                <View
                                    className="w-7 h-7 rounded-full items-center justify-center"
                                >
                                    <Ionicons name="arrow-forward" size={12} color={colors.primary} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Confirmation Bottom Sheet */}
            <BottomSheet
                isVisible={isConfirmModalVisible}
                onClose={() => setConfirmModalVisible(false)}
                title="Confirm Purchase"
            >
                {selectedPurchase && (
                    <View className="py-2">
                        {/* Summary Card */}
                        <View
                            className="rounded-2xl p-4 mb-5"
                            style={{
                                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                borderWidth: 1,
                                borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                            }}
                        >
                            {/* Network Row */}
                            <View className="flex-row items-center justify-between mb-4">
                                <Text
                                    className="text-sm"
                                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                                >
                                    Network
                                </Text>
                                <View className="flex-row items-center">
                                    <View
                                        className="w-6 h-6 rounded-lg items-center justify-center mr-2 overflow-hidden"
                                        style={{ backgroundColor: '#fff' }}
                                    >
                                        <Image
                                            source={NETWORK_LOGOS[selectedPurchase.network.toLowerCase()]}
                                            style={{ width: 18, height: 18 }}
                                            resizeMode="contain"
                                        />
                                    </View>
                                    <Text
                                        className="font-semibold text-sm capitalize"
                                        style={{ color: isDark ? '#fff' : '#111' }}
                                    >
                                        {selectedPurchase.network}
                                    </Text>
                                </View>
                            </View>

                            {/* Plan Row */}
                            <View className="flex-row items-center justify-between mb-4">
                                <Text
                                    className="text-sm"
                                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                                >
                                    Plan
                                </Text>
                                <Text
                                    className="font-semibold text-sm"
                                    style={{ color: isDark ? '#fff' : '#111' }}
                                >
                                    {selectedPurchase.plan_name}
                                </Text>
                            </View>

                            {/* Phone Row */}
                            <View className="flex-row items-center justify-between mb-4">
                                <Text
                                    className="text-sm"
                                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                                >
                                    Phone
                                </Text>
                                <Text
                                    className="font-semibold text-sm"
                                    style={{ color: isDark ? '#fff' : '#111' }}
                                >
                                    {selectedPurchase.phone}
                                </Text>
                            </View>

                            {/* Amount Row */}
                            <View
                                className="flex-row items-center justify-between pt-4"
                                style={{
                                    borderTopWidth: 1,
                                    borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                }}
                            >
                                <Text
                                    className="text-sm"
                                    style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
                                >
                                    Amount
                                </Text>
                                <Text className="font-bold text-lg" style={{ color: colors.primary }}>
                                    {formatNigerianNaira(selectedPurchase.amount)}
                                </Text>
                            </View>
                        </View>

                        {/* Buttons */}
                        <View className="flex-row gap-x-3">
                            <TouchableOpacity
                                onPress={() => setConfirmModalVisible(false)}
                                activeOpacity={0.8}
                                className="flex-1 py-4 rounded-2xl items-center justify-center"
                                style={{
                                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                }}
                            >
                                <Text
                                    className="font-semibold text-sm"
                                    style={{ color: isDark ? '#fff' : '#111' }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleConfirmPurchase}
                                disabled={insufficientFunds}
                                activeOpacity={0.9}
                                className="flex-1 py-4 rounded-2xl items-center justify-center"
                                style={{
                                    backgroundColor: insufficientFunds
                                        ? isDark
                                            ? 'rgba(255,255,255,0.1)'
                                            : 'rgba(0,0,0,0.08)'
                                        : colors.primary,
                                }}
                            >
                                <Text
                                    className="font-bold text-sm"
                                    style={{
                                        color: insufficientFunds
                                            ? isDark
                                                ? 'rgba(255,255,255,0.4)'
                                                : 'rgba(0,0,0,0.3)'
                                            : '#fff',
                                    }}
                                >
                                    {insufficientFunds ? 'Low Balance' : 'Confirm'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </BottomSheet>

            {/* PIN Pad */}
            <PinPad
                isVisible={isPinPadVisible}
                onClose={() => setPinPadVisible(false)}
                handler={handlePinSubmit}
                loadingText={loadingText}
                onSuccess={async () => {
                    await processPurchase();
                }}
            />

            {/* Status Modal */}
            <StatusModal
                amount={transactionData?.data?.amount || 0}
                quantity={(transactionData?.data as any)?.quantity}
                data_bonus={(transactionData?.data as any)?.data_bonus}
                status={
                    transactionData?.error || transactionError
                        ? 'error'
                        : ((transactionData?.data?.status as any) || 'success')
                }
                isVisible={isStatusModalVisible}
                description={
                    transactionData?.data?.description ||
                    transactionData?.message ||
                    transactionError?.message ||
                    ''
                }
                actionText={transactionData?.error || transactionError ? 'Done' : 'View Receipt'}
                onAction={
                    transactionData?.error || transactionError
                        ? undefined
                        : () => {
                            if (transactionData?.data?.id) {
                                router.push({
                                    pathname: '/transactions/[id]',
                                    params: { id: String(transactionData.data.id) },
                                });
                            }
                        }
                }
                onClose={() => setStatusModalVisible(false)}
                transaction={transactionData?.data}
            />

            {isProcessing && <LoadingSpinner isPending={true} showBg={false} />}
        </View>
    );
};

export default QuickDataBuy;
