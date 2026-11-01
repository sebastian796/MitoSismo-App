import { API_BASE_URL } from "../config/api";
import {
  NOTIFICATION_COUNTRIES,
  type NotificationSettings,
} from "../types/notifications";
import { ApiError } from "./apiError";

export type SettingsSnapshot = {
  settings: NotificationSettings;
  updatedAt: string;
};
export type UserSettingsDTO = {
  notifGeneral: boolean;
  notifSismos: boolean;
  magnitudMinima: number;
  paisesNotificacion: string[];
  notifConsejos: boolean;
  horaConsejos: number;
  recordatorioMisiones: boolean;
  alertaSonora: boolean;
  updatedAt: string;
};
export function validateNotificationSettings(
  value: NotificationSettings,
): void {
  if (
    !value ||
    [value.enabled, value.quakes, value.tips, value.missions, value.sound].some(
      (v) => typeof v !== "boolean",
    ) ||
    !Number.isFinite(value.minMagnitude) ||
    value.minMagnitude < 1 ||
    value.minMagnitude > 10 ||
    Math.abs(value.minMagnitude * 10 - Math.round(value.minMagnitude * 10)) >
      0.0000001 ||
    !Number.isInteger(value.tipsHour) ||
    value.tipsHour < 0 ||
    value.tipsHour > 23 ||
    !Array.isArray(value.countries) ||
    value.countries.length > 5 ||
    new Set(value.countries).size !== value.countries.length ||
    value.countries.some((c) => !NOTIFICATION_COUNTRIES.includes(c))
  ) {
    throw new ApiError(
      "Las preferencias recibidas no son válidas o el servidor no tiene el contrato de ocho configuraciones.",
      400,
    );
  }
}
export function fromUserSettingsDTO(data: UserSettingsDTO): SettingsSnapshot {
  if (
    !data ||
    typeof data.updatedAt !== "string" ||
    !Number.isFinite(Date.parse(data.updatedAt))
  ) {
    throw new ApiError(
      "El servidor no devolvió la versión de la configuración. Revisa la actualización del backend y la migración pendiente.",
      0,
    );
  }
  const settings: NotificationSettings = {
    enabled: data.notifGeneral,
    quakes: data.notifSismos,
    minMagnitude: data.magnitudMinima,
    countries: data.paisesNotificacion,
    tips: data.notifConsejos,
    tipsHour: data.horaConsejos,
    missions: data.recordatorioMisiones,
    sound: data.alertaSonora,
  };
  validateNotificationSettings(settings);
  return {
    settings: { ...settings, countries: [...settings.countries] },
    updatedAt: data.updatedAt,
  };
}
export function toUserSettingsDTO(snapshot: SettingsSnapshot): UserSettingsDTO {
  validateNotificationSettings(snapshot.settings);
  const s = snapshot.settings;
  return {
    notifGeneral: s.enabled,
    notifSismos: s.quakes,
    magnitudMinima: s.minMagnitude,
    paisesNotificacion: [...s.countries],
    notifConsejos: s.tips,
    horaConsejos: s.tipsHour,
    recordatorioMisiones: s.missions,
    alertaSonora: s.sound,
    updatedAt: snapshot.updatedAt,
  };
}
async function request(
  token: string,
  method: "GET" | "PUT",
  snapshot?: SettingsSnapshot,
  signal?: AbortSignal,
): Promise<SettingsSnapshot> {
  if (!token)
    throw new ApiError(
      "Inicia sesión para consultar tus configuraciones.",
      401,
    );
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 12000);
  try {
    const response = await fetch(
      API_BASE_URL.replace(/\/$/, "") +
        "/usuario/" +
        (method === "GET" ? "getConfig" : "updateConfig"),
      {
        method,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          Authorization: "Bearer " + token,
          ...(method === "PUT" ? { "Content-Type": "application/json" } : {}),
        },
        body: snapshot
          ? JSON.stringify(toUserSettingsDTO(snapshot))
          : undefined,
      },
    );
    if (!response.ok) {
      const message =
        response.status === 409
          ? "La configuración cambió en otro dispositivo. Recarga los valores del servidor."
          : response.status === 401 || response.status === 403
            ? "Tu sesión no permite consultar o guardar estas configuraciones. Inicia sesión de nuevo."
            : response.status >= 500
              ? "El servidor no pudo procesar la configuración. Comprueba que el backend y la migración de columnas estén actualizados."
              : "No se pudo procesar la configuración (HTTP " +
                response.status +
                ").";
      throw new ApiError(message, response.status);
    }
    return fromUserSettingsDTO(await response.json());
  } catch (error) {
    if (signal?.aborted || error instanceof ApiError) throw error;
    throw new ApiError(
      "No se pudo confirmar la configuración con el servidor. Revisa tu conexión y reintenta.",
      0,
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
export const fetchUserSettings = (token: string, signal?: AbortSignal) =>
  request(token, "GET", undefined, signal);
export const saveUserSettings = (
  token: string,
  snapshot: SettingsSnapshot,
  signal?: AbortSignal,
) => request(token, "PUT", snapshot, signal);

export type SettingsAuthScope = {
  userId: number | null;
  authLoading: boolean;
  getAccessToken: () => Promise<string | null>;
};
export async function settingsAccessTokenFor(
  id: number,
  current: () => SettingsAuthScope,
  signal: AbortSignal,
): Promise<string> {
  const before = current();
  if (before.userId !== id || before.authLoading || signal.aborted)
    throw new ApiError("La sesión cambió.", 401);
  const token = await before.getAccessToken();
  const after = current();
  if (!token || after.userId !== id || after.authLoading || signal.aborted)
    throw new ApiError(
      "No hay una sesión válida para guardar configuraciones.",
      401,
    );
  return token;
}
