import {
    API_BASE_URL,
    DEFAULT_CREATURE_ID,
    USE_MOCK_AUTH,
} from "../config/api";
import type {
    AuthSession,
    AuthTokens,
    CreatureData,
    RegisterInput,
} from "../types/auth";
import { ApiError } from "./apiError";
import * as mock from "./mockAuth";
export { ApiError };
type Context = "login" | "register" | "other";
type UsuarioResponse = {
  id: number;
  nombreUsuario: string;
  email: string;
  rol: string;
  accessToken: string;
  refreshToken: string;
  dataMascota?: CreatureData | null;
};
function friendlyMessage(status: number, data: any, context: Context): string {
  const text = (
    typeof data?.message === "string" ? data.message : ""
  ).toLowerCase();
  if (text.includes("correo registrado") || status === 409) {
    return "Este correo ya está registrado. Inicia sesión o usa otro correo.";
  }
  if (
    text.includes("usuario no existente") ||
    text.includes("password incorrecto") ||
    status === 401
  ) {
    return "Correo o contraseña incorrectos.";
  }
  if (text.includes("criatura no encontrada")) {
    return "El servidor no tiene la criatura inicial cargada. Avisa al equipo del backend.";
  }
  if (status === 400) {
    return context === "login"
      ? "Correo o contraseña incorrectos."
      : "El servidor rechazó los datos. Revisa el formulario.";
  }
  if (status >= 500)
    return "El servidor tuvo un problema. Inténtalo más tarde.";
  return "Ocurrió un error inesperado.";
}
async function request<T>(
  path: string,
  body?: unknown,
  context: Context = "other",
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
      0,
    );
  } finally {
    clearTimeout(timer);
  }
  const raw = await response.text();
  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }
  if (!response.ok) {
    throw new ApiError(
      friendlyMessage(response.status, data, context),
      response.status,
    );
  }
  return data as T;
}
function toSession(d: UsuarioResponse): AuthSession {
  return {
    user: {
      id: d.id,
      nombreUsuario: d.nombreUsuario,
      email: d.email,
      rol: d.rol,
      dataMascota: d.dataMascota ?? null,
    },
    tokens: { accessToken: d.accessToken, refreshToken: d.refreshToken },
  };
}
export async function registerUser(input: RegisterInput): Promise<AuthSession> {
  if (USE_MOCK_AUTH) return mock.registerUser(input);
  const data = await request<UsuarioResponse>(
    "/auth/registrar",
    {
      nombreUsuario: input.nombreUsuario.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      pais: input.pais,
      ciudad: input.ciudad?.trim() || undefined,
      criaturaId: DEFAULT_CREATURE_ID,
    },
    "register",
  );
  return toSession(data);
}
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthSession> {
  if (USE_MOCK_AUTH) return mock.loginUser(email, password);
  const data = await request<UsuarioResponse>(
    "/auth/login",
    { email: email.trim().toLowerCase(), password },
    "login",
  );
  return toSession(data);
}
export function isTokenValid(token: string): Promise<boolean> {
  if (USE_MOCK_AUTH) return mock.isTokenValid(token);
  return request<boolean>("/auth/validacion", { token });
}
export function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  if (USE_MOCK_AUTH) return mock.refreshTokens(refreshToken);
  return request<AuthTokens>("/auth/reflesh", { token: refreshToken });
}
export async function logoutRemote(userId: number): Promise<void> {
  if (USE_MOCK_AUTH) return mock.logoutRemote(userId);
  await request<void>(`/auth/invalidacion?userId=${userId}`);
}