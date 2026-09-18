import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, Card, Ignis, Button } from '../components';
import { ignisCreature } from '../constants/data';
import { Colors, Spacing, Typography, Radii } from '../constants/theme';

export default function CreatureScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Mascota Guardiana" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Creature Showcase */}
        <Card style={styles.heroCard}>
          <View style={styles.avatarContainer}>
            <Ignis size={100} />
          </View>
          <Text style={styles.creatureName}>{ignisCreature.name}</Text>
          <Text style={styles.creatureTitle}>{ignisCreature.title}</Text>
          
          <View style={styles.tagRow}>
            <View style={styles.tagPill}>
              <Text style={styles.tagText}>Elemento: {ignisCreature.element}</Text>
            </View>
            <View style={[styles.tagPill, { backgroundColor: Colors.surfaceAlt }]}>
              <Text style={[styles.tagText, { color: Colors.primary }]}>Nivel {ignisCreature.level}</Text>
            </View>
          </View>

          <Text style={styles.creatureBio}>{ignisCreature.description}</Text>
        </Card>

        {/* Mythology Lore Section */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Sabiduría Ancestral Andina
        </Text>

        <Card style={styles.loreCard}>
          <View style={styles.loreHeader}>
            <Ionicons name="sparkles" size={18} color={Colors.gold} />
            <Text style={styles.loreTitle}>Mito del Fuego y la Pachamama</Text>
          </View>
          <Text style={styles.loreText}>{ignisCreature.mythLore}</Text>
        </Card>

        {/* Abilities List */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Habilidades de Alerta
        </Text>

        {ignisCreature.abilities.map((ability, index) => (
          <Card key={index} style={styles.abilityCard}>
            <View style={styles.abilityRow}>
              <View
                style={[
                  styles.abilityIcon,
                  ability.unlocked ? styles.abilityUnlocked : styles.abilityLocked,
                ]}
              >
                <Ionicons
                  name={ability.unlocked ? 'flash' : 'lock-closed'}
                  size={18}
                  color={ability.unlocked ? Colors.white : Colors.textMuted}
                />
              </View>

              <View style={styles.abilityInfo}>
                <View style={styles.abilityHeaderRow}>
                  <Text style={styles.abilityName}>{ability.name}</Text>
                  <Text
                    style={[
                      styles.abilityStatus,
                      ability.unlocked ? styles.unlockedText : styles.lockedText,
                    ]}
                  >
                    {ability.unlocked ? 'Activo' : 'Bloqueado'}
                  </Text>
                </View>
                <Text style={styles.abilityDesc}>{ability.description}</Text>
              </View>
            </View>
          </Card>
        ))}

        {/* Back Button */}
        <Button
          title="Regresar al Inicio"
          onPress={() => router.back()}
          style={styles.backButton}
        />
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
    paddingBottom: Spacing.xxxl,
  },
  heroCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  creatureName: {
    ...Typography.titleLarge,
    fontSize: 28,
  },
  creatureTitle: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    fontWeight: '700',
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  tagPill: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  creatureBio: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  loreCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.primaryDark,
  },
  loreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  loreTitle: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.gold,
  },
  loreText: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  abilityCard: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  abilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  abilityIcon: {
    width: 38,
    height: 38,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  abilityUnlocked: {
    backgroundColor: Colors.accent,
  },
  abilityLocked: {
    backgroundColor: Colors.surfaceAlt,
  },
  abilityInfo: {
    flex: 1,
  },
  abilityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  abilityName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  abilityStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  unlockedText: {
    color: '#2E7D32',
  },
  lockedText: {
    color: Colors.textMuted,
  },
  abilityDesc: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});
