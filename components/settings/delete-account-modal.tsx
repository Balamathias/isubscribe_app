import { COLORS } from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useDeleteAccount } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSession } from '../session-context';

const { width: screenWidth } = Dimensions.get('window');

interface DeleteAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
}

type DeleteStep = 'warning' | 'confirm' | 'final';

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isVisible,
  onClose,
}) => {
  const [currentStep, setCurrentStep] = useState<DeleteStep>('warning');
  const [confirmationText, setConfirmationText] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const { user } = useSession();
  const { mutateAsync: deleteAccount, isPending } = useDeleteAccount();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, scaleAnim, slideAnim]);

  const animateStepChange = (callback: () => void) => {
    Animated.timing(slideAnim, {
      toValue: -20,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      callback();
      slideAnim.setValue(20);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentStep('warning');
      setConfirmationText('');
      setIsChecked(false);
      onClose();
    });
  };

  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount();

      if (result.data) {
        Toast.show({
          type: 'success',
          text1: 'Account Deleted',
          text2: 'Your account has been successfully deleted',
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
        text2: error.message || 'Please try again later',
      });
    }
  };

  const goToStep = (step: DeleteStep) => {
    animateStepChange(() => setCurrentStep(step));
  };

  // Step indicator
  const StepIndicator = () => {
    const steps: DeleteStep[] = ['warning', 'confirm', 'final'];
    const currentIndex = steps.indexOf(currentStep);

    return (
      <View className="flex-row items-center justify-center mb-6">
        {steps.map((step, index) => (
          <View key={step} className="flex-row items-center">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  index <= currentIndex
                    ? '#ef4444'
                    : isDark
                      ? 'rgba(255,255,255,0.2)'
                      : 'rgba(0,0,0,0.1)',
              }}
            />
            {index < steps.length - 1 && (
              <View
                className="w-8 h-0.5 mx-1"
                style={{
                  backgroundColor:
                    index < currentIndex
                      ? '#ef4444'
                      : isDark
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(0,0,0,0.1)',
                }}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  // Consequence Item Component
  const ConsequenceItem = ({
    icon,
    title,
    description,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
  }) => (
    <View className="flex-row items-start mb-4">
      <View
        className="w-10 h-10 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
      >
        <Ionicons name={icon} size={18} color="#ef4444" />
      </View>
      <View className="flex-1">
        <Text
          className="font-semibold text-sm mb-0.5"
          style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
        >
          {title}
        </Text>
        <Text
          className="text-xs"
          style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)' }}
        >
          {description}
        </Text>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'warning':
        return (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Icon */}
            <View className="items-center mb-5">
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Ionicons name="warning" size={40} color="#ef4444" />
              </View>
            </View>

            {/* Title */}
            <Text
              className="text-2xl font-bold text-center mb-2"
              style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
            >
              Delete Your Account?
            </Text>

            {/* Description */}
            <Text
              className="text-center text-base mb-6"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
            >
              This action is permanent and cannot be undone. All your data will be permanently removed.
            </Text>

            {/* Consequences Card */}
            <View
              className="rounded-2xl p-4 mb-6"
              style={{
                backgroundColor: isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(239,68,68,0.2)',
              }}
            >
              <ConsequenceItem
                icon="wallet-outline"
                title="Wallet Balance"
                description="Any remaining balance will be lost"
              />
              <ConsequenceItem
                icon="time-outline"
                title="Transaction History"
                description="All records permanently deleted"
              />
              <ConsequenceItem
                icon="people-outline"
                title="Saved Beneficiaries"
                description="All contacts removed"
              />
              <ConsequenceItem
                icon="shield-checkmark-outline"
                title="Security Settings"
                description="PINs and auth methods deleted"
              />
            </View>

            {/* Buttons */}
            <View className="gap-y-3">
              <TouchableOpacity
                onPress={() => goToStep('confirm')}
                activeOpacity={0.9}
              >
                <View
                  className="py-4 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  <Text className="text-white font-bold text-base">
                    I Understand, Continue
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleClose} activeOpacity={0.8}>
                <View
                  className="py-4 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <Text
                    className="font-semibold text-base"
                    style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
                  >
                    Cancel
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 'confirm':
        return (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Icon */}
            <View className="items-center mb-5">
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <Ionicons name="key-outline" size={40} color="#ef4444" />
              </View>
            </View>

            {/* Title */}
            <Text
              className="text-2xl font-bold text-center mb-2"
              style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
            >
              Confirm Deletion
            </Text>

            {/* Description */}
            <Text
              className="text-center text-base mb-6"
              style={{ color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }}
            >
              To proceed, please type <Text className="font-bold text-red-500">DELETE</Text> below
            </Text>

            {/* Input */}
            <View className="mb-5">
              <TextInput
                className="rounded-2xl px-5 py-4 text-center text-lg font-semibold"
                style={{
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(0,0,0,0.03)',
                  borderWidth: 1.5,
                  borderColor:
                    confirmationText === 'DELETE'
                      ? '#ef4444'
                      : isDark
                        ? 'rgba(255,255,255,0.1)'
                        : 'rgba(0,0,0,0.08)',
                  color: isDark ? '#ffffff' : '#1a1a2e',
                }}
                placeholder="Type DELETE"
                placeholderTextColor={
                  isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                }
                value={confirmationText}
                onChangeText={setConfirmationText}
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            {/* Checkbox */}
            <TouchableOpacity
              onPress={() => setIsChecked(!isChecked)}
              className="flex-row items-center mb-6"
              activeOpacity={0.7}
            >
              <View
                className="w-6 h-6 rounded-lg mr-3 items-center justify-center"
                style={{
                  backgroundColor: isChecked
                    ? '#ef4444'
                    : isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)',
                  borderWidth: isChecked ? 0 : 1.5,
                  borderColor: isDark
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(0,0,0,0.1)',
                }}
              >
                {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <Text
                className="flex-1 text-sm"
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
              >
                I understand this action is permanent and cannot be undone
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View className="gap-y-3">
              <TouchableOpacity
                onPress={() => goToStep('final')}
                disabled={confirmationText !== 'DELETE' || !isChecked}
                activeOpacity={0.9}
              >
                <View
                  className="py-4 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor:
                      confirmationText === 'DELETE' && isChecked
                        ? '#ef4444'
                        : isDark
                          ? 'rgba(239,68,68,0.3)'
                          : 'rgba(239,68,68,0.4)',
                  }}
                >
                  <Text
                    className="font-bold text-base"
                    style={{
                      color:
                        confirmationText === 'DELETE' && isChecked
                          ? '#ffffff'
                          : isDark
                            ? 'rgba(255,255,255,0.5)'
                            : 'rgba(255,255,255,0.8)',
                    }}
                  >
                    Proceed to Final Step
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => goToStep('warning')}
                activeOpacity={0.8}
              >
                <View
                  className="py-4 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <Text
                    className="font-semibold text-base"
                    style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
                  >
                    Go Back
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 'final':
        return (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* Icon */}
            <View className="items-center mb-5">
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
              >
                <Ionicons name="trash" size={40} color="#ef4444" />
              </View>
            </View>

            {/* Title */}
            <Text
              className="text-2xl font-bold text-center mb-2"
              style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
            >
              Final Confirmation
            </Text>

            {/* Warning Card */}
            <View
              className="rounded-2xl p-4 mb-6"
              style={{
                backgroundColor: 'rgba(239,68,68,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239,68,68,0.3)',
              }}
            >
              <View className="flex-row items-center mb-3">
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text className="text-red-500 font-bold text-base ml-2">
                  Last Chance!
                </Text>
              </View>
              <Text
                className="text-sm leading-5"
                style={{ color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }}
              >
                Clicking the button below will immediately and permanently delete your account for{' '}
                <Text className="font-semibold" style={{ color: isDark ? '#fff' : '#000' }}>
                  {user?.email}
                </Text>
                . This cannot be reversed.
              </Text>
            </View>

            {/* Buttons */}
            <View className="gap-y-3">
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={isPending}
                activeOpacity={0.9}
              >
                <View
                  className="py-4 rounded-2xl flex-row items-center justify-center"
                  style={{
                    backgroundColor: '#dc2626',
                    opacity: isPending ? 0.7 : 1,
                  }}
                >
                  {isPending ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name="trash"
                        size={18}
                        color="white"
                        style={{ marginRight: 8 }}
                      />
                      <Text className="text-white font-bold text-base">
                        Delete My Account Forever
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                disabled={isPending}
                activeOpacity={0.8}
              >
                <View
                  className="py-4 rounded-2xl items-center justify-center"
                  style={{
                    backgroundColor: isDark
                      ? 'rgba(255,255,255,0.08)'
                      : 'rgba(0,0,0,0.05)',
                  }}
                >
                  <Text
                    className="font-semibold text-base"
                    style={{ color: isDark ? '#ffffff' : '#1a1a2e' }}
                  >
                    Keep My Account
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        className="flex-1 items-center justify-center px-5"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          opacity: fadeAnim,
        }}
      >
        <Animated.View
          className="w-full rounded-3xl p-6"
          style={{
            maxWidth: screenWidth - 40,
            backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
            transform: [{ scale: scaleAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 25 },
            shadowOpacity: 0.4,
            shadowRadius: 40,
            elevation: 25,
          }}
        >
          {/* Step Indicator */}
          <StepIndicator />

          {/* Content */}
          {renderStepContent()}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default DeleteAccountModal;
