// components/provider-selector.tsx

import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../session-context';
import LoadingSpinner from '../ui/loading-spinner';

interface Props {
  selectedProvider: string | null | any;
  onSelect: (providerId: string) => void;
}

const ProviderSelector: React.FC<Props> = ({ selectedProvider, onSelect }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const { electricityServices } = useSession()

  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? 'dark' : 'light'
  const colors = COLORS[theme];

  const filteredProviders = electricityServices?.filter(p =>
    p?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string | number) => {
    onSelect(id as any);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        className="bg-input border border-border rounded-xl p-4 flex-row justify-between items-center pr-6"
      >
        <View className="flex flex-row items-center gap-3">
          {selectedProvider ? (
            <>
              <View className="w-10 h-10 rounded-full bg-background border border-border items-center justify-center overflow-hidden">
                <Image
                  source={{uri: electricityServices?.find(p => p.id === selectedProvider)?.thumbnail || ''}}
                  className="w-8 h-8 rounded-full"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {electricityServices?.find(p => p.id === selectedProvider)?.name}
                </Text>
                <Text className="text-xs text-muted-foreground">Electricity Provider</Text>
              </View>
            </>
          ) : (
            <>
              <View className="w-10 h-10 rounded-full bg-muted/50 border border-border items-center justify-center">
                <Ionicons name="business" size={20} color={colors.mutedForeground} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-muted-foreground">
                  Select Electricity Provider
                </Text>
                <Text className="text-xs text-muted-foreground">Choose your DISCO</Text>
              </View>
            </>
          )}
        </View>
        <View className="">
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={colors.foreground} 
            style={{ transform: [{ rotate: '0deg' }] }}
          />
        </View>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)} transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <SafeAreaView className="bg-card rounded-t-3xl max-h-[85%] shadow-2xl">
            <LoadingSpinner isPending={false} />
            
            <View className="p-6 border-b border-border/30">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-foreground">Select Provider</Text>
                  <Text className="text-sm text-muted-foreground mt-1">Choose your electricity distribution company</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)}
                  className="w-10 h-10 bg-muted/50 rounded-full items-center justify-center"
                >
                  <Ionicons name="close" color={colors.foreground} size={20} />
                </TouchableOpacity>
              </View>
              
              <View className="flex-row items-center bg-input border border-border rounded-xl px-4 py-3 mt-4">
                <Ionicons name="search" size={18} color={colors.mutedForeground} />
                <TextInput
                  placeholder="Search electricity providers..."
                  className="ml-3 flex-1 text-base text-foreground"
                  value={search}
                  placeholderTextColor={colors.mutedForeground}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" color={colors.mutedForeground} size={18} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <FlatList
              data={filteredProviders?.map(service => ({
                id: service.id,
                name: service.name,
                logo: service.thumbnail,
              }))}
              keyExtractor={item => item.id?.toString()}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item?.id)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between p-4 mb-3 bg-background rounded-xl border border-border/30"
                >
                  <View className="flex-row items-center gap-x-4 flex-1">
                    <View className="w-12 h-12 rounded-full bg-muted/20 border border-border items-center justify-center overflow-hidden">
                      <Image
                        source={{ uri: item.logo || '' }}
                        className="w-10 h-10 rounded-full"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                      <Text className="text-xs text-muted-foreground mt-1">Distribution Company</Text>
                    </View>
                  </View>
                  
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selectedProvider === item.id
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}>
                    {selectedProvider === item.id && (
                      <Ionicons name="checkmark" size={14} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View className="h-1" />}
            />
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

export default ProviderSelector;
