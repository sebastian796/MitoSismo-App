import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { magInfo, Radii } from '../../constants/theme';

interface MagBadgeProps {
  mag: number;
  showDot?: boolean;
}

export function MagBadge({ mag, showDot = false }: MagBadgeProps) {
  const info = magInfo(mag);

  return (
    <View style={[styles.badge, { backgroundColor: info.bg }]}>
      {showDot && <View style={[styles.dot, { backgroundColor: info.dot }]} />}
      <Text style={[styles.label, { color: info.text }]}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: Radii.full,
    marginRight: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
