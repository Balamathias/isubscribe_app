import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/colors';

const tabs = [
  { name: 'Home', route: '/', icon: 'home-outline' },
  { name: 'Subs', route: '/subs', icon: 'gift-outline' },
  { name: 'History', route: '/history', icon: 'time-outline' },
  { name: 'Settings', route: '/settings', icon: 'settings-outline' },
];

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      {tabs.map((tab:any) => {
        const isActive = pathname === tab.route;

        return (
          <TouchableOpacity
            key={tab.route}
            onPress={() => router.push(tab.route)}
            style={styles.tab}
          >
            <Ionicons
              name={tab.icon}
              size={24}
              color={isActive ? COLORS.light.primary : COLORS.light.secondary}
            />
            <Text style={{ color: isActive ? COLORS.light.primary : COLORS.light.secondary, fontSize: 12 }}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BottomNav;
