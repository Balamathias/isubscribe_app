import { COLORS } from '@/constants/colors';
import React, { useEffect } from 'react';
import { Image, Text, useColorScheme, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SplashScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const taglineOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Logo entrance animation
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 400 });

    // Text fade in
    textOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));

    // Tagline fade in
    taglineOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));

    // Continuous pulse animation
    pulseScale.value = withDelay(
      800,
      withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      )
    );
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value * pulseScale.value }],
    opacity: logoOpacity.value,
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <SafeAreaView
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: isDark ? '#0a0a0a' : '#fff' }}
    >
      {/* Background gradient orbs */}
      <View
        className="absolute w-64 h-64 rounded-full"
        style={{
          top: '15%',
          left: '-20%',
          backgroundColor: colors.primary,
          opacity: 0.05,
        }}
      />
      <View
        className="absolute w-48 h-48 rounded-full"
        style={{
          bottom: '20%',
          right: '-15%',
          backgroundColor: '#a855f7',
          opacity: 0.05,
        }}
      />

      {/* Main Content */}
      <View className="flex-1 items-center justify-center">
        <Animated.View style={logoAnimatedStyle} className="items-center">
          {/* Logo Container */}
          <View
            className="w-24 h-24 rounded-3xl items-center justify-center mb-6"
          >
            <Image
              source={require('@/assets/images/logo-icon.png')}
              className="w-14 h-14"
              style={{ tintColor: colors.primary }}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        {/* Brand Name */}
        <Animated.View style={textAnimatedStyle} className="items-center">
          <Text
            className="text-3xl font-bold tracking-tight"
            style={{ color: isDark ? '#fff' : '#111' }}
          >
            isubscribe
          </Text>
          <View
            className="h-1 w-12 rounded-full mt-3"
            style={{ backgroundColor: colors.primary }}
          />
        </Animated.View>
      </View>

      {/* Tagline */}
      <Animated.View style={taglineAnimatedStyle} className="mb-12 items-center">
        <Text
          className="text-sm font-medium"
          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
        >
          Subscribe and stay connected
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default SplashScreen;
