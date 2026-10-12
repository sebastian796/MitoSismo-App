import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { CreatureAvatar } from "./CreatureAvatar";

function creatureMessage(mag?: number) {
  if (mag === undefined)
    return "Estoy atento al suelo. ¡Buen momento para revisar tu mochila!";
  if (mag >= 5)
    return "¡Hubo un sismo fuerte! Revisa tu mochila y tu plan familiar.";
  if (mag >= 4) return "Sismo moderado reciente. Repasa tus zonas seguras.";
  return "Suelo en calma. ¡Buen momento para completar una misión!";
}

/**
 * Tarjeta de criatura del Inicio. Tres estados:
 *  1) Invitado: Ignis ilustrativa, sin nivel ni XP, con opción de registrarse.
 *  2) Usuario con criatura: nombre, nivel y XP reales de su cuenta.
 *  3) Usuario sin criatura asignada: estado vacío (no se inventan datos).
 */
export function HomeCreatureCard({ latestMag }: { latestMag?: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const mascota = user?.dataMascota ?? null;

  if (!user) {
    return (
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.textCol}>
            <View style={[styles.tag, styles.tagMuted]}>
              <Text style={styles.tagText}>Mascota ilustrativa</Text>
            </View>
            <Text style={styles.title}>Ignis, guardián de MitoSismo</Text>
            <Text style={styles.desc}>
              Crea tu cuenta para tener tu propia criatura, ganar XP y subir de
              nivel.
            </Text>
            <Pressable
              style={styles.cta}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text style={styles.ctaText}>Crear cuenta</Text>
            </Pressable>
          </View>
          <CreatureAvatar nombre="Ignis" size={64} />
        </View>
      </Card>
    );
  }

  if (!mascota) {
    return (
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.textCol}>
            <View style={[styles.tag, styles.tagMuted]}>
              <Text style={styles.tagText}>Sin criatura</Text>
            </View>
            <Text style={styles.title}>Aún no tienes una criatura</Text>
            <Text style={styles.desc}>
              Tu cuenta todavía no tiene una criatura asignada.
            </Text>
          </View>
          <CreatureAvatar size={64} />
        </View>
      </Card>
    );
  }

  const { criatura, nivel, xpActual } = mascota;
  return (
    <Pressable onPress={() => router.push("/creature")}>
      <Card style={styles.card}>
        <View style={styles.content}>
          <View style={styles.textCol}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>
                Nivel {nivel} • {criatura.nombre}
              </Text>
            </View>
            <Text style={styles.title}>Guardián Activo</Text>
            <Text style={styles.desc} numberOfLines={3}>
              {creatureMessage(latestMag)}
            </Text>
            <Text style={styles.xp}>{xpActual} XP</Text>
          </View>
          <CreatureAvatar
            nombre={criatura.nombre}
            elemento={criatura.elemento}
            imageUrl={criatura.imageUrl}
            size={64}
          />
        </View>
      </Card>
    </Pressable>
  );
}

/** Tarjeta de criatura del Perfil (fondo claro). */
export function ProfileCreatureCard() {
  const router = useRouter();
  const { user } = useAuth();
  const mascota = user?.dataMascota ?? null;

  if (!user) {
    return (
      <Card style={styles.profileCard}>
        <Text style={styles.profileTitle}>Sin criatura</Text>
        <Text style={styles.profileDesc}>
          Regístrate para tener tu propia criatura y guardar tu progreso.
        </Text>
        <Button
          title="Crear cuenta"
          variant="outline"
          size="small"
          onPress={() => router.push("/(auth)/register")}
          style={styles.profileButton}
        />
      </Card>
    );
  }

  if (!mascota) {
    return (
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <CreatureAvatar size={52} />
          <View style={styles.profileText}>
            <Text style={styles.profileTitle}>Aún no tienes una criatura</Text>
            <Text style={styles.profileDesc}>
              Tu cuenta todavía no tiene una criatura asignada.
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  const { criatura, nivel, xpActual } = mascota;
  return (
    <Card style={styles.profileCard}>
      <View style={styles.profileRow}>
        <CreatureAvatar
          nombre={criatura.nombre}
          elemento={criatura.elemento}
          imageUrl={criatura.imageUrl}
          size={52}
        />
        <View style={styles.profileText}>
          <Text style={styles.profileTitle}>{criatura.nombre}</Text>
          <Text style={styles.profileDesc}>
            Nivel {nivel} • {xpActual} XP
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primaryDark,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  textCol: { flex: 1, marginRight: Spacing.md },
  tag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radii.full,
    alignSelf: "flex-start",
    marginBottom: Spacing.xs,
  },
  tagMuted: { backgroundColor: "rgba(255,255,255,0.25)" },
  tagText: { fontSize: 10, fontWeight: "700", color: Colors.white },
  title: { ...Typography.titleSmall, color: Colors.white, marginBottom: 2 },
  desc: {
    ...Typography.bodySmall,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 16,
  },
  xp: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.accent,
    marginTop: Spacing.xs,
  },
  cta: {
    alignSelf: "flex-start",
    marginTop: Spacing.sm,
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
  },
  ctaText: { color: Colors.white, fontWeight: "700", fontSize: 12 },

  profileCard: { padding: Spacing.lg, marginBottom: Spacing.lg },
  profileRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  profileText: { flex: 1 },
  profileTitle: { ...Typography.bodyLarge, fontWeight: "700" },
  profileDesc: { ...Typography.bodySmall, marginTop: 2 },
  profileButton: { marginTop: Spacing.md, alignSelf: "flex-start" },
});
