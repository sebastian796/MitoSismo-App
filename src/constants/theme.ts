export const Colors = {
  primary: '#2C1810',      // Tierra oscura andina
  primaryDark: '#1C0C04',
  accent: '#E8521A',       // Fuego / Ignis
  accentLight: '#FF8A50',
  accentDark: '#C03808',
  gold: '#C8A96E',         // Mito / Sol
  background: '#F8F4EE',   // Arena suave
  surface: '#FFFFFF',
  surfaceAlt: '#EDE8DC',
  border: '#DDD5C5',
  borderDark: '#C4B9A5',
  textPrimary: '#1C0C04',
  textSecondary: '#8A7A6A',
  textMuted: '#A89989',
  white: '#FFFFFF',
  black: '#000000',
  
  // Alertas Sísmicas por Magnitud
  magLeve: {
    bg: '#E8F5E9',
    text: '#2E7D32',
    dot: '#4CAF50',
    label: 'Leve',
  },
  magModerado: {
    bg: '#FFF3E0',
    text: '#E65100',
    dot: '#FF9800',
    label: 'Moderado',
  },
  magFuerte: {
    bg: '#FFEBEE',
    text: '#C62828',
    dot: '#E53935',
    label: 'Fuerte',
  },
  magMayor: {
    bg: '#FFCDD2',
    text: '#B71C1C',
    dot: '#7A0000',
    label: 'Mayor',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const Typography = {
  titleLarge: {
    fontSize: 26,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.textPrimary,
  },
  titleSmall: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  bodyLarge: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: Colors.textPrimary,
  },
  bodyMedium: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.textSecondary,
  },
  bodySmall: {
    fontSize: 11,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
  },
};

export const Radii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
};

export function magInfo(mag: number) {
  if (mag < 4.0) return Colors.magLeve;
  if (mag < 5.0) return Colors.magModerado;
  if (mag < 7.0) return Colors.magFuerte;
  return Colors.magMayor;
}
