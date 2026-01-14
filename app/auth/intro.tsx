import useFirstLaunch from '@/hooks/useFirstLaunch';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Floating orb component for premium background effect
const FloatingOrb: React.FC<{
    size: number;
    color: string;
    initialX: number;
    initialY: number;
    delay: number;
}> = ({ size, color, initialX, initialY, delay }) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const animate = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(translateY, {
                            toValue: 25,
                            duration: 4000 + delay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateX, {
                            toValue: 15,
                            duration: 3500 + delay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale, {
                            toValue: 1.15,
                            duration: 4000 + delay,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(translateY, {
                            toValue: 0,
                            duration: 4000 + delay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(translateX, {
                            toValue: 0,
                            duration: 3500 + delay,
                            useNativeDriver: true,
                        }),
                        Animated.timing(scale, {
                            toValue: 1,
                            duration: 4000 + delay,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            ).start();
        };
        animate();
    }, [delay, translateY, translateX, scale]);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                left: initialX,
                top: initialY,
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                opacity: 0.5,
                transform: [{ translateY }, { translateX }, { scale }],
            }}
        />
    );
};

// Feature item with animated checkmark
interface FeatureItemProps {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    delay: number;
    isDark: boolean;
}

const FeatureItem: React.FC<FeatureItemProps> = ({
    icon,
    title,
    description,
    delay,
    isDark,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const checkScale = useRef(new Animated.Value(0)).current;
    const checkPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timeout = setTimeout(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                // Animate checkmark after item appears
                Animated.spring(checkScale, {
                    toValue: 1,
                    tension: 100,
                    friction: 6,
                    useNativeDriver: true,
                }).start(() => {
                    // Add subtle pulse animation to checkmark
                    Animated.loop(
                        Animated.sequence([
                            Animated.timing(checkPulse, {
                                toValue: 1.1,
                                duration: 1500,
                                useNativeDriver: true,
                            }),
                            Animated.timing(checkPulse, {
                                toValue: 1,
                                duration: 1500,
                                useNativeDriver: true,
                            }),
                        ])
                    ).start();
                });
            });
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay, fadeAnim, slideAnim, checkScale, checkPulse]);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
            }}
            className="flex-row items-center py-4 px-2"
        >
            {/* Icon container */}
            <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                style={{
                    backgroundColor: isDark ? 'rgba(123, 47, 242, 0.15)' : 'rgba(123, 47, 242, 0.1)',
                }}
            >
                <Ionicons name={icon} size={22} color="#7B2FF2" />
            </View>

            {/* Text content */}
            <View className="flex-1">
                <Text className="text-foreground dark:text-white font-semibold text-base mb-0.5">
                    {title}
                </Text>
                <Text className="text-muted-foreground text-sm">
                    {description}
                </Text>
            </View>

            {/* Animated checkmark */}
            <Animated.View
                style={{
                    transform: [{ scale: checkScale }, { scale: checkPulse }],
                }}
            >
                <View
                    className="w-6 h-6 rounded-full items-center justify-center"
                    style={{ backgroundColor: '#10b981' }}
                >
                    <Ionicons name="checkmark" size={14} color="white" />
                </View>
            </Animated.View>
        </Animated.View>
    );
};

