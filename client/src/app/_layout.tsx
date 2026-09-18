import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="quake/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="creature" />
        <Stack.Screen name="prevention" />
      </Stack>
    </SafeAreaProvider>
  );
}
