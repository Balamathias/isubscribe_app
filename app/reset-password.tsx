import ResetPasswordForm from '@/components/auth/reset-password-form';
import { useThemedColors } from '@/hooks/useThemedColors';
import React from 'react';
import { ScrollView } from 'react-native';
import { View } from 'react-native';

const ResetPasswordScreen = () => {
  console.log('ResetPasswordScreen rendered');
  const { theme } = useThemedColors();
  return (
    <View className={"flex flex-1 bg-background min-h-full justify-center items-center w-full" + ` ${theme}`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <ResetPasswordForm />
      </ScrollView>
    </View>
  );
};

export default ResetPasswordScreen;
