import type { Quake } from "../types/earthquake";

const quakeCache = new Map<string, Quake>();
const USGS_API_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query";
const LATAM_BOUNDS = {
  minlatitude: -60,
  maxlatitude: 33,
  minlongitude: -120,
  maxlongitude: -30,
};
type USGSFeature = {
  id: string;
  properties: { mag: number | null; magType: string | null; place: string | null; time: number | null; title: string | null };
  geometry: { coordinates: [number, number, number] };
};
type USGSResponse = { features: USGSFeature[] };

function formatRelativeTime(timestamp: number | null): string {
  if (timestamp == null || !Number.isFinite(timestamp) || timestamp <= 0) return "Fecha desconocida";

  // USGS `properties.time` is Unix epoch time in MILLISECONDS (UTC).
  // Do not parse it as a date string or subtract a timezone offset manually.
  const elapsedMs = Date.now() - timestamp;
  if (elapsedMs < -60_000) return `En el futuro · ${formatFullDate(timestamp)}`;
  if (elapsedMs < 60_000) return "Hace menos de 1 min";

  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  if (elapsedMinutes < 60) return `Hace ${elapsedMinutes} min`;

  const elapsedHours = Math.floor(elapsedMs / 3_600_000);
  if (elapsedHours < 24) return `Hace ${elapsedHours} h`;

  const elapsedDays = Math.floor(elapsedMs / 86_400_000);
  if (elapsedDays < 7) return `Hace ${elapsedDays} día${elapsedDays === 1 ? "" : "s"}`;

  return formatFullDate(timestamp);
}
function formatFullDate(timestamp: number | null): string {
  if (timestamp == null || !Number.isFinite(timestamp)) return "Fecha desconocida";
  return new Intl.DateTimeFormat("es-PE", {
    timeZone: "America/Lima", dateStyle: "medium", timeStyle: "medium",
  }).format(new Date(timestamp));
}
function formatCoordinates(lat: number, lng: number): string {
  return `${Math.abs(lat).toFixed(3)}°${lat >= 0 ? "N" : "S"}  ${Math.abs(lng).toFixed(3)}°${lng >= 0 ? "E" : "O"}`;
}
// Country names used by USGS place strings. Events without a verifiable
// Latin-American country in the official place label are excluded rather than guessed.
const LATAM_COUNTRIES: Array<[string, string]> = [
  ["peru", "Perú"], ["chile", "Chile"], ["ecuador", "Ecuador"], ["colombia", "Colombia"],
  ["mexico", "México"], ["argentina", "Argentina"], ["bolivia", "Bolivia"], ["brazil", "Brasil"],
  ["brasil", "Brasil"], ["venezuela", "Venezuela"], ["uruguay", "Uruguay"], ["paraguay", "Paraguay"],
  ["panama", "Panamá"], ["costa rica", "Costa Rica"], ["nicaragua", "Nicaragua"], ["honduras", "Honduras"],
  ["guatemala", "Guatemala"], ["el salvador", "El Salvador"], ["belize", "Belice"],
  ["cuba", "Cuba"], ["haiti", "Haití"], ["dominican republic", "República Dominicana"],
  ["puerto rico", "Puerto Rico"], ["jamaica", "Jamaica"], ["trinidad and tobago", "Trinidad y Tobago"],
  ["trinidad", "Trinidad y Tobago"], ["guyana", "Guyana"], ["suriname", "Surinam"],
  ["french guiana", "Guayana Francesa"], ["guayana francesa", "Guayana Francesa"],
];
function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function countryFromPlace(place: string): string | null {
  const normalized = normalize(place);
  for (const [needle, label] of LATAM_COUNTRIES) if (normalized.includes(needle)) return label;
  return null;
}
function mapFeatureToQuake(feature: USGSFeature, forcedCountry?: string): Quake | null {
  const { properties, geometry } = feature;
  if (properties.mag == null || properties.place == null || properties.time == null || !geometry?.coordinates) return null;
  const [lng, lat, rawDepth] = geometry.coordinates;
  const country = forcedCountry || countryFromPlace(properties.place);
  if (!country) return null;
  const quake: Quake = {
    id: feature.id, mag: properties.mag, magType: properties.magType ?? "Desconocida",
    place: properties.place, depth: Number((rawDepth ?? 0).toFixed(1)),
    time: formatRelativeTime(properties.time), country, lat, lng,
    coords: formatCoordinates(lat, lng), fullDate: formatFullDate(properties.time),
  };
  quakeCache.set(quake.id, quake);
  return quake;
}

/**
 * Real-time data from the public USGS Earthquake Hazards Program API.
 * Results are limited to the Latin-American geographic region and returned newest first.
 */
export async function fetchRecentEarthquakes(limit = 10, country?: string): Promise<Quake[]> {
  const params = new URLSearchParams({
    format: "geojson", orderby: "time", limit: "20000",
    minlatitude: String(LATAM_BOUNDS.minlatitude), maxlatitude: String(LATAM_BOUNDS.maxlatitude),
    minlongitude: String(LATAM_BOUNDS.minlongitude), maxlongitude: String(LATAM_BOUNDS.maxlongitude),
  });
  const response = await fetch(`${USGS_API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`Error al consultar la API sísmica: ${response.status}`);
  const data: USGSResponse = await response.json();
  let quakes = (data.features ?? [])
    .map(feature => mapFeatureToQuake(feature))
    .filter((quake): quake is Quake => quake !== null)
    .filter(q => q.lat >= LATAM_BOUNDS.minlatitude && q.lat <= LATAM_BOUNDS.maxlatitude && q.lng >= LATAM_BOUNDS.minlongitude && q.lng <= LATAM_BOUNDS.maxlongitude);

  if (country && country !== "Todos") {
    if (country === "Internacional") {
      quakes = quakes.filter(q => !["Perú", "Chile", "Ecuador", "Colombia", "México"].includes(q.country));
    } else {
      // Filter by the country named by the USGS event itself, never by a rough
      // rectangle that could incorrectly label neighboring countries or the ocean.
      quakes = quakes.filter(q => q.country === country);
    }
  }
  return quakes.slice(0, Math.max(0, Math.min(limit, 10)));
}
export async function fetchEarthquakeById(id: string): Promise<Quake | null> {
  const cached = quakeCache.get(id);
  if (cached) return cached;
  const params = new URLSearchParams({ format: "geojson", eventid: id });
  const response = await fetch(`${USGS_API_URL}?${params.toString()}`);
  if (!response.ok) throw new Error(`Error al consultar el sismo: ${response.status}`);
  const data = await response.json();
  const feature: USGSFeature | undefined = Array.isArray(data?.features) ? data.features[0] : data?.type === "Feature" ? data : undefined;
  if (!feature) return null;
  const quake = mapFeatureToQuake(feature);
  if (!quake || quake.lat < LATAM_BOUNDS.minlatitude || quake.lat > LATAM_BOUNDS.maxlatitude || quake.lng < LATAM_BOUNDS.minlongitude || quake.lng > LATAM_BOUNDS.maxlongitude) return null;
  return quake;
}
