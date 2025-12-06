import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Linking, Image } from 'react-native';
import { useListPromoBanners, useGenerateWebAuthLink } from '@/services/api-hooks';
import Carousel from 'react-native-reanimated-carousel';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { PromoBanner } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

const { width } = Dimensions.get('window');

const PromoCarousel = () => {
    const { data: bannersResponse, isLoading } = useListPromoBanners();
    const { mutateAsync: generateWebAuthLink } = useGenerateWebAuthLink();
    const [loadingMap, setLoadingMap] = useState<Record<number, boolean>>({});

    const banners = bannersResponse?.data || [];

    const handlePress = async (banner: PromoBanner) => {
        if (!banner.cta_link) return;

        setLoadingMap(prev => ({ ...prev, [banner.id]: true }));

        try {
            // Generate magic link
            const response = await generateWebAuthLink(banner.cta_link);

            if (response?.data?.url) {
                await WebBrowser.openBrowserAsync(response.data.url, {
                    toolbarColor: COLORS.light.primary, // Customize as needed
                    controlsColor: 'white',
                });
            } else {
                // Fallback to simpler opening if magic link fails or not returned
                // Or maybe just open the CTA link directly if not authenticated 
                // But the requirement implies we want seamless auth.
                // If it fails, we can alert or just open the raw link (user might need to login manually)
                await WebBrowser.openBrowserAsync(banner.cta_link);
            }
        } catch (e) {
            console.error(e);
            // Fallback
            await WebBrowser.openBrowserAsync(banner.cta_link);
        } finally {
            setLoadingMap(prev => ({ ...prev, [banner.id]: false }));
        }
    };

    if (isLoading || !banners.length) {
        return null; // Or a skeleton loader
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

                {/* Gradient Overlay for Text Readability */}
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

                    {/* Optional CTA indicator */}
                    <View className="flex-row items-center bg-white/20 self-start px-2 py-1 rounded-full backdrop-blur-sm">
                        <Text className="text-white text-[10px] font-medium mr-1">
                            {isProcessing ? 'Opening...' : 'Tap to View'}
                        </Text>
                        {!isProcessing && <Ionicons name="arrow-forward" size={10} color="white" />}
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View className="mb-6">
            <Carousel
                loop
                width={width - 32} // taking padding into account
                height={120}
                autoPlay={true}
                data={banners}
                scrollAnimationDuration={2500}
                renderItem={renderItem}
                mode="parallax" // Nice effect
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
        </View>
    );
};

export default PromoCarousel;
