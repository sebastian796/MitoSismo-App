import { API_BASE_URL } from "../config/api";

import type {
  AuthSession,
  AuthTokens,
  AuthUser,
  CreatureData,
  CreatureInfo,
  RegisterInput,
} from "../types/auth";

import { ApiError } from "./apiError";

export { ApiError };

type Context = "login" | "register" | "other";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
  context?: Context;
};

type UsuarioResponse = {
  id: number;
  nombreUsuario: string;
  email: string;
  rol: string;
  ciudad?: string | null;
  pais?: string | null;
};

function friendlyMessage(status: number, data: any, context: Context): string {
  if (status === 409) {
    return "Este correo ya está registrado. Inicia sesión o usa otro correo.";
  }

  if (status === 401) {
    return context === "login"
      ? "Correo o contraseña incorrectos."
      : "Tu sesión expiró. Inicia sesión de nuevo.";
  }

  if (status === 403) {
    return "No tienes permiso para realizar esta acción.";
  }

  if (status === 404) {
    return typeof data?.message === "string"
      ? data.message
      : "No se encontró lo solicitado.";
  }

  if (status === 400) {
    if (context === "login") {
      return "Correo o contraseña incorrectos.";
    }

    return data?.fieldErrors
      ? "Revisa los campos marcados."
      : "Los datos enviados no son válidos.";
  }

  if (status >= 500) {
    return "El servidor tuvo un problema. Inténtalo más tarde.";
  }

  return typeof data?.message === "string"
    ? data.message
    : "Ocurrió un error inesperado.";
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "POST", body, token, context = "other" } = options;

  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, 12000);

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
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

  let raw: string;

  try {
    raw = await response.text();
  } catch {
    throw new ApiError("No se pudo leer la respuesta del servidor.", 0);
  }

  let data: any = null;

  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    const fieldErrors =
      data && typeof data === "object" && data.fieldErrors
        ? (data.fieldErrors as Record<string, string>)
        : undefined;

    throw new ApiError(
      friendlyMessage(response.status, data, context),
      response.status,
      context === "login" ? undefined : fieldErrors,
    );
  }

  return data as T;
}

// REGISTRO REAL
export function registerRequest(input: RegisterInput): Promise<AuthTokens> {
  return request<AuthTokens>("/auth/registrar", {
    context: "register",
    body: {
      nombreUsuario: input.nombreUsuario.trim(),
      email: input.email.trim().toLowerCase(),
      password: input.password,
      pais: input.pais,
      ciudad: input.ciudad?.trim() || undefined,
      criaturaId: input.criaturaId,
    },
  });
}

// LOGIN REAL
export function loginRequest(
  email: string,
  password: string,
): Promise<AuthTokens> {
  return request<AuthTokens>("/auth/login", {
    context: "login",
    body: {
      email: email.trim().toLowerCase(),
      password,
    },
  });
}

// RENOVACIÓN DE TOKENS
export function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  return request<AuthTokens>("/auth/reflesh", {
    body: {
      token: refreshToken,
    },
  });
}

// CERRAR SESIÓN REMOTA
export async function logoutRemote(userId: number): Promise<void> {
  await request<void>(
    `/auth/invalidacion?userId=${encodeURIComponent(String(userId))}`,
  );
}

// CONSULTAR MASCOTA REAL
export async function fetchMyCreature(
  accessToken: string,
): Promise<CreatureData> {
  const data = await request<CreatureData>("/criatura/myCriatura", {
    method: "GET",
    token: accessToken,
  });

  if (
    !data ||
    !data.criatura ||
    typeof data.nivel !== "number" ||
    typeof data.xpActual !== "number"
  ) {
    throw new ApiError(
      "El servidor devolvió datos incompletos de la criatura.",
      0,
    );
  }

  return data;
}

// RECUPERAR PERFIL Y MASCOTA
export async function fetchAccountData(
  accessToken: string,
  fallback?: AuthUser | null,
): Promise<AuthUser> {
  const usuario = await request<UsuarioResponse>("/usuario/getDatosUsuario", {
    method: "GET",
    token: accessToken,
  });

  let dataMascota: CreatureData | null =
    fallback?.id === usuario.id ? fallback.dataMascota : null;

  try {
    dataMascota = await fetchMyCreature(accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      dataMascota = null;
    } else {
      console.warn("No se pudo cargar la criatura:", error);
    }
  }

  return {
    id: usuario.id,
    nombreUsuario: usuario.nombreUsuario,
    email: usuario.email,
    rol: usuario.rol,
    ciudad: usuario.ciudad ?? null,
    pais: usuario.pais ?? null,
    dataMascota,
  };
}

// CATÁLOGO DE CRIATURAS
export function fetchStarterCreatures(): Promise<CreatureInfo[]> {
  return request<CreatureInfo[]>("/criatura/eleccion", {
    method: "GET",
  });
}

// CONSTRUIR SESIÓN
async function buildSession(
  tokens: AuthTokens,
  accountError: string,
): Promise<AuthSession> {
  try {
    const user = await fetchAccountData(tokens.accessToken);

    return {
      user,
      tokens,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status !== 0) {
      throw error;
    }

    throw new ApiError(
      accountError,
      error instanceof ApiError ? error.status : 0,
    );
  }
}

// REGISTRAR Y RECUPERAR USUARIO
export async function registerUser(input: RegisterInput): Promise<AuthSession> {
  const tokens = await registerRequest(input);

  return buildSession(
    tokens,
    "Tu cuenta fue creada, pero no pudimos cargar tu perfil. Inicia sesión.",
  );
}

// INICIAR SESIÓN Y RECUPERAR USUARIO
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthSession> {
  const tokens = await loginRequest(email, password);

  return buildSession(
    tokens,
    "Iniciaste sesión, pero no pudimos cargar tu perfil. Inténtalo de nuevo.",
  );
}
