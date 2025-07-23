// tv-plan-selector.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import LoadingSpinner from '../ui/loading-spinner';
import { TextInput } from 'react-native';
import { Tables } from '@/types/database';
import { useThemedColors } from '@/hooks/useThemedColors';

interface PlanItem extends Tables<'tv'> {
}

interface Props {
  selectedProviderId: string | null;
  onSelectPlan?: (plan: PlanItem) => void;
  plans: PlanItem[];
  selectedPlan?: PlanItem | null | any;
  setSelectedPlan?: any;
}


const TvPlanSelector: React.FC<Props> = ({ selectedProviderId, plans, selectedPlan, onSelectPlan, setSelectedPlan }) => {
  const [modalVisible, setModalVisible] = useState(false);
   const [search, setSearch] = useState('');
   const colors = useThemedColors().colors
  
    const filteredPlans = plans.filter(p =>
      p?.name?.toLowerCase().includes(search.toLowerCase())
    );

  const handleSelect = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setTimeout(() => {
        setModalVisible(false);
    }, 500);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-card p-3 rounded-lg flex-row justify-between items-center"
      >
        <Text className="text-base font-medium text-muted-foreground">
          {selectedPlan ? selectedPlan?.name : 'Select Tv Plan'}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 justify-end bg-black/50">

          <View className="bg-card rounded-t-2xl p-4 max-h-[85%] ">
             {/* Search */}
            <View className="flex-row items-center bg-input/70 px-4 py-2 rounded-lg mb-4">
              <Ionicons name="search" size={20} color={colors.mutedForeground} />
              <TextInput
                placeholder="Filter plans..."
                className="ml-2 flex-1 text-sm"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor={colors.mutedForeground}
              />
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredPlans}
              keyExtractor={(item) => item.variation_code!}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className="flex-row items-center justify-between px-2 py-4"
                >
                  <Text className="text-sm text-foreground">{item.name}</Text>

                    <View
                        className={`w-10 h-6 rounded-full justify-center ${
                        selectedPlan?.variation_code === item.variation_code
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                    >
                        <View
                        className={`w-4 h-4 rounded-full bg-card ${
                            selectedPlan?.variation_code === item.variation_code
                            ? 'ml-auto mr-1'
                            : 'ml-1'
                        }`}
                        />
                    </View>
                </TouchableOpacity>
                
              )}
                ItemSeparatorComponent={() => <View className="h-px bg-border" />}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

export default TvPlanSelector;
