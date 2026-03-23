import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import AppContent from './src/AppContent';

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#20A0A0" />
      <SafeAreaView style={styles.container}>
        <AppContent />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#20A0A0',
  },
});
