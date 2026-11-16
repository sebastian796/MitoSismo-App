import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import type { Map as LeafletMap, LayerGroup, CircleMarker, Circle } from 'leaflet';
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

  // Refs aislados para la ubicación del usuario
  const userMarkerRef = useRef<CircleMarker | null>(null);
  const userAccuracyRef = useRef<Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const hasCenteredUserRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [minimumMagnitude, setMinimumMagnitude] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado de coordenadas y permisos del usuario
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
  } | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

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
    const timer = setInterval(() => {
      void loadEarthquakes();
    }, 60_000);
    return () => clearInterval(timer);
  }, [loadEarthquakes]);

  // 1. Rastreo GPS: solo captura coordenadas y actualiza el estado
  const startUserTracking = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Lectura rápida inicial para no depender solo de watchPosition
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocationDenied(false);
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 30000, timeout: 5000 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocationDenied(false);
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setLocationDenied(true);
        }
        console.warn('Error de geolocalización:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );
  }, []);

  // 2. Inicialización del mapa Leaflet
  useEffect(() => {
    let cancelled = false;

    async function createMap() {
      if (!mapElementRef.current || mapRef.current) return;
      const leaflet = await import('leaflet');
      if (cancelled || !mapElementRef.current) return;

      const map = leaflet.map(mapElementRef.current, {
        center: [-9.19, -75.02],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
      });

      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        })
        .addTo(map);

      mapRef.current = map;
      layerRef.current = leaflet.layerGroup().addTo(map);
      setMapReady(true);

      startUserTracking();
    }

    createMap();

    return () => {
      cancelled = true;
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      userMarkerRef.current = null;
      userAccuracyRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      setMapReady(false);
    };
  }, [startUserTracking]);

  // 3. Efecto dedicado a dibujar/actualizar el punto azul cuando mapReady y userLocation existan
  useEffect(() => {
    if (!mapReady || !userLocation || !mapRef.current) return;

    let cancelled = false;

    async function renderUserPoint() {
      const leaflet = await import('leaflet');
      const map = mapRef.current;
      if (cancelled || !map || !userLocation) return;

      const { lat, lng, accuracy } = userLocation;

      if (!userMarkerRef.current) {
        userAccuracyRef.current = leaflet
          .circle([lat, lng], {
            radius: accuracy,
            color: '#2563EB',
            fillColor: '#3B82F6',
            fillOpacity: 0.15,
            weight: 1,
          })
          .addTo(map);

        userMarkerRef.current = leaflet
          .circleMarker([lat, lng], {
            radius: 8,
            color: '#FFFFFF',
            fillColor: '#2563EB',
            fillOpacity: 1,
            weight: 2.5,
          })
          .bindPopup('<strong>Tu ubicación actual</strong>')
          .addTo(map);
      } else {
        userMarkerRef.current.setLatLng([lat, lng]);
        userAccuracyRef.current?.setLatLng([lat, lng]).setRadius(accuracy);
      }

      // Asegura que el punto del usuario quede por encima de los marcadores de sismos
      userMarkerRef.current.bringToFront();

      if (!hasCenteredUserRef.current) {
        hasCenteredUserRef.current = true;
        map.setView([lat, lng], 10);
      }
    }

    renderUserPoint();

    return () => {
      cancelled = true;
    };
  }, [mapReady, userLocation]);

  // Botón para regresar a la ubicación en tiempo real o solicitar permisos
  const handleCenterOnUser = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo([userLocation.lat, userLocation.lng], 12, { duration: 0.8 });
      userMarkerRef.current?.openPopup();
      return;
    }

    hasCenteredUserRef.current = false;
    startUserTracking();
  }, [userLocation, startUserTracking]);

  const visibleQuakes = useMemo(
    () => quakes.filter((quake) => quake.mag >= minimumMagnitude),
    [quakes, minimumMagnitude]
  );

  // Renderizado de marcadores de sismos
  useEffect(() => {
    if (!mapReady) return;
    let cancelled = false;

    async function updateMarkers() {
      const leaflet = await import('leaflet');
      if (cancelled || !mapRef.current || !layerRef.current) return;
      layerRef.current.clearLayers();
      visibleQuakes.forEach((quake) => {
        const color = magnitudeColor(quake.mag);
        leaflet
          .circleMarker([quake.lat, quake.lng], {
            radius: Math.max(6, Math.min(16, 5 + quake.mag * 1.5)),
            color,
            fillColor: color,
            fillOpacity: 0.72,
            weight: 2,
          })
          .bindPopup(
            `<strong>M ${quake.mag.toFixed(1)}</strong><br/>${quake.place}<br/>Profundidad: ${quake.depth.toFixed(1)} km<br/>${quake.fullDate}`
          )
          .addTo(layerRef.current!);
      });

      // Mantener el punto del usuario siempre visible arriba
      userMarkerRef.current?.bringToFront();
    }

    updateMarkers();
    return () => {
      cancelled = true;
    };
  }, [mapReady, visibleQuakes]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text style={styles.title}>Mapa de sismos</Text>
          <Text style={styles.subtitle}>Últimos 10 sismos de América Latina</Text>
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

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={loadEarthquakes} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.mapWrapper}>
        {/* Uso de div nativo para evitar el error de tipo y garantizar el nodo DOM real para Leaflet */}
        <div
          ref={mapElementRef}
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        />

        <Pressable
          onPress={handleCenterOnUser}
          style={styles.locateButton}
          accessibilityLabel="Centrar en mi ubicación"
        >
          <Text style={styles.locateIcon}>{userLocation ? '⌖' : '📍'}</Text>
          <Text style={styles.locateText}>
            {userLocation ? 'Mi ubicación' : locationDenied ? 'Activar GPS' : 'Ubicarme'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Fuente de sismos: USGS · {userLocation ? 'GPS activo' : 'Mapa: OpenStreetMap'}
        </Text>
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
  mapWrapper: { flex: 1, minHeight: 400, position: 'relative' },
  map: { flex: 1, minHeight: 400 },
  errorBox: { position: 'absolute', zIndex: 1000, top: 125, left: 20, right: 20, padding: 14, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  errorText: { color: colors.magFuerte.text, textAlign: 'center', lineHeight: 20 },
  retryButton: { alignSelf: 'center', marginTop: 10, backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 9 },
  retryText: { color: colors.white, fontWeight: '700' },
  locateButton: { position: 'absolute', zIndex: 1000, right: 16, bottom: 18, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  locateIcon: { fontSize: 15, fontWeight: '700', color: colors.primary },
  locateText: { fontSize: 12, fontWeight: '700', color: colors.textPrimary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  footerText: { fontSize: 10, color: colors.textSecondary },
});