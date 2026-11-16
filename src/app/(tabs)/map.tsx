import React, { useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Callout, Marker } from 'react-native-maps';
import { ActivityIndicator } from 'react-native';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';
import { fetchRecentEarthquakes } from '../../services/earthquakeService';
import type { Quake } from '../../types/earthquake';
import { useCallback, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native'; // <-- Asegúrate de incluir Alert y Linking en tu import de 'react-native'
// ... mantén tus demás imports (React, useState, useEffect, useMemo, useCallback, useRef, SafeAreaView, View, Text, Pressable, ActivityIndicator, StyleSheet, MapView, Marker, Callout, useRouter, Colors, fetchRecentEarthquakes, Quake)

type GeoSubscription = Awaited<ReturnType<typeof Location.watchPositionAsync>>;

const INITIAL_REGION = {
  latitude: -9.19,
  longitude: -75.02,
  latitudeDelta: 14,
  longitudeDelta: 12,
};

const STREET_ZOOM_DELTA = {
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
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
  const mapRef = useRef<MapView | null>(null);
  const subscriptionRef = useRef<GeoSubscription | null>(null);
  const hasCenteredUserRef = useRef(false);

  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [minimumMagnitude, setMinimumMagnitude] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estado de permisos y ubicación en tiempo real
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);

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

  // Verifica si hay permiso; si no lo hay, lo solicita y activa el rastreo en tiempo real
  const ensurePermissionAndTrack = useCallback(async (fromButtonPress = false) => {
    try {
      const current = await Location.getForegroundPermissionsAsync();
      let finalStatus = current.status;

      if (finalStatus !== 'granted') {
        if (current.canAskAgain) {
          const requested = await Location.requestForegroundPermissionsAsync();
          finalStatus = requested.status;
        } else if (fromButtonPress) {
          Alert.alert(
            'Permiso de ubicación requerido',
            'Para mostrar tu ubicación en tiempo real respecto a los sismos, habilita el acceso a la ubicación en los ajustes de la aplicación.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Abrir Ajustes', onPress: () => void Linking.openSettings() },
            ]
          );
          return;
        }
      }

      if (finalStatus !== 'granted') {
        setLocationDenied(true);
        setHasLocationPermission(false);
        return;
      }

      setLocationDenied(false);
      setHasLocationPermission(true);

      // Obtener posición inicial inmediata para no esperar al primer intervalo del watch
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown && !hasCenteredUserRef.current && mapRef.current) {
        const initialCoords = {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
        setUserCoords(initialCoords);
        hasCenteredUserRef.current = true;
        mapRef.current.animateToRegion(
          {
            ...initialCoords,
            ...STREET_ZOOM_DELTA,
          },
          800
        );
      }

      // Iniciar escucha continua en tiempo real
      subscriptionRef.current?.remove();
      subscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserCoords(coords);

          if (!hasCenteredUserRef.current && mapRef.current) {
            hasCenteredUserRef.current = true;
            mapRef.current.animateToRegion(
              {
                ...coords,
                ...STREET_ZOOM_DELTA,
              },
              800
            );
          }
        }
      );
    } catch (err) {
      console.warn('No se pudo obtener la ubicación del dispositivo:', err);
    }
  }, []);

  // Solicitud automática al abrir el mapa
  useEffect(() => {
    void ensurePermissionAndTrack(false);

    return () => {
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
    };
  }, [ensurePermissionAndTrack]);

  // Botón flotante: centra en la ubicación actual a nivel de calles o solicita permisos si faltan
  const handleCenterOnUser = useCallback(() => {
    if (hasLocationPermission && userCoords && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...userCoords,
          ...STREET_ZOOM_DELTA,
        },
        800
      );
      return;
    }

    hasCenteredUserRef.current = false;
    void ensurePermissionAndTrack(true);
  }, [hasLocationPermission, userCoords, ensurePermissionAndTrack]);

  const visibleQuakes = useMemo(
    () => quakes.filter((quake) => quake.mag >= minimumMagnitude),
    [quakes, minimumMagnitude]
  );

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
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation={false}
          showsMyLocationButton={false}
        >
          {hasLocationPermission && userCoords ? (
            <Marker
              coordinate={userCoords}
              anchor={{ x: 0.5, y: 0.5 }}
              title="Tu ubicación"
              zIndex={999}
            >
              <View style={styles.userLocationOuter}>
                <View style={styles.userLocationInner} />
              </View>
            </Marker>
          ) : null}

          {visibleQuakes.map((quake) => {
            const color = magnitudeColor(quake.mag);
            const size = Math.max(16, Math.min(34, 12 + quake.mag * 3));

            return (
              <Marker
                key={quake.id}
                coordinate={{ latitude: quake.lat, longitude: quake.lng }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View
                  style={[
                    styles.marker,
                    {
                      backgroundColor: color,
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                      opacity: 0.85,
                    },
                  ]}
                >
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
            );
          })}
        </MapView>

        <Pressable
          onPress={handleCenterOnUser}
          style={styles.locateButton}
          accessibilityLabel="Centrar en mi ubicación"
        >
          <Text style={styles.locateIcon}>{hasLocationPermission && userCoords ? '⌖' : '📍'}</Text>
          <Text style={styles.locateText}>
            {hasLocationPermission && userCoords ? 'Mi ubicación' : locationDenied ? 'Activar GPS' : 'Ubicarme'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Fuente de sismos: USGS · {hasLocationPermission && userCoords ? 'GPS activo' : 'Mapa: Nativo'}
        </Text>
        {loading ? <ActivityIndicator size="small" color={Colors.gold} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background ?? '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '600',
  },
  headerText: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshText: {
    color: Colors.gold,
    fontSize: 18,
    fontWeight: '700',
  },
  filters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  filter: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterActive: {
    backgroundColor: Colors.gold,
  },
  filterText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#0F172A',
  },
  resultCount: {
    marginLeft: 'auto',
    color: '#94A3B8',
    fontSize: 12,
  },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#DC2626',
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  userLocationOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  marker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutMagnitude: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  calloutPlace: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  calloutDetail: {
    fontSize: 11,
    color: '#64748B',
  },
  locateButton: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  locateIcon: {
    color: '#38BDF8',
    fontSize: 16,
  },
  locateText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 11,
  },
});