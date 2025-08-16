import { useThemedColors } from '@/hooks/useThemedColors';
import { useGenerateReservedAccount } from '@/services/api-hooks';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import BottomSheet from '../ui/bottom-sheet';

interface GenerateAccountFormProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const GenerateAccountForm: React.FC<GenerateAccountFormProps> = ({
  isVisible,
  onClose,
  onSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'bvn' | 'nin'>('nin');
  const [inputValue, setInputValue] = useState('');
  const [errors, setErrors] = useState<string>('');

  const { colors } = useThemedColors()
  
  const queryClient = useQueryClient();
  const generateAccountMutation = useGenerateReservedAccount();

  const validateInput = (value: string, method: 'bvn' | 'nin') => {
    if (!value.trim()) {
      return `${method.toUpperCase()} is required`;
    }
    
    if (method === 'bvn') {
      if (value.length !== 11 || !/^\d+$/.test(value)) {
        return 'BVN must be exactly 11 digits';
      }
    } else if (method === 'nin') {
      if (value.length !== 11 || !/^\d+$/.test(value)) {
        return 'NIN must be exactly 11 digits';
      }
    }
    
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateInput(inputValue, selectedMethod);
    if (validationError) {
      setErrors(validationError);
      return;
    }

    const params = selectedMethod === 'bvn' ? { bvn: inputValue } : { nin: inputValue };
    
    try {
      const result = await generateAccountMutation.mutateAsync(params);
      
      if (result.data) {
        Toast.show({
          type: 'success',
          text1: 'Account Generated Successfully!',
          text2: 'Your reserved account has been created successfully.'
        });

        if (result?.error) {
            Toast.show({
                type: 'error',
                text1: 'Generation Failed',
                text2: result?.message || 'Failed to generate account. Please try again.'
            });
            return;
        }
        
        // Invalidate and refetch account data
        queryClient.invalidateQueries({ queryKey: ['getAccount'] });
        
        onSuccess?.();
        onClose();
        resetForm();
      } else {
        Toast.show({
          type: 'error',
          text1: 'Generation Failed',
          text2: (result)?.message || 'Failed to generate account. Please try again.'
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'An unexpected error occurred'
      });
    }
  };

  const resetForm = () => {
    setInputValue('');
    setErrors('');
    setSelectedMethod('nin');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <BottomSheet isVisible={isVisible} onClose={handleClose} title="Generate Reserved Account">
      <View className="">
        <Text className="text-muted-foreground text-center mb-6">
          Generate a reserved account to fund your wallet when other options are not available.
        </Text>

        {/* Method Selection */}
        <Text className="text-foreground font-semibold mb-3">Choose Verification Method:</Text>
        <View className="flex-row gap-3 mb-6"

          <TouchableOpacity
            onPress={() => setSelectedMethod('nin')}
            className={`flex-1 p-4 rounded-xl border-2 ${
              selectedMethod === 'nin' 
                ? 'border-primary bg-primary/10' 
                : 'border-border bg-card'
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons 
                name="person-outline" 
                size={20} 
                color={selectedMethod === 'nin' ? colors.primary : colors.mutedForeground} 
              />
              <Text className={`ml-2 font-semibold ${
                selectedMethod === 'nin' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                NIN
              </Text>
            </View>
            <Text className={`text-xs text-center mt-1 ${
              selectedMethod === 'nin' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              National Identity Number
            </Text>
          </TouchableOpacity>

           <TouchableOpacity
            onPress={() => setSelectedMethod('bvn')}
            className={`flex-1 p-4 rounded-xl border-2 ${
              selectedMethod === 'bvn' 
                ? 'border-primary bg-primary/10' 
                : 'border-border bg-card'
            }`}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons 
                name="card-outline" 
                size={20} 
                color={selectedMethod === 'bvn' ? colors.primary : colors.mutedForeground} 
              />
              <Text className={`ml-2 font-semibold ${
                selectedMethod === 'bvn' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                BVN
              </Text>
            </View>
            <Text className={`text-xs text-center mt-1 ${
              selectedMethod === 'bvn' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              Bank Verification Number
            </Text>
          </TouchableOpacity>
        </View>

        {/* Input Field */}
        <Text className="text-foreground font-semibold mb-2">
          Enter your {selectedMethod.toUpperCase()}:
        </Text>
        <TextInput
          value={inputValue}
          onChangeText={(text) => {
            setInputValue(text);
            setErrors('');
          }}
          placeholder={`Enter your ${selectedMethod.toUpperCase()}`}
          keyboardType="numeric"
          maxLength={11}
          className="border border-border rounded-xl p-4 text-foreground bg-card mb-2"
          placeholderTextColor={colors.mutedForeground}
        />
        
        {errors ? (
          <Text className="text-destructive text-sm mb-4">{errors}</Text>
        ) : null}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={generateAccountMutation.isPending}
          className={`p-4 rounded-xl flex-row items-center justify-center ${
            generateAccountMutation.isPending 
              ? 'bg-muted' 
              : 'bg-primary'
          }`}
          style={{
            opacity: generateAccountMutation.isPending ? 0.7 : 1
          }}
        >
          {generateAccountMutation.isPending ? (
            <>
              <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold">Generating Account...</Text>
            </>
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text className="text-white font-semibold">Generate Account</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info Text */}
        <View className="mt-4 p-3 bg-muted/30 rounded-lg">
          <View className="flex-row items-start">
            <Ionicons name="information-circle-outline" size={16} color={colors.muted} style={{ marginRight: 8, marginTop: 2 }} />
            <Text className="text-muted-foreground text-xs flex-1">
              Your {selectedMethod.toUpperCase()} will be used to verify your identity and generate a secure reserved account for funding your wallet.
            </Text>
          </View>
        </View>
      </View>
    </BottomSheet>
  );
};

export default GenerateAccountForm;
