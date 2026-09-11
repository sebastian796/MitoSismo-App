import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, Card, MagBadge, Button } from '../../components';
import { quakes } from '../../constants/data';
import { Colors, Spacing, Typography, Radii, magInfo } from '../../constants/theme';

export default function QuakeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reported, setReported] = useState(false);

  const quake = quakes.find((q) => q.id.toString() === id) || quakes[0];
  const info = magInfo(quake.mag);

  const handleReportSafe = () => {
    setReported(true);
    Alert.alert('Reporte Enviado', 'Tu estado "Estoy a salvo" ha sido registrado y compartido con tus contactos.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Detalle del Sismo" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Magnitude Header Card */}
        <Card style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <MagBadge mag={quake.mag} showDot />
            <Text style={styles.countryLabel}>{quake.country}</Text>
          </View>

          <View style={styles.magDisplayRow}>
            <Text style={styles.magLargeNumber}>{quake.mag.toFixed(1)}</Text>
            <View style={styles.magTextGroup}>
              <Text style={styles.magScaleLabel}>Magnitud Local (ML)</Text>
              <Text style={styles.magSubText}>Intensidad: {info.label}</Text>
            </View>
          </View>

          <Text style={styles.placeText}>{quake.place}</Text>
        </Card>

        {/* Technical Details Grid */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Parámetros Sísmicos
        </Text>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="calendar-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Fecha y Hora Exacta</Text>
              <Text style={styles.detailValue}>{quake.fullDate}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="arrow-down-circle-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Profundidad Hipocentral</Text>
              <Text style={styles.detailValue}>{quake.depth} km (Superficial)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="navigate-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>Coordenadas del Epicentro</Text>
              <Text style={styles.detailValue}>{quake.coords}</Text>
            </View>
          </View>
        </Card>

        {/* Safety Report Action */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Tu Estado de Seguridad
        </Text>

        <Card style={styles.reportCard}>
          <Text style={styles.reportTitle}>¿Sentiste este sismo?</Text>
          <Text style={styles.reportSub}>
            Informa a tu familia y comunidad que te encuentras a salvo.
          </Text>

          <Button
            title={reported ? '✓ Estado Reportado: A Salvo' : 'Reportar: Estoy a Salvo'}
            onPress={handleReportSafe}
            variant={reported ? 'secondary' : 'accent'}
            disabled={reported}
            style={styles.reportButton}
          />
        </Card>

        {/* Back button */}
        <Button
          title="Regresar a la lista"
          variant="outline"
          onPress={() => router.back()}
          style={styles.backAction}
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
  mainCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  countryLabel: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  magDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  magLargeNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    marginRight: Spacing.md,
  },
  magTextGroup: {
    justifyContent: 'center',
  },
  magScaleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  magSubText: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  placeText: {
    ...Typography.titleSmall,
    marginTop: Spacing.sm,
    lineHeight: 22,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  detailsCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  detailIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  detailTextCol: {
    flex: 1,
  },
  detailLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  detailValue: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  reportCard: {
    padding: Spacing.lg,
  },
  reportTitle: {
    ...Typography.titleSmall,
  },
  reportSub: {
    ...Typography.bodySmall,
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  reportButton: {
    width: '100%',
  },
  backAction: {
    marginTop: Spacing.xl,
  },
});
