import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

/** No monta contenido privado mientras se restaura la sesión ni para invitados. */
export function MissionsAccessGuard({ children }: { children: ReactNode }) {
  const { loading, user, requireAuth } = useAuth();
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      if (!loading && !user) {
        requireAuth("ver misiones, retos y progreso");
        // La pestaña ya cancela tabPress. Este caso cubre URL y navegación directa.
        router.replace("/(tabs)");
      }
    }, [loading, user, requireAuth, router]),
  );
  if (loading || !user) return null;
  return children;
}
