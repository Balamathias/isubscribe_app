import { useThemedColors } from '@/hooks/useThemedColors';
import { EducationProviders } from '@/types/utils';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const providers: { id: EducationProviders; name: string; logo: any }[] = [
  { id: 'waec', name: 'WAEC', logo: require('../../assets/services/education/waec.png') },
  { id: 'gce', name: 'GCE', logo: require('../../assets/services/education/gce.jpg') },
  { id: 'jamb', name: 'JAMB', logo: require('../../assets/services/education/jamb.png') },
]

interface Props {
  selectedProvider: EducationProviders;
  onSelect: (providerId: EducationProviders) => void;
}

const EducationTypeSelector: React.FC<Props> = ({ selectedProvider, onSelect }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');
  const { colors } = useThemedColors();

  const filteredProviders = providers.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: EducationProviders) => {
    onSelect(id);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        className="bg-input border border-border rounded-xl px-4 py-3 flex-row justify-between items-center"
      >
        <View className="flex-row items-center space-x-3">
          {selectedProvider ? (
            <>
              <View className="w-10 h-10 rounded-full bg-background border border-border items-center justify-center overflow-hidden">
                <Image
                  source={
                    providers.find(p => p.id === selectedProvider)?.logo ??
                    providers[0].logo
                  }
                  className="w-8 h-8 rounded-full"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {providers.find(p => p.id === selectedProvider)?.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Examination Board
                </Text>
              </View>
            </>
          ) : (
            <>
              <View className="w-10 h-10 rounded-full bg-muted/50 border border-border items-center justify-center">
                <Ionicons name="school" size={20} color={colors.mutedForeground} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-muted-foreground">
                  Select Exam Type
                </Text>
                <Text className="text-xs text-muted-foreground">
                  Choose examination board
                </Text>
              </View>
            </>
          )}

          <View className="ml-2">
            <Ionicons name="chevron-down" size={20} color={colors.foreground} />
          </View>
        </View>
      </TouchableOpacity>

      <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)} transparent={true}>
        <View className="flex-1 bg-black/60 justify-end">
          <SafeAreaView className="bg-card rounded-t-3xl max-h-[85%] shadow-2xl">
            
            <View className="p-6 border-b border-border/30">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-foreground">Select Exam Type</Text>
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
                  placeholder="Search examination boards..."
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
              data={filteredProviders}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between p-4 mb-3 bg-background rounded-xl border border-border/30"
                >
                  <View className="flex-row items-center gap-x-4 flex-1">
                    <View className="w-12 h-12 rounded-full bg-muted/20 border border-border items-center justify-center overflow-hidden">
                      <Image
                        source={item.logo}
                        className="w-10 h-10 rounded-full"
                        resizeMode="contain"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                      <Text className="text-xs text-muted-foreground mt-1">Examination Board</Text>
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

export default EducationTypeSelector;
