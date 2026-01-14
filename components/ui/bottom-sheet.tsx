import { useThemedColors } from '@/hooks/useThemedColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  isVisible,
  onClose,
  title,
  children,
  height = 600
}) => {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = useThemedColors().colors

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View className="flex-1 justify-end bg-black/50">
          {/* Backdrop */}
          <Pressable
            onPress={onClose}
            className="absolute inset-0"
          />

          {/* Sheet content */}
          <View
            className={`${theme} bg-background rounded-t-3xl p-6`}
            style={{ maxHeight: '80%' }}
          >
            {(title || true) && (
              <View className="flex-row items-center justify-between pb-4">
                <Text className="text-xl font-bold text-foreground">{title}</Text>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="w-10 h-10 rounded-full bg-gray-500/20 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            )}
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BottomSheet;
