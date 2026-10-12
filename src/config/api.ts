import Constants from "expo-constants";
import { Platform } from "react-native";

const PORT = 8080;

// Detecta la IP de tu PC a partir del servidor de Expo (sirve en celular y emulador).
function resolveHost(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) return hostUri.split(":")[0];
  return Platform.OS === "android" ? "10.0.2.2" : "localhost";
}

// Puedes forzar la URL creando un archivo .env.local con:
// EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${resolveHost()}:${PORT}/api`;
