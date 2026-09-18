import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, Card, Button } from '../../components';
import { missions as initialMissions } from '../../constants/data';
import { Mission } from '../../types';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

export default function MissionsScreen() {
  const [missionsList, setMissionsList] = useState<Mission[]>(initialMissions);
  const totalXp = missionsList.reduce(
    (acc, m) => acc + (m.completed ? m.xp : 0),
    350
  );
  const nextLevelThreshold = 1000;
  const progressPercent = Math.min(100, Math.round((totalXp / nextLevelThreshold) * 100));

  const toggleMission = (id: number) => {
    setMissionsList((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, completed: !m.completed, progress: m.completed ? 0 : 100 } : m
      )
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Misiones de Prevención" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* XP & Level Hero Card */}
        <Card style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.levelLabel}>NIVEL 3</Text>
              <Text style={styles.levelTitle}>Brigadista Comunitario</Text>
            </View>
            <View style={styles.xpBadge}>
              <Ionicons name="sparkles" size={16} color={Colors.gold} />
              <Text style={styles.xpText}>{totalXp} XP</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.progressLabels}>
            <Text style={styles.progressSub}>{totalXp} / {nextLevelThreshold} XP para Nivel 4</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
        </Card>

        {/* Missions Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Misiones Disponibles</Text>
          <Text style={styles.sectionCount}>
            {missionsList.filter((m) => m.completed).length}/{missionsList.length} Completadas
          </Text>
        </View>

        {/* Missions Checklist */}
        {missionsList.map((m) => (
          <Pressable key={m.id} onPress={() => toggleMission(m.id)}>
            <Card style={[styles.missionCard, m.completed && styles.missionCompletedCard]}>
              <View style={styles.missionRow}>
                {/* Checkbox Icon */}
                <View
                  style={[
                    styles.checkbox,
                    m.completed && styles.checkboxCompleted,
                  ]}
                >
                  {m.completed && (
                    <Ionicons name="checkmark" size={18} color={Colors.white} />
                  )}
                </View>

                {/* Info */}
                <View style={styles.missionInfo}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[
                        styles.missionTitle,
                        m.completed && styles.missionTitleCompleted,
                      ]}
                    >
                      {m.title}
                    </Text>
                  </View>
                  <Text style={styles.missionDesc}>{m.description}</Text>

                  {/* XP Reward */}
                  <View style={styles.rewardRow}>
                    <View style={styles.rewardPill}>
                      <Ionicons name="star" size={12} color={Colors.accent} />
                      <Text style={styles.rewardText}>+{m.xp} XP</Text>
                    </View>
                    {m.completed ? (
                      <Text style={styles.statusCompletedText}>¡Completado!</Text>
                    ) : (
                      <Text style={styles.statusPendingText}>Toca para completar</Text>
                    )}
                  </View>
                </View>
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
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  xpCard: {
    backgroundColor: Colors.primaryDark,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentLight,
    letterSpacing: 0.5,
  },
  levelTitle: {
    ...Typography.titleSmall,
    color: Colors.white,
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 4,
  },
  xpText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.white,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radii.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentLight,
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
  sectionCount: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.accent,
  },
  missionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  missionCompletedCard: {
    backgroundColor: '#F3EFE6',
    borderColor: '#D4CAB8',
  },
  missionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: Radii.sm,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: Spacing.md,
    backgroundColor: Colors.surface,
  },
  checkboxCompleted: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  missionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  missionTitle: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  missionTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textSecondary,
  },
  missionDesc: {
    ...Typography.bodySmall,
    marginTop: 2,
    lineHeight: 16,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    gap: 4,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
  },
  statusCompletedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
  },
  statusPendingText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
});
