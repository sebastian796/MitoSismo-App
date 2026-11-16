import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {getUserMissions, completeMission, } from "../../services/missionsService";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, TopBar } from "../../components";
import { MissionsAccessGuard } from "../../components/auth/MissionsAccessGuard";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { Mission } from "../../types";

export default function MissionsScreen() {
  return (
    <MissionsAccessGuard>
      <AuthenticatedMissionsScreen />
    </MissionsAccessGuard>
  );
}

function AuthenticatedMissionsScreen() {
  const { user, getAccessToken, refreshAccount } = useAuth();

  const [missionsList, setMissionsList] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});

  const loadMissions = useCallback(
    async (isMounted?: () => boolean) => {
      try {
        setLoading(true);
        setError(null);

        const token = await getAccessToken();
        if (!token) {
          throw new Error("No se encontró una sesión válida.");
        }

        const data = await getUserMissions(token);
        if (!isMounted || isMounted()) {
          setMissionsList(data);
        }
      } catch (err) {
        console.error("Error cargando misiones:", err);
        if (!isMounted || isMounted()) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las misiones.",
          );
        }
      } finally {
        if (!isMounted || isMounted()) {
          setLoading(false);
        }
      }
    },
    [getAccessToken],
  );

  useEffect(() => {
    let mounted = true;
    loadMissions(() => mounted);
    return () => {
      mounted = false;
    };
  }, [loadMissions]);

  // Nivel y XP reales de la cuenta
  const mascota = user?.dataMascota ?? null;
  const nivel = Math.max(1, mascota?.nivel ?? 1);
  const totalXp = Math.max(0, mascota?.xpActual ?? 0);
  const nextLevelThreshold = Math.max(1, (nivel + 1) * (nivel + 1) * 10);

  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((totalXp / nextLevelThreshold) * 100)),
  );

  const handleCompleteMission = async (mission: Mission) => {
    // Una vez completada o mientras se está procesando, no permite volver a ejecutarse
    if (mission.completed || updatingIds[mission.id]) return;

    setUpdatingIds((prev) => ({ ...prev, [mission.id]: true }));
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("No se encontró una sesión válida.");
      }

      await completeMission(mission.id, token);

      setMissionsList((prev) =>
        prev.map((m) =>
          m.id === mission.id
            ? {
                ...m,
                completed: true,
                progress: 100,
              }
            : m,
        ),
      );

      await refreshAccount();
    } catch (err) {
      console.error("Error completando misión:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo completar la misión. Inténtalo nuevamente.",
      );
    } finally {
      setUpdatingIds((prev) => {
        const next = { ...prev };
        delete next[mission.id];
        return next;
      });
    }
  };

  const completedCount = missionsList.filter((m) => m.completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Misiones de Prevención" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.levelLabel}>
                {user ? `NIVEL ${nivel}` : "SIN CUENTA"}
              </Text>
              <Text style={styles.levelTitle}>
                {user
                  ? (mascota?.criatura.nombre ?? "Sin criatura")
                  : "Inicia sesión para ganar XP"}
              </Text>
            </View>
            <View style={styles.xpBadge}>
              <Ionicons name="sparkles" size={16} color={Colors.gold} />
              <Text style={styles.xpText}>
                {user ? `${totalXp} XP` : "— XP"}
              </Text>
            </View>
          </View>

          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressSub}>
              {user
                ? `${totalXp} / ${nextLevelThreshold} XP para Nivel ${nivel + 1}`
                : "Inicia sesión para guardar tu progreso"}
            </Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Misiones Disponibles</Text>
          <Text style={styles.sectionCount}>
            {completedCount}/{missionsList.length} Completadas
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.accent} />
            <Text style={styles.loadingText}>Cargando misiones...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            {!loading && missionsList.length === 0 && (
              <Pressable
                onPress={() => loadMissions()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>Reintentar</Text>
              </Pressable>
            )}
          </View>
        )}

        {!loading &&
          missionsList.map((m) => {
            const isUpdating = Boolean(updatingIds[m.id]);
            const isDisabled = m.completed || isUpdating;

            return (
              <Pressable
                key={m.id}
                onPress={() => handleCompleteMission(m)}
                disabled={isDisabled}
              >
                <Card
                  style={[
                    styles.missionCard,
                    m.completed && styles.missionCompletedCard,
                    isUpdating && styles.missionCardUpdating,
                  ]}
                >
                  <View style={styles.missionRow}>
                    <View
                      style={[
                        styles.checkbox,
                        m.completed && styles.checkboxCompleted,
                      ]}
                    >
                      {isUpdating ? (
                        <ActivityIndicator size="small" color={Colors.accent} />
                      ) : (
                        m.completed && (
                          <Ionicons
                            name="checkmark"
                            size={18}
                            color={Colors.white}
                          />
                        )
                      )}
                    </View>

                    <View style={styles.missionInfo}>
                      <View style={styles.titleRow}>
                        <Text
                          style={[
                            styles.missionTitle,
                            m.completed && styles.missionTitleCompleted,
                          ]}
                        >
                          {m.title}
                        </Text>
                      </View>
                      <Text style={styles.missionDesc}>{m.description}</Text>

                      <View style={styles.itemProgressBg}>
                        <View
                          style={[
                            styles.itemProgressFill,
                            { width: `${m.progress}%` },
                          ]}
                        />
                      </View>

                      <View style={styles.rewardRow}>
                        <View style={styles.rewardPill}>
                          <Ionicons
                            name="star"
                            size={12}
                            color={Colors.accent}
                          />
                          <Text style={styles.rewardText}>+{m.xp} XP</Text>
                        </View>
                        {isUpdating ? (
                          <Text style={styles.statusPendingText}>
                            Completando...
                          </Text>
                        ) : m.completed ? (
                          <Text style={styles.statusCompletedText}>
                            ¡Completado!
                          </Text>
                        ) : (
                          <Text style={styles.statusPendingText}>
                            Toca para completar
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })}
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
    paddingBottom: Spacing.xxl,
  },
  xpCard: {
    backgroundColor: Colors.primaryDark,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  xpHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  levelLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.accentLight,
    letterSpacing: 0.5,
  },
  levelTitle: {
    ...Typography.titleSmall,
    color: Colors.white,
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 4,
  },
  xpText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.white,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: Radii.full,
    overflow: "hidden",
    marginBottom: Spacing.sm,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.accentLight,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.titleSmall,
  },
  sectionCount: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.accent,
  },
  missionCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  missionCompletedCard: {
    backgroundColor: "#F3EFE6",
    borderColor: "#D4CAB8",
  },
  missionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: Radii.sm,
    borderWidth: 2,
    borderColor: Colors.borderDark,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
    marginRight: Spacing.md,
    backgroundColor: Colors.surface,
  },
  checkboxCompleted: {
    backgroundColor: "#2E7D32",
    borderColor: "#2E7D32",
  },
  missionInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  missionTitle: {
    ...Typography.bodyLarge,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  missionTitleCompleted: {
    textDecorationLine: "line-through",
    color: Colors.textSecondary,
  },
  missionDesc: {
    ...Typography.bodySmall,
    marginTop: 2,
    lineHeight: 16,
  },
  itemProgressBg: {
    height: 4,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    overflow: "hidden",
    marginTop: Spacing.sm,
  },
  itemProgressFill: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: Radii.full,
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
  },
  rewardPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    gap: 4,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.accent,
  },
  statusCompletedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2E7D32",
  },
  statusPendingText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  loadingText: {
    color: 'black',
    fontSize: 14,
  },
  errorContainer: {
    marginBottom: 12,
    gap: 8,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 14,
  },
  retryButton: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.accent,
  },
  retryText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 13,
  },
  missionCardUpdating: {
    opacity: 0.65,
  },
});
