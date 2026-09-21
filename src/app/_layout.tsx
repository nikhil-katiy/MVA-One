import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import { AuthProvider } from '@/context/AuthContext';

function AppLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6ED',
  },
});