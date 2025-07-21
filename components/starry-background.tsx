import { COLORS } from '@/constants/colors';
import React, { useEffect } from 'react';
import { Dimensions, useColorScheme, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface StarryBackgroundProps {
  intensity?: 'light' | 'medium' | 'high';
  animated?: boolean;
  style?: any;
  children?: React.ReactNode;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const StarryBackground: React.FC<StarryBackgroundProps> = ({
  intensity = 'light',
  animated = true,
  style,
  children
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  const getStarCount = () => {
    switch (intensity) {
      case 'light': return 15;
      case 'medium': return 25;
      case 'high': return 40;
      default: return 15;
    }
  };

  const generateStars = (): Star[] => {
    const starCount = getStarCount();
    return Array.from({ length: starCount }, (_, index) => ({
      id: index,
      x: Math.random() * screenWidth,
      y: Math.random() * screenHeight,
      size: Math.random() * 2 + 1, // 1-3px
      opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4 opacity for subtlety
      duration: Math.random() * 3000 + 2000, // 2-5 seconds
    }));
  };

  const stars = generateStars();

  const StarComponent = ({ star }: { star: Star }) => {
    const opacity = useSharedValue(star.opacity);
    const scale = useSharedValue(1);

    useEffect(() => {
      if (animated) {
        opacity.value = withRepeat(
          withDelay(
            Math.random() * 2000,
            withTiming(star.opacity * 1.5, { duration: star.duration })
          ),
          -1,
          true
        );

        scale.value = withRepeat(
          withDelay(
            Math.random() * 1000,
            withTiming(1.2, { duration: star.duration * 0.8 })
          ),
          -1,
          true
        );
      }
    }, [animated]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    }));

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: star.x,
            top: star.y,
            width: star.size,
            height: star.size,
            borderRadius: star.size / 2,
            backgroundColor: isDark ? '#ffffff' : colors.primary,
          },
          animatedStyle,
        ]}
      />
    );
  };

  const ShootingStar = ({ delay }: { delay: number }) => {
    const translateX = useSharedValue(-100);
    const translateY = useSharedValue(-100);
    const opacity = useSharedValue(0);

    useEffect(() => {
      if (animated) {
        const animate = () => {
          translateX.value = -100;
          translateY.value = -100;
          opacity.value = 0;

          setTimeout(() => {
            translateX.value = withTiming(screenWidth + 100, { duration: 1500 });
            translateY.value = withTiming(screenHeight / 2, { duration: 1500 });
            opacity.value = withTiming(0.6, { duration: 300 }, () => {
              opacity.value = withTiming(0, { duration: 300 });
            });
          }, delay);
        };

        animate();
        const interval = setInterval(animate, 15000 + Math.random() * 10000);

        return () => clearInterval(interval);
      }
    }, [animated, delay]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    }));

    if (!isDark) return null;

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 2,
            height: 2,
            borderRadius: 1,
            backgroundColor: '#ffffff',
          },
          animatedStyle,
        ]}
      >
        <View
          style={{
            position: 'absolute',
            width: 30,
            height: 1,
            backgroundColor: '#ffffff',
            opacity: 0.3,
            left: -30,
            top: 0.5,
          }}
        />
      </Animated.View>
    );
  };

  const getGradientColors = () => {
    if (isDark) {
      return [
        'rgba(15, 23, 42, 0.95)',
        'rgba(30, 41, 59, 0.9)',
        'rgba(51, 65, 85, 0.85)',
      ];
    } else {
      return [
        'rgba(248, 250, 252, 0.98)',
        'rgba(241, 245, 249, 0.95)',
        'rgba(226, 232, 240, 0.9)',
      ];
    }
  };

  return (
    <View style={[{ flex: 1 }, style]}>
      <LinearGradient
        colors={getGradientColors() as any}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />

      {stars.map((star) => (
        <StarComponent key={star.id} star={star} />
      ))}

      {isDark && intensity !== 'light' && (
        <>
          <ShootingStar delay={2000} />
          <ShootingStar delay={8000} />
        </>
      )}

      {children}
    </View>
  );
};

export default StarryBackground;