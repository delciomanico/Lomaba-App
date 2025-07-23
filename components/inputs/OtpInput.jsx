import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text } from 'react-native';

const OtpInput = ({ codeLength = 5, onCodeFilled }) => {
  const [code, setCode] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    if (code.length === codeLength) {
      onCodeFilled(code);
    }
  }, [code, codeLength, onCodeFilled]);

  const handleChangeText = (text, index) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    
    if (numericText.length === 0) {
      // Backspace pressed
      const newCode = code.substring(0, index) + code.substring(index + 1);
      setCode(newCode);
      
      if (index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else if (numericText.length === 1) {
      // New digit entered
      const newCode = code.substring(0, index) + numericText + code.substring(index + 1);
      setCode(newCode);
      
      if (index < codeLength - 1) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && code[index] === undefined && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const focusInput = (index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  };

  return (
    <View style={styles.container}>
      {Array.from({ length: codeLength }).map((_, index) => (
        <TouchableOpacity 
          key={index} 
          onPress={() => focusInput(index)}
          activeOpacity={1}
        >
          <TextInput
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={[styles.input, code[index] ? styles.filledInput : null]}
            value={code[index] || ''}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            selectTextOnFocus
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 20,
  },
  input: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginHorizontal: 5,
    textAlign: 'center',
    fontSize: 20,
    color: '#000',
  },
  filledInput: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
});

export default OtpInput;