export type NotificationSettings = {
  enabled: boolean; // interruptor general
  quakes: boolean; // alertas de sismos
  minMagnitude: number; // magnitud mínima (≈ magnitud_minima del backend)
  countries: string[]; // vacío = todos los países
  tips: boolean; // consejos de prevención
  tipsHour: number; // hora del consejo (0-23)
  missions: boolean; // recordatorio de misiones (19:00)
  sound: boolean; // alerta sonora
};

export const NOTIFICATION_COUNTRIES = [
  "Perú",
  "Chile",
  "Ecuador",
  "Colombia",
  "México",
];
export const MAGNITUDE_OPTIONS = [3.0, 4.0, 4.5, 5.0, 6.0];
export const TIPS_HOUR_OPTIONS = [8, 12, 18, 20];

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  quakes: true,
  minMagnitude: 4.5,
  countries: ["Perú"],
  tips: true,
  tipsHour: 8,
  missions: true,
  sound: false,
};
