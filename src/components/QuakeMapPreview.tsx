import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import type { Quake } from '../types/earthquake';
type Props = {
  quake: Quake;
  markerColor?: string;
};
export default function QuakeMapPreview({ quake, markerColor = Colors.primary }: Props) {
  return (
    <View style={styles.wrapper}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: quake.lat,
          longitude: quake.lng,
          latitudeDelta: 2.2,
          longitudeDelta: 2.2,
        }}
        scrollEnabled
        zoomEnabled
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker coordinate={{ latitude: quake.lat, longitude: quake.lng }}>
          <View style={[styles.marker, { borderColor: markerColor }]}>
            <View style={[styles.markerDot, { backgroundColor: markerColor }]} />
          </View>
        </Marker>
      </MapView>
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
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 3,
    backgroundColor: 'rgba(255,255,255,0.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
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