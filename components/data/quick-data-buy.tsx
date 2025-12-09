import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useGetRecentDataPurchases, useProcessTransaction, useVerifyPin } from '@/services/api-hooks';
import { useSession } from '@/components/session-context';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { COLORS } from '@/constants/colors';
import { useThemedColors } from '@/hooks/useThemedColors';
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

const QuickDataBuy = () => {
    const { data: recentPurchasesResponse, isLoading } = useGetRecentDataPurchases();
    const { mutateAsync: processTransaction, isPending: isProcessing, data: transactionData, error: transactionError } = useProcessTransaction();
    const { mutateAsync: verifyPinMutation } = useVerifyPin();
    const { refetchBalance, refetchTransactions, user } = useSession();
    const { authenticate, isBiometricEnabled } = useLocalAuth();
    const colors = useThemedColors().colors;

    const [selectedPurchase, setSelectedPurchase] = useState<RecentDataPurchase | null>(null);
    const [isConfirmModalVisible, setConfirmModalVisible] = useState(false);
    const [isPinPadVisible, setPinPadVisible] = useState(false);
    const [isStatusModalVisible, setStatusModalVisible] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    const purchases = recentPurchasesResponse?.data || [];

    if (!isLoading && purchases.length === 0) {
        return null; // Or render nothing if no history
    }

    const handleSelect = (purchase: RecentDataPurchase) => {
        setSelectedPurchase(purchase);
        setConfirmModalVisible(true);
    };

    const processPurchase = async () => {
        if (!selectedPurchase) return;

        console.log("Processing purchase for:", selectedPurchase);

        const payload = {
            phone: selectedPurchase.phone,
            payment_method: "wallet",
            category: selectedPurchase.category,
            plan_id: selectedPurchase.plan_id,
            channel: 'data_bundle',
        };

        console.log("[process payload]: ", payload)

        // Close confirmation modal before processing
        setConfirmModalVisible(false);

        await processTransaction(payload, {
            onSuccess: (data) => {
                console.log("Transaction Success:", data);
                setStatusModalVisible(true);
                if (data?.data?.status === "success" || data?.data?.status === "pending") {
                    refetchBalance();
                    refetchTransactions();
                }
            },
            onError: (error: any) => {
                console.error("Transaction Error:", error);
                setStatusModalVisible(true);
            }
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
        } catch (error) {
            setLoadingText('Verification failed');
            return false;
        }
    };

    const handleConfirmPurchase = async () => {
        if (!selectedPurchase) return;

        if (isBiometricEnabled) {
            // Close modal to show biometric prompt cleanly
            setConfirmModalVisible(false);
            try {
                const authenticated = await authenticate();
                if (authenticated) {
                    await processPurchase();
                } else {
                    setPinPadVisible(true);
                }
            } catch (error) {
                console.error('Biometric auth failed:', error);
                setPinPadVisible(true);
            }
        } else {
            setConfirmModalVisible(false);
            setPinPadVisible(true);
        }
    };

    if (isLoading) {
        return (
            <View className="mb-6 px-4">
                <View className="h-6 w-32 bg-muted rounded mb-3 animate-pulse" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {[1, 2, 3].map(i => (
                        <View key={i} className="w-[160px] h-[120px] bg-card mr-3 rounded-xl p-3 border border-border/50 animate-pulse" />
                    ))}
                </ScrollView>
            </View>
        );
    }

    return (
        <View className="mb-4 mt-4">
            <Text className="text-foreground font-bold text-lg mb-2">One-Tap Buy</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 10 }}
            >
                {purchases.map((purchase) => (
                    <TouchableOpacity
                        key={purchase.id}
                        onPress={() => handleSelect(purchase)}
                        activeOpacity={0.7}
                        className="w-[160px] bg-card p-3 rounded-2xl mr-3 border border-border/50 shadow-sm justify-between space-y-3"
                    >
                        <View className="flex-row justify-between items-start">
                            <View className="w-8 h-8 rounded-full bg-white items-center justify-center overflow-hidden border border-gray-100">
                                <Image
                                    source={NETWORK_LOGOS[purchase.network.toLowerCase()] || NETWORK_LOGOS.mtn}
                                    style={{ width: '100%', height: '100%' }}
                                    resizeMode="cover"
                                />
                            </View>
                            <View className="bg-primary/10 px-2 py-0.5 rounded-full">
                                <Text className="text-[10px] font-bold text-primary uppercase">{purchase.network}</Text>
                            </View>
                        </View>

                        <View>
                            <Text className="text-foreground font-bold text-sm" numberOfLines={1}>
                                {purchase.meta_data?.plan_name || purchase.plan_name || "Data Plan"}
                            </Text>
                            <Text className="text-muted-foreground text-xs" numberOfLines={1}>{purchase.phone}</Text>
                        </View>

                        <View className="pt-2 border-t border-border/30 flex-row justify-between items-center">
                            <Text className="text-foreground font-bold text-sm">
                                {formatNigerianNaira(purchase.amount)}
                            </Text>
                            <View className="w-6 h-6 rounded-full bg-primary/10 items-center justify-center">
                                <Ionicons name="arrow-forward" size={12} color={colors.primary} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <BottomSheet
                isVisible={isConfirmModalVisible}
                onClose={() => setConfirmModalVisible(false)}
                title="Confirm Purchase"
            >
                {selectedPurchase && (
                    <View className="gap-y-4 py-2">
                        <Text className="text-muted-foreground text-sm">
                            Are you sure you want to buy this data plan again?
                        </Text>

                        <View className="flex-row justify-between items-center">
                            <Text className="text-muted-foreground">Network</Text>
                            <View className="flex-row items-center gap-2">
                                <Image
                                    source={NETWORK_LOGOS[selectedPurchase.network.toLowerCase()]}
                                    style={{ width: 20, height: 20, borderRadius: 10 }}
                                />
                                <Text className="text-foreground font-medium capitalize">{selectedPurchase.network}</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className="text-muted-foreground">Plan</Text>
                            <Text className="text-foreground font-medium">{selectedPurchase.plan_name}</Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className="text-muted-foreground">Phone</Text>
                            <Text className="text-foreground font-medium">{selectedPurchase.phone}</Text>
                        </View>

                        <View className="flex-row justify-between items-center">
                            <Text className="text-muted-foreground">Amount</Text>
                            <Text className="text-primary font-bold text-lg">{formatNigerianNaira(selectedPurchase.amount)}</Text>
                        </View>

                        <View className="flex-row gap-3 pt-4">
                            <TouchableOpacity
                                onPress={() => setConfirmModalVisible(false)}
                                className="flex-1 py-3 rounded-xl border border-border items-center justify-center"
                            >
                                <Text className="text-foreground font-semibold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirmPurchase}
                                className="flex-1 py-3 rounded-xl bg-primary items-center justify-center"
                            >
                                <Text className="text-white font-semibold">Confirm & Pay</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </BottomSheet>

            <PinPad
                isVisible={isPinPadVisible}
                onClose={() => setPinPadVisible(false)}
                handler={handlePinSubmit}
                loadingText={loadingText}
                onSuccess={async () => {
                    await processPurchase();
                }}
            />

            <StatusModal
                amount={transactionData?.data?.amount || 0}
                quantity={(transactionData?.data as any)?.quantity}
                data_bonus={(transactionData?.data as any)?.data_bonus}
                status={
                    (transactionData?.error || transactionError) ? 'error' : (transactionData?.data?.status as any || 'success')
                }
                isVisible={isStatusModalVisible}
                description={transactionData?.data?.description || transactionData?.message || transactionError?.message || ''}
                actionText={
                    (transactionData?.error || transactionError) ? 'Done' : 'View Receipt'
                }
                onAction={(transactionData?.error || transactionError) ? undefined : () => {
                    if (transactionData?.data?.id) {
                        router.push({
                            pathname: '/transactions/[id]',
                            params: { id: String(transactionData.data.id) }
                        });
                    }
                }}
                onClose={() => setStatusModalVisible(false)}
                transaction={transactionData?.data}
            />
            {isProcessing && <LoadingSpinner isPending={true} showBg={false} />}
        </View>
    );
};

export default QuickDataBuy;
