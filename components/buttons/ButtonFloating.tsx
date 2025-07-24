import React from 'react';
import { TouchableOpacity, StyleSheet, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {FloatingRefreshButtonProps} from '@/types/order'


export const FloatingRefreshButton: React.FC<FloatingRefreshButtonProps> = ({ 
  onRefresh, 
  isLoading = false 
}) => {
  const rotation = React.useRef(new Animated.Value(0)).current;

  const handlePress = async () => {
    // Animação de rotação
    Animated.sequence([
      Animated.timing(rotation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(rotation, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();

    // Executa a função de atualização
    await onRefresh();
  };

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={handlePress}
        disabled={isLoading}
        style={styles.button}
      >
        <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
          <Ionicons 
            name="refresh" 
            size={24} 
            color="#FFFFFF" 
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    zIndex: 999,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35', 
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});