// Datos de una criatura tal como los devuelve el backend (CriaturaDTO).
export type CreatureInfo = {
  id: number;
  nombre: string;
  titulo?: string | null;
  descripcion?: string | null;
  elemento?: string | null; // FUEGO | AGUA | TIERRA | AIRE
  mitoLore?: string | null;
  imageUrl?: string | null;
};

// Criatura del usuario con su progreso (CriaturaDataDTO).
export type CreatureData = {
  criatura: CreatureInfo;
  nivel: number;
  xpActual: number;
  activa: boolean;
};

// Datos NO sensibles del usuario (UsuarioDTO + su criatura).
export type AuthUser = {
  id: number;
  nombreUsuario: string;
  email: string;
  rol: string;
  ciudad: string | null;
  pais: string | null;
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
  criaturaId: number;
};
