// components/provider-selector.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  Image,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingSpinner from '../ui/loading-spinner';
import { useSession } from '../session-context';
import { COLORS } from '@/constants/colors';

const providers = [
  { id: 'ikeja', name: 'Ikeja Electricity', logo: require('../../assets/services/electricity/ikeja.jpeg') },
  { id: 'eko', name: 'Eko Electricity', logo: require('../../assets/services/electricity/eko.png') },
  { id: 'kano', name: 'Kano Electricity', logo: require('../../assets/services/electricity/kano.png') },
  { id: 'ph', name: 'Port Harcourt Electricity', logo:require('../../assets/services/electricity/port.jpeg') },
  { id: 'jos', name: 'Jos Electricity', logo: require('../../assets/services/electricity/jos.jpeg') },
  { id: 'ibadan', name: 'Ibadan Electricity', logo: require('../../assets/services/electricity/ibadan.jpeg') },
  { id: 'kaduna', name: 'Kaduna Electricity', logo: require('../../assets/services/electricity/kaduna.jpeg') },
  { id: 'abuja', name: 'Abuja Electricity', logo: require('../../assets/services/electricity/abuja.png') },
];

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
      {/* Selected Display */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-card p-2 rounded-lg flex-row justify-between items-center"
      >
        <View className=' flex flex-row items-center gap-2'>
          <Image
            source={{uri: electricityServices?.find(p => p.id === selectedProvider)?.thumbnail || electricityServices?.find(p => p.id === 8)?.thumbnail || ''}}
            className="w-8 h-8 rounded-full bg-muted"
            resizeMode="contain"
          />
          <Text className="text-base font-medium text-foreground">
            {selectedProvider
              ? electricityServices?.find(p => p.id === selectedProvider)?.name
              : 'Select Provider'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.foreground} />
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}   transparent={true} className="flex-1 justify-end bg-black/50">
        <SafeAreaView  className="flex-1 bg-black/50 bg-opacity-50 justify-end ">
        <LoadingSpinner isPending={false} />
          <View className="bg-card rounded-t-2xl p-4 max-h-[85%] ">
            <View className="flex-row items-center bg-input px-4 py-2 rounded-xl mb-4">
              <Ionicons name="search" size={20} color={colors.mutedForeground} />
              <TextInput
                placeholder="Filter providers..."
                className="ml-2 flex-1 text-sm text-foreground"
                value={search}
                placeholderTextColor={colors.mutedForeground}
                onChangeText={setSearch}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" color={colors.mutedForeground} size={20} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredProviders?.map(service => ({
                id: service.id,
                name: service.name,
                logo: service.thumbnail,
              }))}

              keyExtractor={item => item.id?.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item?.id)}
                  className="flex-row items-center justify-between px-2 py-3"
                >
                  <View className="flex-row items-center gap-x-3">
                    <Image
                      source={{ uri: item.logo ||'' }}
                      className="w-8 h-8 rounded-full"
                      resizeMode="contain"
                    />
                    <Text className="text-base text-muted-foreground">{item.name}</Text>
                  </View>
                  <View
                    className={`w-10 h-6 rounded-full justify-center ${
                      selectedProvider === item.id
                        ? 'bg-purple-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <View
                      className={`w-4 h-4 rounded-full bg-card ${
                        selectedProvider === item.id
                          ? 'ml-auto mr-1'
                          : 'ml-1'
                      }`}
                    />
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View className="h-px bg-muted" />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default ProviderSelector;
