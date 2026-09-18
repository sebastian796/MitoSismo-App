import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card, MagBadge, Ignis, Button } from '../../components';
import { quakes, ignisCreature } from '../../constants/data';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const latestQuake = quakes[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hola, Explorador</Text>
            <Text style={styles.subGreeting}>Monitoreo sísmico en tiempo real</Text>
          </View>
          <Pressable
            style={styles.notifButton}
            onPress={() => router.push('/prevention')}
          >
            <Ionicons name="notifications-outline" size={22} color={Colors.primary} />
          </Pressable>
        </View>

        {/* Mascot Banner (Ignis) */}
        <Pressable onPress={() => router.push('/creature')}>
          <Card style={styles.creatureCard}>
            <View style={styles.creatureContent}>
              <View style={styles.creatureTextCol}>
                <View style={styles.creatureTag}>
                  <Text style={styles.creatureTagText}>Nivel {ignisCreature.level} • {ignisCreature.name}</Text>
                </View>
                <Text style={styles.creatureTitle}>Guardián Activo</Text>
                <Text style={styles.creatureDesc} numberOfLines={2}>
                  "Suelo en calma por el momento. ¡Buen momento para revisar tu mochila!"
                </Text>
              </View>
              <View style={styles.creatureAvatar}>
                <Ignis size={64} />
              </View>
            </View>
          </Card>
        </Pressable>

        {/* Latest Earthquake Alert Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Último Sismo Registrado</Text>
          <Pressable onPress={() => router.push('/(tabs)/recent')}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push(`/quake/${latestQuake.id}`)}>
          <Card style={styles.latestQuakeCard}>
            <View style={styles.quakeTopRow}>
              <View style={styles.magContainer}>
                <Text style={styles.magNumber}>{latestQuake.mag.toFixed(1)}</Text>
                <Text style={styles.magUnit}>Mag</Text>
              </View>
              <View style={styles.quakeMainInfo}>
                <MagBadge mag={latestQuake.mag} showDot />
                <Text style={styles.quakePlace} numberOfLines={2}>
                  {latestQuake.place}
                </Text>
              </View>
            </View>

            <View style={styles.quakeDivider} />

            <View style={styles.quakeBottomRow}>
              <View style={styles.quakeMetaItem}>
                <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.quakeMetaText}>{latestQuake.time}</Text>
              </View>
              <View style={styles.quakeMetaItem}>
                <Ionicons name="arrow-down-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.quakeMetaText}>Prof: {latestQuake.depth} km</Text>
              </View>
            </View>
          </Card>
        </Pressable>

        {/* Quick Actions Grid */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Preparación y Prevención
        </Text>

        <View style={styles.actionsGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/prevention')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#E65100" />
            </View>
            <Text style={styles.actionTitle}>Guías de Prevención</Text>
            <Text style={styles.actionSub}>Antes, durante y después</Text>
          </Pressable>

          <Pressable
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/missions')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="bag-handle" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.actionTitle}>Misiones y Retos</Text>
            <Text style={styles.actionSub}>Gana XP y medallas</Text>
          </Pressable>
        </View>

        {/* Recent Earthquakes List */}
        <View style={[styles.sectionHeader, { marginTop: Spacing.xl }]}>
          <Text style={styles.sectionTitle}>Actividad Reciente</Text>
        </View>

        {quakes.slice(1, 4).map((q) => (
          <Pressable
            key={q.id}
            onPress={() => router.push(`/quake/${q.id}`)}
          >
            <Card style={styles.miniQuakeCard}>
              <View style={styles.miniQuakeRow}>
                <View style={styles.miniMagBox}>
                  <Text style={styles.miniMagText}>{q.mag.toFixed(1)}</Text>
                </View>
                <View style={styles.miniQuakeDetails}>
                  <Text style={styles.miniQuakePlace} numberOfLines={1}>
                    {q.place}
                  </Text>
                  <Text style={styles.miniQuakeTime}>{q.time}</Text>
                </View>
                <MagBadge mag={q.mag} />
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.titleMedium,
  },
  subGreeting: {
    ...Typography.bodyMedium,
  },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  creatureCard: {
    backgroundColor: Colors.primaryDark,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  creatureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  creatureTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  creatureTag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  creatureTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.white,
  },
  creatureTitle: {
    ...Typography.titleSmall,
    color: Colors.white,
    marginBottom: 2,
  },
  creatureDesc: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 16,
  },
  creatureAvatar: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleSmall,
  },
  seeAllText: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontWeight: '700',
  },
  latestQuakeCard: {
    padding: Spacing.lg,
  },
  quakeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  magContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    marginRight: Spacing.md,
  },
  magNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.primary,
  },
  magUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: -2,
  },
  quakeMainInfo: {
    flex: 1,
    gap: Spacing.xs,
  },
  quakePlace: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  quakeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  quakeBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quakeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  quakeMetaText: {
    ...Typography.bodySmall,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionSub: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  miniQuakeCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  miniQuakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniMagBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  miniMagText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  miniQuakeDetails: {
    flex: 1,
  },
  miniQuakePlace: {
    ...Typography.bodyMedium,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  miniQuakeTime: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
});
