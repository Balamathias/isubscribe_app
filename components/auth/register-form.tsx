import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';
import IsubscribeLogo from './logo-isubscribe';
import { performOAuth } from '@/services/auth';
import { useSignUp } from '@/services/auth-hooks';
import Toast from 'react-native-toast-message';

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
  return (
    <View className="mb-4">
      <View className="flex-row items-center bg-input border border-secondary rounded-xl px-4 py-2 shadow-sm">
        <Ionicons name={icon} size={20} color="gray" className="mr-3" />
        <TextInput
          className="flex-1 text-base text-foreground"
          placeholder={placeholder}
          placeholderTextColor="gray"
          onChangeText={onChange}
          value={value}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {secureTextEntry !== undefined && (
          <TouchableOpacity onPress={toggleVisibility} className="p-1">
            <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color="gray" />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-red-500 text-sm mt-1 ml-2">{error}</Text>}
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
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-4">
      <IsubscribeLogo />

      <TouchableOpacity onPress={performOAuth} className="flex-row items-center bg-input border border-secondary rounded-xl px-6 py-4 shadow-sm w-full max-w-sm justify-center mb-8">
        <Image source={require('../../assets/images/google-icon.png')} className="w-6 h-6 mr-3" />
        <Text className="text-foreground font-semibold text-base">Sign up with Google</Text>
      </TouchableOpacity>

      <View className="flex-row items-center w-full max-w-sm mb-8">
        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        <Text className="text-muted-foreground mx-4 text-base">Or</Text>
        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
      </View>

      <View className="w-full max-w-sm">
        <Text className="text-foreground text-base font-semibold mb-2 ml-2">Full Name</Text>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              icon="person-outline"
              placeholder="John Doe"
              value={value}
              onChange={onChange}
              error={errors.fullName?.message}
            />
          )}
        />

        <Text className="text-foreground text-base font-semibold mb-2 ml-2">Phone Number</Text>
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

        <Text className="text-foreground text-base font-semibold mb-2 ml-2">Email</Text>
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

        <Text className="text-foreground text-base font-semibold mb-2 ml-2">Password</Text>
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

        <Text className="text-foreground text-base font-semibold mb-2 ml-2">Confirm Password</Text>
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

        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)} 
          className="w-full rounded-2xl overflow-hidden mt-4"
          disabled={isPending}
        >
          <LinearGradient
            colors={['#7B2FF2', '#F357A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 items-center justify-center rounded-2xl"
          >
            {isPending ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Sign Up</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted-foreground text-base">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push(`/auth/login`)}>
            <Text className="text-primary font-semibold text-base">Log In.</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-muted-foreground text-center text-xs mt-8 px-4">
          By signing up, you agree to our 
          <Text className="text-primary"> Terms and Conditions</Text> and 
          <Text className="text-primary"> Privacy Policy</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default RegisterForm; 