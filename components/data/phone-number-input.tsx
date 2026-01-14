import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import React, { useState } from 'react';
import { ActionSheetIOS, Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Tables } from '../../types/database';
import { networks } from '../../utils/networks';
import { useSession } from '../session-context';
import BottomSheet from '../ui/bottom-sheet';
import { useThemedColors } from '@/hooks/useThemedColors';

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

  const { colors, theme } = useThemedColors();
  const isDark = theme === 'dark';

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

  const getBorderColor = () => {
    if (error) return '#ef4444';
    if (isFocused) return colors.primary;
    return isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  };

  return (
    <View style={{ width: '100%', marginBottom: 16, marginTop: 16 }}>
      <Text
        style={{
          fontSize: 15,
          fontWeight: '600',
          marginBottom: 8,
          color: colors.foreground,
        }}
      >
        Phone Number
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.input,
          borderWidth: 1.5,
          borderColor: getBorderColor(),
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name="call-outline" size={18} color={colors.mutedForeground} />
        </View>
        <TextInput
          style={{
            flex: 1,
            fontSize: 16,
            color: colors.foreground,
            paddingVertical: 0,
          }}
          placeholder="e.g., 08012345678"
          placeholderTextColor={colors.mutedForeground}
          onChangeText={onChange}
          value={value}
          keyboardType="phone-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {beneficiaries && beneficiaries.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowBeneficiaries(true)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
            }}
          >
            <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleContactPicking}
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: 8,
          }}
        >
          <Ionicons name="person-add-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {error && (
        <Text
          style={{
            color: '#ef4444',
            fontSize: 13,
            marginTop: 6,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      )}

      {/* Beneficiaries Bottom Sheet */}
      <BottomSheet
        isVisible={showBeneficiaries}
        onClose={() => setShowBeneficiaries(false)}
        title="Select Beneficiary"
      >
        <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
          {beneficiaries?.map((beneficiary) => {
            const networkInfo = getNetworkInfo(beneficiary.network || '');
            return (
              <TouchableOpacity
                key={beneficiary.id}
                onPress={() => handleSelectBeneficiary(beneficiary)}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.foreground,
                      fontWeight: '500',
                      fontSize: 16,
                    }}
                  >
                    {beneficiary.phone}
                  </Text>
                  {beneficiary.network && (
                    <Text
                      style={{
                        color: colors.mutedForeground,
                        fontSize: 13,
                        marginTop: 2,
                        textTransform: 'capitalize',
                      }}
                    >
                      {beneficiary.network}
                    </Text>
                  )}
                </View>
                {networkInfo ? (
                  <Image
                    source={networkInfo.logo}
                    style={{ width: 32, height: 32, marginLeft: 12 }}
                    resizeMode="contain"
                  />
                ) : beneficiary.network ? (
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      marginLeft: 12,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                      borderRadius: 16,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="cellular-outline" size={16} color={colors.mutedForeground} />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
          {(!beneficiaries || beneficiaries.length === 0) && (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Ionicons name="people-outline" size={28} color={colors.mutedForeground} />
              </View>
              <Text
                style={{
                  color: colors.mutedForeground,
                  textAlign: 'center',
                  fontSize: 14,
                }}
              >
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
