export type CreatureData = {
  criatura: {
    id: number;
    nombre: string;
    titulo?: string | null;
    elemento?: string | null;
    imageUrl?: string | null;
  };
  nivel: number;
  xpActual: number;
  activa: boolean;
};
export type AuthUser = {
  id: number;
  nombreUsuario: string;
  email: string;
  rol: string;
  dataMascota: CreatureData | null;
};
export type AuthTokens = { accessToken: string; refreshToken: string };
export type AuthSession = { user: AuthUser; tokens: AuthTokens };
export type RegisterInput = {
  nombreUsuario: string;
  email: string;
  password: string;
  pais: string;
  ciudad?: string;
};