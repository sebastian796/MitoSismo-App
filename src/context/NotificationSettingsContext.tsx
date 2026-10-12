import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQuakeWatcher } from "../hooks/useQuakeWatcher";
import {
  requestNotificationPermission,
  sendTestNotification,
  subscribeToNotificationTaps,
  syncScheduledReminders,
} from "../services/notificationService";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "../types/notifications";
import { useAuth } from "./AuthContext";

// Las preferencias se guardan POR USUARIO: cada cuenta tiene su propia clave,
// así que al cambiar de cuenta no se mezclan ni se heredan las del usuario anterior.
const STORAGE_PREFIX = "mitosismo:notificationSettings";
const LEGACY_KEY = "mitosismo:notificationSettings"; // versión anterior (una sola clave global)

type Ctx = {
  settings: NotificationSettings;
  hydrated: boolean;
  update: (patch: Partial<NotificationSettings>) => Promise<void>;
  setEnabled: (value: boolean) => Promise<"ok" | "denied" | "auth">;
  sendTest: () => Promise<boolean>;
};

const NotificationSettingsContext = createContext<Ctx | null>(null);

const FEATURE = "configurar tus notificaciones";

export function NotificationSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, requireAuth } = useAuth();
  const storageKey = `${STORAGE_PREFIX}:${user?.id ?? "guest"}`;

  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [hydrated, setHydrated] = useState(false);
  const settingsRef = useRef(settings);
  const storageKeyRef = useRef(storageKey);

  // Carga las preferencias de la cuenta activa (o las de invitado) cada vez que cambia de usuario.
  useEffect(() => {
    storageKeyRef.current = storageKey;
    let cancelled = false;

    settingsRef.current = DEFAULT_NOTIFICATION_SETTINGS; // nunca se muestran datos del usuario anterior
    setSettings(DEFAULT_NOTIFICATION_SETTINGS);
    setHydrated(false);

    (async () => {
      let loaded = DEFAULT_NOTIFICATION_SETTINGS;
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw)
          loaded = { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) };
        AsyncStorage.removeItem(LEGACY_KEY).catch(() => {});
      } catch (e) {
        console.warn(
          "No se pudo cargar la configuración de notificaciones:",
          e,
        );
      }
      if (cancelled) return;
      settingsRef.current = loaded;
      setSettings(loaded);
      try {
        await syncScheduledReminders(loaded);
      } catch (e) {
        console.warn("No se pudieron programar los recordatorios:", e);
      }
      if (!cancelled) setHydrated(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [storageKey]);

  useEffect(() => {
    return subscribeToNotificationTaps((quakeId) => {
      try {
        router.push(`/quake/${quakeId}`);
      } catch {}
    });
  }, [router]);

  const update = useCallback(
    async (patch: Partial<NotificationSettings>) => {
      // La acción se protege aquí (no solo en los botones): un invitado no puede modificar nada.
      if (!requireAuth(FEATURE)) return;
      const next = { ...settingsRef.current, ...patch };
      settingsRef.current = next;
      setSettings(next);
      try {
        await AsyncStorage.setItem(storageKeyRef.current, JSON.stringify(next));
        await syncScheduledReminders(next);
      } catch (e) {
        console.warn("No se pudo guardar la configuración:", e);
      }
    },
    [requireAuth],
  );

  const setEnabled = useCallback(
    async (value: boolean): Promise<"ok" | "denied" | "auth"> => {
      if (!requireAuth(FEATURE)) return "auth";
      if (value) {
        const granted = await requestNotificationPermission();
        if (!granted) return "denied";
      }
      await update({ enabled: value });
      return "ok";
    },
    [requireAuth, update],
  );

  const sendTest = useCallback(async () => {
    if (!requireAuth(FEATURE)) return false;
    return sendTestNotification(settingsRef.current.sound);
  }, [requireAuth]);

  useQuakeWatcher(settings, hydrated);

  const value = useMemo(
    () => ({ settings, hydrated, update, setEnabled, sendTest }),
    [settings, hydrated, update, setEnabled, sendTest],
  );

  return (
    <NotificationSettingsContext.Provider value={value}>
      {children}
    </NotificationSettingsContext.Provider>
  );
}

export function useNotificationSettings() {
  const ctx = useContext(NotificationSettingsContext);
  if (!ctx) {
    throw new Error(
      "useNotificationSettings debe usarse dentro de NotificationSettingsProvider",
    );
  }
  return ctx;
}
