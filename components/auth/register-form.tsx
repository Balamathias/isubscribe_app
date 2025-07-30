import { useThemedColors } from '@/hooks/useThemedColors';
import { performOAuth } from '@/services/auth';
import { useSignUp } from '@/services/auth-hooks';
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

interface CustomTextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
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
  const { colors } = useThemedColors();
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

const registerSchema = z.object({
  fullName: z.string().min(1, 'Full Name is required'),
  phoneNumber: z.string().min(10, 'Phone Number must be at least 10 digits').max(15, 'Phone Number cannot exceed 15 digits').regex(/^[0-9]+$/, 'Phone Number must contain only digits'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').min(1, 'Password is required'),
  confirmPassword: z.string().min(1, 'Confirm Password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const { mutate: register, isPending } = useSignUp()

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      phoneNumber: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const onSubmit = (data: RegisterFormInputs) => {
    register({
      email: data.email,
      password: data.password,
      metadata: {
        phone: data.phoneNumber,
        full_name: data.fullName,
      }
    }, {
      onSuccess: (data) => {
        if (data?.error) {
          throw new Error(data?.message)
        } else {
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Account created successfully!',
          })

          router.replace(`/auth/verify-otp?email=${data?.data?.user?.email || getValues('email')}`)
        }
      },
      onError: (error) => {
        Toast.show({
          type: 'error',
          text1: 'Error!',
          text2: error?.message
        })
      }
    })
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-4">
        <View className="items-center mb-8 mt-4">
          <IsubscribeLogo />
          <Text className="text-foreground text-2xl font-bold mt-6 mb-2">Create Account</Text>
          <Text className="text-muted-foreground text-center text-base">
            Join thousands of users managing their subscriptions
          </Text>
        </View>

        <TouchableOpacity 
          onPress={performOAuth} 
          className="flex-row items-center bg-card border border-border rounded-2xl px-6 py-4 shadow-sm w-full justify-center mb-6 active:scale-95"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
        >
          <Image source={require('../../assets/images/google-icon.png')} className="w-5 h-5 mr-3" />
          <Text className="text-foreground font-semibold text-base">Continue with Google</Text>
        </TouchableOpacity>

        <View className="flex-row items-center w-full mb-6">
          <View className="flex-1 h-px bg-border" />
          <Text className="text-muted-foreground mx-4 text-sm font-medium">or sign up with email</Text>
          <View className="flex-1 h-px bg-border" />
        </View>

        <View className="flex-1">
          <View className="mb-4">
            <Text className="text-foreground text-sm font-semibold mb-2">Full Name</Text>
            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  icon="person-outline"
                  placeholder="Enter your full name"
                  value={value}
                  onChange={onChange}
                  error={errors.fullName?.message}
                />
              )}
            />
          </View>

          <View className="mb-4">
            <Text className="text-foreground text-sm font-semibold mb-2">Phone Number</Text>
            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  icon="call-outline"
                  placeholder="e.g., 08012345678"
                  value={value}
                  onChange={onChange}
                  keyboardType="phone-pad"
                  error={errors.phoneNumber?.message}
                />
              )}
            />
          </View>

          <View className="mb-4">
            <Text className="text-foreground text-sm font-semibold mb-2">Email Address</Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  icon="mail-outline"
                  placeholder="your-email@example.com"
                  value={value}
                  onChange={onChange}
                  keyboardType="email-address"
                  error={errors.email?.message}
                />
              )}
            />
          </View>

          {/* Password Row */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-foreground text-sm font-semibold mb-2">Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    icon="lock-closed-outline"
                    placeholder="••••••"
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
            <View className="flex-1">
              <Text className="text-foreground text-sm font-semibold mb-2">Confirm</Text>
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    icon="lock-closed-outline"
                    placeholder="••••••"
                    value={value}
                    onChange={onChange}
                    secureTextEntry={!isConfirmPasswordVisible}
                    toggleVisibility={toggleConfirmPasswordVisibility}
                    isPasswordVisible={isConfirmPasswordVisible}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
            </View>
          </View>

            <View className="mb-6">
            <Text className="text-muted-foreground text-center text-xs leading-5">
              By creating an account, you agree to our{' '}
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
            </View>

          <TouchableOpacity 
            onPress={handleSubmit(onSubmit)} 
            className="w-full rounded-2xl overflow-hidden mb-6 active:scale-98"
            disabled={isPending}
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
                  <Text className="text-white font-bold text-lg ml-2">Creating Account...</Text>
                </View>
              ) : (
                <Text className="text-white font-bold text-lg">Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center">
            <Text className="text-muted-foreground text-base">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/login')} className="active:scale-95">
              <Text className="text-primary font-semibold text-base">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterForm; 