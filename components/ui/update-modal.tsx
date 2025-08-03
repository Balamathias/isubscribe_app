import { useSession } from '@/components/session-context';
import BottomSheet from '@/components/ui/bottom-sheet';
import { useThemedColors } from '@/hooks/useThemedColors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import React, { useEffect, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

const UPDATE_DISMISSED_KEY = '@update_dismissed_';
const UPDATE_REMINDER_INTERVAL = 24 * 60 * 60 * 1000;

interface UpdateModalProps {
  isVisible: boolean;
  onClose: () => void;
  updateUrl: string;
  updateMessage: string;
  appVersion: string;
}

const UpdateModal: React.FC<UpdateModalProps> = ({
  isVisible,
  onClose,
  updateUrl,
  updateMessage,
  appVersion
}) => {
  const { colors } = useThemedColors();

  const handleUpdateNow = async () => {
    try {
      const supported = await Linking.canOpenURL(updateUrl);
      if (supported) {
        await Linking.openURL(updateUrl);
        onClose();
      } else {
        Alert.alert(
          'Update Available',
          'Please visit your app store to update the app.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (error) {
      console.error('Error opening update URL:', error);
      Alert.alert(
        'Update Available',
        'Please visit your app store to update the app.',
        [{ text: 'OK', onPress: onClose }]
      );
    }
  };

  const handleRemindLater = async () => {
    try {
      const remindTime = Date.now() + UPDATE_REMINDER_INTERVAL;
      await AsyncStorage.setItem(`${UPDATE_DISMISSED_KEY}${appVersion}`, remindTime.toString());
      onClose();
    } catch (error) {
      console.error('Error saving reminder:', error);
      onClose();
    }
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={handleRemindLater} title="Update Available">
      <View className="pb-4">
        <View className="items-center mb-6">
          <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
            <Ionicons name="download-outline" size={32} color={colors.primary} />
          </View>
          <Text className="text-foreground font-bold text-xl text-center mb-2">
            New Version Available!
          </Text>
          <Text className="text-muted-foreground text-center text-base">
            Current version: {appVersion}
          </Text>
        </View>

        <View className="bg-card border border-border/20 rounded-2xl p-4 mb-6">
          <View className="flex-row items-start mb-2">
            <Ionicons 
              name="information-circle-outline" 
              size={20} 
              color={colors.primary} 
              style={{ marginRight: 8, marginTop: 2 }} 
            />
            <Text className="text-foreground font-semibold text-lg flex-1">
              What's New
            </Text>
          </View>
          <Text className="text-muted-foreground leading-6">
            {updateMessage || 'This update includes bug fixes, performance improvements, and new features to enhance your experience.'}
          </Text>
        </View>

        <View className="gap-y-3 mb-6 hidden">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-green-500/10 rounded-full items-center justify-center mr-3">
              <Ionicons name="checkmark" size={12} color="#10B981" />
            </View>
            <Text className="text-muted-foreground flex-1">
              Enhanced security and performance
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-blue-500/10 rounded-full items-center justify-center mr-3">
              <Ionicons name="star" size={12} color="#3B82F6" />
            </View>
            <Text className="text-muted-foreground flex-1">
              New features and improvements
            </Text>
          </View>
          
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-purple-500/10 rounded-full items-center justify-center mr-3">
              <Ionicons name="shield-checkmark" size={12} color="#8B5CF6" />
            </View>
            <Text className="text-muted-foreground flex-1">
              Bug fixes and stability improvements
            </Text>
          </View>
        </View>

        <View className="gap-y-3">
          <TouchableOpacity
            onPress={handleUpdateNow}
            activeOpacity={0.8}
            className='py-4 rounded-2xl bg-primary'
            style={{
                experimental_backgroundImage: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.destructive} 100%)`,
            }}
          >
              <View className="flex-row items-center justify-center">
                <Ionicons name="download" size={20} color="#fff" style={{ marginRight: 8 }} />
                <Text className="text-white font-bold text-lg">Update Now</Text>
              </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleRemindLater}
            className="border border-border rounded-2xl py-4 px-6"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="time-outline" size={20} color={colors.muted} style={{ marginRight: 8 }} />
              <Text className="text-muted-foreground font-semibold text-lg">Remind Me Later</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-muted-foreground text-xs text-center mt-4 leading-4">
          We'll remind you again in 24 hours. You can always update from your app store.
        </Text>
      </View>
    </BottomSheet>
  );
};

export const useUpdateModal = () => {
  const [showModal, setShowModal] = useState(false);
  const { appConfig } = useSession();

  useEffect(() => {
    const checkForUpdates = async () => {
      if (!appConfig?.update_available) return;

      try {
        const dismissedTime = await AsyncStorage.getItem(`${UPDATE_DISMISSED_KEY}${appConfig.app_version}`);
        
        if (dismissedTime) {
          const reminderTime = parseInt(dismissedTime);
          const now = Date.now();
          
          // Only show if reminder time has passed
          if (now >= reminderTime) {
            setShowModal(true);
          }
        } else {
          // First time seeing this update
          setShowModal(true);
        }
      } catch (error) {
        console.error('Error checking update status:', error);
        // Show modal on error to be safe
        if (appConfig?.update_available) {
          setShowModal(true);
        }
      }
    };

    // Small delay to ensure app is loaded
    const timer = setTimeout(checkForUpdates, 2000);
    return () => clearTimeout(timer);
  }, [appConfig]);

  const closeModal = () => {
    setShowModal(false);
  };

  return {
    showUpdateModal: showModal,
    closeUpdateModal: closeModal,
    UpdateModal: () => (
      <UpdateModal
        isVisible={showModal}
        onClose={closeModal}
        updateUrl={appConfig?.update_url || ''}
        updateMessage={appConfig?.update_message || ''}
        appVersion={appConfig?.app_version || '1.0.0'}
      />
    ),
  };
};

export default UpdateModal;
