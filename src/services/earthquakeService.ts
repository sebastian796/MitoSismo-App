import { COUNTRIES } from "../constants/countries";
import polygonData from "../constants/countryPolygons.json";
import type { Quake } from "../types/earthquake";

const USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";

/* -------------------------------------------------------------------------- */
/*  Tipos de la respuesta de USGS                                              */
/* -------------------------------------------------------------------------- */

type USGSFeature = {
  id: string;
  properties: {
    mag: number | null;
    magType: string | null;
    place: string | null;
    time: number | null;
    title: string | null;
  };
  geometry: {
    coordinates: [number, number, number];
  };
};

type USGSResponse = {
  features: USGSFeature[];
};

/* -------------------------------------------------------------------------- */
/*  Clasificación de país                                                      */
/*                                                                             */
/*  Antes se usaban rectángulos, que se solapan (el de Perú incluía el sur de  */
/*  Ecuador) y, además, a TODO evento devuelto se le ponía el país pedido.     */
/*  Ahora cada evento se clasifica por sus propias coordenadas:                */
/*    1) Punto dentro de la frontera de un país (polígonos Natural Earth).     */
/*    2) Si cae en el mar: el país que menciona el texto `place` de USGS       */
/*       ("32 km SSW of Huacho, Peru"), solo si menciona exactamente uno.      */
/*    3) Si no, el país más cercano a menos de 150 km.                         */
/*    4) Si nada aplica: "Internacional".                                      */
/* -------------------------------------------------------------------------- */

type CountryShape = {
  bbox: [number, number, number, number]; // minLng, minLat, maxLng, maxLat
  polygons: number[][][]; // polígono -> anillos -> [lng, lat, lng, lat, ...]
};

const SHAPES = polygonData.countries as unknown as Record<string, CountryShape>;

// valor del enum del backend (PERU) -> etiqueta en español (Perú)
const LABEL_BY_KEY: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.value, c.label]),
);
// etiqueta en español -> valor del enum
const KEY_BY_LABEL: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.label, c.value]),
);

// Nombres que USGS usa en `place` (en inglés) para el respaldo por texto.
const NAME_ALIASES: Record<string, string[]> = {
  ARGENTINA: ["argentina"],
  BOLIVIA: ["bolivia"],
  BRASIL: ["brazil", "brasil"],
  CHILE: ["chile"],
  COLOMBIA: ["colombia"],
  COSTA_RICA: ["costa rica"],
  CUBA: ["cuba"],
  REPUBLICA_DOMINICANA: ["dominican republic", "republica dominicana"],
  ECUADOR: ["ecuador"],
  EL_SALVADOR: ["el salvador"],
  GUATEMALA: ["guatemala"],
  HONDURAS: ["honduras"],
  MEXICO: ["mexico"],
  NICARAGUA: ["nicaragua"],
  PANAMA: ["panama"],
  PARAGUAY: ["paraguay"],
  PERU: ["peru"],
  PUERTO_RICO: ["puerto rico"],
  URUGUAY: ["uruguay"],
  VENEZUELA: ["venezuela"],
};

const INTERNATIONAL = "Internacional";
const MAX_COAST_DISTANCE_KM = 150;

