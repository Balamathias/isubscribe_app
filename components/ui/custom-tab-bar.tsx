import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

  const getTabIcon = (routeName: string, focused: boolean) => {
    const iconColor = focused ? '#FFFFFF' : theme.mutedForeground;
    const iconSize = 22;

    switch (routeName) {
      case 'index':
        return <Ionicons name="home-outline" size={iconSize} color={iconColor} />;
      case 'subs':
        return <Ionicons name="gift-outline" size={iconSize} color={iconColor} />;
      case 'history':
        return <Ionicons name="time-outline" size={iconSize} color={iconColor} />;
      case 'settings':
        return <Ionicons name="settings-outline" size={iconSize} color={iconColor} />;
      default:
        return <Ionicons name="home-outline" size={iconSize} color={iconColor} />;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'index':
        return 'Home';
      case 'subs':
        return 'Subs';
      case 'history':
        return 'History';
      case 'settings':
        return 'Settings';
      default:
        return routeName;
    }
  };

  return (
    <View 
      className="bg-background border-t-none border-border shadow-sm"
      style={{
        paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
        paddingTop: 8,
        paddingHorizontal: 12,
      }}
    >
      <View className="flex-row justify-around items-center">
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          // Skip subs tab since it has href: null
          if (route.name === 'subs') {
            return null;
          }

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              className="flex-1 items-center justify-center py-2 mx-1 rounded-2xl overflow-hidden"
              style={{
                minHeight: 48,
              }}
            >
              {isFocused ? (
                <LinearGradient
                  colors={['#7B2FF2', '#F357A8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="absolute inset-0 rounded-2xl"
                />
              ) : null}
              
              <View className="items-center justify-center">
                {getTabIcon(route.name, isFocused)}
                <Text 
                  className={`text-xs font-medium mt-1 ${
                    isFocused ? 'text-white' : 'text-muted-foreground'
                  }`}
                  numberOfLines={1}
                >
                  {getTabLabel(route.name)}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomTabBar;
