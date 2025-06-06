import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number;
  hideCloseButton?: boolean
}

const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isVisible, 
  onClose, 
  title,
  children,
  height = 600,
  hideCloseButton = false
}) => {
  return (
    <View>
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
            >
            <TouchableOpacity 
                activeOpacity={1} 
                onPress={onClose}
                className="flex-1 justify-end bg-black/50"
                style={{ flex: 1 }}
            >
                <TouchableOpacity 
                activeOpacity={1} 
                onPress={(e) => e.stopPropagation()}
                className="bg-background rounded-t-3xl p-6 max-h-[80vh] w-full"
                >
                {(title && !hideCloseButton) && (
                    <View className="flex-row justify-between items-center mb-6">
                    {title && <Text className="text-foreground font-bold text-xl">{title}</Text>}
                    <TouchableOpacity onPress={onClose} className="p-2">
                        <Ionicons name="close-circle-outline" size={30} color="#000" />
                    </TouchableOpacity>
                    </View>
                )}
                {children}
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },
});

export default BottomSheet;

