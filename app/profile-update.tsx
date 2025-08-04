import { useSession } from '@/components/session-context';
import Header from '@/components/transactions/header';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useUpdateProfile } from '@/services/api-hooks';
import { Tables } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface ProfileFormData {
  full_name: string;
  phone: string;
  email: string;
  state: string;
  username: string;
}

const ProfileUpdateScreen = () => {
  const { colors, theme } = useThemedColors();
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
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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
      // Only send fields that have values
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
        
        // Invalidate profile queries
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
    Alert.alert(
      'Reset Changes',
      'Are you sure you want to discard all changes?',
      [
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
      ]
    );
  };

  const renderProfilePicture = () => {
    const avatarUrl = user?.user_metadata?.picture || profile?.avatar;
    const initials = formData.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    return (
      <View className="items-center mb-8">
        <View className="relative">
          <View
            className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20"
            style={{ borderColor: colors.primary + '20' }}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="w-full h-full"
                style={{ backgroundColor: colors.muted }}
              />
            ) : (
              <View
                className="w-full h-full items-center justify-center"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                {initials ? (
                  <Text
                    className="text-primary font-bold text-2xl md:text-3xl"
                    style={{ color: colors.primary }}
                  >
                    {initials}
                  </Text>
                ) : (
                  <Ionicons name="person" size={width > 768 ? 48 : 36} color={colors.primary} />
                )}
              </View>
            )}
          </View>
          
          <View
            className="absolute bottom-0 right-0 w-8 h-8 md:w-10 md:h-10 bg-primary rounded-full items-center justify-center border-2 border-background"
            style={{ backgroundColor: colors.primary, borderColor: colors.background }}
          >
            <Ionicons name="camera" size={width > 768 ? 20 : 16} color="#fff" />
          </View>
        </View>
        
        <Text className="text-muted-foreground text-sm mt-3 text-center">
          Profile picture coming soon
        </Text>
      </View>
    );
  };

  const renderFormField = (
    field: keyof ProfileFormData,
    label: string,
    placeholder: string,
    icon: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default'
  ) => (
    <View className="mb-6">
      <Text className="text-foreground font-semibold mb-2 text-base">{label}</Text>
      <View className="relative">
        <View className="absolute left-4 top-4 z-10">
          <Ionicons name={icon as any} size={20} color={colors.mutedForeground} />
        </View>
        <TextInput
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={keyboardType}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
          className={`border rounded-xl pl-12 pr-4 py-4 text-foreground bg-card text-base border-border/90 ${errors[field] ? 'border-destructive' : ''}`}
        />
      </View>
      {errors[field] && (
        <Text className="text-destructive text-sm mt-1" style={{ color: colors.destructive }}>
          {errors[field]}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-background ${theme}`} edges={['bottom']}>
      <Header title="Edit Profile" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4 md:px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          <View className="max-w-lg mx-auto w-full pt-6">
            {renderProfilePicture()}

            <View className="space-y-0">
              {renderFormField('full_name', 'Full Name', 'Enter your full name', 'person')}
              {renderFormField('username', 'Username', 'Choose a username', 'at')}
              {renderFormField('email', 'Email Address', 'Enter your email', 'mail', 'email-address')}
              {renderFormField('phone', 'Phone Number', 'Enter your phone number', 'call', 'phone-pad')}
              {renderFormField('state', 'State', 'Enter your state', 'location')}
            </View>

            {hasChanges && (
              <View className="mt-8 gap-y-4">
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="bg-primary rounded-xl py-4 px-6 flex-row items-center justify-center"
                  style={{
                    backgroundColor: updateProfileMutation.isPending ? colors.muted : colors.primary,
                    opacity: updateProfileMutation.isPending ? 0.7 : 1,
                    experimental_backgroundImage: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.destructive} 100%)`
                  }}
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text className="text-white font-semibold text-lg">Updating...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text className="text-white font-semibold text-lg">Save Changes</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleReset}
                  disabled={updateProfileMutation.isPending}
                  className="border border-border rounded-xl py-4 px-6 flex-row items-center justify-center"
                  style={{
                    opacity: updateProfileMutation.isPending ? 0.5 : 1,
                  }}
                >
                  <Ionicons name="refresh" size={20} color={colors.mutedForeground} style={{ marginRight: 8 }} />
                  <Text className="text-muted-foreground font-semibold text-lg">Reset Changes</Text>
                </TouchableOpacity>
              </View>
            )}

            {!hasChanges && (
              <View className="mt-8 bg-muted-foreground/10 rounded-xl p-4 flex-row items-center">
                <Ionicons name="information-circle" size={20} color={colors.mutedForeground} style={{ marginRight: 12 }} />
                <Text className="text-muted-foreground flex-1">
                  Make changes to see update options
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileUpdateScreen;
