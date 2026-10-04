import Constants, { ExecutionEnvironment } from "expo-constants";
import { Alert, Platform } from "react-native";
import type { Quake } from "../types/earthquake";
import type { NotificationSettings } from "../types/notifications";
export type NotificationMode = "native" | "expo-go" | "web";
export const notificationMode: NotificationMode =
  Platform.OS === "web"
    ? "web"
    : Platform.OS === "android" &&
        Constants.executionEnvironment === ExecutionEnvironment.StoreClient
      ? "expo-go"
      : "native";
export const CHANNEL_SOUND = "alertas-sonoras";
export const CHANNEL_SILENT = "alertas-silenciosas";
type NotificationsModule = typeof import("expo-notifications");
let cachedModule: NotificationsModule | null = null;
function getNotifications(): NotificationsModule | null {
  if (notificationMode !== "native") return null;
  if (!cachedModule) {
    cachedModule = require("expo-notifications") as NotificationsModule;
    cachedModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
  return cachedModule;
}
function webApi(): any {
  return (globalThis as any).Notification ?? null;
}
const TIPS = [
  "Identifica hoy las zonas seguras de tu casa: columnas, muros fuertes y bajo mesas resistentes.",
  "Revisa tu mochila de emergencia: agua, linterna, radio, botiquín y documentos.",
  "Acuerda con tu familia un punto de encuentro fuera de casa.",
  "Guarda en tu celular los números de emergencia de tu país.",
  "Durante un sismo: agáchate, cúbrete y sujétate. No uses el ascensor.",
  "Después de un sismo, revisa fugas de gas o cables dañados antes de volver a entrar.",
  "Practica un simulacro con tu familia: ¿cuánto tardan en llegar a la zona segura?",
];
export async function setupNotificationChannels() {
  const N = getNotifications();
  if (!N || Platform.OS !== "android") return;
  await N.setNotificationChannelAsync(CHANNEL_SOUND, {
    name: "Alertas sísmicas (con sonido)",
    importance: N.AndroidImportance.MAX,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#E8521A",
  });
  await N.setNotificationChannelAsync(CHANNEL_SILENT, {
    name: "Alertas y recordatorios (silenciosos)",
    importance: N.AndroidImportance.HIGH,
    sound: null,
  });
}
export async function requestNotificationPermission(): Promise<boolean> {
  if (notificationMode === "web") {
    const W = webApi();
    if (!W) return false;
    if (W.permission === "granted") return true;
    if (W.permission === "denied") return false;
    return (await W.requestPermission()) === "granted";
  }
  if (notificationMode === "expo-go") return true;
  const N = getNotifications();
  if (!N) return false;
  await setupNotificationChannels();
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  const req = await N.requestPermissionsAsync();
  return req.granted;
}
export async function syncScheduledReminders(s: NotificationSettings) {
  const N = getNotifications();
  if (!N) return;
  await N.cancelAllScheduledNotificationsAsync();
  if (!s.enabled) return;
  if (s.tips) {
    for (let i = 0; i < 7; i++) {
      await N.scheduleNotificationAsync({
        identifier: `consejo-${i + 1}`,
        content: {
          title: "Consejo de prevención 🌋",
          body: TIPS[i],
          sound: false,
        },
        trigger: {
          type: N.SchedulableTriggerInputTypes.WEEKLY,
          weekday: i + 1,
          hour: s.tipsHour,
          minute: 0,
          channelId: CHANNEL_SILENT,
        },
      });
    }
  }
  if (s.missions) {
    await N.scheduleNotificationAsync({
      identifier: "recordatorio-misiones",
      content: {
        title: "Tus misiones te esperan ⭐",
        body: "Completa una misión de preparación y gana XP para Ignis.",
        sound: false,
      },
      trigger: {
        type: N.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 0,
        channelId: CHANNEL_SILENT,
      },
    });
  }
}
async function deliver(
  title: string,
  body: string,
  sound: boolean,
  data?: Record<string, string>,
): Promise<boolean> {
  if (notificationMode === "web") {
    const W = webApi();
    if (!W || W.permission !== "granted") return false;
    new W(title, { body });
    return true;
  }
  if (notificationMode === "expo-go") {
    Alert.alert(title, body);
    return true;
  }
  const N = getNotifications();
  if (!N) return false;
  await N.scheduleNotificationAsync({
    content: { title, body, sound: sound ? "default" : false, data },
    trigger: { channelId: sound ? CHANNEL_SOUND : CHANNEL_SILENT },
  });
  return true;
}
export async function sendQuakeNotification(quake: Quake, sound: boolean) {
  await deliver(
    `Sismo M ${quake.mag.toFixed(1)} · ${quake.country}`,
    `${quake.place} · Prof. ${quake.depth} km`,
    sound,
    { quakeId: quake.id },
  );
}
export async function sendTestNotification(sound: boolean): Promise<boolean> {
  try {
    return await deliver(
      "Notificación de prueba 🔔",
      "Si ves esto, las alertas de MitoSismo funcionan.",
      sound,
    );
  } catch (e) {
    console.warn("Falló la notificación de prueba:", e);
    return false;
  }
}
export function subscribeToNotificationTaps(
  onQuake: (quakeId: string) => void,
): () => void {
  const N = getNotifications();
  if (!N) return () => {};
  const sub = N.addNotificationResponseReceivedListener((response) => {
    const quakeId = response.notification.request.content.data?.quakeId;
    if (typeof quakeId === "string") onQuake(quakeId);
  });
  return () => sub.remove();
}