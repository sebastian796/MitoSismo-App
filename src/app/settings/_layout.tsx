import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { Colors } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
export default function SettingsLayout() {
  const { user, loading, requireAuth } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && !user) {
      requireAuth("abrir configuración");
      router.replace("/(tabs)/profile");
    }
  }, [loading, user, requireAuth, router]);
  if (loading || !user) return null;
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: "slide_from_right",
      }}
    />
  );
}
