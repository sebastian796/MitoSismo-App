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

async function authenticatedFetch(
  endpoint: string,
  token: string,
  options: RequestInit = {},
) {
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
}

function mapMission(mission: BackendMission): Mission {
  return {
    id: mission.id,
    title: mission.titulo,
    description: mission.descripcion,
    xp: mission.xpRecompensa,
    completed: mission.completada ?? false,
    progress: mission.completada ? 100 : 0,
    icon: "flag",
  };
}

export async function getUserMissions(token: string): Promise<Mission[]> {
  const response = await authenticatedFetch("/misiones", token);

  if (!response.ok) {
    throw new Error(`Error al obtener misiones: ${response.status}`);
  }

  const data: BackendMission[] = await response.json();
  return data.map(mapMission);
}

export async function completeMission(
  id: number,
  token: string,
): Promise<void> {
  const response = await authenticatedFetch(
    `/misiones/completada?idMision=${id}`,
    token,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(`Error al completar misión: ${response.status}`);
  }
}

export async function uncompleteMission(
  id: number,
  token: string,
): Promise<void> {
  const response = await authenticatedFetch(
    `/misiones/descompletar?idMision=${id}`,
    token,
    { method: "POST" },
  );

  if (!response.ok) {
    throw new Error(`Error al descompletar misión: ${response.status}`);
  }
}
