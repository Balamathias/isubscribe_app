import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = (data: ForgotPasswordFormInputs) => {
    console.log('Forgot password data:', data);
    // Here you would typically send the email to your backend to initiate OTP sending
    router.push('/auth/verify-otp'); // Navigate to OTP verification screen after sending OTP
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center px-4">
      <IsubscribeLogo />

      <View className="w-full max-w-sm items-center">
        <Text className="text-foreground text-2xl font-bold mb-4">Forgot Password?</Text>
        <Text className="text-muted-foreground text-center mb-8">
          Enter your registered email address to receive a verification code.
        </Text>

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

        <TouchableOpacity onPress={handleSubmit(onSubmit)} className="w-full rounded-xl overflow-hidden mt-4">
          <LinearGradient
            colors={['#7B2FF2', '#F357A8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="py-4 items-center justify-center rounded-xl"
          >
            <Text className="text-white font-bold text-lg">Send OTP</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/auth/login')} className="items-center mt-8">
          <Text className="text-primary font-semibold text-base">Go back to login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordForm; 