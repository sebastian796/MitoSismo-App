import type { Quake } from '../types/earthquake';

// URL de consulta de la API de USGS.
const USGS_API_URL =
  'https://earthquake.usgs.gov/fdsnws/event/1/query';

// Límites geográficos utilizados para los filtros por país.
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

// Estructura de un evento recibido desde USGS.
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

// Estructura de la respuesta de USGS.
type USGSResponse = {
  features: USGSFeature[];
};

// Convierte el timestamp a un tiempo relativo.
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

// Formatea la fecha completa del sismo.
function formatFullDate(timestamp: number | null): string {
  if (!timestamp) {
    return 'Fecha desconocida';
  }

  return new Date(timestamp).toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'medium',
  });
}

// Formatea las coordenadas para mostrarlas en pantalla.
function formatCoordinates(lat: number, lng: number): string {
  const latitudeDirection = lat >= 0 ? 'N' : 'S';
  const longitudeDirection = lng >= 0 ? 'E' : 'O';

  return `${Math.abs(lat).toFixed(3)}°${latitudeDirection}  ${Math.abs(
    lng,
  ).toFixed(3)}°${longitudeDirection}`;
}

// Determina el país a partir de la ubicación proporcionada por USGS.
function extractCountry(place: string): string {
  if (!place) {
    return 'Internacional';
  }

  // Normaliza el texto para evitar problemas con tildes.
  const normalizedPlace = place
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

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

  if (normalizedPlace.includes('mexico')) {
    return 'México';
  }

  return 'Internacional';
}

// Convierte los datos de USGS al modelo Quake de la aplicación.
function mapFeatureToQuake(
  feature: USGSFeature,
  country?: keyof typeof COUNTRY_BOUNDS,
): Quake | null {
  const { properties, geometry } = feature;

  // Descarta eventos sin información necesaria.
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

    // Usa el país del filtro o lo obtiene desde el lugar.
    country: country ?? extractCountry(properties.place),

    lat,
    lng,
    coords: formatCoordinates(lat, lng),
    fullDate: formatFullDate(properties.time),
  };
}

// Obtiene los sismos recientes y aplica filtros geográficos.
export async function fetchRecentEarthquakes(
  limit = 20,
  country?: keyof typeof COUNTRY_BOUNDS | 'Internacional',
): Promise<Quake[]> {
  const params = new URLSearchParams({
    format: 'geojson',
    orderby: 'time',
    limit: String(limit),
  });

  // Agrega los límites del país seleccionado a la consulta.
  if (country && country !== 'Internacional') {
    const bounds = COUNTRY_BOUNDS[country];

    params.set('minlatitude', String(bounds.minlatitude));
    params.set('maxlatitude', String(bounds.maxlatitude));
    params.set('minlongitude', String(bounds.minlongitude));
    params.set('maxlongitude', String(bounds.maxlongitude));
  }

  // Consulta la API de USGS.
  const response = await fetch(
    `${USGS_API_URL}?${params.toString()}`,
  );

  if (!response.ok) {
    throw new Error(
      `Error al consultar la API sísmica: ${response.status}`,
    );
  }

  const data: USGSResponse = await response.json();

  // Convierte los eventos al formato de la aplicación.
  const quakes = data.features
    .map((feature) => mapFeatureToQuake(feature, country))
    .filter((quake): quake is Quake => quake !== null);

  // Internacional excluye los países que tienen filtros propios.
  if (country === 'Internacional') {
    const excludedCountries = [
      'Perú',
      'Chile',
      'Ecuador',
      'Colombia',
      'México',
    ];

    return quakes
      .filter((quake) => !excludedCountries.includes(quake.country))
      .slice(0, limit);
  }

  return quakes;
}

// Obtiene un sismo específico mediante su ID de USGS.
export async function fetchEarthquakeById(
  id: string,
): Promise<Quake | null> {
  const params = new URLSearchParams({
    format: 'geojson',
    eventid: id,
  });

  // Consulta el evento específico.
  const response = await fetch(
    `${USGS_API_URL}?${params.toString()}`,
  );

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

  // Convierte el resultado al modelo de la aplicación.
  return mapFeatureToQuake(feature);
}