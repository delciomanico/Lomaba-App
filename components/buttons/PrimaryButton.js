import theme from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const PrimaryButton = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity 
      style={[styles.button, style]}
      onPress={onPress}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    backgroundColor: theme.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  text: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PrimaryButton;