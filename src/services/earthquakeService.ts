import type { Quake } from "../types/earthquake";
import { isQuakeInCountry } from "../utils/countryFilter";

// ==========================================
// 1. CONFIGURACIÓN
// ==========================================

const quakeCache = new Map<string, Quake>();

const USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

const GEOJSON_URL = "/geo/countries.geojson";

// Distancia aproximada permitida alrededor del país.
const COASTAL_DISTANCE_KM = 150;

// Seguimos usando rectángulos para optimizar la búsqueda.
const COUNTRY_BOUNDS = {
  Perú: {
    minlatitude: -18.5,
    maxlatitude: 0,
    minlongitude: -81.5,
    maxlongitude: -68.5,
  },
  Chile: {
    minlatitude: -56,
    maxlatitude: -17,
    minlongitude: -76,
    maxlongitude: -66,
  },
  Ecuador: {
    minlatitude: -5,
    maxlatitude: 2,
    minlongitude: -82,
    maxlongitude: -75,
  },
  Colombia: {
    minlatitude: -5,
    maxlatitude: 13,
    minlongitude: -80,
    maxlongitude: -66,
  },
  México: {
    minlatitude: 14,
    maxlatitude: 33,
    minlongitude: -118,
    maxlongitude: -86,
  },
};

type CountryName = keyof typeof COUNTRY_BOUNDS;

type USGSFeature = {
  id: string;
  properties: {
    mag: number | null;
    magType: string | null;
    place: string | null;
    time: number | null;
    title: string | null;
  };
  geometry: { coordinates: [number, number, number] };
};

type USGSResponse = {
  features: USGSFeature[];
};

// ==========================================
// 2. FUNCIONES DE FORMATO
// ==========================================

