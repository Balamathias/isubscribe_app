import { useSession } from '@/components/session-context';
import Header from '@/components/transactions/header';
import { COLORS } from '@/constants/colors';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useUpdateProfile } from '@/services/api-hooks';
import { Tables } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

interface ProfileFormData {
  full_name: string;
  phone: string;
  email: string;
  state: string;
  username: string;
}

const ProfileUpdateScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];
  const { theme } = useThemedColors()

  const { profile, user } = useSession();
  const updateProfileMutation = useUpdateProfile();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    phone: '',
    email: '',
    state: '',
    username: '',
  });

  const [errors, setErrors] = useState<Partial<ProfileFormData>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Prefill form with existing data
  useEffect(() => {
    if (profile || user) {
      const initialData = {
        full_name: profile?.full_name || user?.user_metadata?.full_name || '',
        phone: profile?.phone || user?.phone || '',
        email: profile?.email || user?.email || '',
        state: profile?.state || '',
        username: profile?.username || '',
      };
      setFormData(initialData);
    }
  }, [profile, user]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const hasFormChanges =
        formData.full_name !== (profile.full_name || '') ||
        formData.phone !== (profile.phone || '') ||
        formData.email !== (profile.email || '') ||
        formData.state !== (profile.state || '') ||
        formData.username !== (profile.username || '');

      setHasChanges(hasFormChanges);
    }
  }, [formData, profile]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const updateData: Partial<Tables<'profile'>> = {};

      if (formData.full_name.trim()) updateData.full_name = formData.full_name.trim();
      if (formData.phone.trim()) updateData.phone = formData.phone.trim();
      if (formData.email.trim()) updateData.email = formData.email.trim();
      if (formData.state.trim()) updateData.state = formData.state.trim();
      if (formData.username.trim()) updateData.username = formData.username.trim();

      const result = await updateProfileMutation.mutateAsync(updateData);

      if (result.data) {
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile has been updated successfully.',
        });

        queryClient.invalidateQueries({ queryKey: ['getUserProfile'] });
        setHasChanges(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: (result.error as any)?.message || 'Failed to update profile. Please try again.',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An unexpected error occurred',
      });
    }
  };

  const handleReset = () => {
    Alert.alert('Reset Changes', 'Are you sure you want to discard all changes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          const resetData = {
            full_name: profile?.full_name || user?.user_metadata?.full_name || '',
            phone: profile?.phone || user?.phone || '',
            email: profile?.email || user?.email || '',
            state: profile?.state || '',
            username: profile?.username || '',
          };
          setFormData(resetData);
          setErrors({});
        },
      },
    ]);
  };

  const getInitials = () => {
    return formData.full_name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const avatarUrl = user?.user_metadata?.picture || profile?.avatar;
  const initials = getInitials();

  const renderFormField = (
    field: keyof ProfileFormData,
    label: string,
    placeholder: string,
    icon: keyof typeof Ionicons.glyphMap,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default'
  ) => (
    <View className="mb-4">
      <Text
        className="font-semibold text-sm mb-2"
        style={{ color: isDark ? '#fff' : '#111' }}
      >
        {label}
      </Text>
      <View
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
          borderWidth: 1,
          borderColor: errors[field]
            ? '#ef4444'
            : isDark
              ? 'rgba(255,255,255,0.08)'
              : 'rgba(0,0,0,0.06)',
        }}
      >
        <View className="flex-row items-center">
          <View className="pl-4">
            <Ionicons
              name={icon}
              size={18}
              color={errors[field] ? '#ef4444' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'}
            />
          </View>
          <TextInput
            value={formData[field]}
            onChangeText={(value) => handleInputChange(field, value)}
            placeholder={placeholder}
            placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
            keyboardType={keyboardType}
            autoCapitalize={field === 'email' || field === 'username' ? 'none' : 'words'}
            className="flex-1 py-3.5 px-3 text-sm"
            style={{ color: isDark ? '#fff' : '#111' }}
          />
        </View>
      </View>
      {errors[field] && (
        <View className="flex-row items-center mt-1.5">
          <Ionicons name="alert-circle" size={12} color="#ef4444" />
          <Text className="text-xs ml-1" style={{ color: '#ef4444' }}>
            {errors[field]}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      <Header title="Edit Profile" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Profile Picture Section */}
          <View className="items-center py-6">
            <View className="relative">
              <View
                className="w-24 h-24 rounded-full overflow-hidden"
                style={{
                  borderWidth: 3,
                  borderColor: colors.primary + '30',
                }}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-full h-full"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                  />
                ) : (
                  <View
                    className="w-full h-full items-center justify-center"
                    style={{ backgroundColor: colors.primary + '15' }}
                  >
                    {initials ? (
                      <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                        {initials}
                      </Text>
                    ) : (
                      <Ionicons name="person" size={36} color={colors.primary} />
                    )}
                  </View>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full items-center justify-center"
                style={{
                  backgroundColor: colors.primary,
                  borderWidth: 2,
                  borderColor: isDark ? '#1a1a1a' : '#fff',
                }}
              >
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text
              className="text-xs mt-3"
              style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)' }}
            >
              Tap to change photo
            </Text>
          </View>

          {/* Form Fields */}
          <View
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-2.5 bg-primary/20"
              >
                <Ionicons name="person-circle-outline" size={18} color={colors.primary} />
              </View>
              <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                Personal Information
              </Text>
            </View>

            {renderFormField('full_name', 'Full Name', 'Enter your full name', 'person-outline')}
            {renderFormField('username', 'Username', 'Choose a username', 'at')}
          </View>

          <View
            className="rounded-2xl p-4 mb-4"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            }}
          >
            <View className="flex-row items-center mb-4">
              <View
                className="w-8 h-8 rounded-lg items-center justify-center mr-2.5"
                style={{ backgroundColor: '#3b82f6' + '15' }}
              >
                <Ionicons name="mail-outline" size={18} color="#3b82f6" />
              </View>
              <Text className="font-semibold text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                Contact Details
              </Text>
            </View>

            {renderFormField('email', 'Email Address', 'Enter your email', 'mail-outline', 'email-address')}
            {renderFormField('phone', 'Phone Number', 'Enter your phone number', 'call-outline', 'phone-pad')}
            {renderFormField('state', 'State/Region', 'Enter your state', 'location-outline')}
          </View>

          {/* Action Buttons */}
          {hasChanges ? (
            <View className="gap-y-3 mt-2">
              <TouchableOpacity
                onPress={handleSave}
                disabled={updateProfileMutation.isPending}
                activeOpacity={0.9}
                className="rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={
                    updateProfileMutation.isPending
                      ? [isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)']
                      : [colors.primary, '#a855f7']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 flex-row items-center justify-center"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text className="text-white font-bold text-base ml-2">Updating...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text className="text-white font-bold text-base ml-2">Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleReset}
                disabled={updateProfileMutation.isPending}
                activeOpacity={0.85}
                className="rounded-2xl py-4 flex-row items-center justify-center"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  opacity: updateProfileMutation.isPending ? 0.5 : 1,
                }}
              >
                <Ionicons name="refresh" size={18} color={isDark ? '#fff' : '#111'} />
                <Text className="font-semibold text-sm ml-2" style={{ color: isDark ? '#fff' : '#111' }}>
                  Reset Changes
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              className="rounded-xl p-4 flex-row items-center mt-2"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
            >
              <Ionicons name="information-circle" size={18} color={isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)'} />
              <Text
                className="text-xs flex-1 ml-2"
                style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)' }}
              >
                Make changes to see update options
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileUpdateScreen;
