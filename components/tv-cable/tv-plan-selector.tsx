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

interface PlanItem {
  variation_code: string;
  name: string;
  variation_amount: string;
  fixedPrice: string;
  cashBack: string;
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

  const handleSelect = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setTimeout(() => {
        setModalVisible(false);
    }, 500);
  };

  console.log("first:", selectedPlan);
  console.log("second:", selectedProviderId);

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-white p-3 rounded-lg flex-row justify-between items-center"
      >
        <Text className="text-base font-medium">
          {selectedPlan ? selectedPlan?.name : 'Select Tv Plan'}
        </Text>
        <Ionicons name="chevron-down" size={20} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 justify-end bg-black/50">
          {/* <LoadingSpinner isPending /> */}

          <View className="bg-white rounded-t-2xl p-4 max-h-[85%] ">
            <FlatList
              data={plans}
              keyExtractor={(item) => item.variation_code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  className="flex-row items-center justify-between px-2 py-4"
                >
                  <Text className="text-sm text-gray-800">{item.name}</Text>

                    <View
                        className={`w-10 h-6 rounded-full justify-center ${
                        selectedPlan?.variation_code === item.variation_code
                            ? 'bg-purple-600'
                            : 'bg-gray-300'
                        }`}
                    >
                        <View
                        className={`w-4 h-4 rounded-full bg-white ${
                            selectedPlan?.variation_code === item.variation_code
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

export default TvPlanSelector;
