import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, Card, Button } from '../../components';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const [notifQuakes, setNotifQuakes] = useState(true);
  const [notifTips, setNotifTips] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Mi Perfil" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={Colors.white} />
          </View>
          <Text style={styles.userName}>Sebastian Belli</Text>
          <Text style={styles.userRole}>Brigadista • Lima, Perú</Text>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Sismos Reportados</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statNumber}>4</Text>
            <Text style={styles.statLabel}>Misiones Hechas</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statNumber}>350</Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </Card>
        </View>

        {/* Badges / Medals Section */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Medallas e Insignias
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesRow}
        >
          <Card style={styles.badgeCard}>
            <View style={[styles.badgeIconBox, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.badgeName}>Zona Segura</Text>
            <Text style={styles.badgeStatus}>Desbloqueado</Text>
          </Card>

          <Card style={styles.badgeCard}>
            <View style={[styles.badgeIconBox, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="bag" size={24} color="#E65100" />
            </View>
            <Text style={styles.badgeName}>Mochila Lista</Text>
            <Text style={styles.badgeStatus}>En progreso</Text>
          </Card>

          <Card style={styles.badgeCard}>
            <View style={[styles.badgeIconBox, { backgroundColor: '#EDE7F6' }]}>
              <Ionicons name="flame" size={24} color="#512DA8" />
            </View>
            <Text style={styles.badgeName}>Amigo de Ignis</Text>
            <Text style={styles.badgeStatus}>Desbloqueado</Text>
          </Card>
        </ScrollView>

        {/* Settings Section */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Preferencias de Alertas
        </Text>

        <Card style={styles.settingsCard}>
          <View style={styles.settingItem}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Notificaciones de Sismos</Text>
              <Text style={styles.settingSub}>Alertas inmediatas en M ≥ 4.5</Text>
            </View>
            <Switch
              value={notifQuakes}
              onValueChange={setNotifQuakes}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Consejos Diarios de Prevención</Text>
              <Text style={styles.settingSub}>Misiones y recordatorios de preparación</Text>
            </View>
            <Switch
              value={notifTips}
              onValueChange={setNotifTips}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingTextCol}>
              <Text style={styles.settingTitle}>Alerta Sonora Prioritaria</Text>
              <Text style={styles.settingSub}>Sonido en sismos de alta intensidad</Text>
            </View>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor={Colors.white}
            />
          </View>
        </Card>

        {/* Logout */}
        <Button
          title="Cerrar Sesión"
          variant="outline"
          onPress={() => router.replace('/')}
          style={styles.logoutButton}
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
  userCard: {
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.titleMedium,
  },
  userRole: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  badgesRow: {
    gap: Spacing.md,
  },
  badgeCard: {
    width: 120,
    padding: Spacing.md,
    alignItems: 'center',
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  badgeStatus: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  settingTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  settingSub: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  logoutButton: {
    marginTop: Spacing.xl,
  },
});
