export type Quake = {
  id: number;
  mag: number;
  place: string;
  depth: number;
  time: string;
  country: string;
  lat: number;
  lng: number;
  coords: string;
  fullDate: string;
};

export type Mission = {
  id: number;
  title: string;
  description: string;
  progress: number;
  xp: number;
  completed: boolean;
  icon: string;
};

export const quakes: Quake[] = [
  {
    id: 1,
    mag: 5.2,
    place: "120 km al oeste de Lima, Perú",
    depth: 38,
    time: "Hoy, 03:42 a.m.",
    country: "Perú",
    lat: -12.0,
    lng: -79.5,
    coords: "12.043°S  79.512°O",
    fullDate: "7 sep 2026, 03:42:17 a.m. (UTC-5)",
  },
  {
    id: 2,
    mag: 4.1,
    place: "45 km al norte de Santiago, Chile",
    depth: 12,
    time: "Hoy, 01:15 a.m.",
    country: "Chile",
    lat: -33.0,
    lng: -70.7,
    coords: "33.021°S  70.681°O",
    fullDate: "7 sep 2026, 01:15:44 a.m. (UTC-4)",
  },
  {
    id: 3,
    mag: 3.7,
    place: "80 km al este de Quito, Ecuador",
    depth: 55,
    time: "Ayer, 22:30",
    country: "Ecuador",
    lat: -0.2,
    lng: -78.0,
    coords: "0.218°S  77.985°O",
    fullDate: "6 sep 2026, 22:30:09 p.m. (UTC-5)",
  },
  {
    id: 4,
    mag: 6.1,
    place: "200 km al sur de Valparaíso, Chile",
    depth: 22,
    time: "Ayer, 18:05",
    country: "Chile",
    lat: -35.0,
    lng: -71.6,
    coords: "34.988°S  71.604°O",
    fullDate: "6 sep 2026, 18:05:32 p.m. (UTC-4)",
  },
  {
    id: 5,
    mag: 2.8,
    place: "30 km al noroeste de Bogotá, Colombia",
    depth: 8,
    time: "Ayer, 14:20",
    country: "Colombia",
    lat: 4.8,
    lng: -74.3,
    coords: "4.812°N  74.298°O",
    fullDate: "6 sep 2026, 14:20:05 p.m. (UTC-5)",
  },
  {
    id: 6,
    mag: 4.8,
    place: "15 km al norte de Ciudad de México",
    depth: 18,
    time: "Hace 2 días",
    country: "México",
    lat: 19.5,
    lng: -99.1,
    coords: "19.512°N  99.134°O",
    fullDate: "5 sep 2026, 21:38:51 p.m. (UTC-6)",
  },
];

export const missions: Mission[] = [
  {
    id: 1,
    title: "Conoce tu zona segura",
    description: "Identifica los puntos seguros dentro y fuera de tu hogar.",
    progress: 60,
    xp: 150,
    completed: false,
    icon: "🏠",
  },
  {
    id: 2,
    title: "Prepara una mochila de emergencia",
    description: "Arma un kit básico con agua, linterna, botiquín y documentos.",
    progress: 30,
    xp: 200,
    completed: false,
    icon: "🎒",
  },
  {
    id: 3,
    title: "Aprende qué hacer durante un sismo",
    description: "Conoce las acciones clave durante un movimiento sísmico.",
    progress: 100,
    xp: 100,
    completed: true,
    icon: "⚡",
  },
  {
    id: 4,
    title: "Identifica los riesgos en tu hogar",
    description: "Reconoce objetos y estructuras peligrosas durante un temblor.",
    progress: 0,
    xp: 180,
    completed: false,
    icon: "🔍",
  },
  {
    id: 5,
    title: "Comparte con tu familia",
    description: "Enseña a tu familia las medidas de seguridad aprendidas.",
    progress: 15,
    xp: 120,
    completed: false,
    icon: "👨‍👩‍👧",
  },
];
