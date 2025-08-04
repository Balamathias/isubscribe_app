import { Image } from 'expo-image';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View } from 'react-native';
import { ImageSourcePropType } from 'react-native';

interface AvatarProps {
  source?: ImageSourcePropType;
  size?: number;
  fallback?: string;
  className?: string;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onPress?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 40,
  fallback = '👤',
  className = '',
  resizeMode = 'cover',
  onPress
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`overflow-hidden rounded-full bg-muted ${className}`}
      style={{ width: size, height: size }}
    >
      {source ? (
        <Image
          source={source}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={200}
          resizeMode={resizeMode}
        />
      ) : (
        <View className="w-full h-full items-center justify-center">
          <Text className="text-foreground text-lg">{fallback}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Avatar;