function formatRelativeTime(timestamp: number | null): string {
  if (timestamp === null) {
    return "Fecha desconocida";
  }

  const date = new Date(timestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return "Hace unos segundos";
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  if (diffDays === 1) {
    return "Ayer";
  }

  return `Hace ${diffDays} días`;
}

function formatFullDate(timestamp: number | null): string {
  if (timestamp === null) {
    return "Fecha desconocida";
  }

  return new Date(timestamp).toLocaleString("es-PE", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function formatCoordinates(lat: number, lng: number): string {
  const latitudeDirection = lat >= 0 ? "N" : "S";
  const longitudeDirection = lng >= 0 ? "E" : "O";

  return `${Math.abs(lat).toFixed(3)}°${latitudeDirection}  ${Math.abs(
    lng,
  ).toFixed(3)}°${longitudeDirection}`;
}

function extractCountry(place: string): string {
  if (!place) {
    return "Internacional";
  }

  const normalizedPlace = place
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedPlace.includes("peru")) return "Perú";
  if (normalizedPlace.includes("chile")) return "Chile";
  if (normalizedPlace.includes("ecuador")) return "Ecuador";
  if (normalizedPlace.includes("colombia")) return "Colombia";
  if (normalizedPlace.includes("mexico")) return "México";

  return "Internacional";
}

// ==========================================
// 3. TRANSFORMACIÓN A QUAKE
// ==========================================

function mapFeatureToQuake(
  feature: USGSFeature,
  countryOverride?: CountryName,
): Quake | null {
  const { properties, geometry } = feature;

  if (
    !Number.isFinite(properties.mag) ||
    properties.mag === null ||
    properties.place === null ||
    !Number.isFinite(properties.time) ||
    properties.time === null ||
    !geometry?.coordinates
  ) {
    return null;
  }

  const [lng, lat, depth] = geometry.coordinates;

  if (
    !Number.isFinite(lng) ||
    !Number.isFinite(lat) ||
    !Number.isFinite(depth)
  ) {
    return null;
  }

  const quake: Quake = {
    id: feature.id,
    mag: properties.mag,
    magType: properties.magType ?? "Desconocida",
    place: properties.place,
    depth: Number(depth.toFixed(1)),
    time: formatRelativeTime(properties.time),
    country: countryOverride ?? extractCountry(properties.place),
    lat,
    lng,
    coords: formatCoordinates(lat, lng),
    fullDate: formatFullDate(properties.time),
  };

  quakeCache.set(quake.id, quake);

  return quake;
}

// ==========================================
// 4. CONSULTA DE SISMOS RECIENTES
// ==========================================

export async function fetchRecentEarthquakes(
  limit = 20,
  country?: string,
): Promise<Quake[]> {
  if (limit <= 0) return [];

  // Comprobamos si se seleccionó uno de los países.
  const selectedCountry =
    typeof country === "string" &&
    Object.prototype.hasOwnProperty.call(COUNTRY_BOUNDS, country)
      ? (country as CountryName)
      : undefined;

  const quakes: Quake[] = [];
  const seenIds = new Set<string>();

  // Consultaremos más registros cuando haya
  // que aplicar filtros adicionales.
  const requiresFiltering = !!selectedCountry || country === "Internacional";

  const pageSize = requiresFiltering ? Math.max(100, limit) : limit;
  const maxPages = requiresFiltering ? 5 : 1;

  const excludedCountries = ["Perú", "Chile", "Ecuador", "Colombia", "México"];

  // Consultamos los sismos de los últimos 90 días.
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  for (let page = 0; page < maxPages; page++) {
    const params = new URLSearchParams({
      format: "geojson",
      orderby: "time",
      limit: String(pageSize),
      offset: String(page * pageSize + 1),
      starttime: startDate.toISOString(),
    });

    // Primera etapa: búsqueda rectangular.
    if (selectedCountry) {
      const bounds = COUNTRY_BOUNDS[selectedCountry];

      // Márgenes ampliados para incluir
      // zonas marítimas cercanas.
      params.set("minlatitude", String(bounds.minlatitude - 2));

      params.set("maxlatitude", String(bounds.maxlatitude + 2));

      params.set("minlongitude", String(bounds.minlongitude - 3));

      params.set("maxlongitude", String(bounds.maxlongitude + 3));
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let data: USGSResponse;
    try {
      const response = await fetch(`${USGS_API_URL}?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error(
          `Error al consultar la API sísmica: ${response.status}`,
        );
      data = await response.json();
      if (!Array.isArray(data.features))
        throw new Error("Respuesta USGS inválida.");

    } finally {
      clearTimeout(timeout);
    }

    for (const feature of data.features) {
      if (seenIds.has(feature.id)) continue;

      seenIds.add(feature.id);

      // Segunda etapa: filtro geográfico.
      if (selectedCountry) {
        const [lng, lat] = feature.geometry?.coordinates ?? [];

        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          continue;
        }

        if (!isQuakeInCountry(lng, lat, selectedCountry)) {
          continue;
        }
      }

      // Solo asignamos el país seleccionado
      // después de validar sus coordenadas.
      const quake = mapFeatureToQuake(feature, selectedCountry);

      if (!quake) continue;

      // Conservamos el comportamiento original
      // de la opción Internacional.
      if (
        country === "Internacional" &&
        excludedCountries.includes(quake.country)
      ) {
        continue;
      }

      quakes.push(quake);

      if (quakes.length >= limit) {
        return quakes;
      }
    }


    // No hay más eventos disponibles.
    if (data.features.length < pageSize) {
      break;
    }
  }
  return quakes;
}

/** Obtiene una página y comprueba si hay otra, respetando el filtro geográfico. */
export async function fetchRecentEarthquakePage(
  page: number,
  pageSize = 10,
  country?: string,
): Promise<{ quakes: Quake[]; hasNextPage: boolean }> {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(pageSize) || pageSize < 1) {
    throw new Error("Página o tamaño de página inválidos.");
  }

  // El filtrado por país sucede después de consultar USGS: necesitamos
  // contar eventos que sí pertenecen al país antes de dividir en páginas.
  const start = (page - 1) * pageSize;
  const matches = await fetchRecentEarthquakes(start + pageSize + 1, country);
  return {
    quakes: matches.slice(start, start + pageSize),
    hasNextPage: matches.length > start + pageSize,
  };
}

// ==========================================
// 5. CONSULTA POR ID
// ==========================================

export async function fetchEarthquakeById(id: string): Promise<Quake | null> {
  const cached = quakeCache.get(id);

  if (cached) {
    return cached;
  }

  const params = new URLSearchParams({
    format: "geojson",
    eventid: id,
  });

  const response = await fetch(`${USGS_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Error al consultar el sismo: ${response.status}`);
  }

  const data = await response.json();

  const feature: USGSFeature | undefined = Array.isArray(data?.features)
    ? data.features[0]
    : data?.type === "Feature"
      ? data
      : undefined;

  if (!feature) {
    return null;
  }

  return mapFeatureToQuake(feature);
}
