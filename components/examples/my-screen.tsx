import React, { useState } from 'react';
import PinPad from '@/components/pin-pad';
import { Alert, View } from 'react-native';
import { Button } from '@react-navigation/elements';

const MyScreen = () => {
  const [isPinPadVisible, setPinPadVisible] = useState(false);

  const handlePinSubmit = async (pin: string) => {
    // In a real scenario, you'd send the PIN to your backend here
    console.log('PIN submitted:', pin);
    // Simulate an API call
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        if (pin === '1234') { // Replace with actual PIN verification logic
          Alert.alert('Success', 'PIN verified successfully!');
          resolve(true);
        } else {
          Alert.alert('Error', 'Incorrect PIN. Please try again.');
          resolve(false);
        }
      }, 1000);
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Open Pin Pad" onPress={() => setPinPadVisible(true)} />

      <PinPad
        isVisible={isPinPadVisible}
        onClose={() => setPinPadVisible(false)}
        handler={handlePinSubmit}
        title="Confirm Transaction"
        description="Enter your 4-digit PIN to complete the payment."
        onSuccess={() => console.log('PIN pad success callback')}
        onError={() => console.log('PIN pad error callback')}
      />
    </View>
  );
};

export default MyScreen;
