import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthRequiredModal } from "../components/auth/AuthRequiredModal";
import { Colors } from "../constants/theme";
import { AuthProvider } from "../context/AuthContext";
import { NotificationSettingsProvider } from "../context/NotificationSettingsContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NotificationSettingsProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.background },
              animation: "fade",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" options={{ animation: "none" }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="quake/[id]"
              options={{ presentation: "card" }}
            />
            <Stack.Screen name="creature" />
            <Stack.Screen name="prevention" />
            <Stack.Screen name="settings" />
          </Stack>
          <AuthRequiredModal />
        </NotificationSettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
