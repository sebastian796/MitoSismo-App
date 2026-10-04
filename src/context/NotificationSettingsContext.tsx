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
const STORAGE_KEY = "mitosismo:notificationSettings";
type Ctx = {
  settings: NotificationSettings;
  hydrated: boolean;
  update: (patch: Partial<NotificationSettings>) => Promise<void>;
  setEnabled: (value: boolean) => Promise<"ok" | "denied">;
  sendTest: () => Promise<boolean>;
};
const NotificationSettingsContext = createContext<Ctx | null>(null);
export function NotificationSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [settings, setSettings] = useState<NotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS,
  );
  const [hydrated, setHydrated] = useState(false);
  const settingsRef = useRef(settings);
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const loaded: NotificationSettings = raw
          ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(raw) }
          : DEFAULT_NOTIFICATION_SETTINGS;
        settingsRef.current = loaded;
        setSettings(loaded);
        await syncScheduledReminders(loaded);
      } catch (e) {
        console.warn(
          "No se pudo cargar la configuración de notificaciones:",
          e,
        );
      } finally {
        setHydrated(true);
      }
    })();
  }, []);
  useEffect(() => {
    return subscribeToNotificationTaps((quakeId) => {
      try {
        router.push(`/quake/${quakeId}`);
      } catch {}
    });
  }, [router]);
  const update = useCallback(async (patch: Partial<NotificationSettings>) => {
    const next = { ...settingsRef.current, ...patch };
    settingsRef.current = next;
    setSettings(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      await syncScheduledReminders(next);
    } catch (e) {
      console.warn("No se pudo guardar la configuración:", e);
    }
  }, []);
  const setEnabled = useCallback(
    async (value: boolean): Promise<"ok" | "denied"> => {
      if (value) {
        const granted = await requestNotificationPermission();
        if (!granted) return "denied";
      }
      await update({ enabled: value });
      return "ok";
    },
    [update],
  );
  const sendTest = useCallback(
    () => sendTestNotification(settingsRef.current.sound),
    [],
  );
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
  if (!ctx)
    throw new Error(
      "useNotificationSettings debe usarse dentro de NotificationSettingsProvider",
    );
  return ctx;
}