import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Quake } from '../../types/earthquake';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';
import { Card } from '../core/Card';
import { MagBadge } from '../core/MagBadge';

interface QuakeCardProps {
  quake: Quake;
  onPress: () => void;
}

/** Reusable summary card for an earthquake in vertical lists. */
export function QuakeCard({ quake, onPress }: QuakeCardProps) {
  return (
    <Pressable onPress={onPress} style={styles.pressable}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.magnitudeBox}>
            <Text style={styles.magnitude}>{quake.mag.toFixed(1)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.badgeRow}>
              <MagBadge mag={quake.mag} />
              <Text style={styles.country}>{quake.country}</Text>
            </View>
            <Text style={styles.place} numberOfLines={1}>
              {quake.place}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{quake.time}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="swap-vertical-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>Prof: {quake.depth} km</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{quake.coords.split('  ')[0]}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  magnitudeBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  magnitude: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  headerInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  country: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  place: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
