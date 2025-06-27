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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingSpinner from '../ui/loading-spinner';

const providers = [
  { id: 'ikeja', name: 'Ikeja Electricity', logo: require('../../assets/services/mtn.png') },
  { id: 'eko', name: 'Eko Electricity', logo: require('../../assets/services/glo.png') },
  { id: 'kano', name: 'Kano Electricity', logo: require('../../assets/services/airtel.png') },
  { id: 'ph', name: 'Port Harcourt Electricity', logo:require('../../assets/services/mtn.png') },
  { id: 'jos', name: 'Jos Electricity', logo: require('../../assets/services/glo.png') },
  { id: 'ibadan', name: 'Ibadan Electricity', logo: require('../../assets/services/airtel.png') },
  { id: 'kaduna', name: 'Kaduna Electricity', logo: require('../../assets/services/mtn.png') },
  { id: 'abuja', name: 'Abuja Electricity', logo: require('../../assets/services/glo.png') },
];

interface Props {
  selectedProvider: string | null | any;
  onSelect: (providerId: string) => void;
}

const ProviderSelector: React.FC<Props> = ({ selectedProvider, onSelect }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    onSelect(id);
    setModalVisible(false);
  };

  return (
    <>
      {/* Selected Display */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-white p-2 rounded-lg flex-row justify-between items-center"
      >
        <View className=' flex flex-row items-center gap-2'>
          <Image
            source={selectedProvider?.logo || providers?.[1]?.logo}
            className="w-8 h-8 rounded-full"
            resizeMode="contain"
          />
          <Text className="text-base font-medium">
            {selectedProvider
              ? providers.find(p => p.id === selectedProvider)?.name
              : 'Select Provider'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} />
      </TouchableOpacity>

      {/* Modal Drawer */}
      <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}   transparent={true} className="flex-1 justify-end bg-black/50">
        <SafeAreaView  className="flex-1 bg-black/50 bg-opacity-50 justify-end my-2 ">
        <LoadingSpinner isPending />
          <View className="bg-white rounded-t-2xl p-4 max-h-[85%] ">
            {/* Search */}
            <View className="flex-row items-center bg-[#f1f1f1] px-4 py-2 rounded-lg mb-4">
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                placeholder="Filter providers..."
                className="ml-2 flex-1 text-sm"
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} />
              </TouchableOpacity>
            </View>

            {/* Providers List */}
            <FlatList
              data={filteredProviders}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.id)}
                  className="flex-row items-center justify-between px-2 py-3"
                >
                  <View className="flex-row items-center gap-x-3">
                    <Image
                      source={item.logo}
                      className="w-8 h-8 rounded-full"
                      resizeMode="contain"
                    />
                    <Text className="text-base text-gray-800">{item.name}</Text>
                  </View>
                  <View
                    className={`w-10 h-6 rounded-full justify-center ${
                      selectedProvider === item.id
                        ? 'bg-purple-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    <View
                      className={`w-4 h-4 rounded-full bg-white ${
                        selectedProvider === item.id
                          ? 'ml-auto mr-1'
                          : 'ml-1'
                      }`}
                    />
                  </View>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View className="h-px bg-gray-100" />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default ProviderSelector;
