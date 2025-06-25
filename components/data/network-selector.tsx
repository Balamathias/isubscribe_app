import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useVerifyPhone } from '../../services/api-hooks';

interface Network {
  id: string;
  name: string;
  logo: any; // ImageSourcePropType
}

interface NetworkSelectorProps {
  networks: Network[];
  selectedNetworkId: string | null;
  onSelectNetwork: (networkId: string) => void;
  phoneNumber?: string
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks, selectedNetworkId, onSelectNetwork, phoneNumber
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const verifyPhone = useVerifyPhone();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    const verifyPhoneNumber = async () => {
      if (phoneNumber && phoneNumber.length >= 10) {
        try {
          const result = await verifyPhone.mutateAsync(phoneNumber);
          if (result.data?.network) {
            const matchingNetwork = networks.find(n => n.id.toLowerCase() === result?.data?.network.toLowerCase());
            if (matchingNetwork) {
              onSelectNetwork(matchingNetwork.id);
            }
          }
        } catch (error) {
          console.error('Error verifying phone number:', error);
        }
      }
    };

    verifyPhoneNumber();
  }, [phoneNumber, networks]);

  return (
    <View className="w-full max-w-sm px-4">
      <View className="flex-row justify-between mb-4 mt-8">
        {networks.map((network) => {
          const isSelected = selectedNetworkId === network.id;
          return (
            <TouchableOpacity
              key={network.id}
              onPress={() => {
                if (!isSelected) {
                  scale.value = withTiming(1.05, { duration: 200 });
                  opacity.value = withTiming(1, { duration: 200 });
                } else {
                  scale.value = withTiming(1, { duration: 200 });
                  opacity.value = withTiming(1, { duration: 200 });
                }
                onSelectNetwork(network.id);
              }}
              className="items-center flex-1 mx-1"
            >
                  <Animated.View
                    className={`w-16 h-16 rounded-full items-center justify-center p-2
                      ${isSelected ? 'border-2 border-primary' : 'bg-card border border-border'}`}
                    style={[
                      animatedStyle,
                      isSelected && {
                      backgroundColor: network.id === 'mtn' ? '#ffdd57' : 
                              network.id === 'airtel' ? '#f1b4b4' :
                              network.id === 'glo' ? '#69b365' :
                              network.id === '9mobile' ? '#77ad91' : '#007BFF'
                      }
                    ]}
                  >
                  <Image 
                    source={network.logo} 
                    className="w-10 h-10 rounded-full" 
                    resizeMode="contain"
                    style={{ 
                    tintColor: undefined,
                    backgroundColor: 'transparent',
                    }}
                    fadeDuration={0}
                  />
                  {isSelected && (
                    <View className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    </View>
                  )}
                  </Animated.View>
              <Text className="text-center text-xs text-foreground mt-2">{network.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default NetworkSelector;