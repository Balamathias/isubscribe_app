// tv-plan-selector.tsx
import { useThemedColors } from '@/hooks/useThemedColors';
import { Tables } from '@/types/database';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { colors } = useThemedColors();
  
  const filteredPlans = plans.filter(p =>
    p?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (plan: PlanItem) => {
    setSelectedPlan(plan);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        className="bg-input border border-border rounded-xl p-4 flex-row justify-between items-center"
      >
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">
            {selectedPlan ? selectedPlan?.name : 'Select TV Subscription Plan'}
          </Text>
          {selectedPlan && (
            <Text className="text-sm text-muted-foreground mt-1">
              ₦{parseFloat(selectedPlan?.amount || '0').toLocaleString()}
            </Text>
          )}
        </View>
        <Ionicons 
          name="chevron-down" 
          size={20} 
          color={colors.foreground} 
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/60 justify-end">
          <SafeAreaView className="bg-card rounded-t-3xl max-h-[85%] shadow-2xl">
            <View className="p-6 border-b border-border/30">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xl font-bold text-foreground">Select Subscription Plan</Text>
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
                  placeholder="Search subscription plans..."
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
              data={filteredPlans}
              keyExtractor={(item) => item.variation_code!}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                  className="flex-row items-center justify-between p-4 mb-3 bg-background rounded-xl border border-border/30"
                >
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                    <Text className="text-sm text-primary font-medium mt-1">
                      ₦{item?.amount?.toLocaleString()}
                    </Text>
                    {item?.cashback && (
                      <Text className="text-xs text-green-600 mt-1">
                        Cashback: ₦{item.cashback} eqv.
                      </Text>
                    )}
                  </View>
                  
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    selectedPlan?.variation_code === item.variation_code
                      ? 'border-primary bg-primary'
                      : 'border-border'
                  }`}>
                    {selectedPlan?.variation_code === item.variation_code && (
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

export default TvPlanSelector;
