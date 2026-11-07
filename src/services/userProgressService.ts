import { API_BASE_URL } from "../config/api";
import type { Quake } from "../types/earthquake";

async function request<T>(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<T> {
  if (!token) throw new Error("Inicia sesión para acceder a tu progreso.");
  const response = await fetch(API_BASE_URL.replace(/\/$/, "") + path, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  if (!response.ok)
    throw new Error(`La API de progreso respondió HTTP ${response.status}.`);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export type MissionProgress = {
  id: number;
  titulo: string;
  descripcion: string;
  xpRecompensa: number;
  grado: string;
  imageUrl?: string | null;
  completada: boolean;
};
export type SafetyReport = {
  id: number;
  sismoExternoId: string;
  estadoSeguridad: "A SALVO" | "EN PELIGRO" | "DESCONOCIDO";
  sentido: boolean;
  latitud?: number;
  longitud?: number;
  comentario?: string | null;
  createdAt: string;
};
export type SafetyReportInput = Omit<SafetyReport, "id" | "createdAt">;

export const fetchMissionProgress = (token: string) =>
  request<MissionProgress[]>("/misiones/", token);
export const completeMission = (missionId: number, token: string) =>
  request<unknown>(
    `/misiones/completada?idMision=${encodeURIComponent(missionId)}`,
    token,
    { method: "POST" },
  );
export const fetchMySafetyReports = (token: string) =>
  request<SafetyReport[]>("/reportes-seguridad/mis-reportes", token);
export const saveSafetyReport = (input: SafetyReportInput, token: string) =>
  request<SafetyReport>("/reportes-seguridad", token, {
    method: "POST",
    body: JSON.stringify(input),
  });

// Los eventos sísmicos se obtienen de USGS; esta integración sólo registra el reporte personal.
export const safetyReportForQuake = (
  quake: Quake,
  state: SafetyReportInput["estadoSeguridad"],
  token: string,
) =>
  saveSafetyReport(
    {
      sismoExternoId: quake.id,
      estadoSeguridad: state,
      sentido: true,
      latitud: quake.lat,
      longitud: quake.lng,
    },
    token,
  );
