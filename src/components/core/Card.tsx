import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Radii, Shadows } from '../../constants/theme';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({ children, style, variant = 'elevated' }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'flat' && styles.flat,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radii.lg,
    overflow: 'hidden',
  },
  elevated: {
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  flat: {
    backgroundColor: Colors.surfaceAlt,
  },
});
