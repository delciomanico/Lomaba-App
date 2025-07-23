import theme from '@/constants/colors';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

const CustomTextInput = ({ placeholder, secureTextEntry, keyboardType, value, onChangeText }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    height: 50,
    backgroundColor: theme.white,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: theme.text,
  },
});

export default CustomTextInput;