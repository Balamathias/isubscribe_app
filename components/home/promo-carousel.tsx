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

const { width } = Dimensions.get('window');

const PromoCarousel = () => {
    const { data: bannersResponse, isLoading } = useListPromoBanners();
    const { mutateAsync: generateWebAuthLink } = useGenerateWebAuthLink();
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

    // WebView State
    const [modalVisible, setModalVisible] = useState(false);
    const [activeUrl, setActiveUrl] = useState<string>('');
    const [activeTitle, setActiveTitle] = useState<string>('');

    const banners = bannersResponse?.data || [];

    const handlePress = async (banner: PromoBanner) => {
        if (!banner.cta_link) return;

        setLoadingMap(prev => ({ ...prev, [banner.id]: true }));

        try {
            // Generate magic link if possible to auto-login user in the webview
            const response = await generateWebAuthLink(banner.cta_link);

            if (response?.error) {
                console.warn("Auto-login failed, falling back to direct link:", response.error);
            }

            const targetUrl = response?.data?.url || banner.cta_link;

            setActiveUrl(targetUrl);
            setActiveTitle(banner.title);
            setModalVisible(true);

        } catch (e) {
            console.error(e);
            // Fallback to direct link
            setActiveUrl(banner.cta_link);
            setActiveTitle(banner.title);
            setModalVisible(true);
        } finally {
            setLoadingMap(prev => ({ ...prev, [banner.id]: false }));
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
        </View>
    );
};

export default PromoCarousel;
