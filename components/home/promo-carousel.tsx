import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Image,
    Modal,
    ActivityIndicator,
    useColorScheme,
} from 'react-native';
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

    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const colors = COLORS[isDark ? 'dark' : 'light'];

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
        setLoadingMap((prev) => ({ ...prev, [selectedBanner.id]: true }));

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
            const targetUrl = selectedBanner.cta_link;
            if (option === 'app') {
                setActiveUrl(targetUrl);
                setActiveTitle(selectedBanner.title);
                setModalVisible(true);
            } else {
                await WebBrowser.openBrowserAsync(targetUrl);
            }
        } finally {
            setLoadingMap((prev) => ({ ...prev, [selectedBanner.id]: false }));
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
                activeOpacity={0.95}
                onPress={() => handlePress(item)}
                className="mx-1"
                style={{
                    height: 150,
                    borderRadius: 24,
                    overflow: 'hidden',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: isDark ? 0.4 : 0.15,
                    shadowRadius: 20,
                    elevation: 8,
                }}
            >
                {/* Background Image */}
                <Image
                    source={{ uri: item.image_url }}
                    className="absolute inset-0 w-full h-full"
                    resizeMode="cover"
                />

                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
                    locations={[0, 0.6, 1]}
                    className="absolute inset-0"
                />

                {/* Content */}
                <View className="flex-1 justify-end p-5">
                    {/* Title */}
                    <Text
                        className="text-white font-bold text-xl mb-1.5"
                        numberOfLines={1}
                        style={{
                            textShadowColor: 'rgba(0,0,0,0.5)',
                            textShadowOffset: { width: 0, height: 1 },
                            textShadowRadius: 4,
                        }}
                    >
                        {item.title}
                    </Text>

                    {/* Description */}
                    <Text
                        className="text-white/80 text-sm mb-3"
                        numberOfLines={2}
                        style={{ lineHeight: 18 }}
                    >
                        {item.description}
                    </Text>

                    {/* CTA Button */}
                    <View className="flex-row items-center">
                        <View
                            className="flex-row items-center px-4 py-2 rounded-full"
                            style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.3)',
                            }}
                        >
                            {isProcessing ? (
                                <>
                                    <ActivityIndicator
                                        size="small"
                                        color="white"
                                        style={{ marginRight: 6 }}
                                    />
                                    <Text className="text-white text-xs font-semibold">
                                        Opening...
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Text className="text-white text-xs font-semibold mr-1.5">
                                        Learn More
                                    </Text>
                                    <Ionicons name="arrow-forward" size={12} color="white" />
                                </>
                            )}
                        </View>
                    </View>
                </View>

                {/* Promo Badge */}
                <View
                    className="absolute top-4 right-4 px-3 py-1.5 rounded-full"
                    style={{
                        backgroundColor: colors.primary,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                    }}
                >
                    <Text className="text-white text-[10px] font-bold uppercase tracking-wider">
                        Promo
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="mb-5">
            {/* Section Header */}
            <View className="flex-row items-center justify-between mb-4 px-1">
                <View className="flex-row items-center">
                    <View
                        className="items-center justify-center mr-2"
                    >
                        <Ionicons name="megaphone" size={16} color={colors.primary} />
                    </View>
                    <Text className="text-foreground font-bold text-lg">
                        Special Offers
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <View
                        className="w-2 h-2 rounded-full mr-1.5"
                        style={{ backgroundColor: '#22c55e' }}
                    />
                    <Text
                        className="text-xs font-medium"
                        style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
                    >
                        {banners.length} active
                    </Text>
                </View>
            </View>

            {/* Carousel */}
            <Carousel
                loop
                width={width - 32}
                height={150}
                autoPlay={true}
                data={banners}
                scrollAnimationDuration={2000}
                renderItem={renderItem}
                mode="parallax"
                modeConfig={{
                    parallaxScrollingScale: 0.92,
                    parallaxScrollingOffset: 40,
                }}
                // @ts-ignore
                panGestureHandlerProps={{
                    activeOffsetX: [-10, 10],
                    failOffsetY: [-5, 5],
                }}
            />

            {/* Dots Indicator */}
            {banners.length > 1 && (
                <View className="flex-row justify-center mt-4">
                    {banners.slice(0, 5).map((_, index) => (
                        <View
                            key={index}
                            className="w-1.5 h-1.5 rounded-full mx-1"
                            style={{
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.3)'
                                    : 'rgba(0,0,0,0.2)',
                            }}
                        />
                    ))}
                </View>
            )}

            {/* WebView Modal */}
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
                presentationStyle="pageSheet"
            >
                <SafeAreaView className="flex-1 bg-background">
                    <View
                        className="flex-row items-center justify-between px-4 py-3"
                        style={{
                            borderBottomWidth: 1,
                            borderBottomColor: isDark
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.08)',
                        }}
                    >
                        <TouchableOpacity
                            onPress={handleCloseModal}
                            className="w-9 h-9 items-center justify-center rounded-full"
                            style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}
                        >
                            <Ionicons name="close" size={20} color="#ef4444" />
                        </TouchableOpacity>

                        <Text
                            className="font-semibold text-base flex-1 text-center text-foreground mx-4"
                            numberOfLines={1}
                        >
                            {activeTitle || 'Promo'}
                        </Text>

                        <View className="w-9" />
                    </View>

                    <WebView
                        source={{ uri: activeUrl }}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View className="absolute inset-0 items-center justify-center bg-background">
                                <ActivityIndicator size="large" color={colors.primary} />
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

            {/* Options Bottom Sheet */}
            <BottomSheet
                isVisible={optionsSheetVisible}
                onClose={() => setOptionsSheetVisible(false)}
                title={selectedBanner?.title || 'Choose Option'}
            >
                <View className="gap-y-3 py-2">
                    <Text
                        className="text-sm mb-3"
                        style={{
                            color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                        }}
                    >
                        How would you like to open this link?
                    </Text>

                    <TouchableOpacity
                        onPress={() => handleOpenOption('app')}
                        activeOpacity={0.8}
                        className="flex-row items-center p-4 rounded-2xl"
                        style={{
                            backgroundColor: isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)',
                            borderWidth: 1,
                            borderColor: isDark
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(0,0,0,0.05)',
                        }}
                    >
                        <View
                            className="w-12 h-12 rounded-xl items-center justify-center mr-4 bg-primary/20"
                        >
                            <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold text-foreground text-base mb-0.5">
                                Open in App
                            </Text>
                            <Text
                                className="text-xs"
                                style={{
                                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                                }}
                            >
                                Best for quick viewing
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleOpenOption('browser')}
                        activeOpacity={0.8}
                        className="flex-row items-center p-4 rounded-2xl"
                        style={{
                            backgroundColor: isDark
                                ? 'rgba(255,255,255,0.05)'
                                : 'rgba(0,0,0,0.03)',
                            borderWidth: 1,
                            borderColor: isDark
                                ? 'rgba(255,255,255,0.08)'
                                : 'rgba(0,0,0,0.05)',
                        }}
                    >
                        <View
                            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                            style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                        >
                            <Ionicons name="browsers-outline" size={20} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-semibold text-foreground text-base mb-0.5">
                                Open in Browser
                            </Text>
                            <Text
                                className="text-xs"
                                style={{
                                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                                }}
                            >
                                Use Chrome/Safari for full features
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                    </TouchableOpacity>
                </View>
            </BottomSheet>
        </View>
    );
};

export default PromoCarousel;
