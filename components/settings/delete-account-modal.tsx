import { COLORS } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useDeleteAccount } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSession } from '../session-context';
import BottomSheet from '../ui/bottom-sheet';

interface DeleteAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type DeleteStep = 'warning' | 'consequences' | 'confirmation' | 'final';

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isVisible,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<DeleteStep>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const { user } = useSession();
  const { mutateAsync: deleteAccount, isPending } = useDeleteAccount();
  
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];

  const handleClose = () => {
    setCurrentStep('warning');
    setConfirmationText('');
    setIsChecked(false);
    onClose();
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount();
      
      if (result.data) {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: 'Your account has been successfully deleted'
        });
        
        await supabase.auth.signOut();
        
        handleClose();
        router.replace('/auth/login');
      } else {
        throw new Error(result.message || 'Failed to delete account');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Delete Failed',
        text2: error.message || 'Please try again later'
      });
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 'warning':
        return (
          <View className="flex-1">
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center mb-4">
                <Ionicons name="warning" size={40} color="#EF4444" />
              </View>
              <Text className="text-foreground text-xl font-bold mb-2">
                Delete Account
              </Text>
              <Text className="text-muted-foreground text-center">
                Are you sure you want to delete your account? This action cannot be undone.
              </Text>
            </View>

            <View className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
              <Text className="text-red-700 dark:text-red-400 font-semibold text-base mb-2">
                ⚠️ Warning
              </Text>
              <Text className="text-red-600 dark:text-red-300 text-sm">
                Deleting your account will permanently remove all your data, including:
              </Text>
              <View className="mt-2 gap-y-1">
                <Text className="text-red-600 dark:text-red-300 text-sm">• Transaction history</Text>
                <Text className="text-red-600 dark:text-red-300 text-sm">• Wallet balance</Text>
                <Text className="text-red-600 dark:text-red-300 text-sm">• Personal information</Text>
                <Text className="text-red-600 dark:text-red-300 text-sm">• Account settings</Text>
              </View>
            </View>

            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 py-4 rounded-xl border border-border bg-secondary"
              >
                <Text className="text-foreground text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setCurrentStep('consequences')}
                className="flex-1 py-4 rounded-xl bg-red-500"
              >
                <Text className="text-white text-center font-semibold">
                  Continue
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'consequences':
        return (
          <View className="flex-1">
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900 items-center justify-center mb-4">
                <Ionicons name="information-circle" size={40} color="#F59E0B" />
              </View>
              <Text className="text-foreground text-xl font-bold mb-2">
                Account Deletion Consequences
              </Text>
              <Text className="text-muted-foreground text-center">
                Please read the following carefully before proceeding
              </Text>
            </View>

            <ScrollView className="flex-1 mb-6" showsVerticalScrollIndicator={false}>
              <View className="gap-y-4">
                <View className="bg-card rounded-xl p-4 border border-border">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="wallet" size={20} color={colors.primary} />
                    <Text className="text-foreground font-semibold ml-2">
                      Wallet Balance
                    </Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    Any remaining wallet balance will be permanently lost. Please withdraw or use your funds before deletion.
                  </Text>
                </View>

                <View className="bg-card rounded-xl p-4 border border-border">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="time" size={20} color={colors.primary} />
                    <Text className="text-foreground font-semibold ml-2">
                      Transaction History
                    </Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    All your transaction records will be permanently deleted and cannot be recovered.
                  </Text>
                </View>

                <View className="bg-card rounded-xl p-4 border border-border">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="people" size={20} color={colors.primary} />
                    <Text className="text-foreground font-semibold ml-2">
                      Beneficiaries
                    </Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    All saved beneficiaries and frequent contacts will be removed.
                  </Text>
                </View>

                <View className="bg-card rounded-xl p-4 border border-border">
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="shield" size={20} color={colors.primary} />
                    <Text className="text-foreground font-semibold ml-2">
                      Security Settings
                    </Text>
                  </View>
                  <Text className="text-muted-foreground text-sm">
                    All security settings, PINs, and authentication methods will be deleted.
                  </Text>
                </View>

                <View className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
                  <Text className="text-yellow-700 dark:text-yellow-400 font-semibold text-sm mb-2">
                    📱 Account Recovery
                  </Text>
                  <Text className="text-yellow-600 dark:text-yellow-300 text-sm">
                    Once deleted, you cannot recover your account. You would need to create a new account to use our services again.
                  </Text>
                </View>
              </View>
            </ScrollView>

            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={() => setCurrentStep('warning')}
                className="flex-1 py-4 rounded-xl border border-border bg-secondary"
              >
                <Text className="text-foreground text-center font-semibold">
                  Back
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setCurrentStep('confirmation')}
                className="flex-1 py-4 rounded-xl bg-red-500"
              >
                <Text className="text-white text-center font-semibold">
                  I Understand
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'confirmation':
        return (
          <View className="flex-1">
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={40} color="#EF4444" />
              </View>
              <Text className="text-foreground text-xl font-bold mb-2">
                Confirm Account Deletion
              </Text>
              <Text className="text-muted-foreground text-center">
                Please confirm that you want to delete your account
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-foreground font-semibold mb-3">
                Type "DELETE" to confirm:
              </Text>
              <TextInput
                className="border border-border rounded-xl px-4 py-3 text-foreground"
                placeholder="Type DELETE here"
                placeholderTextColor={colors.mutedForeground}
                value={confirmationText}
                onChangeText={setConfirmationText}
                autoCapitalize="characters"
              />
            </View>

            <TouchableOpacity
              onPress={() => setIsChecked(!isChecked)}
              className="flex-row items-center mb-6"
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                isChecked ? 'bg-red-500 border-red-500' : 'border-border'
              }`}>
                {isChecked && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text className="text-foreground text-sm flex-1">
                I understand that this action is permanent and cannot be undone
              </Text>
            </TouchableOpacity>

            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={() => setCurrentStep('consequences')}
                className="flex-1 py-4 rounded-xl border border-border bg-secondary"
              >
                <Text className="text-foreground text-center font-semibold">
                  Back
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setCurrentStep('final')}
                disabled={confirmationText !== 'DELETE' || !isChecked}
                className={`flex-1 py-4 rounded-xl ${
                  confirmationText === 'DELETE' && isChecked 
                    ? 'bg-red-500' 
                    : 'bg-red-300'
                }`}
              >
                <Text className="text-white text-center font-semibold">
                  Proceed
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'final':
        return (
          <View className="flex-1">
            <View className="items-center mb-6">
              <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 items-center justify-center mb-4">
                <Ionicons name="trash" size={40} color="#EF4444" />
              </View>
              <Text className="text-foreground text-xl font-bold mb-2">
                Final Confirmation
              </Text>
              <Text className="text-muted-foreground text-center">
                This is your last chance to cancel
              </Text>
            </View>

            <View className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mb-6">
              <Text className="text-red-700 dark:text-red-400 font-semibold text-base mb-2">
                🚨 Last Warning
              </Text>
              <Text className="text-red-600 dark:text-red-300 text-sm">
                You are about to permanently delete your account. This action is irreversible and will immediately:
              </Text>
              <View className="mt-2 gap-y-1">
                <Text className="text-red-600 dark:text-red-300 text-sm">• Delete all your data</Text>
                <Text className="text-red-600 dark:text-red-300 text-sm">• Remove your wallet balance</Text>
                <Text className="text-red-600 dark:text-red-300 text-sm">• Sign you out of all devices</Text>
                <Text className="text-red-600 dark:text-red-300 text-sm">• Make your account unrecoverable</Text>
              </View>
            </View>

            <View className="flex-row gap-x-3">
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 py-4 rounded-xl border border-border bg-secondary"
                disabled={isPending}
              >
                <Text className="text-foreground text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={isPending}
                className="flex-1 py-4 rounded-xl overflow-hidden"
              >
                <LinearGradient
                  colors={['#EF4444', '#DC2626']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute inset-0"
                />
                <View className="flex-row items-center justify-center">
                  {isPending ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons name="trash" size={18} color="white" />
                      <Text className="text-white font-semibold ml-2">
                        Delete Account
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        );
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'warning':
        return 'Delete Account';
      case 'consequences':
        return 'Deletion Consequences';
      case 'confirmation':
        return 'Confirm Deletion';
      case 'final':
        return 'Final Confirmation';
      default:
        return 'Delete Account';
    }
  };

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={handleClose}
      title={getStepTitle()}
    >
      <View className="flex-1" style={{ minHeight: 400 }}>
        {getStepContent()}
      </View>
    </BottomSheet>
  );
};

export default DeleteAccountModal;
