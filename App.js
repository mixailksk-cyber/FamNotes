import React from 'react';
import { View, StyleSheet } from 'react-native';
import AppContent from './src/AppContent';

export default function App() {
  return (
    <View style={styles.container}>
      <AppContent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#20A0A0',
  },
});
