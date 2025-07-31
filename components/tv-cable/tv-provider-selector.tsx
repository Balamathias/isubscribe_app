import { TVProviders } from '@/types/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


export interface Provider {
  id: TVProviders;
  name: string;
  logo: any; // ImageSourcePropType
}

interface TvProviderSelectorProps {
  providers: Provider[];
  selectedProviderId: string | null;
  onSelectProvider: (networkId: TVProviders) => void;
  phoneNumber?: string
}

const TvProviderSelector: React.FC<TvProviderSelectorProps> = ({
  providers, selectedProviderId, onSelectProvider, phoneNumber
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
    <View className="w-full max-w-sm px-4 py-2 bg-card rounded-xl border border-border/20 mb-4">
      <View className="flex-row justify-between mb-4 mt-8">
        {providers.map((provider) => {
          const isSelected = selectedProviderId === provider.id;
          return (
            <TouchableOpacity
              key={provider.id}
              onPress={() => {
                if (!isSelected) {
                  scale.value = withTiming(1.05, { duration: 200 });
                  opacity.value = withTiming(1, { duration: 200 });
                } else {
                  scale.value = withTiming(1, { duration: 200 });
                  opacity.value = withTiming(1, { duration: 200 });
                }
                onSelectProvider(provider.id);
              }}
              className="items-center flex-1 mx-1"
            >
              <Animated.View
                style={animatedStyle}
                className={`w-12 h-12 rounded-full items-center justify-center 
                  ${isSelected ? 'bg-primary-foreground border-2 border-primary' : 'bg-card border border-border'}`}
              >
                <Image source={provider.logo} className="w-10 h-10 rounded-full" resizeMode="contain" />
                {isSelected && (
                  <View className="absolute -top-1 -right-1 bg-primary rounded-full p-1">
                    <Ionicons name="checkmark-circle" size={12} color="white" />
                  </View>
                )}
              </Animated.View>
              <Text className="text-center text-xs text-foreground mt-2">{provider.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default TvProviderSelector;