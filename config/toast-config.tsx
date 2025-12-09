import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View, useColorScheme, Platform } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
  type?: string;
}

const CustomToast = ({ text1, text2, type }: CustomToastProps) => {
  const theme = useColorScheme() ?? 'light';
  const isDark = theme === 'dark';

  const config: Record<string, { icon: keyof typeof Ionicons.glyphMap, color: string, bg: string }> = {
    success: {
      icon: 'checkmark-circle',
      color: isDark ? '#4ade80' : '#16a34a', // green-400 : green-600
      bg: isDark ? 'rgba(74, 222, 128, 0.15)' : 'rgba(22, 163, 74, 0.08)',
    },
    error: {
      icon: 'alert-circle',
      color: isDark ? '#f87171' : '#dc2626', // red-400 : red-600
      bg: isDark ? 'rgba(248, 113, 113, 0.15)' : 'rgba(220, 38, 38, 0.08)',
    },
    info: {
      icon: 'information-circle',
      color: isDark ? '#60a5fa' : '#2563eb', // blue-400 : blue-600
      bg: isDark ? 'rgba(96, 165, 250, 0.15)' : 'rgba(37, 99, 235, 0.08)',
    },
    warning: {
      icon: 'warning',
      color: isDark ? '#fbbf24' : '#d97706', // amber-400 : amber-600
      bg: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(217, 119, 6, 0.08)',
    },
    delete: {
      icon: 'trash',
      color: isDark ? '#f87171' : '#dc2626',
      bg: isDark ? 'rgba(248, 113, 113, 0.15)' : 'rgba(220, 38, 38, 0.08)',
    }
  };

  // Default to info if type not found
  const style = config[type || 'info'] || config.info;

  return (
    <View
      className={"w-[92%] bg-card border border-border/60 rounded-2xl p-3.5 flex-row items-center shadow-sm " + theme}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 5,
        // Add extra padding for notch if needed, but toast message usually handles positioning
      }}
    >
      <View
        className="w-11 h-11 rounded-full items-center justify-center mr-3.5"
        style={{ backgroundColor: style.bg }}
      >
        <Ionicons name={style.icon} size={22} color={style.color} />
      </View>

      <View className="flex-1 justify-center gap-0.5">
        {text1 && (
          <Text className="text-foreground font-bold text-[15px] tracking-tight">
            {text1}
          </Text>
        )}
        {text2 && (
          <Text className="text-muted-foreground text-[13px] leading-5 font-medium" numberOfLines={2}>
            {text2}
          </Text>
        )}
      </View>

      {/* Close indicator or accent */}
      <View className="w-1 h-8 rounded-full opacity-20 ml-2" style={{ backgroundColor: style.color }} />
    </View>
  );
};

const toastConfig = {
  success: (props: CustomToastProps) => <CustomToast {...props} type="success" />,
  error: (props: CustomToastProps) => <CustomToast {...props} type="error" />,
  info: (props: CustomToastProps) => <CustomToast {...props} type="info" />,
  warning: (props: CustomToastProps) => <CustomToast {...props} type="warning" />,
  delete: (props: CustomToastProps) => <CustomToast {...props} type="delete" />,
};

export default toastConfig;