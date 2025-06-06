import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface FundWalletBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
}

const FundWalletBottomSheet: React.FC<FundWalletBottomSheetProps> = ({ isVisible, onClose }) => {
  return (
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
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
          className="bg-background rounded-t-3xl p-6 max-h-[80vh]"
        >
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-forground font-bold text-xl">Fund Your Wallet</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close-circle-outline" size={30} className='text-forground' />
            </TouchableOpacity>
          </View>

          <View className="flex-col md:flex-row justify-center items-center gap-4">
            {/* Card 1 */}
            <LinearGradient
              colors={['#17B98E', '#2EDAA4', '#2CD27F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-5 w-full md:w-1/2 min-h-[180px] overflow-hidden"
            >
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="card-outline" size={24} color="#fff" />
                  <Text className="text-white font-semibold text-lg ml-2">isubscribe Virtual</Text>
                </View>
                <View className="flex-row">
                  <View className="w-4 h-4 rounded-full bg-white/30 mr-1" />
                  <View className="w-4 h-4 rounded-full bg-white/30" />
                </View>
              </View>
              <Text className="text-white/80 text-xs mb-1">ACCOUNT NUMBER</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-bold text-2xl">6618312297</Text>
                <TouchableOpacity className="bg-white rounded-full p-3">
                  <Ionicons name="copy-outline" size={20} color="#7B2FF2" />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between items-start mt-4">
                <View>
                  <Text className="text-white/80 text-xs mb-1">BANK NAME</Text>
                  <Text className="text-white font-semibold text-base">Palmpay</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white/80 text-xs mb-1">ACCOUNT NAME</Text>
                  <Text className="text-white font-semibold text-base text-right">Bala Mathias (isubscribe)</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Card 2 */}
            <LinearGradient
              colors={['#7B2FF2', '#8667f7', '#F357A8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-2xl p-5 w-full md:w-1/2 min-h-[180px] overflow-hidden"
            >
              <View className="flex-row justify-between items-center mb-4">
                <View className="flex-row items-center">
                  <Ionicons name="card-outline" size={24} color="#fff" />
                  <Text className="text-white font-semibold text-lg ml-2">isubscribe Virtual</Text>
                </View>
                <View className="flex-row">
                  <View className="w-4 h-4 rounded-full bg-white/30 mr-1" />
                  <View className="w-4 h-4 rounded-full bg-white/30" />
                </View>
              </View>
              <Text className="text-white/80 text-xs mb-1">ACCOUNT NUMBER</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-white font-bold text-2xl">6886597590</Text>
                <TouchableOpacity className="bg-white rounded-full p-3">
                  <Ionicons name="copy-outline" size={20} color="#7B2FF2" />
                </TouchableOpacity>
              </View>
              <View className="flex-row justify-between items-start mt-4">
                <View>
                  <Text className="text-white/80 text-xs mb-1">BANK NAME</Text>
                  <Text className="text-white font-semibold text-base">Moniepoint ...</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white/80 text-xs mb-1">ACCOUNT NAME</Text>
                  <Text className="text-white font-semibold text-base text-right">iSubscribe Network Technology.-Mat</Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FundWalletBottomSheet;