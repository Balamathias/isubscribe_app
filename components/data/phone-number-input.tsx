import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import React, { useState } from 'react';
import { ActionSheetIOS, Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Tables } from '../../types/database';
import { networks } from '../../utils/networks';
import { useSession } from '../session-context';
import BottomSheet from '../ui/bottom-sheet';

interface PhoneNumberInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  onSelectContact: (phoneNumber: string) => void;
}

type Beneficiary = Tables<'beneficiaries'>;

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value, onChange, error, onSelectContact
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showBeneficiaries, setShowBeneficiaries] = useState(false);
  
  const { beneficiaries } = useSession();

  const getNetworkInfo = (networkId: string) => {
    return networks.find(network => network.id.toLowerCase() === networkId?.toLowerCase());
  };

  const parsePhoneNumber = (phoneNumber: string): string => {
    if (!phoneNumber) return '';
    
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+234')) {
      cleaned = '0' + cleaned.substring(4);
    } else if (cleaned.startsWith('234')) {
      cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
      if (cleaned.length >= 10) {
        cleaned = '0' + cleaned.substring(cleaned.length - 10);
      }
    }
    
    if (!cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '0' + cleaned;
    }
    
    if (cleaned.length > 11) {
      cleaned = cleaned.substring(0, 11);
    }
    
    return cleaned;
  };

  const handleContactPicking = async () => {
    if (Platform.OS === 'web') {
      alert('Contact picking is not supported on web.');
      return;
    }

    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const contact = await Contacts.presentContactPickerAsync();

        if (contact && contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          if (contact.phoneNumbers.length === 1) {
            const phoneNumber = parsePhoneNumber(contact.phoneNumbers[0].number || '');
            onChange(phoneNumber);
            onSelectContact(phoneNumber);
          } else {
            // Handle multiple phone numbers
            const phoneOptions = contact.phoneNumbers.map(phone => 
              `${parsePhoneNumber(phone.number || '')} ${phone.label ? `(${phone.label})` : ''}`
            );

            if (Platform.OS === 'ios') {
              ActionSheetIOS.showActionSheetWithOptions(
                {
                  options: [...phoneOptions, 'Cancel'],
                  cancelButtonIndex: phoneOptions.length,
                  title: `Select phone number for ${contact.name || 'contact'}`,
                },
                (buttonIndex) => {
                  if (buttonIndex < phoneOptions.length) {
                    const phoneNumber = parsePhoneNumber(contact.phoneNumbers![buttonIndex].number || '');
                    onChange(phoneNumber);
                    onSelectContact(phoneNumber);
                  }
                }
              );
            } else {
              if (phoneOptions.length <= 3) {
                Alert.alert(
                  `Select phone number for ${contact.name || 'contact'}`,
                  undefined,
                  [
                    ...phoneOptions.map((option, index) => ({
                      text: option,
                      onPress: () => {
                        const phoneNumber = parsePhoneNumber(contact.phoneNumbers![index].number || '');
                        onChange(phoneNumber);
                        onSelectContact(phoneNumber);
                      }
                    })),
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              } else {
                const phoneNumber = parsePhoneNumber(contact.phoneNumbers[0].number || '');
                onChange(phoneNumber);
                onSelectContact(phoneNumber);
              }
            }
          }
        }
      } else {
        alert('Permission to access contacts denied.');
      }
    } catch (error) {
      console.error('Error picking contact:', error);
      alert('Error accessing contacts');
    }
  };

  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    if (beneficiary.phone) {
      const phoneNumber = parsePhoneNumber(beneficiary.phone);
      onChange(phoneNumber);
      onSelectContact(phoneNumber);
      setShowBeneficiaries(false);
    }
  };

  return (
    <View className="w-full max-w-sm mb-4 mt-4">
      <Text className="text-foreground text-base font-semibold mb-2">Phone Number</Text>
      <View
        className={`flex-row items-center bg-input border rounded-xl px-4 py-2 shadow-sm
          ${error ? 'border-red-500' : isFocused ? 'border-primary' : 'border-secondary'}`}
      >
        <Ionicons name="call-outline" size={20} color="gray" className="mr-3" />
        <TextInput
          className="flex-1 text-base text-foreground"
          placeholder="e.g., 08012345678"
          placeholderTextColor="gray"
          onChangeText={onChange}
          value={value}
          keyboardType="phone-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {beneficiaries && beneficiaries.length > 0 && (
          <TouchableOpacity onPress={() => setShowBeneficiaries(true)} className="p-1 ml-2">
            <Ionicons name="chevron-down-outline" size={18} color="gray" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleContactPicking} className="p-1 ml-2">
          <Ionicons name="person-add-outline" size={20} color="gray" />
        </TouchableOpacity>
      </View>
      {error && <Text className="text-red-500 text-sm mt-1 ml-2">{error}</Text>}

      {/* Beneficiaries Bottom Sheet */}
      <BottomSheet
        isVisible={showBeneficiaries}
        onClose={() => setShowBeneficiaries(false)}
        title="Select Beneficiary"
      >
        <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
          {beneficiaries?.map((beneficiary) => {
            const networkInfo = getNetworkInfo(beneficiary.network || '');
            return (
              <TouchableOpacity
                key={beneficiary.id}
                onPress={() => handleSelectBeneficiary(beneficiary)}
                className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className="flex-1">
                  <Text className="text-foreground font-medium text-base">
                    {beneficiary.phone}
                  </Text>
                  {beneficiary.network && (
                    <Text className="text-gray-500 text-sm mt-1 capitalize">
                      {beneficiary.network}
                    </Text>
                  )}
                </View>
                {networkInfo ? (
                  <Image
                    source={networkInfo.logo}
                    className="w-8 h-8 ml-3"
                    resizeMode="contain"
                  />
                ) : beneficiary.network ? (
                  <View className="w-8 h-8 ml-3 bg-gray-200 rounded-full items-center justify-center">
                    <Ionicons name="cellular-outline" size={16} color="gray" />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
          {(!beneficiaries || beneficiaries.length === 0) && (
            <View className="p-8 items-center">
              <Ionicons name="people-outline" size={48} color="gray" />
              <Text className="text-gray-500 text-center mt-4">
                No beneficiaries found
              </Text>
            </View>
          )}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

export default PhoneNumberInput;
