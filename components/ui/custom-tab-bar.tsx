import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const colors = colorScheme === 'dark' ? COLORS.dark : COLORS.light;

  const getTabIcon = (routeName: string, focused: boolean) => {
    const iconColor = focused ? '#FFFFFF' : colors.mutedForeground;
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
    <View className={`${theme} bg-background`}>
        <SafeAreaView 
            edges={['bottom']} 
            className=" border-t-none border-border shadow-2xl bg-background"
            style={{
                paddingTop: 6,
                paddingHorizontal: 16,
            }}
        >
        <View className="flex-row justify-around items-center bg-background">
            {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

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
                    className="flex-1 items-center justify-center py-1"
                    style={{
                        minHeight: 52,
                    }}
                >
                <View className="items-center justify-center relative">
                    <View className="relative ">
                    {isFocused ? (
                        <View className="w-16 h-10 rounded-2xl overflow-hidden items-center justify-center">
                        <LinearGradient
                            colors={['#7B2FF2', '#a13ae1']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            className="absolute inset-0"
                        />
                        {getTabIcon(route.name, isFocused)}
                        </View>
                    ) : (
                        <View className="w-16 h-10 items-center justify-center">
                        {getTabIcon(route.name, isFocused)}
                        </View>
                    )}
                    </View>
                    
                    <Text 
                    className={`text-sm font-medium ${
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
    </View>
  );
};

export default CustomTabBar;
