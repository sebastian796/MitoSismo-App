import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Map as LeafletMap, CircleMarker } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import type { Quake } from '../types/earthquake';
type Props = {
  quake: Quake;
  markerColor?: string;
};
export default function QuakeMapPreview({ quake, markerColor = Colors.primary }: Props) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  useEffect(() => {
    let cancelled = false;
    async function createMap() {
      if (!mapElementRef.current || mapRef.current) return;
      const leaflet = await import('leaflet');
      if (cancelled || !mapElementRef.current) return;
      const map = leaflet.map(mapElementRef.current, {
        center: [quake.lat, quake.lng],
        zoom: 7,
        minZoom: 3,
        maxZoom: 18,
        scrollWheelZoom: true,
      });
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        })
        .addTo(map);
      markerRef.current = leaflet
        .circleMarker([quake.lat, quake.lng], {
          radius: Math.max(9, Math.min(18, 6 + quake.mag * 1.5)),
          color: markerColor,
          fillColor: markerColor,
          fillOpacity: 0.78,
          weight: 3,
        })
        .bindPopup(
          `<strong>M ${quake.mag.toFixed(1)}</strong><br/>${quake.place}<br/>Profundidad: ${quake.depth.toFixed(1)} km`,
        )
        .addTo(map);
      mapRef.current = map;
      window.setTimeout(() => map.invalidateSize(), 0);
    }
    createMap();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [quake, markerColor]);
  return (
    <View style={styles.wrapper}>
      <View ref={mapElementRef} style={styles.map} />
      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.overlayText}>Epicentro · M {quake.mag.toFixed(1)}</Text>
      </View>
      <View style={styles.coordinates}>
        <Text style={styles.coordinatesText}>{quake.coords}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    height: 280,
    overflow: 'hidden',
    borderRadius: Radii.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.md,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  overlayText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  coordinates: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  coordinatesText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});