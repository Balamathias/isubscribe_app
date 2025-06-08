import BottomSheet from '@/components/ui/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import PinPad from '../pin-pad';
import { networks } from './buy-data';
import Avatar from '../ui/avatar';
import { useSession } from '../session-context';
import { router } from 'expo-router';
import { Tables } from '@/types/database';
import { SuperPlansMB } from '@/services/accounts';

interface DataBundleDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedBundleDetails: SuperPlansMB;
  onSubmit: () => void;
  networkId: string,
  phoneNumber: string
}

const DataBundleDetailsModal: React.FC<DataBundleDetailsModalProps> = ({
  isVisible,
  onClose,
  selectedBundleDetails,
  onSubmit,
  networkId,
  phoneNumber
}) => {

    const [isPinPadVisible, setPinPadVisible] = useState(false);

    const { user } = useSession()

    const colorSheme = useColorScheme()
    const theme = colorSheme === 'dark' ? 'dark' : 'light'
    const colors = COLORS[theme]
    
    
    const handlePinSubmit = async (pin: string) => {
      console.log('PIN submitted:', pin);
      // TODO: Simulate an API call
      return new Promise<boolean>((resolve) => {
        setTimeout(() => {
          if (pin === '1234') {
            Alert.alert('Success', 'PIN verified successfully!');
            resolve(true);
          } else {
              Alert.alert('Error', 'Incorrect PIN. Please try again.');
              resolve(false);
          }
        }, 1000);
      });
    };
    
    if (!selectedBundleDetails) {
        return null;
    }
    console.log('Selected Bundle Details:', selectedBundleDetails);

    const network = networks.find(n => n.id === networkId);

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title={`${selectedBundleDetails?.quantity} - ${selectedBundleDetails?.duration}(Corporate Gifting)`}
    >
      <View className="flex flex-col gap-4 w-full">
        <View className="p-4 bg-secondary rounded-xl mb-4 w-full">
            <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Product</Text>
            <View className="flex-row items-center">
                <Text className="text-foreground font-semibold text-base mr-2">{network?.name}</Text>
                <Avatar 
                    size={18} 
                    source={network?.logo}
                />
            </View>
            </View>
            <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Phone Number</Text>
            <Text className="text-foreground font-semibold text-base">{phoneNumber}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Price</Text>
            <Text className="text-foreground font-semibold text-base">₦{selectedBundleDetails?.price}.00</Text>
            </View>
            <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Amount</Text>
            <Text className="text-foreground font-semibold text-base">{selectedBundleDetails?.quantity}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Duration</Text>
            <Text className="text-foreground font-semibold text-base">{selectedBundleDetails?.duration}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Data Bonus</Text>
            <Text className="text-primary font-semibold text-base">+<Text>{selectedBundleDetails?.data_bonus}</Text></Text>
            </View>
            <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Plan Name</Text>
            <Text className="text-foreground font-semibold text-base">{selectedBundleDetails?.quantity} - {selectedBundleDetails?.duration}(Corporate Gifting)</Text>
            </View>
            <View className="flex-row justify-between">
            <Text className="text-muted-foreground text-base">Plan Type</Text>
            <Text className="text-foreground font-semibold text-base">{selectedBundleDetails?.name}</Text>
            </View>
        </View>

        <View className="bg-primary/10 rounded-xl p-4 flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
            <Ionicons name="wallet-outline" size={24} color={colors.primary} />
            <View className="ml-3">
                <Text className="text-foreground font-bold text-lg">Wallet Balance <Text className="text-muted-foreground text-sm font-normal">• Selected</Text></Text>
                <Text className="text-foreground font-bold text-xl">{formatNigerianNaira(user ? 207 : 0)}</Text>
            </View>
            </View>
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>

        <TouchableOpacity
            className="rounded-xl py-4 overflow-hidden bg-primary flex flex-row items-center justify-center gap-x-1"
            onPress={() => user ? setPinPadVisible(true) : router.push(`/auth/login`)}
            activeOpacity={0.5}
        >
            <LinearGradient
                colors={[colors.primary, '#e65bf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="absolute inset-0"
            />
            {!user && <Ionicons size={20} name='log-in-outline' color={'white'} />}
            <Text className="text-primary-foreground text-lg font-bold">{user ? 'Proceed' : 'Login'}</Text>
        </TouchableOpacity>

        <PinPad
            isVisible={isPinPadVisible}
            onClose={() => setPinPadVisible(false)}
            handler={handlePinSubmit}
            title="Confirm Transaction"
            description="Enter your 4-digit PIN to complete the payment."
            onSuccess={() => console.log('PIN pad success callback')}
            onError={() => console.log('PIN pad error callback')}
        />
      </View>
    </BottomSheet>
  );
};

export default DataBundleDetailsModal;