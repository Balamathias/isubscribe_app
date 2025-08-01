import { useThemedColors } from '@/hooks/useThemedColors';
import { performOAuth } from '@/services/auth';
import { useSignIn } from '@/services/auth-hooks';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';
import IsubscribeLogo from './logo-isubscribe';
import { ScrollView } from 'react-native';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

interface CustomTextInputProps {
  icon: keyof typeof Ionicons.glyphMap; // More specific typing for Ionicons
  placeholder: string;
  onChange: (text: string) => void;
  value: string;
  secureTextEntry?: boolean;
  toggleVisibility?: () => void;
  isPasswordVisible?: boolean;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
}

const CustomTextInput: React.FC<CustomTextInputProps> = ({
  icon, placeholder, onChange, value, secureTextEntry, toggleVisibility, isPasswordVisible, error, keyboardType = 'default'
}) => {
  const { colors } = useThemedColors()
  return (
    <View className="mb-1">
      <View className={`flex-row items-center bg-card border rounded-2xl px-4 py-4 shadow-sm ${
        error ? 'border-destructive' : 'border-border'
      }`}>
        <Ionicons name={icon} size={20} color={error ? colors.destructive : colors.mutedForeground} className="mr-3" />
        <TextInput
          className="flex-1 text-base text-foreground"
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          onChangeText={onChange}
          value={value}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {secureTextEntry !== undefined && (
          <TouchableOpacity onPress={toggleVisibility} className="p-1 active:scale-95">
            <Ionicons 
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={colors.mutedForeground} 
            />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-destructive text-xs mt-1 ml-3 font-medium">{error}</Text>
      )}
    </View>
  );
};

const LoginForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { mutate: signIn, isPending } = useSignIn()

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const onSubmit = (data: LoginFormInputs) => {
    signIn(data, {
      onSuccess: () => {
        router.replace(`/`)
        Toast.show({
          type: `success`,
          text1: `Signed in successfully.`
        })
      },
      onError: (error) => {
        Toast.show({
          type: `error`,
          text1: `Sign In failed!`,
          text2: error?.message
        })
      }
    })
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView contentContainerClassName="flex-1 px-6 py-4 justify-center">
        {/* Header Section */}
        <View className="items-center mb-12">          
          {/* Icon with background */}
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6 mt-8">
            <Ionicons name="log-in-outline" size={32} color="#7B2FF2" />
          </View>
          
          <Text className="text-foreground text-2xl font-bold mb-3">Welcome Back</Text>
          <Text className="text-muted-foreground text-center text-base leading-6 px-4">
            Sign in to your account to continue managing your subscriptions
          </Text>
        </View>

        {/* Google Sign In */}
        <TouchableOpacity 
          onPress={performOAuth} 
          className="flex-row items-center bg-card border border-border rounded-2xl px-6 py-4 shadow-sm w-full justify-center mb-6 active:scale-95"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
          <Image source={require('@/assets/images/google-icon.png')} className="w-5 h-5 mr-3" />
          <Text className="text-foreground font-semibold text-base">Continue with Google</Text>
        </TouchableOpacity>

        {/* Divider */}
        <View className="flex-row items-center w-full mb-6">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-muted-foreground mx-4 text-sm font-medium">or sign in with email</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        {/* Form Section */}
        <View className="mb-6">
          {/* Email */}
          <View className="mb-4">
            <Text className="text-foreground text-sm font-semibold mb-2">Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  icon="mail-outline"
                  placeholder="Enter your email address"
                  value={value}
                  onChange={onChange}
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />
          </View>

          {/* Password */}
          <View className="mb-4">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-foreground text-sm font-semibold">Password</Text>
              <TouchableOpacity onPress={() => router.push('/auth/forgot-password')} className="active:scale-95">
                <Text className="text-primary text-sm font-medium">Forgot?</Text>
              </TouchableOpacity>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  icon="lock-closed-outline"
                  placeholder="Enter your password"
                  value={value}
                  onChange={onChange}
                  secureTextEntry={!isPasswordVisible}
                  toggleVisibility={togglePasswordVisibility}
                  isPasswordVisible={isPasswordVisible}
                  error={errors.password?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Sign In Button */}
        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)} 
          disabled={isPending}
          className="w-full rounded-2xl overflow-hidden mb-8 active:scale-98"
          style={{ 
            shadowColor: '#7B2FF2', 
            shadowOffset: { width: 0, height: 4 }, 
            shadowOpacity: 0.3, 
            shadowRadius: 8,
            elevation: 8 
          }}
        >
          <LinearGradient
            colors={['#7B2FF2', '#F357A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 items-center justify-center rounded-2xl"
          >
            {isPending ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="white" size="small" />
                <Text className="text-white font-bold text-lg ml-2">Signing In...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="log-in-outline" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">Sign In</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center items-center mb-6">
          <Text className="text-muted-foreground text-base">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')} className="active:scale-95">
            <Text className="text-primary font-semibold text-base">Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Terms Notice */}
        <Text className="text-muted-foreground text-center text-xs leading-5 px-4">
          By signing in, you agree to our{' '}
          <Text 
            className="text-primary text-xs font-medium" 
            onPress={() => router.push('/terms')}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text 
            className="text-primary text-xs font-medium" 
            onPress={() => router.push('/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginForm;