import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession, AuthTokens, RegisterInput } from "../types/auth";
import { ApiError } from "./apiError";
const USERS_KEY = "mitosismo.mock.users";
type MockUser = {
  id: number;
  nombreUsuario: string;
  email: string;
  password: string;
  pais: string;
  ciudad?: string;
};
const wait = (ms = 500) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));
async function readUsers(): Promise<MockUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as MockUser[]) : [];
  } catch {
    return [];
  }
}
function makeTokens(userId: number): AuthTokens {
  const stamp = Date.now();
  return {
    accessToken: `mock-access-${userId}-${stamp}`,
    refreshToken: `mock-refresh-${userId}-${stamp}`,
  };
}
function toSession(u: MockUser): AuthSession {
  return {
    user: {
      id: u.id,
      nombreUsuario: u.nombreUsuario,
      email: u.email,
      rol: "USUARIO",
      dataMascota: {
        criatura: {
          id: 1,
          nombre: "Ignis",
          titulo: "Espíritu Guardián del Fuego y la Tierra",
          elemento: "FUEGO",
        },
        nivel: 1,
        xpActual: 0,
        activa: true,
      },
    },
    tokens: makeTokens(u.id),
  };
}
export async function registerUser(input: RegisterInput): Promise<AuthSession> {
  await wait();
  const users = await readUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) {
    throw new ApiError(
      "Este correo ya está registrado. Inicia sesión o usa otro correo.",
      409,
    );
  }
  const user: MockUser = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    nombreUsuario: input.nombreUsuario.trim(),
    email,
    password: input.password,
    pais: input.pais,
    ciudad: input.ciudad?.trim() || undefined,
  };
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
  return toSession(user);
}
export async function loginUser(
  email: string,
  password: string,
): Promise<AuthSession> {
  await wait();
  const users = await readUsers();
  const user = users.find((u) => u.email === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    throw new ApiError("Correo o contraseña incorrectos.", 401);
  }
  return toSession(user);
}
export async function isTokenValid(token: string): Promise<boolean> {
  return token.startsWith("mock-access-");
}
export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const match = /^mock-refresh-(\d+)-/.exec(refreshToken);
  if (!match) throw new ApiError("Token inválido.", 401);
  return makeTokens(Number(match[1]));
}
export async function logoutRemote(_userId: number): Promise<void> {
}