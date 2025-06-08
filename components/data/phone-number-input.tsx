import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import React, { useState } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSession } from '../session-context';

interface PhoneNumberInputProps {
  value: string;
  onChange: (text: string) => void;
  error?: string;
  onSelectContact: (phoneNumber: string) => void;
}

const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value, onChange, error, onSelectContact
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleContactPicking = async () => {
    if (Platform.OS === 'web') {
      alert('Contact picking is not supported on web.');
      return;
    }

    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers],
      });

      if (data.length > 0) {
        const contact = data[0];
        if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
          const phoneNumber = contact.phoneNumbers[0].number?.replace(/[^\d+]/g, '') || '';
          onSelectContact(phoneNumber);
        }
      }
    } else {
      alert('Permission to access contacts denied.');
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
        <TouchableOpacity onPress={handleContactPicking} className="p-1 ml-2">
          <Ionicons name="person-add-outline" size={20} color="gray" />
        </TouchableOpacity>
      </View>
      {error && <Text className="text-red-500 text-sm mt-1 ml-2">{error}</Text>}
    </View>
  );
};

export default PhoneNumberInput; 