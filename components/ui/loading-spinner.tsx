import React, { useEffect, useRef } from 'react';
import {
  View,
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { EvilIcons, Ionicons } from '@expo/vector-icons';

interface Props {
  isPending?: boolean;
}

const LoadingSpinner: React.FC<Props> = ({ isPending }) => {
  const screenWidth = Dimensions.get('window').width;
  const progressAnim = useRef(new Animated.Value(0)).current;
    const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPending) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(progressAnim, {
            toValue: screenWidth,
            duration: 700,
            useNativeDriver: false,
          }),
          Animated.timing(progressAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: false,
          }),
        ])
      ).start();
       // Spinner rotation animation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      progressAnim.stopAnimation();
      spinAnim.stopAnimation();
    }
  }, [isPending]);

    // Interpolate spinAnim into degrees
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isPending) return null;

  return (
    <View style={styles.overlay}>
      {/* Spinner in center */}
      <View style={styles.spinnerBox}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View> 

     {/* <View style={styles.spinnerBox}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="refresh-circle" size={36} color="#7C3AED" />
          <EvilIcons name="spinner" size={24} color="#7C3AED" />
        </Animated.View>
      </View> */}

      {/* Animated Gradient Progress Bar */}
      <Animated.View style={[styles.animatedBar, { left: progressAnim }]}>
        <LinearGradient
          colors={['#7C3AED', '#DB2777', '#A21CAF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 999,
    elevation: 5,
  },
  animatedBar: {
    position: 'absolute',
    top: 0,
    height: 5,
    width: 200,
  },
  gradientBar: {
    height: '100%',
    width: '100%',
    borderRadius: 8,
  },
});

export default LoadingSpinner;
