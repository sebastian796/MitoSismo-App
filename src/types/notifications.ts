export type NotificationSettings = {
  enabled: boolean;
  quakes: boolean;
  minMagnitude: number;
  countries: string[];
  tips: boolean;
  tipsHour: number;
  missions: boolean;
  sound: boolean;
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