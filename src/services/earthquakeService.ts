import type { Quake } from '../types/earthquake';

const USGS_API_URL =
  'https://earthquake.usgs.gov/fdsnws/event/1/query';

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

function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) {
    return 'Fecha desconocida';
  }

  const date = new Date(timestamp);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Hace unos segundos';
  }

  if (diffMinutes < 60) {
    return `Hace ${diffMinutes} min`;
  }

  if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  }

  if (diffDays === 1) {
    return 'Ayer';
  }

  return `Hace ${diffDays} días`;
}

function formatFullDate(timestamp: number | null): string {
  if (!timestamp) {
    return 'Fecha desconocida';
  }

  return new Date(timestamp).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

function formatCoordinates(lat: number, lng: number): string {
  const latitudeDirection = lat >= 0 ? 'N' : 'S';
  const longitudeDirection = lng >= 0 ? 'E' : 'O';

  return `${Math.abs(lat).toFixed(3)}°${latitudeDirection}  ${Math.abs(
    lng,
  ).toFixed(3)}°${longitudeDirection}`;
}

function extractCountry(place: string): string {
  if (!place) {
    return 'Internacional';
  }

  const normalizedPlace = place.toLowerCase();

  if (normalizedPlace.includes('peru')) {
    return 'Perú';
  }

  if (normalizedPlace.includes('chile')) {
    return 'Chile';
  }

  if (normalizedPlace.includes('ecuador')) {
    return 'Ecuador';
  }

  if (normalizedPlace.includes('colombia')) {
    return 'Colombia';
  }

  if (
    normalizedPlace.includes('mexico') ||
    normalizedPlace.includes('méxico')
  ) {
    return 'México';
  }

  return 'Internacional';
}

function mapFeatureToQuake(feature: USGSFeature): Quake | null {
  const { properties, geometry } = feature;

  if (
    properties.mag === null ||
    properties.place === null ||
    properties.time === null
  ) {
    return null;
  }

  const [lng, lat, depth] = geometry.coordinates;

  return {
    id: feature.id,
    mag: properties.mag,
    magType: properties.magType ?? 'Desconocida',
    place: properties.place,
    depth: Number(depth.toFixed(1)),
    time: formatRelativeTime(properties.time),
    country: extractCountry(properties.place),
    lat,
    lng,
    coords: formatCoordinates(lat, lng),
    fullDate: formatFullDate(properties.time),
  };
}

export async function fetchRecentEarthquakes(
  limit = 20,
): Promise<Quake[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    orderby: 'time',
    limit: String(limit),
  });

  const response = await fetch(`${USGS_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Error al consultar la API sísmica: ${response.status}`,
    );
  }

  const data: USGSResponse = await response.json();

  return data.features
    .map(mapFeatureToQuake)
    .filter((quake): quake is Quake => quake !== null);
}

export async function fetchEarthquakeById(
  id: string,
): Promise<Quake | null> {
  const params = new URLSearchParams({
    format: 'geojson',
    eventid: id,
  });

  const response = await fetch(`${USGS_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Error al consultar el sismo: ${response.status}`,
    );
  }

  const data: USGSResponse = await response.json();

  const feature = data.features[0];

  if (!feature) {
    return null;
  }

  return mapFeatureToQuake(feature);
}