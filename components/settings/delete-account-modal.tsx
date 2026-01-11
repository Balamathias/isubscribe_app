import { supabase } from '@/lib/supabase';
import { useDeleteAccount } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSession } from '../session-context';

const { height: screenHeight } = Dimensions.get('window');

interface DeleteAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [confirmText, setConfirmText] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [canDelete, setCanDelete] = useState(false);
  const { user } = useSession();
  const { mutateAsync: deleteAccount, isPending } = useDeleteAccount();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animations
  const slideAnim = useRef(new Animated.Value(screenHeight)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Countdown timer for final step
  useEffect(() => {
    if (step === 2 && confirmText === 'DELETE' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (countdown === 0) {
      setCanDelete(true);
    }
  }, [step, confirmText, countdown]);

  // Pulse animation for delete button when ready
  useEffect(() => {
    if (canDelete) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [canDelete, pulseAnim]);

  // Open/close animations
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, backdropAnim]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setStep(1);
      setConfirmText('');
      setCountdown(5);
      setCanDelete(false);
      onClose();
    });
  }, [slideAnim, backdropAnim, onClose]);

  const shakeButton = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleDelete = async () => {
    if (!canDelete) {
      shakeButton();
      return;
    }

    try {
      const result = await deleteAccount();
      if (result.data) {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: 'Your account has been permanently removed',
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
        text2: error.message || 'Please try again',
      });
    }
  };

  const goToStep2 = () => {
    setStep(2);
    setCountdown(5);
    setCanDelete(false);
  };

  if (!isVisible) return null;

  return (
    <View className="absolute inset-0" style={{ zIndex: 1000 }}>
      {/* Backdrop */}
      <Animated.View
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(0,0,0,0.7)',
          opacity: backdropAnim,
        }}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View className="flex-1" />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Bottom Sheet */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0"
        style={{
          transform: [{ translateY: slideAnim }],
          maxHeight: screenHeight * 0.9,
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View
            className="rounded-t-[32px] overflow-hidden"
            style={{
              backgroundColor: isDark ? '#0f0f1a' : '#ffffff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            {/* Handle */}
            <View className="items-center pt-3 pb-2">
              <View
                className="w-10 h-1 rounded-full"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                }}
              />
            </View>

            <ScrollView
              className="px-6"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {step === 1 ? (
                /* ========== STEP 1: Warning ========== */
                <View className="pb-8">
                  {/* Header */}
                  <View className="items-center py-6">
                    <View
                      className="w-24 h-24 rounded-full items-center justify-center mb-5"
                      style={{
                        backgroundColor: 'rgba(220, 38, 38, 0.1)',
                      }}
                    >
                      <Ionicons name="skull-outline" size={48} color="#dc2626" />
                    </View>

                    <Text
                      className="text-2xl font-bold text-center mb-2"
                      style={{ color: isDark ? '#ffffff' : '#111' }}
                    >
                      This is permanent
                    </Text>
                    <Text
                      className="text-base text-center px-4"
                      style={{
                        color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                        lineHeight: 22,
                      }}
                    >
                      Deleting your account will erase everything and cannot be undone.
                    </Text>
                  </View>

                  {/* What you'll lose */}
                  <View
                    className="rounded-2xl p-5 mb-6"
                    style={{
                      backgroundColor: isDark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.04)',
                      borderWidth: 1,
                      borderColor: 'rgba(220,38,38,0.15)',
                    }}
                  >
                    <Text
                      className="text-sm font-semibold mb-4"
                      style={{ color: '#dc2626' }}
                    >
                      You will permanently lose:
                    </Text>

                    {[
                      { icon: 'wallet', text: 'Your wallet balance' },
                      { icon: 'receipt', text: 'All transaction history' },
                      { icon: 'people', text: 'Saved beneficiaries' },
                      { icon: 'key', text: 'Your PIN and security settings' },
                    ].map((item, i) => (
                      <View key={i} className="flex-row items-center mb-3 last:mb-0">
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color="#dc2626"
                          style={{ opacity: 0.8, marginRight: 12 }}
                        />
                        <Text
                          className="text-sm"
                          style={{
                            color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                          }}
                        >
                          {item.text}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Buttons */}
                  <TouchableOpacity
                    onPress={goToStep2}
                    activeOpacity={0.9}
                    className="mb-3"
                  >
                    <View
                      className="py-4 rounded-2xl items-center"
                      style={{ backgroundColor: '#dc2626' }}
                    >
                      <Text className="text-white font-bold text-base">
                        Continue to Delete
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
                    <View
                      className="py-4 rounded-2xl items-center"
                      style={{
                        backgroundColor: isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                      }}
                    >
                      <Text
                        className="font-semibold text-base"
                        style={{ color: isDark ? '#fff' : '#111' }}
                      >
                        Keep My Account
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                /* ========== STEP 2: Confirm ========== */
                <View className="pb-8">
                  {/* Header */}
                  <View className="items-center py-6">
                    <View
                      className="w-20 h-20 rounded-full items-center justify-center mb-4"
                      style={{
                        backgroundColor: 'rgba(220, 38, 38, 0.15)',
                      }}
                    >
                      <Ionicons name="warning" size={40} color="#dc2626" />
                    </View>

                    <Text
                      className="text-xl font-bold text-center mb-1"
                      style={{ color: isDark ? '#ffffff' : '#111' }}
                    >
                      Final Step
                    </Text>
                    <Text
                      className="text-sm text-center"
                      style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
                    >
                      {user?.email}
                    </Text>
                  </View>

                  {/* Type DELETE */}
                  <View className="mb-5">
                    <Text
                      className="text-sm font-medium mb-3 text-center"
                      style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
                    >
                      Type <Text style={{ color: '#dc2626', fontWeight: '700' }}>DELETE</Text> to confirm
                    </Text>
                    <TextInput
                      className="rounded-xl px-4 py-4 text-center text-lg font-bold tracking-widest"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderWidth: 2,
                        borderColor:
                          confirmText === 'DELETE'
                            ? '#22c55e'
                            : isDark
                              ? 'rgba(255,255,255,0.1)'
                              : 'rgba(0,0,0,0.08)',
                        color: confirmText === 'DELETE' ? '#22c55e' : isDark ? '#fff' : '#111',
                      }}
                      value={confirmText}
                      onChangeText={(t) => {
                        setConfirmText(t.toUpperCase());
                        if (t.toUpperCase() !== 'DELETE') {
                          setCountdown(5);
                          setCanDelete(false);
                        }
                      }}
                      placeholder="• • • • • •"
                      placeholderTextColor={isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}
                      autoCapitalize="characters"
                      autoCorrect={false}
                      maxLength={6}
                    />
                  </View>

                  {/* Countdown or Ready */}
                  {confirmText === 'DELETE' && (
                    <View className="items-center mb-5">
                      {countdown > 0 ? (
                        <View className="flex-row items-center">
                          <View
                            className="w-8 h-8 rounded-full items-center justify-center mr-2"
                            style={{ backgroundColor: 'rgba(220,38,38,0.1)' }}
                          >
                            <Text className="text-sm font-bold" style={{ color: '#dc2626' }}>
                              {countdown}
                            </Text>
                          </View>
                          <Text
                            className="text-sm"
                            style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
                          >
                            Please wait...
                          </Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center">
                          <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                          <Text className="text-sm ml-2" style={{ color: '#22c55e' }}>
                            Ready to delete
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Delete Button */}
                  <Animated.View
                    style={{
                      transform: [
                        { translateX: shakeAnim },
                        { scale: canDelete ? pulseAnim : 1 },
                      ],
                    }}
                  >
                    <TouchableOpacity
                      onPress={handleDelete}
                      activeOpacity={0.9}
                      disabled={isPending}
                      className="mb-3"
                    >
                      <View
                        className="py-4 rounded-2xl flex-row items-center justify-center"
                        style={{
                          backgroundColor: canDelete ? '#dc2626' : isDark ? 'rgba(220,38,38,0.3)' : 'rgba(220,38,38,0.2)',
                        }}
                      >
                        {isPending ? (
                          <ActivityIndicator color="white" size="small" />
                        ) : (
                          <Text
                            className="font-bold text-base"
                            style={{
                              color: canDelete ? '#fff' : isDark ? 'rgba(255,255,255,0.4)' : 'rgba(220,38,38,0.5)',
                            }}
                          >
                            {canDelete ? 'Delete Forever' : 'Waiting...'}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animated.View>

                  {/* Back / Cancel */}
                  <View className="flex-row gap-x-3">
                    <TouchableOpacity
                      onPress={() => {
                        setStep(1);
                        setConfirmText('');
                        setCountdown(5);
                        setCanDelete(false);
                      }}
                      activeOpacity={0.8}
                      className="flex-1"
                    >
                      <View
                        className="py-3.5 rounded-2xl items-center"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)',
                        }}
                      >
                        <Text
                          className="font-medium text-sm"
                          style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
                        >
                          Go Back
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleClose} activeOpacity={0.8} className="flex-1">
                      <View
                        className="py-3.5 rounded-2xl items-center"
                        style={{
                          backgroundColor: isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.04)',
                        }}
                      >
                        <Text
                          className="font-semibold text-sm"
                          style={{ color: isDark ? '#fff' : '#111' }}
                        >
                          Cancel
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
};

export default DeleteAccountModal;
