import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface Network {
  id: string;
  name: string;
  logo: any; // ImageSourcePropType
}

interface NetworkSelectorProps {
  networks: Network[];
  selectedNetworkId: string | null;
  onSelectNetwork: (networkId: string) => void;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  networks, selectedNetworkId, onSelectNetwork
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

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
                style={animatedStyle}
                className={`w-16 h-16 rounded-full items-center justify-center p-2
                  ${isSelected ? 'bg-primary-foreground border-2 border-primary' : 'bg-card border border-border'}`}
              >
                <Image source={network.logo} className="w-10 h-10 rounded-full" resizeMode="contain" />
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