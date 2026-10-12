import type { AuthSession } from "../types/auth";
import { ApiError } from "./apiError";
import { refreshTokens } from "./authService";
import { getTokenExpiry, isTokenExpired } from "./jwt";
import { saveTokens } from "./sessionStorage";

export type TokenCheck =
  | { status: "valid"; session: AuthSession } // el access token sigue vigente
  | { status: "renewed"; session: AuthSession } // se renovó con el refresh token
  | { status: "offline"; session: AuthSession } // no se pudo renovar (sin red / servidor caído): se conserva la sesión
  | { status: "invalid" }; // el refresh token ya no sirve: hay que iniciar sesión

/**
 * Decide si hay que renovar el access token y lo renueva.
 * Se lee la fecha de expiración localmente (jwt.ts); el backend valida de verdad cada petición.
 * Antes se enviaba el access token a /auth/validacion, que solo acepta refresh tokens.
 */
export async function ensureValidTokens(
  session: AuthSession,
): Promise<TokenCheck> {
  const { accessToken, refreshToken } = session.tokens;
  if (!isTokenExpired(accessToken)) return { status: "valid", session };

  const refreshExpiry = getTokenExpiry(refreshToken);
  if (refreshExpiry !== null && refreshExpiry <= Date.now()) {
    return { status: "invalid" };
  }

  try {
    const tokens = await refreshTokens(refreshToken);
    await saveTokens(tokens);
    return { status: "renewed", session: { ...session, tokens } };
  } catch (e) {
    if (
      e instanceof ApiError &&
      (e.status === 400 || e.status === 401 || e.status === 403)
    ) {
      return { status: "invalid" };
    }
    return { status: "offline", session };
  }
}
