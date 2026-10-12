import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  fetchAccountData,
  loginUser,
  logoutRemote,
  registerUser,
} from "../services/authService";
import { isTokenExpired } from "../services/jwt";
import { ensureValidTokens } from "../services/sessionManager";
import {
  clearSession,
  loadSession,
  saveSession,
  saveUser,
} from "../services/sessionStorage";
import type { AuthSession, AuthUser, RegisterInput } from "../types/auth";

export type AuthPrompt = { visible: boolean; title: string; message: string };

const HIDDEN_PROMPT: AuthPrompt = { visible: false, title: "", message: "" };

type Ctx = {
  loading: boolean; // true mientras se restaura la sesión al abrir la app
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  /** Access token vigente (lo renueva si venció). null si no hay sesión o no se pudo renovar. */
  getAccessToken: () => Promise<string | null>;
  /** Vuelve a pedir al servidor los datos de la cuenta (nivel, XP, criatura). */
  refreshAccount: () => Promise<void>;
  /** Devuelve true si hay sesión. Si no, abre el aviso "Necesitas iniciar sesión". */
  requireAuth: (feature?: string) => boolean;
  authPrompt: AuthPrompt;
  closeAuthPrompt: () => void;
};

const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [authPrompt, setAuthPrompt] = useState<AuthPrompt>(HIDDEN_PROMPT);

  // Copia síncrona de la sesión: las funciones asíncronas siempre leen el valor más reciente.
  const sessionRef = useRef<AuthSession | null>(null);
  // Evita renovar el token dos veces a la vez (el backend rota el refresh token).
  const renewing = useRef<Promise<string | null> | null>(null);

  const applySession = useCallback((next: AuthSession | null) => {
    sessionRef.current = next;
    setSession(next);
  }, []);

  const expireSession = useCallback(async () => {
    applySession(null);
    await clearSession();
    setAuthPrompt({
      visible: true,
      title: "Tu sesión expiró",
      message: "Inicia sesión de nuevo para continuar.",
    });
  }, [applySession]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    const current = sessionRef.current;
    if (!current) return null;
    if (!isTokenExpired(current.tokens.accessToken)) {
      return current.tokens.accessToken;
    }

    if (!renewing.current) {
      renewing.current = (async () => {
        const result = await ensureValidTokens(current);
        // Si mientras tanto cerró sesión o cambió de cuenta, se descarta el resultado.
        if (
          sessionRef.current?.tokens.refreshToken !==
          current.tokens.refreshToken
        ) {
          return null;
        }
        if (result.status === "invalid") {
          await expireSession();
          return null;
        }
        if (result.status === "renewed") {
          applySession(result.session);
          return result.session.tokens.accessToken;
        }
        return null; // sin conexión: se conserva la sesión guardada
      })().finally(() => {
        renewing.current = null;
      });
    }
    return renewing.current;
  }, [applySession, expireSession]);

  const refreshAccount = useCallback(async () => {
    const token = await getAccessToken();
    const current = sessionRef.current;
    if (!token || !current) return;
    try {
      const user = await fetchAccountData(token, current.user);
      // Si cambió de cuenta mientras esperaba, no se mezclan los datos.
      if (sessionRef.current?.user.id !== user.id) return;
      applySession({ ...sessionRef.current, user });
      await saveUser(user);
    } catch (e) {
      console.warn(
        "No se pudo actualizar la cuenta (se usan los datos guardados):",
        e,
      );
    }
  }, [applySession, getAccessToken]);

  // Restaurar sesión al abrir la app.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await loadSession();
        if (!stored || cancelled) return;
        applySession(stored); // se muestran de inmediato los datos guardados
        const token = await getAccessToken(); // renueva solo si el access token venció
        if (token && !cancelled) refreshAccount(); // actualiza en segundo plano
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applySession, getAccessToken, refreshAccount]);

  const login = useCallback(
    async (email: string, password: string) => {
      const next = await loginUser(email, password);
      await saveSession(next);
      applySession(next);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const next = await registerUser(input);
      await saveSession(next);
      applySession(next);
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    const current = sessionRef.current;
    applySession(null);
    await clearSession(); // borra tokens y datos del usuario del dispositivo
    if (current) {
      try {
        await logoutRemote(current.user.id); // revoca los refresh tokens en el servidor
      } catch {
        // si no hay red, la sesión local ya quedó cerrada
      }
    }
  }, [applySession]);

  const requireAuth = useCallback((feature?: string): boolean => {
    if (sessionRef.current) return true;
    setAuthPrompt({
      visible: true,
      title: "Necesitas iniciar sesión para utilizar esta función",
      message: feature
        ? `Para ${feature} necesitas una cuenta de MitoSismo.`
        : "Esta función es solo para usuarios registrados.",
    });
    return false;
  }, []);

  const closeAuthPrompt = useCallback(() => setAuthPrompt(HIDDEN_PROMPT), []);

  const value = useMemo<Ctx>(
    () => ({
      loading,
      user: session?.user ?? null,
      isAuthenticated: !!session,
      login,
      register,
      logout,
      getAccessToken,
      refreshAccount,
      requireAuth,
      authPrompt,
      closeAuthPrompt,
    }),
    [
      loading,
      session,
      login,
      register,
      logout,
      getAccessToken,
      refreshAccount,
      requireAuth,
      authPrompt,
      closeAuthPrompt,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
