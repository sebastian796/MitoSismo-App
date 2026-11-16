import { API_BASE_URL } from "../config/api";
import type { Mission } from "../types";
type BackendMission = {
  id: number;
  titulo: string;
  descripcion: string;
  xpRecompensa: number;
  grado: string;
  imageUrl: string | null;
  completada: boolean | null;
};

type InfoMisionResponse = {
  idMision?: number;
  completada?: boolean;
  xpGanada?: number;
  mensaje?: string;
};

async function authenticatedFetch<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Si el cuerpo no es JSON, conservamos el código HTTP
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

function mapMission(mission: BackendMission): Mission {
  const isCompleted = Boolean(mission.completada);
  return {
    id: mission.id,
    title: mission.titulo,
    description: mission.descripcion,
    xp: mission.xpRecompensa ?? 0,
    completed: isCompleted,
    progress: isCompleted ? 100 : 0,
    icon: "flag",
  };
}

export async function getUserMissions(token: string): Promise<Mission[]> {
  const data = await authenticatedFetch<BackendMission[]>("/misiones", token);
  return data.map(mapMission);
}

export async function completeMission(
  id: number,
  token: string,
): Promise<InfoMisionResponse> {
  return authenticatedFetch<InfoMisionResponse>(
    `/misiones/completada?idMision=${encodeURIComponent(id)}`,
    token,
    { method: "POST" },
  );
}