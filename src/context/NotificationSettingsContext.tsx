import { useRouter } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useQuakeWatcher } from "../hooks/useQuakeWatcher";
import {
  requestNotificationPermission,
  sendTestNotification,
  subscribeToNotificationTaps,
  syncScheduledReminders,
} from "../services/notificationService";
import {
  fetchUserSettings,
  saveUserSettings,
  settingsAccessTokenFor,
} from "../services/userSettingsService";
import { UserSettingsSync, copySettings } from "../services/userSettingsSync";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from "../types/notifications";
import { useAuth } from "./AuthContext";

type Ctx = {
  settings: NotificationSettings;
  hydrated: boolean;
  loading: boolean;
  saving: boolean;
  dirty: boolean;
  error: string | null;
  errorKind: "load" | "save" | "conflict" | null;
  deviceError: string | null;
  retry: () => Promise<void>;
  update: (patch: Partial<NotificationSettings>) => Promise<void>;
  setEnabled: (
    value: boolean,
  ) => Promise<"ok" | "denied" | "auth" | "unavailable">;
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
  const { user, loading: authLoading, getAccessToken, requireAuth } = useAuth();
  const userId = user?.id ?? null;
  const authRef = useRef({ userId, authLoading, getAccessToken });
  authRef.current = { userId, authLoading, getAccessToken };
  const [sync] = useState(() => {
    const tokenFor = (id: number, signal: AbortSignal) =>
      settingsAccessTokenFor(id, () => authRef.current, signal);
    return new UserSettingsSync({
      read: async (id, signal) =>
        fetchUserSettings(await tokenFor(id, signal), signal),
      write: async (id, snapshot, signal) =>
        saveUserSettings(await tokenFor(id, signal), snapshot, signal),
    });
  });
  const state = useSyncExternalStore(
    sync.subscribe,
    sync.getSnapshot,
    sync.getSnapshot,
  );
  useEffect(() => {
    void sync.activate(authLoading ? null : userId);
    return sync.cancel;
  }, [sync, userId, authLoading]);
  const current = !authLoading && userId !== null && state.userId === userId;
  // Esta barrera actúa ya durante el render, antes del efecto de cambio de cuenta.
  const settings = current ? state.settings : DEFAULT_NOTIFICATION_SETTINGS;
  const hydrated = current && state.ready;
  const confirmed =
    current && state.confirmed
      ? state.confirmed.settings
      : DEFAULT_NOTIFICATION_SETTINGS;
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const reminders = useRef<Promise<void>>(Promise.resolve());
  const reminderGeneration = useRef(0);
  useEffect(() => {
    const generation = ++reminderGeneration.current;
    const target = copySettings(
      hydrated ? confirmed : DEFAULT_NOTIFICATION_SETTINGS,
    );
    setDeviceError(null);
    reminders.current = reminders.current
      .catch(() => {})
      .then(async () => {
        if (generation !== reminderGeneration.current) return;
        try {
          await syncScheduledReminders(target);
        } catch {
          if (generation === reminderGeneration.current)
            setDeviceError(
              "Las preferencias de la cuenta se conservan, pero no se pudieron programar los recordatorios en este dispositivo. Revisa sus permisos.",
            );
        }
      });
    return () => {
      reminderGeneration.current++;
    };
  }, [confirmed, hydrated, userId]);
  useEffect(
    () =>
      subscribeToNotificationTaps((id) => {
        router.push(`/quake/${id}`);
      }),
    [router],
  );
  const update = useCallback(
    async (patch: Partial<NotificationSettings>) => {
      if (
        !requireAuth(FEATURE) ||
        authRef.current.authLoading ||
        sync.getSnapshot().userId !== authRef.current.userId
      )
        return;
      sync.update(patch);
    },
    [requireAuth, sync],
  );
  const setEnabled = useCallback(
    async (
      value: boolean,
    ): Promise<"ok" | "denied" | "auth" | "unavailable"> => {
      if (!requireAuth(FEATURE)) return "auth";
      const id = authRef.current.userId;
      if (!sync.getSnapshot().ready || sync.getSnapshot().userId !== id)
        return "unavailable";
      if (value && !(await requestNotificationPermission())) return "denied";
      if (authRef.current.userId !== id || id === null) return "auth";
      return sync.update({ enabled: value }) ? "ok" : "unavailable";
    },
    [requireAuth, sync],
  );
  const sendTest = useCallback(async () => {
    if (!requireAuth(FEATURE)) return false;
    const snapshot = sync.getSnapshot();
    if (
      snapshot.userId !== authRef.current.userId ||
      !snapshot.ready ||
      !snapshot.confirmed ||
      !snapshot.confirmed.settings.enabled
    )
      return false;
    return sendTestNotification(snapshot.confirmed.settings.sound);
  }, [requireAuth, sync]);
  useQuakeWatcher(confirmed, hydrated);
  const value = useMemo<Ctx>(
    () => ({
      settings,
      hydrated,
      loading: authLoading || (current && state.loading),
      saving: current && state.saving,
      dirty: current && state.dirty,
      error: current ? state.error : null,
      errorKind: current ? state.errorKind : null,
      deviceError: current ? deviceError : null,
      retry: sync.retry,
      update,
      setEnabled,
      sendTest,
    }),
    [
      settings,
      hydrated,
      authLoading,
      current,
      state,
      deviceError,
      sync,
      update,
      setEnabled,
      sendTest,
    ],
  );
  return (
    <NotificationSettingsContext.Provider value={value}>
      {children}
    </NotificationSettingsContext.Provider>
  );
}
export function useNotificationSettings() {
  const context = useContext(NotificationSettingsContext);
  if (!context)
    throw new Error(
      "useNotificationSettings debe usarse dentro de NotificationSettingsProvider",
    );
  return context;
}
