import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Text, View, useColorScheme } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence, 
  withTiming,
  withSpring,
  Easing
} from 'react-native-reanimated';

const NotFoundScreen = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const sadIconScale = useSharedValue(1);
  const sadIconRotation = useSharedValue(0);
  const errorTextScale = useSharedValue(1);

  React.useEffect(() => {
    sadIconRotation.value = withSequence(
      withTiming(-10, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(10, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
      withTiming(0, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    );

    sadIconScale.value = withSequence(
      withSpring(1.1, { damping: 2 }),
      withSpring(1, { damping: 2 })
    );

    errorTextScale.value = withSequence(
      withSpring(1.2, { damping: 3 }),
      withSpring(1, { damping: 3 })
    );
  }, []);

  const sadIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: sadIconScale.value },
      { rotate: `${sadIconRotation.value}deg` }
    ]
  }));

  const errorTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: errorTextScale.value }]
  }));

  return (
    <View className="flex-1 items-center justify-center p-4 bg-background" style={{ backgroundColor: colors.background }}>
      <Animated.View style={sadIconStyle}>
        <Ionicons name="sad-outline" size={100} color={colors.primary} className="mb-4" />
      </Animated.View>
      
      <Animated.View style={errorTextStyle}>
        <Text className="text-4xl font-bold text-foreground mb-2" style={{ color: colors.foreground }}>404</Text>
      </Animated.View>

      <Text className="text-xl font-semibold text-muted-foreground text-center mb-8">
        Oops! This page {"doesn't"} exist.
      </Text>

      <Link href="/" className="rounded-xl py-3 px-6 overflow-hidden bg-primary">
        <View className="flex-row items-center justify-center">
          <Ionicons name="home-outline" size={20} color={'white'} className="mr-2" />
          <Text className="text-lg font-bold text-primary-foreground">Go to Home</Text>
        </View>
      </Link>
    </View>
  );
};

export default NotFoundScreen;