import { useThemedColors } from '@/hooks/useThemedColors';
import { performOAuth } from '@/services/auth';
import { useSignUp } from '@/services/auth-hooks';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';

const { width, height } = Dimensions.get('window');

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string()
    .min(10, 'Phone must be at least 10 digits')
    .max(15, 'Phone cannot exceed 15 digits')
    .regex(/^[0-9]+$/, 'Phone must contain only digits'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

// Floating orb component
const FloatingOrb: React.FC<{
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  delay: number;
}> = ({ size, color, initialX, initialY, delay }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, { toValue: 15, duration: 2500 + delay, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 8, duration: 2000 + delay, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(translateY, { toValue: 0, duration: 2500 + delay, useNativeDriver: true }),
          Animated.timing(translateX, { toValue: 0, duration: 2000 + delay, useNativeDriver: true }),
        ]),
      ])
    ).start();
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
        opacity: 0.5,
        transform: [{ translateY }, { translateX }],
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
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
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
    Animated.spring(borderAnim, { toValue: 1, useNativeDriver: false, tension: 50, friction: 7 }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(borderAnim, { toValue: 0, useNativeDriver: false, tension: 50, friction: 7 }).start();
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
      isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
      isDark ? 'rgba(123,47,242,0.1)' : 'rgba(123,47,242,0.05)',
    ],
  });

  return (
    <View className="mb-3">
      <Animated.View
        style={{
          borderWidth: 1.5,
          borderColor,
          backgroundColor: bgColor,
          borderRadius: 14,
          overflow: 'hidden',
        }}
      >
        <View className="flex-row items-center px-4 h-[52px]">
          <Ionicons
            name={icon}
            size={18}
            color={isFocused ? '#7B2FF2' : error ? '#ef4444' : colors.mutedForeground}
            style={{ marginRight: 12 }}
          />
          <TextInput
            className="flex-1 text-foreground"
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={{ fontSize: 15 }}
          />
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={18}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
      {error && (
        <View className="flex-row items-center mt-1.5 ml-1">
          <Ionicons name="alert-circle" size={12} color="#ef4444" />
          <Text className="text-red-500 text-xs ml-1 font-medium">{error}</Text>
        </View>
      )}
    </View>
  );
};

// Password Strength Component
const PasswordStrength: React.FC<{ password: string }> = ({ password }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getStrength = () => {
    let s = 0;
    if (password.length >= 6) s++;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const strength = getStrength();
  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];

  if (!password) return null;

  return (
    <View className="mb-3 mt-1">
      <View className="flex-row gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor: i < strength
                ? colors[strength - 1]
                : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            }}
          />
        ))}
      </View>
      <Text
        className="text-xs mt-1.5 font-medium"
        style={{ color: strength > 0 ? colors[strength - 1] : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
      >
        {strength > 0 ? labels[strength - 1] : ''}
      </Text>
    </View>
  );
};

