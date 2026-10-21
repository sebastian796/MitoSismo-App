import { API_BASE_URL } from "../config/api";
import { emergencyContacts } from "../constants/data";
import type { EmergencyContact } from "../types";
import type { CreatureInfo } from "../types/auth";

export type PreventionPhase = "antes" | "durante" | "despues";
export type PreventionTip = {
  fase: {
    clave: "ANTES" | "DURANTE" | "DESPUES";
    titulo: string | null;
    icono: string | null;
  } | null;
  consejo: string;
};

// Lecturas públicas: nunca envían tokens ni modifican la sesión.
async function publicGet(
  path: string,
  signal?: AbortSignal,
  allowMissing = false,
): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort);
  const timer = setTimeout(abort, 12000);
  try {
    const response = await fetch(API_BASE_URL.replace(/\/$/, "") + path, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (response.status === 204 || (allowMissing && response.status === 404))
      return null;
    if (!response.ok)
      throw new Error(
        "No se pudo consultar el servidor (HTTP " + response.status + ").",
      );
    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}

async function requestPublicCreature(): Promise<CreatureInfo | null> {
  const data = await publicGet("/criatura/publico", undefined, true);
  if (data === null) return null;
  if (
    typeof data !== "object" ||
    !("id" in data) ||
    typeof data.id !== "number" ||
    !("nombre" in data) ||
    typeof data.nombre !== "string"
  ) {
    throw new Error("El servidor devolvió una criatura inválida.");
  }
  return data as CreatureInfo;
}

// Una mascota por sesión de la aplicación, compartida entre Home y Perfil.
// No persiste en disco y no reemplaza nunca la criatura de una cuenta.
let cachedCreature: CreatureInfo | null = null;
let pendingCreature: Promise<CreatureInfo | null> | null = null;

function cancelledRequest(): Error {
  const error = new Error("Consulta cancelada.");
  error.name = "AbortError";
  return error;
}

export function fetchPublicCreature(
  signal?: AbortSignal,
): Promise<CreatureInfo | null> {
  if (signal?.aborted) return Promise.reject(cancelledRequest());
  if (cachedCreature) return Promise.resolve(cachedCreature);
  if (!pendingCreature) {
    pendingCreature = requestPublicCreature()
      .then((creature) => {
        // No conservar errores ni ausencias: el usuario debe poder reintentar.
        if (creature) cachedCreature = creature;
        return creature;
      })
      .finally(() => {
        pendingCreature = null;
      });
  }
  const pending = pendingCreature;
  if (!signal) return pending;
  // Salir de una pantalla cancela sólo su suscripción; no cancela a la otra.
  // El transporte compartido mantiene su propio límite de 12 segundos.
  return new Promise((resolve, reject) => {
    const abort = () => {
      signal.removeEventListener("abort", abort);
      reject(cancelledRequest());
    };
    signal.addEventListener("abort", abort, { once: true });
    pending.then(
      (value) => {
        signal.removeEventListener("abort", abort);
        if (!signal.aborted) resolve(value);
      },
      (error) => {
        signal.removeEventListener("abort", abort);
        if (!signal.aborted) reject(error);
      },
    );
  });
}

export async function fetchPreventionTips(
  phase: PreventionPhase,
  signal?: AbortSignal,
): Promise<PreventionTip[]> {
  const data = await publicGet("/prevencion/" + phase, signal);
  if (
    !Array.isArray(data) ||
    data.some((tip) => !tip || typeof tip.consejo !== "string")
  ) {
    throw new Error("El servidor devolvió consejos inválidos.");
  }
  return data;
}

export type EmergencyDirectory = {
  contacts: EmergencyContact[];
  source: "backend" | "local";
  country: string;
  reason?: "empty" | "unavailable";
};

/** El catálogo existente contiene pais; no existe una ruta filtrada por país. */
export async function fetchEmergencyDirectory(
  country = "PERU",
  signal?: AbortSignal,
): Promise<EmergencyDirectory> {
  try {
    const data = await publicGet(
      "/contectoEmergencia/getListContactoEmergencia",
      signal,
    );
    if (
      !Array.isArray(data) ||
      data.some(
        (contact) =>
          !contact ||
          typeof contact.nombre !== "string" ||
          !contact.nombre.trim() ||
          typeof contact.numero !== "string" ||
          !/^\+?[\d ()-]{2,30}$/.test(contact.numero.trim()) ||
          typeof contact.pais !== "string",
      )
    ) {
      throw new Error("El servidor devolvió un directorio inválido.");
    }
    const contacts: EmergencyContact[] = data
      .filter((contact) => contact.pais === country)
      .map((contact) => ({
        name: contact.nombre,
        number: contact.numero.replace(/[ ()-]/g, ""),
        description:
          typeof contact.descripcion === "string" ? contact.descripcion : "",
        icon: typeof contact.icono === "string" ? contact.icono : "call",
      }));
    if (contacts.length) return { contacts, source: "backend", country };
    return {
      contacts: emergencyContacts,
      source: "local",
      country: "PERU",
      reason: "empty",
    };
  } catch (error) {
    if (signal?.aborted) throw error;
    return {
      contacts: emergencyContacts,
      source: "local",
      country: "PERU",
      reason: "unavailable",
    };
  }
}
