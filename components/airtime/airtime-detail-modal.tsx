import BottomSheet from '@/components/ui/bottom-sheet';
import { COLORS } from '@/constants/colors';
import { formatNigerianNaira } from '@/utils/format-naira';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import PinPad from '../pin-pad';
import { networks } from './buy-airtime';
import Avatar from '../ui/avatar';
import { useSession } from '../session-context';
import { router } from 'expo-router';

interface AirtimeDetailsModalProps {
  isVisible: boolean;
  onClose: () => void;
  selectedPlan: any;
  onSubmit: () => void;
  phoneNumber: string;
  networkId: string;
}

const AirtimeDetailsModal: React.FC<AirtimeDetailsModalProps> = ({
  isVisible,
  onClose,
  selectedPlan,
  onSubmit,
  phoneNumber,
  networkId,
}) => {
  const [isPinPadVisible, setPinPadVisible] = useState(false);
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = COLORS[theme];

  const { user } = useSession()

  const handlePinSubmit = async (pin: string) => {
    console.log('PIN submitted:', pin);
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        if (pin === '1234') {
          Alert.alert('Success', 'Airtime purchase successful!');
          resolve(true);
        } else {
          Alert.alert('Error', 'Incorrect PIN. Please try again.');
          resolve(false);
        }
      }, 1000);
    });
  };

  if (!selectedPlan) {
    return null;
  }

  const network = networks.find(n => n.id === networkId);

  return (
    <BottomSheet
      isVisible={isVisible}
      onClose={onClose}
      title={`${formatNigerianNaira(selectedPlan?.price).split('.')[0]} Airtime`}
    >
      <View className="flex flex-col gap-4 w-full">
        <View className="p-4 bg-secondary rounded-xl mb-4 w-full">
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Product</Text>
            <View className="flex-row items-center">
              <Text className="text-foreground font-semibold text-base mr-2">{network?.name}</Text>
              <Avatar source={network?.logo} size={18} fallback={network?.id}/>
            </View>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Phone Number</Text>
            <Text className="text-foreground font-semibold text-base">{phoneNumber}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Amount</Text>
            <Text className="text-foreground font-semibold text-base">{formatNigerianNaira(selectedPlan?.price)}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-muted-foreground text-base">Bonus</Text>
            <Text className="text-primary font-semibold text-base">+{formatNigerianNaira(selectedPlan?.price * 0.02)}</Text>
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

export default AirtimeDetailsModal;