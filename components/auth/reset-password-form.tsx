import { useThemedColors } from '@/hooks/useThemedColors';
import { useUpdateAuthUser } from '@/services/auth-hooks';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardTypeOptions, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as z from 'zod';

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

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

const ResetPasswordForm = () => {
  const { email, token, validated } = useLocalSearchParams();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  
  const { control, handleSubmit, formState: { errors }, watch } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate: updatePassword, isPending } = useUpdateAuthUser();

  // Check if we have a validated token
  React.useEffect(() => {
    if (!validated || !token || !email) {
      Toast.show({
        type: 'error',
        text1: 'Access Denied',
        text2: 'Please verify your email first',
      });
      router.replace('/auth/forgot-password');
    }
  }, [validated, token, email]);

  const password = watch('password');

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return '#ef4444'; // red
    if (strength === 3) return '#f97316'; // orange
    if (strength === 4) return '#eab308'; // yellow
    return '#10b981'; // green
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 2) return 'Weak';
    if (strength === 3) return 'Fair';
    if (strength === 4) return 'Good';
    return 'Strong';
  };

  const onSubmit = (data: ResetPasswordFormInputs) => {
    updatePassword({
      password: data.password,
      metadata: { email: email as string }
    }, {
      onSuccess: () => {
        Toast.show({
          type: 'success',
          text1: 'Success!',
          text2: 'Your password has been reset successfully',
        });
        // Navigate to login screen
        router.replace('/(tabs)');
      },
      onError: (error: any) => {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error?.message || 'Failed to reset password. Please try again.',
        });
      }
    });
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <SafeAreaView className="flex-1 bg-background h-full">
      <View className="flex-1 px-6 py-4 justify-center">
        {/* Header Section */}
        <View className="items-center mb-12 gap-y-2">
          {/* Icon with background */}
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6 mt-8">
            <Ionicons name="lock-closed-outline" size={32} color="#7B2FF2" />
          </View>
          
          <Text className="text-foreground text-2xl font-bold mb-3">Reset Your Password</Text>
          <Text className="text-muted-foreground text-center text-base leading-6 px-4">
            Enter a new password for your account. Make sure it's strong and secure.
          </Text>
        </View>

        {/* Form Section */}
        <View className="mb-8 mt-4 space-y-4">
          {/* New Password */}
          <View>
            <Text className="text-foreground text-sm font-semibold mb-2">New Password</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  icon="lock-closed-outline"
                  placeholder="Enter your new password"
                  value={value}
                  onChange={onChange}
                  secureTextEntry={!isPasswordVisible}
                  toggleVisibility={() => setIsPasswordVisible(!isPasswordVisible)}
                  isPasswordVisible={isPasswordVisible}
                  error={errors.password?.message}
                />
              )}
            />
            
            {/* Password Strength Indicator */}
            {password && (
              <View className="mt-2 px-3">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs text-muted-foreground">Password Strength</Text>
                  <Text 
                    className="text-xs font-medium"
                    style={{ color: getStrengthColor(passwordStrength) }}
                  >
                    {getStrengthText(passwordStrength)}
                  </Text>
                </View>
                <View className="h-1 bg-muted rounded-full overflow-hidden">
                  <View 
                    className="h-full rounded-full transition-all duration-300"
                    style={{ 
                      width: `${(passwordStrength / 5) * 100}%`,
                      backgroundColor: getStrengthColor(passwordStrength)
                    }}
                  />
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          <View className="mt-4">
            <Text className="text-foreground text-sm font-semibold mb-2">Confirm Password</Text>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  icon="lock-closed-outline"
                  placeholder="Confirm your new password"
                  value={value}
                  onChange={onChange}
                  secureTextEntry={!isConfirmPasswordVisible}
                  toggleVisibility={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                  isPasswordVisible={isConfirmPasswordVisible}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>
        </View>

        {/* Password Requirements */}
        <View className="mb-8 p-4 bg-card rounded-2xl border border-border">
          <Text className="text-foreground text-sm font-semibold mb-3">Password Requirements:</Text>
          <View className="space-y-2">
            {[
              { test: password.length >= 8, text: 'At least 8 characters' },
              { test: /[A-Z]/.test(password), text: 'One uppercase letter' },
              { test: /[a-z]/.test(password), text: 'One lowercase letter' },
              { test: /[0-9]/.test(password), text: 'One number' },
            ].map((req, index) => (
              <View key={index} className="flex-row items-center">
                <Ionicons 
                  name={req.test ? "checkmark-circle" : "ellipse-outline"} 
                  size={16} 
                  color={req.test ? "#10b981" : "#6b7280"} 
                />
                <Text className={`ml-2 text-xs ${req.test ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {req.text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reset Password Button */}
        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          className="w-full rounded-2xl overflow-hidden mb-8 active:scale-98"
          style={{
            shadowColor: '#7B2FF2',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            opacity: isPending ? 0.6 : 1,
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
                <ActivityIndicator size="small" color="#fff" />
                <Text className="text-white font-bold text-lg ml-2">Updating...</Text>
              </View>
            ) : (
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                <Text className="text-white font-bold text-lg ml-2">
                  Reset Password
                </Text>
              </View>
            )}
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

export default ResetPasswordForm;
