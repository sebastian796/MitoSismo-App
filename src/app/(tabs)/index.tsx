import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, Ignis, MagBadge } from "../../components";
import { ignisCreature } from "../../constants/data";
import {
  Colors,
  Radii,
  Spacing,
  Typography,
  magInfo,
} from "../../constants/theme";
import { useNotificationSettings } from "../../context/NotificationSettingsContext";
import { fetchRecentEarthquakes } from "../../services/earthquakeService";
import type { Quake } from "../../types/earthquake";

const HOME_COUNTRIES = ["Perú", "Chile", "Ecuador", "Colombia", "México"];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

function ignisMessage(mag?: number) {
  if (mag === undefined)
    return "Estoy atento al suelo. ¡Buen momento para revisar tu mochila!";
  if (mag >= 5)
    return "¡Hubo un sismo fuerte! Revisa tu mochila y tu plan familiar.";
  if (mag >= 4) return "Sismo moderado reciente. Repasa tus zonas seguras.";
  return "Suelo en calma. ¡Buen momento para completar una misión!";
}

export default function HomeScreen() {
  const router = useRouter();
  const { settings } = useNotificationSettings();

  const [country, setCountry] = useState("Perú");
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async (c: string, isRefresh = false) => {
    const id = ++requestId.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await fetchRecentEarthquakes(15, c);
      if (id !== requestId.current) return;
      setQuakes(data);
    } catch (e) {
      if (id !== requestId.current) return;
      console.warn("Error cargando sismos en Home:", e);
      setError(
        "No pudimos cargar los sismos. Revisa tu conexión e inténtalo de nuevo.",
      );
    } finally {
      if (id === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    load(country);
  }, [country, load]);

  const latest = quakes[0];
  const info = latest ? magInfo(latest.mag) : null;
  const maxMag = quakes.length ? Math.max(...quakes.map((q) => q.mag)) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => load(country, true)}
            tintColor={Colors.accent}
            colors={[Colors.accent]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}, Explorador</Text>
            <Text style={styles.subGreeting}>
              Monitoreo sísmico en tiempo real
            </Text>
          </View>
          <Pressable
            style={styles.notifButton}
            onPress={() => router.push("/settings/notifications")}
          >
            <Ionicons
              name={
                settings.enabled ? "notifications" : "notifications-off-outline"
              }
              size={22}
              color={Colors.primary}
            />
            {!settings.enabled && <View style={styles.notifDot} />}
          </Pressable>
        </View>

        {/* Ignis */}
        <Pressable onPress={() => router.push("/creature")}>
          <Card style={styles.creatureCard}>
            <View style={styles.creatureContent}>
              <View style={styles.creatureTextCol}>
                <View style={styles.creatureTag}>
                  <Text style={styles.creatureTagText}>
                    Nivel {ignisCreature.level} • {ignisCreature.name}
                  </Text>
                </View>
                <Text style={styles.creatureTitle}>Guardián Activo</Text>
                <Text style={styles.creatureDesc} numberOfLines={3}>
                  {ignisMessage(latest?.mag)}
                </Text>
              </View>
              <Ignis size={64} />
            </View>
          </Card>
        </Pressable>

        {/* Selector de país */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {HOME_COUNTRIES.map((c) => {
            const selected = c === country;
            return (
              <Pressable
                key={c}
                onPress={() => setCountry(c)}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text
                  style={[styles.chipText, selected && styles.chipTextSelected]}
                >
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Contenido según estado */}
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.accent} />
            <Text style={styles.centerText}>Consultando sismos…</Text>
          </View>
        ) : error ? (
          <Card style={styles.centerCard}>
            <Ionicons
              name="cloud-offline-outline"
              size={32}
              color={Colors.textSecondary}
            />
            <Text style={styles.centerText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={() => load(country)}>
              <Text style={styles.retryText}>Reintentar</Text>
            </Pressable>
          </Card>
        ) : !latest || !info ? (
          <Card style={styles.centerCard}>
            <Ionicons
              name="checkmark-circle-outline"
              size={32}
              color={Colors.textSecondary}
            />
            <Text style={styles.centerText}>
              No hay sismos recientes en {country}.
            </Text>
          </Card>
        ) : (
          <>
            {/* Último sismo */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Último Sismo Registrado</Text>
              <Pressable onPress={() => router.push("/(tabs)/recent")}>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => router.push(`/quake/${latest.id}`)}>
              <Card
                style={[styles.latestQuakeCard, { borderLeftColor: info.dot }]}
              >
                <View style={styles.quakeTopRow}>
                  <View
                    style={[styles.magContainer, { backgroundColor: info.bg }]}
                  >
                    <Text style={[styles.magNumber, { color: info.text }]}>
                      {latest.mag.toFixed(1)}
                    </Text>
                    <Text style={styles.magUnit}>Mag</Text>
                  </View>
                  <View style={styles.quakeMainInfo}>
                    <MagBadge mag={latest.mag} showDot />
                    <Text style={styles.quakePlace} numberOfLines={2}>
                      {latest.place}
                    </Text>
                  </View>
                </View>
                <View style={styles.quakeDivider} />
                <View style={styles.quakeBottomRow}>
                  <View style={styles.quakeMetaItem}>
                    <Ionicons
                      name="time-outline"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.quakeMetaText}>{latest.time}</Text>
                  </View>
                  <View style={styles.quakeMetaItem}>
                    <Ionicons
                      name="arrow-down-outline"
                      size={14}
                      color={Colors.textSecondary}
                    />
                    <Text style={styles.quakeMetaText}>
                      Prof: {latest.depth} km
                    </Text>
                  </View>
                </View>
              </Card>
            </Pressable>

            {/* Resumen */}
            <View style={styles.statsRow}>
              <Card style={styles.statBox}>
                <Text style={styles.statNumber}>{quakes.length}</Text>
                <Text style={styles.statLabel}>Sismos listados</Text>
              </Card>
              <Card style={styles.statBox}>
                <Text style={styles.statNumber}>{maxMag?.toFixed(1)}</Text>
                <Text style={styles.statLabel}>Mayor magnitud</Text>
              </Card>
            </View>
          </>
        )}

        {/* Acciones rápidas */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Preparación y Prevención
        </Text>
        <View style={styles.actionsGrid}>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push("/prevention")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="shield-checkmark" size={24} color="#E65100" />
            </View>
            <Text style={styles.actionTitle}>Guías de Prevención</Text>
            <Text style={styles.actionSub}>Antes, durante y después</Text>
          </Pressable>
          <Pressable
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/missions")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="bag-handle" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.actionTitle}>Misiones y Retos</Text>
            <Text style={styles.actionSub}>Gana XP y medallas</Text>
          </Pressable>
        </View>

        {/* Actividad reciente */}
        {!loading && !error && quakes.length > 1 && (
          <>
            <Text
              style={[
                styles.sectionTitle,
                { marginTop: Spacing.xl, marginBottom: Spacing.md },
              ]}
            >
              Actividad Reciente
            </Text>
            {quakes.slice(1, 5).map((q) => (
              <Pressable
                key={q.id}
                onPress={() => router.push(`/quake/${q.id}`)}
              >
                <Card style={styles.miniQuakeCard}>
                  <View style={styles.miniQuakeRow}>
                    <View
                      style={[
                        styles.miniMagBox,
                        { backgroundColor: magInfo(q.mag).bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.miniMagText,
                          { color: magInfo(q.mag).text },
                        ]}
                      >
                        {q.mag.toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.miniQuakeDetails}>
                      <Text style={styles.miniQuakePlace} numberOfLines={1}>
                        {q.place}
                      </Text>
                      <Text style={styles.miniQuakeTime}>{q.time}</Text>
                    </View>
                    <MagBadge mag={q.mag} />
                  </View>
                </Card>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  greeting: { ...Typography.titleMedium },
  subGreeting: { ...Typography.bodyMedium },
  notifButton: {
    width: 42,
    height: 42,
    borderRadius: Radii.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.accent,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  creatureCard: {
    backgroundColor: Colors.primaryDark,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  creatureContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  creatureTextCol: { flex: 1, marginRight: Spacing.md },
  creatureTag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    alignSelf: "flex-start",
    marginBottom: Spacing.xs,
  },
  creatureTagText: { fontSize: 10, fontWeight: "700", color: Colors.white },
  creatureTitle: {
    ...Typography.titleSmall,
    color: Colors.white,
    marginBottom: 2,
  },
  creatureDesc: {
    ...Typography.bodySmall,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 16,
  },
  chipsRow: { gap: Spacing.sm, paddingBottom: Spacing.lg },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  chipTextSelected: { color: Colors.white },
  centerBox: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  centerCard: { alignItems: "center", padding: Spacing.xl, gap: Spacing.sm },
  centerText: { ...Typography.bodyMedium, textAlign: "center" },
  retryButton: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: Colors.accent,
  },
  retryText: { color: Colors.white, fontWeight: "700", fontSize: 13 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.titleSmall },
  seeAllText: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontWeight: "700",
  },
  latestQuakeCard: { padding: Spacing.lg, borderLeftWidth: 5 },
  quakeTopRow: { flexDirection: "row", alignItems: "center" },
  magContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
    borderRadius: Radii.md,
    marginRight: Spacing.md,
  },
  magNumber: { fontSize: 22, fontWeight: "800" },
  magUnit: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: -2,
  },
  quakeMainInfo: { flex: 1, gap: Spacing.xs },
  quakePlace: { ...Typography.bodyLarge, fontWeight: "600" },
  quakeDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },
  quakeBottomRow: { flexDirection: "row", justifyContent: "space-between" },
  quakeMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  quakeMetaText: { ...Typography.bodySmall },
  statsRow: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.md },
  statBox: { flex: 1, padding: Spacing.md, alignItems: "center" },
  statNumber: { fontSize: 22, fontWeight: "800", color: Colors.accent },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actionsGrid: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.md },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  actionSub: { ...Typography.bodySmall, marginTop: 2 },
  miniQuakeCard: { padding: Spacing.md, marginBottom: Spacing.sm },
  miniQuakeRow: { flexDirection: "row", alignItems: "center" },
  miniMagBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  miniMagText: { fontSize: 14, fontWeight: "700" },
  miniQuakeDetails: { flex: 1 },
  miniQuakePlace: {
    ...Typography.bodyMedium,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  miniQuakeTime: { ...Typography.bodySmall, marginTop: 2 },
});
