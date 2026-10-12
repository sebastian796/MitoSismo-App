import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Colors } from '../../constants/theme';
import { fetchRecentEarthquakes } from '../../services/earthquakeService';
import type { Quake } from '../../types/earthquake';
const colors = Colors;
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
export default function MapWebScreen() {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [minimumMagnitude, setMinimumMagnitude] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadEarthquakes = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setQuakes(await fetchRecentEarthquakes(10));
    } catch (err) {
      console.error('Error obteniendo sismos:', err);
      setError('No se pudieron cargar los sismos. Revisa tu conexión e inténtalo nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadEarthquakes();
    const timer = setInterval(() => { void loadEarthquakes(); }, 60_000);
    return () => clearInterval(timer);
  }, [loadEarthquakes]);
  useEffect(() => {
    let cancelled = false;
    async function createMap() {
      if (!mapElementRef.current || mapRef.current) return;
      const leaflet = await import('leaflet');
      if (cancelled || !mapElementRef.current) return;
      const map = leaflet.map(mapElementRef.current, { center: [-9.19, -75.02], zoom: 5, minZoom: 4, maxZoom: 12 });
      leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);
    }
    createMap();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);
  const visibleQuakes = useMemo(
    () => quakes.filter((quake) => quake.mag >= minimumMagnitude),
    [quakes, minimumMagnitude],
  );
  useEffect(() => {
    let cancelled = false;
    async function updateMarkers() {
      const leaflet = await import('leaflet');
      if (cancelled || !mapRef.current || !layerRef.current) return;
      layerRef.current.clearLayers();
      visibleQuakes.forEach((quake) => {
        const color = magnitudeColor(quake.mag);
        leaflet.circleMarker([quake.lat, quake.lng], {
          radius: Math.max(6, Math.min(16, 5 + quake.mag * 1.5)),
          color,
          fillColor: color,
          fillOpacity: 0.72,
          weight: 2,
        }).bindPopup(
          `<strong>M ${quake.mag.toFixed(1)}</strong><br/>${quake.place}<br/>Profundidad: ${quake.depth.toFixed(1)} km<br/>${quake.fullDate}`,
        ).addTo(layerRef.current!);
      });
    }
    updateMarkers();
    return () => { cancelled = true; };
  }, [visibleQuakes]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}><Text style={styles.backText}>‹</Text></Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mapa de sismos</Text>
          <Text style={styles.subtitle}>Últimos 10 sismos de América Latina</Text>
        </View>
        <Pressable onPress={loadEarthquakes} style={styles.refreshButton} disabled={loading}><Text style={styles.refreshText}>↻</Text></Pressable>
      </View>
      <View style={styles.filters}>
        {FILTERS.map((filter) => (
          <Pressable key={filter.value} onPress={() => setMinimumMagnitude(filter.value)} style={[styles.filter, minimumMagnitude === filter.value && styles.filterActive]}>
            <Text style={[styles.filterText, minimumMagnitude === filter.value && styles.filterTextActive]}>{filter.label}</Text>
          </Pressable>
        ))}
        <Text style={styles.resultCount}>{visibleQuakes.length} sismos</Text>
      </View>
      {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text><Pressable onPress={loadEarthquakes} style={styles.retryButton}><Text style={styles.retryText}>Reintentar</Text></Pressable></View> : null}
      <View ref={mapElementRef} style={styles.map} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Fuente de sismos: USGS · Mapa: OpenStreetMap</Text>
        {loading ? <ActivityIndicator size="small" color={colors.gold} /> : null}
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  backButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 34, color: colors.textPrimary },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  refreshButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  refreshText: { fontSize: 27, color: colors.primary },
  filters: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface },
  filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  filterActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  filterTextActive: { color: colors.white },
  resultCount: { marginLeft: 'auto', fontSize: 12, color: colors.textSecondary },
  map: { flex: 1, minHeight: 400 },
  errorBox: { position: 'absolute', zIndex: 1000, top: 125, left: 20, right: 20, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  errorText: { color: colors.magFuerte.text, textAlign: 'center', lineHeight: 20 },
  retryButton: { alignSelf: 'center', marginTop: 10, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { color: colors.white, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  footerText: { fontSize: 10, color: colors.textSecondary },
});