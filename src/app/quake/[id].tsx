import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, Card, MagBadge, Button } from '../../components';
import { fetchEarthquakeById } from '../../services/earthquakeService';
import type { Quake } from '../../types/earthquake';
import {
  Colors,
  Spacing,
  Typography,
  Radii,
  magInfo,
} from '../../constants/theme';

export default function QuakeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [reported, setReported] = useState(false);
  const [quake, setQuake] = useState<Quake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuake() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchEarthquakeById(id);

        if (!data) {
          setError('No se encontró información de este sismo.');
          return;
        }

        setQuake(data);
      } catch (err) {
        console.error('Error al cargar detalle del sismo:', err);
        setError('No se pudo cargar el detalle del sismo.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadQuake();
    }
  }, [id]);

  const info = quake ? magInfo(quake.mag) : null;

  const handleReportSafe = () => {
    setReported(true);

    Alert.alert(
      'Reporte Enviado',
      'Tu estado "Estoy a salvo" ha sido registrado y compartido con tus contactos.',
    );
  };

  const handleShareReport = async () => {
    if (!quake || !info) return;

    try {
      await Share.share({
        message: `⚠️ Sismo de magnitud ${quake.mag.toFixed(1)} (${info.label}) en ${quake.place}, ${quake.country}. Coordenadas: ${quake.coords}. Profundidad: ${quake.depth} km. Vía MitoSismo.`,
      });
    } catch {
      Alert.alert('Error', 'No se pudo compartir el reporte.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar
          title="Detalle del Sismo"
          showBack
          onBack={() => router.back()}
        />

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            Cargando información del sismo...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !quake || !info) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar
          title="Detalle del Sismo"
          showBack
          onBack={() => router.back()}
        />

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            {error ?? 'No se encontró el sismo.'}
          </Text>

          <Button
            title="Regresar"
            variant="outline"
            onPress={() => router.back()}
            style={styles.backAction}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        title="Detalle del Sismo"
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Magnitude Header Card */}
        <Card style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <MagBadge mag={quake.mag} showDot />

            <Text style={styles.countryLabel}>
              {quake.country}
            </Text>
          </View>

          <View style={styles.magDisplayRow}>
            <Text style={styles.magLargeNumber}>
              {quake.mag.toFixed(1)}
            </Text>

            <View style={styles.magTextGroup}>
              <Text style={styles.magScaleLabel}>
                Magnitud {quake.magType}
              </Text>

              <Text style={styles.magSubText}>
                Intensidad: {info.label}
              </Text>
            </View>
          </View>

          <Text style={styles.placeText}>
            {quake.place}
          </Text>
        </Card>

        {/* Map Preview */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Ubicación del Epicentro
        </Text>
        <Card style={styles.mapPreviewCard}>
          <View style={styles.mapPreviewCanvas}>
            <View style={[styles.mapPreviewPin, { borderColor: info.dot }]}>
              <View style={[styles.mapPreviewDot, { backgroundColor: info.dot }]} />
            </View>
          </View>
          <View style={styles.mapPreviewFooter}>
            <Ionicons name="navigate" size={14} color={Colors.textSecondary} />
            <Text style={styles.mapPreviewCoords}>{quake.coords}</Text>
          </View>
        </Card>

        {/* Technical Details Grid */}
        <Text
          style={[
            styles.sectionTitle,
            { marginTop: Spacing.xl },
          ]}
        >
          Parámetros Sísmicos
        </Text>

        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>
                Fecha y Hora Exacta
              </Text>

              <Text style={styles.detailValue}>
                {quake.fullDate}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons
                name="arrow-down-circle-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>
                Profundidad Hipocentral
              </Text>

              <Text style={styles.detailValue}>
                {quake.depth} km
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons
                name="navigate-outline"
                size={20}
                color={Colors.primary}
              />
            </View>

            <View style={styles.detailTextCol}>
              <Text style={styles.detailLabel}>
                Coordenadas del Epicentro
              </Text>

              <Text style={styles.detailValue}>
                {quake.coords}
              </Text>
            </View>
          </View>
        </Card>

        {/* Safety Report Action */}
        <Text
          style={[
            styles.sectionTitle,
            { marginTop: Spacing.xl },
          ]}
        >
          Tu Estado de Seguridad
        </Text>

        <Card style={styles.reportCard}>
          <Text style={styles.reportTitle}>
            ¿Sentiste este sismo?
          </Text>

          <Text style={styles.reportSub}>
            Informa a tu familia y comunidad que te encuentras a salvo.
          </Text>

          <Button
            title={
              reported
                ? '✓ Estado Reportado: A Salvo'
                : 'Reportar: Estoy a Salvo'
            }
            onPress={handleReportSafe}
            variant={reported ? 'secondary' : 'accent'}
            disabled={reported}
            style={styles.reportButton}
          />
          <Button
            title="Compartir Reporte"
            variant="outline"
            onPress={handleShareReport}
            style={styles.shareButton}
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
  mapPreviewCard: {
    padding: 0,
    overflow: 'hidden',
  },
  mapPreviewCanvas: {
    height: 140,
    backgroundColor: '#E5DFD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPreviewPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPreviewDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  mapPreviewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  mapPreviewCoords: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  shareButton: {
    width: '100%',
    marginTop: Spacing.sm,
  },
  backAction: {
    marginTop: Spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    ...Typography.titleSmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});