const IntroScreen = () => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { markAsSeen, isLoading } = useFirstLaunch();

    // Main content animations
    const logoFade = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const contentFade = useRef(new Animated.Value(0)).current;
    const contentSlide = useRef(new Animated.Value(40)).current;
    const buttonFade = useRef(new Animated.Value(0)).current;
    const buttonSlide = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        // Staggered entrance animations
        Animated.sequence([
            // Logo appears first
            Animated.parallel([
                Animated.timing(logoFade, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
            // Then content
            Animated.parallel([
                Animated.timing(contentFade, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(contentSlide, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
            // Then button
            Animated.parallel([
                Animated.timing(buttonFade, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.spring(buttonSlide, {
                    toValue: 0,
                    tension: 50,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
        ]).start();
    }, [logoFade, logoScale, contentFade, contentSlide, buttonFade, buttonSlide]);

    const handleGetStarted = async () => {
        await markAsSeen();
        router.replace('/auth/register');
    };

    const handleSignIn = async () => {
        await markAsSeen();
        router.replace('/auth/login');
    };

    const handleNeedHelp = () => {
        router.push('/help');
    };

    if (isLoading) {
        return (
            <View className="flex-1 bg-background items-center justify-center">
                <ActivityIndicator size="large" color="#7B2FF2" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            {/* Premium gradient background */}
            <LinearGradient
                colors={
                    isDark
                        ? ['#0a0a0a', '#1a0a2e', '#0f0f1a', '#0a0a0a']
                        : ['#faf5ff', '#f3e8ff', '#fdf4ff', '#ffffff']
                }
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />

            {/* Floating orbs for visual depth */}
            <FloatingOrb
                size={250}
                color={isDark ? 'rgba(123,47,242,0.12)' : 'rgba(123,47,242,0.08)'}
                initialX={-80}
                initialY={80}
                delay={0}
            />
            <FloatingOrb
                size={180}
                color={isDark ? 'rgba(243,87,168,0.12)' : 'rgba(243,87,168,0.08)'}
                initialX={width - 80}
                initialY={180}
                delay={800}
            />
            <FloatingOrb
                size={120}
                color={isDark ? 'rgba(123,47,242,0.1)' : 'rgba(123,47,242,0.06)'}
                initialX={30}
                initialY={height - 350}
                delay={1500}
            />

            <SafeAreaView className="flex-1">
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Logo Section */}
                    <Animated.View
                        style={{
                            opacity: logoFade,
                            transform: [{ scale: logoScale }],
                        }}
                        className="items-center mt-12 mb-6"
                    >
                        {/* Logo with glow effect */}
                        <View
                        >
                            <Image
                                source={require('@/assets/images/logo-icon.png')}
                                className="w-24 h-24"
                                style={{ tintColor: '#7B2FF2' }}
                            />
                        </View>

                        {/* App name */}
                        <Text
                            className="text-4xl font-bold mt-4 tracking-tight"
                            style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
                        >
                            isubscribe
                        </Text>

                        {/* Tagline badge */}
                        <View
                            className="mt-4 px-5 py-2.5 rounded-full"
                            style={{
                                backgroundColor: isDark
                                    ? 'rgba(123, 47, 242, 0.15)'
                                    : 'rgba(123, 47, 242, 0.1)',
                                borderWidth: 1,
                                borderColor: isDark
                                    ? 'rgba(123, 47, 242, 0.3)'
                                    : 'rgba(123, 47, 242, 0.2)',
                            }}
                        >
                            <Text
                                className="text-sm font-medium"
                                style={{ color: '#7B2FF2' }}
                            >
                                Your all-in-one payment solution
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Description */}
                    <Animated.View
                        style={{
                            opacity: contentFade,
                            transform: [{ translateY: contentSlide }],
                        }}
                    >
                        <Text
                            className="text-center text-base leading-6 mb-8 px-4"
                            style={{
                                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                            }}
                        >
                            Pay for airtime, data, electricity, and cable TV all in one place
                            with instant delivery and secure transactions.
                        </Text>

                        {/* Features Card - Glassmorphism effect */}
                        <View
                            className="rounded-3xl p-4 mb-8"
                            style={{
                                backgroundColor: isDark
                                    ? 'rgba(255,255,255,0.03)'
                                    : 'rgba(255,255,255,0.8)',
                                borderWidth: 1,
                                borderColor: isDark
                                    ? 'rgba(255,255,255,0.08)'
                                    : 'rgba(123, 47, 242, 0.1)',
                            }}
                        >
                            <FeatureItem
                                icon="flash"
                                title="Instant Recharge"
                                description="Buy airtime and data in seconds"
                                delay={800}
                                isDark={isDark}
                            />
                            <View
                                className="h-px mx-2"
                                style={{
                                    backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.06)'
                                        : 'rgba(0,0,0,0.05)',
                                }}
                            />
                            <FeatureItem
                                icon="bulb"
                                title="Pay Bills Easily"
                                description="Electricity, cable TV, and more"
                                delay={1000}
                                isDark={isDark}
                            />
                            <View
                                className="h-px mx-2"
                                style={{
                                    backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.06)'
                                        : 'rgba(0,0,0,0.05)',
                                }}
                            />
                            <FeatureItem
                                icon="shield-checkmark"
                                title="Secure Transactions"
                                description="Bank-level security for all payments"
                                delay={1200}
                                isDark={isDark}
                            />
                        </View>
                    </Animated.View>

                    {/* CTA Buttons */}
                    <Animated.View
                        style={{
                            opacity: buttonFade,
                            transform: [{ translateY: buttonSlide }],
                        }}
                        className="mb-6"
                    >
                        {/* Get Started Button */}
                        <TouchableOpacity
                            onPress={handleGetStarted}
                            activeOpacity={0.9}
                            className="mb-5"
                        >
                            <LinearGradient
                                colors={['#7B2FF2', '#9333ea', '#F357A8']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 16,
                                    paddingVertical: 18,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text className="text-white font-bold text-lg mr-2">
                                    Get Started
                                </Text>
                                <Ionicons name="arrow-forward" size={20} color="white" />
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Sign In Link */}
                        <View className="flex-row justify-center items-center mb-8">
                            <Text
                                className="text-base"
                                style={{
                                    color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                                }}
                            >
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={handleSignIn}>
                                <Text className="text-primary font-bold text-base">
                                    Sign In
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Need Help Link */}
                        <TouchableOpacity
                            onPress={handleNeedHelp}
                            className="flex-row justify-center items-center pb-4"
                        >
                            <Ionicons
                                name="help-circle-outline"
                                size={20}
                                color={isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                            />
                            <Text
                                className="text-base font-medium ml-2"
                                style={{
                                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                                }}
                            >
                                Need Help?
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

export default IntroScreen;
