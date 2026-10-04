import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Callout, Marker } from 'react-native-maps';
import { ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';
import { fetchRecentEarthquakes } from '../../services/earthquakeService';
import type { Quake } from '../../types/earthquake';
import { useCallback, useEffect } from 'react';

const INITIAL_REGION = {
  latitude: -9.19,
  longitude: -75.02,
  latitudeDelta: 14,
  longitudeDelta: 12,
};

const FILTERS = [
  { label: 'Todos', value: 0 },
  { label: 'M≥4', value: 4 },
  { label: 'M≥5', value: 5 },
  { label: 'M≥6', value: 6 },
];

function magnitudeColor(magnitude: number) {
  if (magnitude >= 6) return '#8B1E1E';
  if (magnitude >= 5) return Colors.magFuerte.dot;
  if (magnitude >= 4) return Colors.gold;
  return Colors.magLeve.dot;
}

export default function MapScreen() {
  const router = useRouter();
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [minimumMagnitude, setMinimumMagnitude] = useState(0);
  const [selected, setSelected] = useState<Quake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEarthquakes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setQuakes(await fetchRecentEarthquakes(100, 'Perú'));
    } catch (err) {
      console.error('Error obteniendo sismos:', err);
      setError('No se pudieron cargar los sismos. Revisa tu conexión e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEarthquakes();
  }, [loadEarthquakes]);

  const visibleQuakes = useMemo(
    () => quakes.filter((quake) => quake.mag >= minimumMagnitude),
    [quakes, minimumMagnitude],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mapa de sismos</Text>
          <Text style={styles.subtitle}>Actividad sísmica en la región del Perú</Text>
        </View>
        <Pressable onPress={loadEarthquakes} style={styles.refreshButton} disabled={loading}>
          <Text style={styles.refreshText}>↻</Text>
        </Pressable>
      </View>

      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <Pressable
            key={filter.value}
            onPress={() => setMinimumMagnitude(filter.value)}
            style={[styles.filter, minimumMagnitude === filter.value && styles.filterActive]}
          >
            <Text style={[styles.filterText, minimumMagnitude === filter.value && styles.filterTextActive]}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
        <Text style={styles.resultCount}>{visibleQuakes.length} sismos</Text>
      </View>

      <View style={styles.mapContainer}>
        <MapView style={styles.map} initialRegion={INITIAL_REGION}>
          {visibleQuakes.map((quake) => (
            <Marker
              key={quake.id}
              coordinate={{ latitude: quake.lat, longitude: quake.lng }}
              onPress={() => setSelected(quake)}
            >
              <View style={[styles.marker, { backgroundColor: magnitudeColor(quake.mag) }]}>
                <Text style={styles.markerText}>{quake.mag.toFixed(1)}</Text>
              </View>
              <Callout onPress={() => router.push(`/quake/${quake.id}`)}>
                <View style={styles.callout}>
                  <Text style={styles.calloutMagnitude}>M {quake.mag.toFixed(1)}</Text>
                  <Text style={styles.calloutPlace}>{quake.place}</Text>
                  <Text style={styles.calloutDetail}>Profundidad: {quake.depth.toFixed(1)} km</Text>
                  <Text style={styles.calloutDetail}>{quake.fullDate}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      </View>

      {loading ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color={Colors.gold} />
          <Text style={styles.statusText}>Cargando sismos...</Text>
        </View>
      ) : error ? (
        <View style={styles.statusBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadEarthquakes} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.bottomPanel}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{visibleQuakes.length} sismos encontrados</Text>
            <Text style={styles.resultSource}>Fuente: USGS</Text>
          </View>
          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {visibleQuakes.slice(0, 20).map((quake) => (
              <Pressable key={quake.id} onPress={() => setSelected(quake)} style={styles.listItem}>
                <View style={[styles.listMagnitude, { borderColor: magnitudeColor(quake.mag) }]}>
                  <Text style={[styles.listMagnitudeText, { color: magnitudeColor(quake.mag) }]}>
                    {quake.mag.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.listInfo}>
                  <Text style={styles.listPlace} numberOfLines={2}>{quake.place}</Text>
                  <Text style={styles.listDetail}>Prof. {quake.depth.toFixed(1)} km · {quake.fullDate}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {selected && (
        <Pressable style={styles.selectedCard} onPress={() => router.push(`/quake/${selected.id}`)}>
          <View style={styles.selectedHeader}>
            <Text style={styles.selectedTitle}>Sismo seleccionado</Text>
            <Pressable onPress={() => setSelected(null)} hitSlop={8}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <Text style={styles.selectedPlace}>{selected.place}</Text>
          <Text style={styles.selectedDetail}>
            Magnitud {selected.mag.toFixed(1)} · Profundidad {selected.depth.toFixed(1)} km
          </Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border, backgroundColor: Colors.surface },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 34, lineHeight: 34, color: Colors.textPrimary },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  refreshButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  refreshText: { fontSize: 27, color: Colors.primary },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.surface },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  filterActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },
  resultCount: { marginLeft: 'auto', fontSize: 12, color: Colors.textSecondary },
  mapContainer: { height: 320, marginHorizontal: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  map: { flex: 1 },
  marker: { minWidth: 38, height: 38, paddingHorizontal: 6, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.white },
  markerText: { color: Colors.white, fontWeight: '800', fontSize: 11 },
  callout: { maxWidth: 260, padding: 8 },
  calloutMagnitude: { fontWeight: '800', fontSize: 15, color: Colors.textPrimary },
  calloutPlace: { marginTop: 3, fontSize: 12, color: Colors.textPrimary },
  calloutDetail: { marginTop: 3, fontSize: 11, color: Colors.textSecondary },
  statusBox: { padding: 14, alignItems: 'center', gap: 8 },
  statusText: { fontSize: 12, color: Colors.textSecondary },
  errorText: { color: Colors.magFuerte.text, textAlign: 'center', lineHeight: 20 },
  retryButton: { marginTop: 10, backgroundColor: Colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { color: Colors.white, fontWeight: '700' },
  bottomPanel: { flex: 1, minHeight: 180 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  resultTitle: { ...Typography.bodyLarge, fontWeight: '700' },
  resultSource: { ...Typography.bodySmall },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  listMagnitude: { width: 48, height: 42, borderWidth: 2, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  listMagnitudeText: { fontWeight: '800' },
  listInfo: { flex: 1 },
  listPlace: { ...Typography.bodyMedium, fontWeight: '700', color: Colors.textPrimary },
  listDetail: { ...Typography.bodySmall, marginTop: 2 },
  selectedCard: { position: 'absolute', left: 14, right: 14, bottom: 18, padding: 14, borderRadius: Radii.lg, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  selectedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectedTitle: { fontWeight: '800', color: Colors.textPrimary },
  closeText: { fontSize: 24, color: Colors.textSecondary },
  selectedPlace: { marginTop: 5, fontWeight: '700', color: Colors.textPrimary },
  selectedDetail: { marginTop: 4, fontSize: 12, color: Colors.textSecondary },
});