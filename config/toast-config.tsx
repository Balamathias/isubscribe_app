import { useThemedColors } from '@/hooks/useThemedColors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';

interface CustomToastProps extends BaseToastProps {
  text1?: string;
  text2?: string;
}

const toastConfig = {
  error: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-center gap-2 w-[90%] h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg">
      <Ionicons name="alert-circle" size={20} color="#D92D20" />
      <View className="flex-col gap-1">
        {text1 && (
          <Text className="text-[#D92D20] text-[12px] font-semibold">
            {text1}
          </Text>
        )}
        {text2 && <Text className="text-foreground">{text2}</Text>}
      </View>
    </View>
  ),
  success: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-center gap-2 w-[90%] h-[52px] border border-[#ABEFC6] bg-[#ECFDF3] p-3 rounded-lg">
      <Ionicons name="checkmark-circle" size={20} color="#067647" />
      <View className="flex-col gap-1">
        {text1 && (
          <Text className="text-[#067647] text-[12px] font-semibold">
            {text1}
          </Text>
        )}
        {text2 && <Text className="text-foreground">{text2}</Text>}
      </View>
    </View>
  ),
  info: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-center gap-2 w-[90%] h-[52px] border border-[#5ab2fb] bg-[#ecf5fd] p-3 rounded-lg">
      <Ionicons name="information-circle" size={20} color="#064476" />
      <View className="flex-col gap-1">
        {text1 && (
          <Text className="text-[#064476] text-[12px] font-semibold">
            {text1}
          </Text>
        )}
        {text2 && <Text className="text-foreground">{text2}</Text>}
      </View>
    </View>
  ),
  delete: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-center gap-2 w-[90%] h-[52px] border border-[#D92D20] bg-[#FEF3F2] p-3 rounded-lg">
      <Ionicons name="trash" size={20} color="#D92D20" />
      <View className="flex-col gap-1">
        {text1 && (
          <Text className="text-[#D92D20] text-[12px] font-semibold">
            {text1}
          </Text>
        )}
        {text2 && <Text className="text-foreground">{text2}</Text>}
      </View>
    </View>
  ),
  warning: ({ text1, text2 }: CustomToastProps) => (
    <View className="flex-row items-center gap-2 w-[90%] h-[52px] border border-[#FEF3C7] bg-[#FFFBEB] p-3 rounded-lg">
      <Ionicons name="warning" size={20} color="#92400E" />
      <View className="flex-col gap-1">
        {text1 && (
          <Text className="text-[#92400E] text-[12px] font-semibold">
            {text1}
          </Text>
        )}
        {text2 && <Text className="text-foreground">{text2}</Text>}
      </View>
    </View>
  ),
};

export default toastConfig;