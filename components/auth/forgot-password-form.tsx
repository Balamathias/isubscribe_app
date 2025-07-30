import { useThemedColors } from '@/hooks/useThemedColors';
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
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-6 py-4 justify-center">
        {/* Header Section */}
        <View className="items-center mb-12 gap-y-2">
          <IsubscribeLogo />
          
          {/* Icon with background */}
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6 mt-8">
            <Ionicons name="mail-outline" size={32} color="#7B2FF2" />
          </View>
          
          <Text className="text-foreground text-2xl font-bold mb-3">Forgot Password?</Text>
          <Text className="text-muted-foreground text-center text-base leading-6 px-4 hidden">
            No worries! Enter your email address and we'll send you a verification code to reset your password.
          </Text>
        </View>

        {/* Form Section */}
        <View className="mb-8 mt-4">
          <Text className="text-foreground text-sm font-semibold mb-2">Email Address</Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <CustomTextInput
                icon="mail-outline"
                placeholder="Enter your registered email"
                value={value}
                onChange={onChange}
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
          />
        </View>

        {/* Send OTP Button */}
        <TouchableOpacity 
          onPress={handleSubmit(onSubmit)} 
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
            <View className="flex-row items-center">
              <Ionicons name="send-outline" size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Send Verification Code</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Back to Login */}
        <View className="flex-row justify-center items-center">
          <Ionicons name="arrow-back-outline" size={18} color="#7B2FF2" />
          <TouchableOpacity onPress={() => router.push('/auth/login')} className="ml-2 active:scale-95">
            <Text className="text-primary font-semibold text-base">Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordForm; 