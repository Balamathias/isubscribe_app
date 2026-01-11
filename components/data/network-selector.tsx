import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useVerifyPhone } from '../../services/api-hooks';
import { COLORS } from '@/constants/colors';

interface Network {
  id: string;
  name: string;
  logo: any;
}

interface NetworkSelectorProps {
  networks: Network[];
  selectedNetworkId: string | null;
  onSelectNetwork: (networkId: string) => void;
  phoneNumber?: string;
}

const NetworkItem: React.FC<{
  network: Network;
  isSelected: boolean;
  onSelect: () => void;
  isDark: boolean;
  colors: typeof COLORS.light;
}> = ({ network, isSelected, onSelect, isDark, colors }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isSelected ? 1.05 : 1, {
      damping: 15,
      stiffness: 200,
    });
  }, [isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.85}
      className="items-center flex-1 mx-1"
    >
      <Animated.View
        style={[
          animatedStyle,
          {
            width: 64,
            height: 64,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSelected
              ? colors.primary
              : isDark
                ? 'rgba(255,255,255,0.04)'
                : '#f8f8f8',
            borderWidth: isSelected ? 0 : 1,
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
          },
        ]}
      >
        {/* Network Logo */}
        <View
          className="w-10 h-10 rounded-xl items-center justify-center overflow-hidden"
          style={{ backgroundColor: '#fff' }}
        >
          <Image
            source={network.logo}
            className="w-8 h-8"
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>

        {/* Selected Checkmark */}
        {isSelected && (
          <View
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full items-center justify-center"
            style={{
              backgroundColor: '#22c55e',
              shadowColor: '#22c55e',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.4,
              shadowRadius: 4,
            }}
          >
            <Ionicons name="checkmark" size={12} color="#fff" />
          </View>
        )}
      </Animated.View>

      {/* Network Name */}
      <Text
        className="text-center text-xs font-medium mt-2"
        style={{
          color: isSelected
            ? colors.primary
            : isDark
              ? 'rgba(255,255,255,0.6)'
              : 'rgba(0,0,0,0.5)',
        }}
      >
        {network.name}
      </Text>
    </TouchableOpacity>
  );
};

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks,
  selectedNetworkId,
  onSelectNetwork,
  phoneNumber,
}) => {
  const verifyPhone = useVerifyPhone();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = COLORS[isDark ? 'dark' : 'light'];

  // Auto-detect network from phone number
  useEffect(() => {
    const verifyPhoneNumber = async () => {
      if (phoneNumber && phoneNumber.length >= 10) {
        try {
          const result = await verifyPhone.mutateAsync(phoneNumber);
          if (result.data?.network) {
            const matchingNetwork = networks.find(
              (n) => n.id.toLowerCase() === result?.data?.network.toLowerCase()
            );
            if (matchingNetwork) {
              onSelectNetwork(matchingNetwork.id);
            }
          }
        } catch (error) {
          // Silently fail - user can manually select network
        }
      }
    };

    verifyPhoneNumber();
  }, [phoneNumber, networks]);

  return (
    <View
      className="w-full rounded-2xl p-4"
      style={{
        backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
      }}
    >
      {/* Header */}
      <Text
        className="text-xs font-medium mb-4"
        style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }}
      >
        Select Network
      </Text>

      {/* Network Grid */}
      <View className="flex-row justify-between">
        {networks.map((network) => (
          <NetworkItem
            key={network.id}
            network={network}
            isSelected={selectedNetworkId === network.id}
            onSelect={() => onSelectNetwork(network.id)}
            isDark={isDark}
            colors={colors}
          />
        ))}
      </View>
    </View>
  );
};

export default NetworkSelector;