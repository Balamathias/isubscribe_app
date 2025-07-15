import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useLocalAuth = () => {
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    loadBiometricStatus();
  }, []);

  const checkBiometricSupport = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    setIsBiometricSupported(compatible);
  };

  const loadBiometricStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('@isubscribe/local-auth-status');
      setIsBiometricEnabled(status === 'true');
    } catch (error) {
      console.error('Error loading biometric status:', error);
    }
  };

  const toggleBiometric = async () => {
    if (!isBiometricSupported) {
      Alert.alert('Not Supported', 'Biometric authentication is not supported on this device.');
      return;
    }

    try {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        Alert.alert('Not Set Up', 'Please set up biometric authentication in your device settings.');
        return;
      }

      const newStatus = !isBiometricEnabled;
      await AsyncStorage.setItem('@isubscribe/local-auth-status', String(newStatus));
      setIsBiometricEnabled(newStatus);
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('Error', 'Failed to update biometric settings.');
    }
  };

  const authenticate = async (onCustomFallback?: () => void): Promise<boolean> => {
  if (!isBiometricEnabled) return true;

  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      fallbackLabel: 'Use PIN',
      disableDeviceFallback: true,
      cancelLabel: 'Use PIN',
    });

    if (result.success) {
      return true;
    } else if (result.error === 'user_fallback' && onCustomFallback) {
      onCustomFallback();
      return false;
    }

    return false;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};


  return {
    isBiometricSupported,
    isBiometricEnabled,
    toggleBiometric,
    authenticate,
  };
};