// Algoritmo "ray casting" sobre un anillo plano [lng, lat, lng, lat, ...]
function pointInRing(lng: number, lat: number, ring: number[]): boolean {
  let inside = false;
  const n = ring.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[2 * i];
    const yi = ring[2 * i + 1];
    const xj = ring[2 * j];
    const yj = ring[2 * j + 1];
    if (
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

// Dentro del anillo exterior y fuera de los huecos (lagos, enclaves)
function pointInPolygon(lng: number, lat: number, rings: number[][]): boolean {
  if (!pointInRing(lng, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lng, lat, rings[i])) return false;
  }
  return true;
}

function inBBox(
  lng: number,
  lat: number,
  bbox: CountryShape["bbox"],
  marginDeg = 0,
): boolean {
  return (
    lng >= bbox[0] - marginDeg &&
    lng <= bbox[2] + marginDeg &&
    lat >= bbox[1] - marginDeg &&
    lat <= bbox[3] + marginDeg
  );
}

function classifyByPolygon(lat: number, lng: number): string | null {
  for (const [key, shape] of Object.entries(SHAPES)) {
    if (!inBBox(lng, lat, shape.bbox)) continue;
    for (const rings of shape.polygons) {
      if (pointInPolygon(lng, lat, rings)) return key;
    }
  }
  return null;
}

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Devuelve el país SOLO si el texto menciona exactamente uno.
function classifyByPlaceText(place: string): string | null {
  const text = normalize(place);
  const found: string[] = [];
  for (const [key, aliases] of Object.entries(NAME_ALIASES)) {
    if (aliases.some((a) => new RegExp(`\\b${a}\\b`).test(text)))
      found.push(key);
  }
  return found.length === 1 ? found[0] : null;
}

// Distancia aproximada (km) de un punto a un segmento, en plano local.
function distanceToSegmentKm(
  lng: number,
  lat: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const kx = 111.32 * Math.cos((lat * Math.PI) / 180);
  const ky = 110.57;
  const px = lng * kx;
  const py = lat * ky;
  const ax = x1 * kx;
  const ay = y1 * ky;
  const bx = x2 * kx;
  const by = y2 * ky;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

function classifyByNearestCoast(lat: number, lng: number): string | null {
  const marginDeg = MAX_COAST_DISTANCE_KM / 100;
  let best: string | null = null;
  let bestKm = MAX_COAST_DISTANCE_KM;

  for (const [key, shape] of Object.entries(SHAPES)) {
    if (!inBBox(lng, lat, shape.bbox, marginDeg)) continue;
    for (const rings of shape.polygons) {
      const outer = rings[0];
      const n = outer.length / 2;
      for (let i = 0; i < n - 1; i++) {
        const d = distanceToSegmentKm(
          lng,
          lat,
          outer[2 * i],
          outer[2 * i + 1],
          outer[2 * i + 2],
          outer[2 * i + 3],
        );
        if (d < bestKm) {
          bestKm = d;
          best = key;
        }
      }
    }
  }
  return best;
}

/**
 * Devuelve el país (en español, ej. "Perú") de un evento o "Internacional".
 * Exportada para poder probarla de forma aislada.
 */
export function classifyEarthquakeCountry(
  lat: number,
  lng: number,
  place: string | null,
): string {
  const key =
    classifyByPolygon(lat, lng) ??
    (place ? classifyByPlaceText(place) : null) ??
    classifyByNearestCoast(lat, lng);
  return key ? (LABEL_BY_KEY[key] ?? INTERNATIONAL) : INTERNATIONAL;
}

/* -------------------------------------------------------------------------- */
/*  Formato de datos                                                           */
/* -------------------------------------------------------------------------- */

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return "Fecha desconocida";
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "Hace unos segundos";
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return "Ayer";
  return `Hace ${diffDays} días`;
}

function formatFullDate(timestamp: number | null): string {
  if (!timestamp) return "Fecha desconocida";
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

/* -------------------------------------------------------------------------- */
/*  Caché y peticiones                                                         */
/* -------------------------------------------------------------------------- */

// Guardamos el evento CRUDO de USGS (no el ya formateado) para que el texto
// "Hace X min" se recalcule cada vez y la clasificación no quede congelada.
const featureCache = new Map<string, USGSFeature>();

// Consultas recientes: evita repetir la misma petición varias veces seguidas
// (por ejemplo, el vigilante de notificaciones pide 5 países a la vez).
const QUERY_TTL_MS = 60 * 1000;
const queryCache = new Map<
  string,
  { at: number; promise: Promise<USGSFeature[]> }
>();

function mapFeatureToQuake(feature: USGSFeature): Quake | null {
  const { properties, geometry } = feature;
  if (
    properties.mag === null ||
    properties.place === null ||
    properties.time === null
  ) {
    return null;
  }

  featureCache.set(feature.id, feature);

  const [lng, lat, depth] = geometry.coordinates;
  return {
    id: feature.id,
    mag: properties.mag,
    magType: properties.magType ?? "Desconocida",
    place: properties.place,
    depth: Number(depth.toFixed(1)),
    time: formatRelativeTime(properties.time),
    country: classifyEarthquakeCountry(lat, lng, properties.place),
    lat,
    lng,
    coords: formatCoordinates(lat, lng),
    fullDate: formatFullDate(properties.time),
  };
}

function fetchFeatures(
  params: Record<string, string>,
  forceRefresh: boolean,
): Promise<USGSFeature[]> {
  const search = new URLSearchParams({
    format: "geojson",
    orderby: "time",
    ...params,
  }).toString();

  const cached = queryCache.get(search);
  if (!forceRefresh && cached && Date.now() - cached.at < QUERY_TTL_MS) {
    return cached.promise;
  }

  const promise = (async () => {
    const response = await fetch(`${USGS_API_URL}?${search}`);
    if (!response.ok) {
      throw new Error(`Error al consultar la API sísmica: ${response.status}`);
    }
    const data: USGSResponse = await response.json();
    return data.features;
  })();

  queryCache.set(search, { at: Date.now(), promise });
  // Si falla, no dejamos el error guardado en la caché.
  promise.catch(() => {
    if (queryCache.get(search)?.promise === promise) queryCache.delete(search);
  });
  return promise;
}

function toQuakes(features: USGSFeature[]): Quake[] {
  return features
    .map(mapFeatureToQuake)
    .filter((quake): quake is Quake => quake !== null);
}

/* -------------------------------------------------------------------------- */
/*  API pública del servicio (misma firma que antes + opción forceRefresh)     */
/* -------------------------------------------------------------------------- */

const MAIN_COUNTRIES = ["Perú", "Chile", "Ecuador", "Colombia", "México"];

export async function fetchRecentEarthquakes(
  limit = 20,
  country?: string,
  options?: { forceRefresh?: boolean },
): Promise<Quake[]> {
  const forceRefresh = options?.forceRefresh ?? false;
  const key = country ? KEY_BY_LABEL[country] : undefined;

  // País concreto: consulta por la caja del país (con 1° de margen), pero la
  // pertenencia se decide por la frontera real de cada evento.
  if (key && SHAPES[key]) {
    const [minLng, minLat, maxLng, maxLat] = SHAPES[key].bbox;
    const features = await fetchFeatures(
      {
        minlatitude: String(minLat - 1),
        maxlatitude: String(maxLat + 1),
        minlongitude: String(minLng - 1),
        maxlongitude: String(maxLng + 1),
        limit: String(Math.min(limit * 4, 1000)),
      },
      forceRefresh,
    );
    return toQuakes(features)
      .filter((quake) => quake.country === country)
      .slice(0, limit);
  }

  // "Internacional": todo lo que no sea uno de los 5 países principales.
  if (country === INTERNATIONAL) {
    const features = await fetchFeatures(
      { limit: String(Math.min(limit * 5, 1000)) },
      forceRefresh,
    );
    return toQuakes(features)
      .filter((quake) => !MAIN_COUNTRIES.includes(quake.country))
      .slice(0, limit);
  }

  // "Todos" o sin país: eventos recientes sin filtro geográfico.
  const features = await fetchFeatures({ limit: String(limit) }, forceRefresh);
  return toQuakes(features);
}

export async function fetchEarthquakeById(id: string): Promise<Quake | null> {
  const cached = featureCache.get(id);
  if (cached) return mapFeatureToQuake(cached);

  const params = new URLSearchParams({ format: "geojson", eventid: id });
  const response = await fetch(`${USGS_API_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Error al consultar el sismo: ${response.status}`);
  }

  // Con eventid, USGS devuelve un solo Feature; en listas, un FeatureCollection.
  const data = await response.json();
  const feature: USGSFeature | undefined = Array.isArray(data?.features)
    ? data.features[0]
    : data?.type === "Feature"
      ? data
      : undefined;

  if (!feature) return null;
  return mapFeatureToQuake(feature);
}
