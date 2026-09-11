import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, Card, MagBadge } from '../../components';
import { quakes } from '../../constants/data';
import { Quake } from '../../types';
import { Colors, Spacing, Typography, Radii, Shadows, magInfo } from '../../constants/theme';

export default function MapScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | '4plus' | '5plus'>('all');
  const [selectedQuake, setSelectedQuake] = useState<Quake>(quakes[0]);

  const filteredQuakes = quakes.filter((q) => {
    if (filter === '4plus') return q.mag >= 4.0;
    if (filter === '5plus') return q.mag >= 5.0;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Mapa de Epicentros" />

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <Pressable
          style={[styles.chip, filter === 'all' && styles.chipActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.chipText, filter === 'all' && styles.chipTextActive]}>
            Todos ({quakes.length})
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === '4plus' && styles.chipActive]}
          onPress={() => setFilter('4plus')}
        >
          <Text style={[styles.chipText, filter === '4plus' && styles.chipTextActive]}>
            M ≥ 4.0
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === '5plus' && styles.chipActive]}
          onPress={() => setFilter('5plus')}
        >
          <Text style={[styles.chipText, filter === '5plus' && styles.chipTextActive]}>
            M ≥ 5.0
          </Text>
        </Pressable>
      </View>

      {/* Interactive Map Canvas Container */}
      <View style={styles.mapContainer}>
        {/* Background Grid / Continent stylized representation */}
        <View style={styles.mapCanvas}>
          <View style={styles.gridOverlay}>
            <Text style={styles.coordsLabel}>Cinturón de Fuego del Pacífico</Text>
          </View>

          {/* Epicenter Pins */}
          {filteredQuakes.map((q, index) => {
            const isSelected = selectedQuake.id === q.id;
            const info = magInfo(q.mag);
            // Simulated coordinates placement on the canvas
            const topPercent = 20 + ((index * 37) % 60);
            const leftPercent = 15 + ((index * 43) % 70);

            return (
              <Pressable
                key={q.id}
                style={[
                  styles.pinWrapper,
                  { top: `${topPercent}%`, left: `${leftPercent}%` },
                ]}
                onPress={() => setSelectedQuake(q)}
              >
                <View
                  style={[
                    styles.pinOuterRing,
                    { borderColor: info.dot },
                    isSelected && styles.pinSelectedRing,
                  ]}
                >
                  <View style={[styles.pinDot, { backgroundColor: info.dot }]}>
                    <Text style={styles.pinText}>{q.mag.toFixed(1)}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Selected Quake Popup Card */}
        {selectedQuake && (
          <Pressable
            style={styles.popupWrapper}
            onPress={() => router.push(`/quake/${selectedQuake.id}`)}
          >
            <Card style={styles.popupCard}>
              <View style={styles.popupRow}>
                <View style={styles.popupLeft}>
                  <View style={styles.badgeRow}>
                    <MagBadge mag={selectedQuake.mag} showDot />
                    <Text style={styles.popupTime}>{selectedQuake.time}</Text>
                  </View>
                  <Text style={styles.popupPlace} numberOfLines={1}>
                    {selectedQuake.place}
                  </Text>
                  <Text style={styles.popupCoords}>
                    {selectedQuake.coords} • Prof: {selectedQuake.depth} km
                  </Text>
                </View>
                <View style={styles.popupAction}>
                  <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
                </View>
              </View>
            </Card>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: Radii.xl,
    overflow: 'hidden',
    backgroundColor: '#E5DFD3',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mapCanvas: {
    flex: 1,
    position: 'relative',
  },
  gridOverlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radii.sm,
  },
  coordsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  pinWrapper: {
    position: 'absolute',
    transform: [{ translateX: -18 }, { translateY: -18 }],
  },
  pinOuterRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    ...Shadows.sm,
  },
  pinSelectedRing: {
    transform: [{ scale: 1.25 }],
    borderWidth: 3,
    backgroundColor: Colors.white,
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.white,
  },
  popupWrapper: {
    position: 'absolute',
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
  },
  popupCard: {
    padding: Spacing.md,
    ...Shadows.md,
  },
  popupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popupLeft: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  popupTime: {
    ...Typography.bodySmall,
  },
  popupPlace: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  popupCoords: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  popupAction: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
});
