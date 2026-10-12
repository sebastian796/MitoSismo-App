import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { AuthSession, AuthTokens, AuthUser } from "../types/auth";

// Tokens (sensibles): almacenamiento cifrado del sistema en el celular.
// En web, expo-secure-store no existe y se usa AsyncStorage (localStorage del navegador),
// que es legible por cualquier script de la página: es menos seguro y solo es aceptable en desarrollo.
const ACCESS_KEY = "mitosismo.accessToken";
const REFRESH_KEY = "mitosismo.refreshToken";
// Datos NO sensibles para mostrar el perfil sin esperar a la red.
const USER_KEY = "mitosismo.user";

const secure = Platform.OS !== "web";

async function setSecret(key: string, value: string) {
  if (secure) await SecureStore.setItemAsync(key, value);
  else await AsyncStorage.setItem(key, value);
}

async function getSecret(key: string): Promise<string | null> {
  return secure ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key);
}

async function removeSecret(key: string) {
  if (secure) await SecureStore.deleteItemAsync(key);
  else await AsyncStorage.removeItem(key);
}

export async function saveTokens(tokens: AuthTokens) {
  await setSecret(ACCESS_KEY, tokens.accessToken);
  await setSecret(REFRESH_KEY, tokens.refreshToken);
}

export async function saveUser(user: AuthUser) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function saveSession(session: AuthSession) {
  await saveTokens(session.tokens);
  await saveUser(session.user);
}

export async function loadSession(): Promise<AuthSession | null> {
  try {
    const [accessToken, refreshToken, rawUser] = await Promise.all([
      getSecret(ACCESS_KEY),
      getSecret(REFRESH_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]);
    if (!accessToken || !refreshToken || !rawUser) return null;
    return {
      tokens: { accessToken, refreshToken },
      user: JSON.parse(rawUser) as AuthUser,
    };
  } catch {
    return null;
  }
}

export async function clearSession() {
  try {
    await removeSecret(ACCESS_KEY);
    await removeSecret(REFRESH_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e) {
    console.warn("No se pudo limpiar la sesión:", e);
  }
}
