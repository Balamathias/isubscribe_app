import { useThemedColors } from '@/hooks/useThemedColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Text, TouchableOpacity, TouchableWithoutFeedback, useColorScheme, View } from 'react-native';

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
    <View style={{ flex: 1 }} className={`${theme} bg-background`}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} />
        </TouchableWithoutFeedback>
        <View
          className="flex-1 justify-end bg-black/50"
          style={{ flex: 1 }}
        >
          <View
            className="bg-background rounded-t-3xl p-6 max-h-[80vh] w-full"
            style={{ position: 'absolute', bottom: 0, width: '100%' }}
          >
            {(title || true) && (
              <View className="flex-row justify-between items-center mb-4 sm:mb-6">
                {title && <Text className="text-foreground font-bold text-lg sm:text-xl flex-1 mr-2" numberOfLines={1}>{title}</Text>}
                <TouchableOpacity onPress={onClose} className="p-2">
                  <Ionicons name="close-circle-outline" size={30} color={colors.foreground} />
                </TouchableOpacity>
              </View>
            )}
            {children}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BottomSheet;
