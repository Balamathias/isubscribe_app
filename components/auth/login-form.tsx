import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Image, KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as z from 'zod';
import IsubscribeLogo from './logo-isubscribe';
import { Link, router } from 'expo-router';
import { performOAuth } from '@/services/auth';
import { useSignIn } from '@/services/auth-hooks';
import Toast from 'react-native-toast-message';
import { useThemedColors } from '@/hooks/useThemedColors';

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
    <View className="mb-4">
      <View className="flex-row items-center bg-input  border border-secondary rounded-xl px-4 py-2 shadow-sm">
        <Ionicons name={icon} size={20} color={colors.mutedForeground} className="mr-3" />
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
          <TouchableOpacity onPress={toggleVisibility} className="p-1">
            <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text className="text-destructive text-sm mt-1 ml-2">{error}</Text>}
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
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-4 mt-auto">
      <IsubscribeLogo />

      <TouchableOpacity onPress={performOAuth} className="flex-row items-center bg-input border border-secondary rounded-xl px-6 py-4 shadow-sm w-full max-w-sm justify-center mb-8">
        <Image source={require('@/assets/images/google-icon.png')} className="w-6 h-6 mr-3" />
        <Text className="text-foreground font-semibold text-base">Continue with Google</Text>
      </TouchableOpacity>

      <View className="flex-row items-center w-full max-w-sm mb-8">
        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
        <Text className="text-muted-foreground mx-4 text-base">Or</Text>
        <View className="flex-1 h-px bg-gray-300 dark:bg-gray-700" />
      </View>

      <View className="w-full max-w-sm">
        <Text className="text-foreground text-base font-semibold mb-2 ml-2">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              icon="mail-outline"
              placeholder="e.g: your-email@gmail.com"
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

        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)} 
          disabled={isPending}
          className="w-full rounded-2xl overflow-hidden mt-4"
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
              <Text className="text-white font-bold text-lg">Log In</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-muted-foreground text-base">{"Don't"} have an account? </Text>
          <TouchableOpacity onPress={() => router.push(`/auth/register`)}>
            <Text className="text-primary font-semibold text-base">Create account.</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity className="items-center mt-2">
          <Text className="font-semibold text-base text-muted-foreground">Forgot password? <Link href={`/auth/forgot-password`} className="text-primary">Reset password</Link></Text>
        </TouchableOpacity>

        <Text className="text-muted-foreground text-center text-xs mt-8 px-4">
          By signing in, you agree to our 
          <Link href="/terms" className="text-primary"> Terms and Conditions</Link> and 
          <Link href="/privacy" className="text-primary"> Privacy Policy</Link>.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default LoginForm;