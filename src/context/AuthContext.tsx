import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ApiError,
  isTokenValid,
  loginUser,
  logoutRemote,
  refreshTokens,
  registerUser,
} from "../services/authService";
import {
  clearSession,
  loadSession,
  saveSession,
} from "../services/sessionStorage";
import type { AuthSession, AuthUser, RegisterInput } from "../types/auth";
type Ctx = {
  loading: boolean;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<Ctx | null>(null);
async function restoreSession(): Promise<AuthSession | null> {
  const stored = await loadSession();
  if (!stored) return null;
  try {
    if (await isTokenValid(stored.tokens.accessToken)) return stored;
    const tokens = await refreshTokens(stored.tokens.refreshToken);
    const renewed = { ...stored, tokens };
    await saveSession(renewed);
    return renewed;
  } catch (e) {
    if (e instanceof ApiError && e.status === 0) return stored;
    await clearSession();
    return null;
  }
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    restoreSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);
  const login = useCallback(async (email: string, password: string) => {
    const s = await loginUser(email, password);
    await saveSession(s);
    setSession(s);
  }, []);
  const register = useCallback(async (input: RegisterInput) => {
    const s = await registerUser(input);
    await saveSession(s);
    setSession(s);
  }, []);
  const logout = useCallback(async () => {
    const current = session;
    setSession(null);
    await clearSession();
    if (current) {
      try {
        await logoutRemote(current.user.id);
      } catch {}
    }
  }, [session]);
  const value = useMemo(
    () => ({
      loading,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      login,
      register,
      logout,
    }),
    [loading, session, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}