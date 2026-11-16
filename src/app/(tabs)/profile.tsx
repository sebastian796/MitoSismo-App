import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card } from "../../components";
import { ProfilePreventionCard } from "../../components/ProfilePreventionCard";
import { ProfileCreatureCard } from "../../components/creatures/CreatureCards";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getUserMissions } from "@/services/missionsService";

const BASE_XP = 150;
const XP_INCREMENT = 60;

function calculateLevelProgress(accumulatedXp: number) {
  const safeXp = Math.max(0, accumulatedXp);
  let nivel = 1;
  let xpInCurrentLevel = safeXp;
  let xpNeededForNextLevel = BASE_XP;

  while (xpInCurrentLevel >= xpNeededForNextLevel) {
    xpInCurrentLevel -= xpNeededForNextLevel;
    nivel += 1;
    xpNeededForNextLevel = BASE_XP + (nivel - 1) * XP_INCREMENT;
  }

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)),
  );

  return {
    nivel,
    totalXp: safeXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
  };
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, requireAuth, getAccessToken, refreshAccount } = useAuth();

  const [completedMissionsCount, setCompletedMissionsCount] = useState<number | null>(null);
  const [totalMissionsCount, setTotalMissionsCount] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadProfileStats = useCallback(async () => {
    if (!user) {
      setCompletedMissionsCount(null);
      setTotalMissionsCount(null);
      return;
    }

    try {
      setLoadingStats(true);
      const token = await getAccessToken();
      if (!token) return;

      const [missions] = await Promise.all([
        getUserMissions(token),
        refreshAccount?.().catch(() => null),
      ]);

      if (!isMountedRef.current) return;

      const completed = missions.filter((m) => m.completed).length;
      setCompletedMissionsCount(completed);
      setTotalMissionsCount(missions.length);
    } catch (err) {
      console.warn("No se pudieron sincronizar las estadísticas del perfil:", err);
    } finally {
      if (isMountedRef.current) {
        setLoadingStats(false);
      }
    }
  }, [user, getAccessToken, refreshAccount]);

  useFocusEffect(
    useCallback(() => {
      loadProfileStats();
    }, [loadProfileStats]),
  );

  const levelStats = useMemo(() => {
    const rawXp = user?.dataMascota?.xpActual ?? 0;
    return calculateLevelProgress(rawXp);
  }, [user?.dataMascota?.xpActual]);

  const userInitial = useMemo(() => {
    const name = user?.nombreUsuario?.trim();
    if (!name) return null;
    return name.charAt(0).toUpperCase();
  }, [user?.nombreUsuario]);

  const reportedQuakesCount = useMemo(() => {
    if (!user) return "—";
    const count =
      (user as Record<string, unknown>).sismosReportados ??
      (user as Record<string, unknown>).reportesCount ??
      (Array.isArray((user as Record<string, unknown>).reportes)
        ? ((user as Record<string, unknown>).reportes as unknown[]).length
        : 0);
    return typeof count === "number" ? count : 0;
  }, [user]);

  const handleOpenSettings = useCallback(() => {
    if (!user) {
      requireAuth("abrir configuración");
      return;
    }
    router.push("/settings");
  }, [user, requireAuth, router]);

  const handleLogoutPress = useCallback(() => {
    if (loggingOut) return;

    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas salir de tu cuenta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              setLoggingOut(true);
              await logout();
              if (isMountedRef.current) {
                router.replace("/");
              }
            } catch (err) {
              console.error("Error al cerrar sesión:", err);
              if (isMountedRef.current) {
                setLoggingOut(false);
              }
            }
          },
        },
      ],
    );
  }, [loggingOut, logout, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.profileHeader}>
        <View
          style={styles.headerSide}
          pointerEvents="none"
          accessible={false}
        />
        <Text
          style={styles.headerTitle}
          numberOfLines={1}
          accessibilityRole="header"
        >
          Mi Perfil
        </Text>
        <View style={styles.headerSide}>
          <Pressable
            onPress={handleOpenSettings}
            style={styles.gearButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Abrir configuración"
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={Colors.primary}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            {userInitial ? (
              <Text
                style={{
                  color: Colors.white,
                  fontSize: 30,
                  fontWeight: "700",
                }}
              >
                {userInitial}
              </Text>
            ) : (
              <Ionicons name="person" size={36} color={Colors.white} />
            )}
          </View>

          <Text style={styles.userName}>
            {user?.nombreUsuario ?? "Invitado"}
          </Text>
          <Text style={styles.userRole}>
            {user ? user.email : "Inicia sesión para guardar tu progreso"}
          </Text>

          {user && (
            <View style={{ width: "100%", marginTop: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: Colors.primary,
                    letterSpacing: 0.5,
                  }}
                >
                  NIVEL {levelStats.nivel}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: Colors.accent,
                  }}
                >
                  {levelStats.xpInCurrentLevel} / {levelStats.xpNeededForNextLevel} XP ({levelStats.progressPercent}%)
                </Text>
              </View>

              <View
                style={{
                  height: 8,
                  width: "100%",
                  backgroundColor: "rgba(0,0,0,0.08)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${levelStats.progressPercent}%`,
                    backgroundColor: Colors.accent,
                    borderRadius: 999,
                  }}
                />
              </View>
            </View>
          )}
        </Card>

        <ProfileCreatureCard />

        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Text style={styles.statNumber}>{reportedQuakesCount}</Text>
            <Text style={styles.statLabel}>Sismos Reportados</Text>
          </Card>

          <Pressable
            style={{ flex: 1 }}
            onPress={() => user && router.push("/missions")}
            disabled={!user}
            accessibilityRole="button"
            accessibilityLabel="Ver misiones completadas"
          >
            <Card style={styles.statBox}>
              {user && loadingStats && completedMissionsCount === null ? (
                <ActivityIndicator size="small" color={Colors.accent} />
              ) : (
                <Text style={styles.statNumber}>
                  {!user
                    ? "—"
                    : completedMissionsCount !== null
                      ? totalMissionsCount
                        ? `${completedMissionsCount}/${totalMissionsCount}`
                        : completedMissionsCount
                      : 0}
                </Text>
              )}
              <Text style={styles.statLabel}>Misiones Hechas</Text>
            </Card>
          </Pressable>

          <Card style={styles.statBox}>
            <Text style={styles.statNumber}>
              {user ? levelStats.totalXp : "—"}
            </Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </Card>
        </View>

        <ProfilePreventionCard />

        {user ? (
          <Button
            title={loggingOut ? "Cerrando sesión..." : "Cerrar Sesión"}
            variant="outline"
            disabled={loggingOut}
            onPress={handleLogoutPress}
            style={styles.logoutButton}
          />
        ) : (
          <Button
            title="Iniciar Sesión"
            onPress={() => router.push("/(auth)/login")}
            style={styles.logoutButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  profileHeader: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
  },
  headerSide: { width: 44, alignItems: "flex-end" },
  headerTitle: {
    ...Typography.titleSmall,
    flex: 1,
    minWidth: 0,
    textAlign: "center",
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  userCard: {
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
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
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "600",
  },
  settingsCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  settingTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    ...Typography.bodyLarge,
    fontWeight: "600",
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
    marginTop: Spacing.lg,
  },
  gearButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
});
