import theme from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Divider = () => {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <Text style={styles.text}>OU</Text>
      <View style={styles.line} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  text: {
    width: 40,
    textAlign: 'center',
    color: theme.textLight,
    fontSize: 14,
  },
});

export default Divider;