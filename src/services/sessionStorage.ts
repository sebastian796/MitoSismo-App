import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { AuthSession } from "../types/auth";
const TOKENS_KEY = "mitosismo.tokens";
const USER_KEY = "mitosismo.user";
const secure = Platform.OS !== "web";
async function setToken(value: string) {
  if (secure) await SecureStore.setItemAsync(TOKENS_KEY, value);
  else await AsyncStorage.setItem(TOKENS_KEY, value);
}
async function getToken(): Promise<string | null> {
  return secure
    ? SecureStore.getItemAsync(TOKENS_KEY)
    : AsyncStorage.getItem(TOKENS_KEY);
}
export async function saveSession(session: AuthSession) {
  await setToken(JSON.stringify(session.tokens));
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user));
}
export async function loadSession(): Promise<AuthSession | null> {
  try {
    const [tokens, user] = await Promise.all([
      getToken(),
      AsyncStorage.getItem(USER_KEY),
    ]);
    if (!tokens || !user) return null;
    return { tokens: JSON.parse(tokens), user: JSON.parse(user) };
  } catch {
    return null;
  }
}
export async function clearSession() {
  try {
    if (secure) await SecureStore.deleteItemAsync(TOKENS_KEY);
    else await AsyncStorage.removeItem(TOKENS_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  } catch {}
}