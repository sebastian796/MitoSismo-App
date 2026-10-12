import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Card, TopBar } from "../components";
import { CreatureAvatar } from "../components/creatures/CreatureAvatar";
import { ignisCreature } from "../constants/data";
import { Colors, Radii, Spacing, Typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export default function CreatureScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const isGuest = user === null;
  const mascota = user?.dataMascota ?? null;
  const criatura = mascota?.criatura ?? null;

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.06, {
        duration: 1400,
        easing: Easing.inOut(Easing.sin),
      }),
      -1,
      true,
    );

    return () => {
      cancelAnimation(scale);
    };
  }, [scale]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const creatureName = criatura
    ? criatura.nombre
    : isGuest
      ? ignisCreature.name
      : "Criatura no disponible";

  const creatureTitle = criatura
    ? (criatura.titulo ?? "Mascota Guardiana")
    : isGuest
      ? ignisCreature.title
      : "No pudimos confirmar los datos de tu criatura.";

  const creatureDescription = criatura
    ? (criatura.descripcion ?? "")
    : isGuest
      ? ignisCreature.description
      : "Comprueba tu conexión y vuelve a iniciar sesión si el problema continúa.";

  const loreTitle = criatura
    ? `Mito de ${criatura.nombre}`
    : isGuest
      ? "Mito del Fuego y la Pachamama"
      : "Información no disponible";

  const loreText = criatura
    ? (criatura.mitoLore ?? "Esta criatura aún no tiene un mito registrado.")
    : isGuest
      ? ignisCreature.mythLore
      : "Los datos de tu mascota no se pudieron recuperar.";

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Mascota Guardiana" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.heroCard}>
          <Animated.View style={[styles.avatarContainer, breatheStyle]}>
            {criatura || isGuest ? (
              <CreatureAvatar
                nombre={criatura ? criatura.nombre : ignisCreature.name}
                elemento={criatura?.elemento}
                imageUrl={criatura?.imageUrl}
                size={100}
              />
            ) : (
              <Ionicons
                name="help-circle-outline"
                size={60}
                color={Colors.textSecondary}
              />
            )}
          </Animated.View>

          {isGuest && (
            <View style={styles.guestPill}>
              <Text style={styles.guestPillText}>Mascota ilustrativa</Text>
            </View>
          )}

          <Text style={styles.creatureName}>{creatureName}</Text>

          <Text style={styles.creatureTitle}>{creatureTitle}</Text>

          {(criatura || isGuest) && (
            <View style={styles.tagRow}>
              {criatura && (
                <View style={styles.tagPill}>
                  <Text style={styles.tagText}>
                    {`Elemento: ${criatura.elemento ?? "—"}`}
                  </Text>
                </View>
              )}

              {mascota && (
                <View style={styles.levelPill}>
                  <Text style={styles.levelText}>
                    {`Nivel ${mascota.nivel} • ${mascota.xpActual} XP`}
                  </Text>
                </View>
              )}

              {isGuest && (
                <View style={styles.levelPill}>
                  <Text style={styles.levelText}>Sin progreso personal</Text>
                </View>
              )}
            </View>
          )}

          <Text style={styles.creatureBio}>{creatureDescription}</Text>
        </Card>

        <Text style={styles.sectionTitle}>Sabiduría Ancestral</Text>

        <Card style={styles.loreCard}>
          <View style={styles.loreHeader}>
            <Ionicons name="sparkles" size={18} color={Colors.gold} />

            <Text style={styles.loreTitle}>{loreTitle}</Text>
          </View>

          <Text style={styles.loreText}>{loreText}</Text>
        </Card>

        {isGuest && (
          <Button
            title="Crear cuenta para tener mi criatura"
            onPress={() => router.push("/(auth)/register")}
            style={styles.backButton}
          />
        )}

        <Button
          title="Regresar al Inicio"
          onPress={() => router.back()}
          style={styles.backButton}
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

  heroCard: {
    padding: Spacing.xl,
    alignItems: "center",
  },

  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },

  guestPill: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    marginBottom: Spacing.sm,
  },

  guestPillText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: "700",
  },

  creatureName: {
    ...Typography.titleLarge,
    fontSize: 28,
    textAlign: "center",
  },

  creatureTitle: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "center",
  },

  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },

  tagPill: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },

  tagText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.white,
  },

  levelPill: {
    backgroundColor: Colors.surfaceAlt,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radii.full,
  },

  levelText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.primary,
  },

  creatureBio: {
    ...Typography.bodyMedium,
    textAlign: "center",
    lineHeight: 22,
    marginTop: Spacing.sm,
  },

  sectionTitle: {
    ...Typography.titleSmall,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },

  loreCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.primaryDark,
  },

  loreHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  loreTitle: {
    ...Typography.bodyLarge,
    fontWeight: "700",
    color: Colors.gold,
    flex: 1,
  },

  loreText: {
    ...Typography.bodyMedium,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 22,
  },

  backButton: {
    marginTop: Spacing.xl,
  },
});
