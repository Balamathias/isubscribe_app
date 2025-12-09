import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Image, Modal, ActivityIndicator, Platform } from 'react-native';
import { useListPromoBanners, useGenerateWebAuthLink } from '@/services/api-hooks';
import Carousel from 'react-native-reanimated-carousel';
import { LinearGradient } from 'expo-linear-gradient';
import { PromoBanner } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import BottomSheet from '@/components/ui/bottom-sheet';

const { width } = Dimensions.get('window');

const PromoCarousel = () => {
    const { data: bannersResponse, isLoading } = useListPromoBanners();
    const { mutateAsync: generateWebAuthLink } = useGenerateWebAuthLink();
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

    // WebView State
    const [modalVisible, setModalVisible] = useState(false);
    const [activeUrl, setActiveUrl] = useState<string>('');
    const [activeTitle, setActiveTitle] = useState<string>('');

    const [optionsSheetVisible, setOptionsSheetVisible] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<PromoBanner | null>(null);

    const banners = bannersResponse?.data || [];

    const handlePress = (banner: PromoBanner) => {
        if (!banner.cta_link) return;
        setSelectedBanner(banner);
        setOptionsSheetVisible(true);
    };

    const handleOpenOption = async (option: 'app' | 'browser') => {
        if (!selectedBanner) return;

        setOptionsSheetVisible(false);
        setLoadingMap(prev => ({ ...prev, [selectedBanner.id]: true }));

        try {
            const response = await generateWebAuthLink(selectedBanner.cta_link);
            const targetUrl = response?.data?.url || selectedBanner.cta_link;

            if (option === 'app') {
                setActiveUrl(targetUrl);
                setActiveTitle(selectedBanner.title);
                setModalVisible(true);
            } else {
                await WebBrowser.openBrowserAsync(targetUrl);
            }

        } catch (e) {
            console.error(e);
            // Fallback to direct link
            const targetUrl = selectedBanner.cta_link;
            if (option === 'app') {
                setActiveUrl(targetUrl);
                setActiveTitle(selectedBanner.title);
                setModalVisible(true);
            } else {
                await WebBrowser.openBrowserAsync(targetUrl);
            }
        } finally {
            setLoadingMap(prev => ({ ...prev, [selectedBanner.id]: false }));
        }
    };

    const handleCloseModal = () => {
        setModalVisible(false);
        setActiveUrl('');
        setActiveTitle('');
    };

    if (isLoading || !banners.length) {
        return null;
    }

    const renderItem = ({ item }: { item: PromoBanner }) => {
        const isProcessing = loadingMap[item.id];

        return (
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handlePress(item)}
                className="rounded-3xl overflow-hidden mx-2 h-[120px] bg-card border border-primary/10 shadow-sm relative"
            >
                <Image
                    source={{ uri: item.image_url }}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    className="absolute inset-x-0 bottom-0 h-24 justify-end p-4"
                >
                    <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>
                        {item.title}
                    </Text>
                    <Text className="text-white/80 text-xs mb-2" numberOfLines={2}>
                        {item.description}
                    </Text>

                    <View className="flex-row items-center bg-white/20 self-start px-2 py-1 rounded-full backdrop-blur-sm">
                        <Text className="text-white text-[10px] font-medium mr-1">
                            {isProcessing ? 'Opening...' : 'Tap to View'}
                        </Text>
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="white" style={{ transform: [{ scale: 0.5 }] }} />
                        ) : (
                            <Ionicons name="arrow-forward" size={10} color="white" />
                        )}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View className="mb-6">
            <Carousel
                loop
                width={width - 32}
                height={120}
                autoPlay={true}
                data={banners}
                scrollAnimationDuration={2500}
                renderItem={renderItem}
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.9,
                    parallaxScrollingOffset: 50,
                }}
                // @ts-ignore
                panGestureHandlerProps={{
                    activeOffsetX: [-10, 10],
                    failOffsetY: [-5, 5],
                }}
            />

            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
                presentationStyle="pageSheet"
            >
                <SafeAreaView
                    className="flex-1 bg-background">
                    <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
                        <TouchableOpacity
                            onPress={handleCloseModal}
                            className="w-8 h-8 items-center justify-center rounded-full bg-destructive/80"
                        >
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>

                        <Text className="font-semibold text-base flex-1 text-center text-foreground mx-4" numberOfLines={1}>
                            {activeTitle || 'Promo'}
                        </Text>

                        <View className="w-8" />
                    </View>

                    <WebView
                        source={{ uri: activeUrl }}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View className="absolute inset-0 items-center justify-center bg-background">
                                <ActivityIndicator size="large" color={COLORS.light.primary} />
                            </View>
                        )}
                        className="flex-1"
                        sharedCookiesEnabled={true}
                        domStorageEnabled={true}
                        javaScriptEnabled={true}
                        thirdPartyCookiesEnabled={true}
                    />
                </SafeAreaView>
            </Modal>

            <BottomSheet
                isVisible={optionsSheetVisible}
                onClose={() => setOptionsSheetVisible(false)}
                title={selectedBanner?.title || "Choose Option"}
            >
                <View className="gap-y-3 py-2">
                    <Text className="text-muted-foreground text-sm mb-2">How would you like to open this link?</Text>

                    <TouchableOpacity
                        onPress={() => handleOpenOption('app')}
                        className="flex-row items-center p-3 bg-muted/30 rounded-xl border border-border/40 active:bg-muted/50"
                    >
                        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                            <Ionicons name="phone-portrait-outline" size={16} color={COLORS.light.primary} />
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold text-foreground text-sm">Open in App</Text>
                            <Text className="text-muted-foreground text-xs">Best for quick viewing</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.light.mutedForeground} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleOpenOption('browser')}
                        className="flex-row items-center p-3 bg-muted/30 rounded-xl border border-border/40 active:bg-muted/50"
                    >
                        <View className="w-10 h-10 rounded-full bg-blue-500/10 items-center justify-center mr-3">
                            <Ionicons name="browsers-outline" size={16} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold text-foreground text-sm">Open in Browser</Text>
                            <Text className="text-muted-foreground text-xs">Use Chrome/Safari (Google Login)</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.light.mutedForeground} />
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
};

export default PromoCarousel;
