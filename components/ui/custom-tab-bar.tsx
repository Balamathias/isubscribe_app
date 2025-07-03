import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
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
    <SafeAreaView 
      edges={['bottom']} 
      className="bg-background border-t-none border-border shadow-sm"
      style={{
        paddingTop: 12,
        paddingHorizontal: 16,
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
              className="flex-1 items-center justify-center py-3 mx-2"
              style={{
                minHeight: 52,
              }}
            >
              <View className="items-center justify-center relative">
                <View className="relative mb-1">
                  {isFocused ? (
                    <View className="w-12 h-8 rounded-xl overflow-hidden items-center justify-center">
                      <LinearGradient
                        colors={['#7B2FF2', '#F357A8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        className="absolute inset-0"
                      />
                      {getTabIcon(route.name, isFocused)}
                    </View>
                  ) : (
                    <View className="w-12 h-8 items-center justify-center">
                      {getTabIcon(route.name, isFocused)}
                    </View>
                  )}
                </View>
                
                <Text 
                  className={`text-xs font-medium ${
                    isFocused ? 'text-primary' : 'text-muted-foreground'
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
    </SafeAreaView>
  );
};

export default CustomTabBar;
