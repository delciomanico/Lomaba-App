import theme from '@/constants/colors';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Ícones (você pode usar react-native-vector-icons ou imagens locais)
const socialIcons = {
  google: require('@/assets/images/google.png'),
  apple: require('@/assets/images/google.png'),
  facebook: require('@/assets/images/google.png'),
};

const SocialButton = ({ 
  type = 'google', 
  onPress, 
  style, 
  textStyle,
  showIcon = true,
  fullWidth = false
}) => {
  // Configurações específicas para cada tipo
  const buttonConfig = {
    google: {
      backgroundColor: theme.primary,
      borderColor: theme.border,
      textColor: theme.white,
      text: 'Google',
    },
    apple: {
      backgroundColor: theme.primary,
      borderColor: theme.black,
      textColor: theme.white,
      text: 'Apple',
    },
    facebook: {
      backgroundColor: '#1877F2',
      borderColor: '#1877F2',
      textColor: theme.white,
      text: 'Facebook',
    },
  };

  const config = buttonConfig[type] || buttonConfig.google;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
          width: fullWidth ? '100%' : '48%',
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {showIcon && (
          <Image 
            source={socialIcons[type]} 
            style={[
              styles.icon,
              type === 'apple' && { tintColor: theme.white }
            ]} 
            resizeMode="contain"
          />
        )}
        <Text style={[styles.text, { color: config.textColor }, textStyle]}>
          {config.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SocialButton;