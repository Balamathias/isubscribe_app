import { useThemedColors } from '@/hooks/useThemedColors';
import { performOAuth } from '@/services/auth';
import { useSignIn } from '@/services/auth-hooks';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import { ScrollView } from 'react-native';

const { width, height } = Dimensions.get('window');

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

// Floating orb component for background
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
              toValue: 20,
              duration: 3000 + delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 10,
              duration: 2500 + delay,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1.1,
              duration: 3000 + delay,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(translateY, {
              toValue: 0,
              duration: 3000 + delay,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: 0,
              duration: 2500 + delay,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: 3000 + delay,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };
    animate();
  }, []);

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
        opacity: 0.6,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    />
  );
};

// Premium Input Component
const PremiumInput: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}> = ({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  autoCapitalize = 'none',
}) => {
    const { colors } = useThemedColors();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = () => {
      setIsFocused(true);
      Animated.spring(borderAnim, {
        toValue: 1,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    };

    const handleBlur = () => {
      setIsFocused(false);
      Animated.spring(borderAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 50,
        friction: 7,
      }).start();
    };

    const borderColor = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        error ? '#ef4444' : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        '#7B2FF2',
      ],
    });

    const bgColor = borderAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [
        isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
        isDark ? 'rgba(123,47,242,0.1)' : 'rgba(123,47,242,0.05)',
      ],
    });

    return (
      <View className="mb-4">
        <Animated.View
          style={{
            borderWidth: 1.5,
            borderColor,
            backgroundColor: bgColor,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          <View className="flex-row items-center px-4 h-14">
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? '#7B2FF2' : error ? '#ef4444' : colors.mutedForeground}
              style={{ marginRight: 12 }}
            />
            <TextInput
              className="flex-1 text-foreground text-base"
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={secureTextEntry && !isPasswordVisible}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              onFocus={handleFocus}
              onBlur={handleBlur}
              style={{ fontSize: 16 }}
            />
            {secureTextEntry && (
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        {error && (
          <View className="flex-row items-center mt-2 ml-1">
            <Ionicons name="alert-circle" size={14} color="#ef4444" />
            <Text className="text-red-500 text-xs ml-1.5 font-medium">{error}</Text>
          </View>
        )}
      </View>
    );
  };

const LoginForm = () => {
  const { colors } = useThemedColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { mutate: signIn, isPending } = useSignIn();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const onSubmit = (data: LoginFormInputs) => {
    signIn(data, {
      onSuccess: () => {
        router.replace('/');
        Toast.show({ type: 'success', text1: 'Welcome back!', text2: 'Signed in successfully' });
      },
      onError: (error) => {
        Toast.show({ type: 'error', text1: 'Sign in failed', text2: error?.message });
      },
    });
  };

  return (
    <View className="flex-1 bg-background">
      {/* Background gradient */}
      <LinearGradient
        colors={isDark
          ? ['#0a0a0a', '#1a0a2e', '#0a0a0a']
          : ['#faf5ff', '#f3e8ff', '#fdf4ff']
        }
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating orbs */}
      <FloatingOrb size={200} color={isDark ? 'rgba(123,47,242,0.15)' : 'rgba(123,47,242,0.1)'} initialX={-50} initialY={100} delay={0} />
      <FloatingOrb size={150} color={isDark ? 'rgba(243,87,168,0.15)' : 'rgba(243,87,168,0.1)'} initialX={width - 100} initialY={200} delay={500} />
      <FloatingOrb size={100} color={isDark ? 'rgba(123,47,242,0.1)' : 'rgba(123,47,242,0.08)'} initialX={50} initialY={height - 300} delay={1000} />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
              className={'px-2'}
            >
              {/* Logo & Header */}
              <View className="items-center mb-10">
                <View className="mb-6">
                  <Image source={require('@/assets/images/logo-icon.png')} className="w-20 h-20" />
                </View>
                <Text className="text-foreground text-3xl font-bold tracking-tight mb-2">
                  Welcome back
                </Text>
                <Text className="text-muted-foreground text-base text-center">
                  Sign in to continue to isubscribe
                </Text>
              </View>

              {/* Form Card */}
              <View
                className="rounded-3xl p-6 mb-6"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                }}
              >
                {/* Google Sign In */}
                <TouchableOpacity
                  onPress={performOAuth}
                  activeOpacity={0.8}
                  className="mb-6"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  }}
                >
                  <View className="flex-row items-center justify-center py-3.5">
                    <Image
                      source={require('@/assets/images/google-icon.png')}
                      style={{ width: 20, height: 20, marginRight: 12 }}
                    />
                    <Text className="text-foreground font-semibold text-base">
                      Continue with Google
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-6">
                  <View className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                  <Text className="text-muted-foreground text-xs mx-4 uppercase tracking-widest font-medium">
                    or
                  </Text>
                  <View className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                </View>

                {/* Email Input */}
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, value } }) => (
                    <PremiumInput
                      icon="mail-outline"
                      placeholder="Email address"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      error={errors.email?.message}
                    />
                  )}
                />

                {/* Password Input */}
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, value } }) => (
                    <PremiumInput
                      icon="lock-closed-outline"
                      placeholder="Password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                      error={errors.password?.message}
                    />
                  )}
                />

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => router.push('/auth/forgot-password')}
                  className="self-end mb-6"
                >
                  <Text className="text-primary font-semibold text-sm">
                    Forgot password?
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleSubmit(onSubmit)}
                  disabled={isPending}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={isPending ? ['#9ca3af', '#9ca3af'] : ['#7B2FF2', '#9333ea', '#F357A8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isPending ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-bold text-base tracking-wide">
                        Sign In
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center">
                <Text className="text-muted-foreground text-base">
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={() => router.push('/auth/register')}>
                  <Text className="text-primary font-bold text-base">
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Terms */}
              <Text className="text-muted-foreground/60 text-center text-xs mt-8 leading-5 px-4">
                By continuing, you agree to our{' '}
                <Text className="text-primary/80" onPress={() => router.push('/terms')}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text className="text-primary/80 mb-16" onPress={() => router.push('/privacy')}>
                  Privacy Policy
                </Text>
              </Text>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default LoginForm;
