import Constants from "expo-constants";
import { Platform } from "react-native";
const PORT = 8080;
export const DEFAULT_CREATURE_ID = 1;
export const USE_MOCK_AUTH: boolean =
  process.env.EXPO_PUBLIC_USE_MOCK_AUTH === "true";
function resolveHost(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(":")[0];
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${resolveHost()}:${PORT}/api`;