const RegisterForm = () => {
  const { colors } = useThemedColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const { mutate: register, isPending } = useSignUp();

  const { control, handleSubmit, formState: { errors }, getValues, watch } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', phoneNumber: '', email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 9, useNativeDriver: true }),
    ]).start();
  }, []);

  const onSubmit = (data: RegisterFormInputs) => {
    register(
      { email: data.email, password: data.password, metadata: { phone: data.phoneNumber, full_name: data.fullName } },
      {
        onSuccess: (res) => {
          if (res?.error) throw new Error(res?.message);
          Toast.show({ type: 'success', text1: 'Account created!', text2: 'Please verify your email' });
          router.replace(`/auth/verify-otp?email=${res?.data?.user?.email || getValues('email')}`);
        },
        onError: (error) => {
          Toast.show({ type: 'error', text1: 'Registration failed', text2: error?.message });
        },
      }
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Background */}
      <LinearGradient
        colors={isDark ? ['#0a0a0a', '#1a0a2e', '#0f0520'] : ['#faf5ff', '#f3e8ff', '#fdf4ff']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Orbs */}
      <FloatingOrb size={180} color={isDark ? 'rgba(123,47,242,0.12)' : 'rgba(123,47,242,0.08)'} initialX={-60} initialY={80} delay={0} />
      <FloatingOrb size={120} color={isDark ? 'rgba(243,87,168,0.12)' : 'rgba(243,87,168,0.08)'} initialX={width - 80} initialY={150} delay={400} />
      <FloatingOrb size={90} color={isDark ? 'rgba(123,47,242,0.08)' : 'rgba(123,47,242,0.06)'} initialX={30} initialY={height - 250} delay={800} />

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View
              style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
            >
              {/* Header */}
              <View className="items-center mb-6">
                <View className="mb-4">
                  <View className="mb-6">
                    <Image source={require('@/assets/images/logo-icon.png')} className="w-20 h-20" />
                  </View>
                </View>
                <Text className="text-foreground text-2xl font-bold tracking-tight mb-1">
                  Create account
                </Text>
                <Text className="text-muted-foreground text-sm text-center">
                  Join isubscribe today
                </Text>
              </View>

              {/* Form Card */}
              <View
                className="rounded-3xl p-5 mb-5"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.75)',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: isDark ? 0.25 : 0.08,
                  shadowRadius: 24,
                  elevation: 8,
                }}
              >
                {/* Google */}
                <TouchableOpacity
                  onPress={performOAuth}
                  activeOpacity={0.8}
                  className="mb-5"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                  }}
                >
                  <View className="flex-row items-center justify-center py-3">
                    <Image source={require('../../assets/images/google-icon.png')} style={{ width: 18, height: 18, marginRight: 10 }} />
                    <Text className="text-foreground font-semibold text-sm">Continue with Google</Text>
                  </View>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-5">
                  <View className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                  <Text className="text-muted-foreground text-xs mx-3 uppercase tracking-widest font-medium">or</Text>
                  <View className="flex-1 h-px" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                </View>

                {/* Full Name */}
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, value } }) => (
                    <PremiumInput
                      icon="person-outline"
                      placeholder="Full name"
                      value={value}
                      onChangeText={onChange}
                      autoCapitalize="words"
                      error={errors.fullName?.message}
                    />
                  )}
                />

                {/* Phone */}
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, value } }) => (
                    <PremiumInput
                      icon="call-outline"
                      placeholder="Phone number"
                      value={value}
                      onChangeText={onChange}
                      keyboardType="phone-pad"
                      error={errors.phoneNumber?.message}
                    />
                  )}
                />

                {/* Email */}
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

                {/* Password */}
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
                <PasswordStrength password={password} />

                {/* Confirm Password */}
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { onChange, value } }) => (
                    <PremiumInput
                      icon="shield-checkmark-outline"
                      placeholder="Confirm password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />

                {/* Terms */}
                <Text className="text-muted-foreground/70 text-xs text-center leading-5 mb-4 mt-1">
                  By creating an account, you agree to our{' '}
                  <Text className="text-primary" onPress={() => router.push('/terms')}>Terms</Text>
                  {' '}and{' '}
                  <Text className="text-primary" onPress={() => router.push('/privacy')}>Privacy Policy</Text>
                </Text>

                {/* Submit */}
                <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={isPending} activeOpacity={0.9}>
                  <LinearGradient
                    colors={isPending ? ['#9ca3af', '#9ca3af'] : ['#7B2FF2', '#9333ea', '#F357A8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      borderRadius: 14,
                      paddingVertical: 15,
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#7B2FF2',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: isPending ? 0 : 0.35,
                      shadowRadius: 14,
                      elevation: isPending ? 0 : 8,
                    }}
                  >
                    {isPending ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <Text className="text-white font-bold text-base tracking-wide">Create Account</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Sign In Link */}
              <View className="flex-row justify-center items-center pb-4 mb-16">
                <Text className="text-muted-foreground text-sm">Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/auth/login')}>
                  <Text className="text-primary font-bold text-sm">Sign in</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default RegisterForm;
