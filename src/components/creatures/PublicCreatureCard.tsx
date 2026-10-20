import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { fetchPublicCreature } from "../../services/publicContentService";
import type { CreatureInfo } from "../../types/auth";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { CreatureAvatar } from "./CreatureAvatar";

export function PublicCreatureCard({
  refreshKey = 0,
  variant = "home",
}: {
  refreshKey?: number;
  variant?: "home" | "profile";
}) {
  const isProfile = variant === "profile";
  const router = useRouter();
  const [creature, setCreature] = useState<CreatureInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      setLoading(true);
      setError(false);
      void fetchPublicCreature(controller.signal)
        .then((data) => {
          if (!controller.signal.aborted) setCreature(data);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
      return () => controller.abort();
    }, [refreshKey, retry]),
  );
  return (
    <Card style={isProfile ? styles.profileCard : styles.card}>
      {isProfile && (
        <Text style={styles.publicLabel}>
          Mascota pública · No asignada a tu cuenta
        </Text>
      )}
      {loading ? (
        <ActivityIndicator
          color={isProfile ? Colors.accent : Colors.white}
          accessibilityLabel="Cargando criatura"
        />
      ) : error ? (
        <View>
          <Text style={[styles.desc, isProfile && styles.profileDesc]}>
            No se pudo cargar la criatura. Revisa tu conexión.
          </Text>
          <Pressable style={styles.cta} onPress={() => setRetry((v) => v + 1)}>
            <Text style={styles.ctaText}>Reintentar</Text>
          </Pressable>
        </View>
      ) : !creature ? (
        <Text style={[styles.desc, isProfile && styles.profileDesc]}>
          No hay una criatura pública disponible.
        </Text>
      ) : (
        <View style={styles.content}>
          <View style={styles.textCol}>
            <Text style={[styles.title, isProfile && styles.profileTitle]}>
              {creature.nombre}
            </Text>
            {!!creature.titulo && (
              <Text style={[styles.desc, isProfile && styles.profileDesc]}>
                {creature.titulo}
              </Text>
            )}
            {!!creature.elemento && (
              <Text style={[styles.element, isProfile && styles.profileDesc]}>
                {creature.elemento}
              </Text>
            )}
            {!!creature.descripcion && (
              <Text style={[styles.desc, isProfile && styles.profileDesc]}>
                {creature.descripcion}
              </Text>
            )}
            {!isProfile && (
              <Pressable
                style={styles.cta}
                onPress={() => router.push("/(auth)/register")}
              >
                <Text style={styles.ctaText}>Crear cuenta</Text>
              </Pressable>
            )}
          </View>
          <CreatureAvatar
            nombre={creature.nombre}
            elemento={creature.elemento}
            imageUrl={creature.imageUrl}
            size={isProfile ? 52 : 64}
            allowIllustration={false}
          />
        </View>
      )}
      {isProfile && (
        <Button
          title="Crear cuenta"
          variant="outline"
          size="small"
          onPress={() => router.push("/(auth)/register")}
          style={styles.profileButton}
        />
      )}
    </Card>
  );
}
const styles = StyleSheet.create({
  profileCard: { padding: Spacing.lg, marginBottom: Spacing.lg },
  profileTitle: {
    ...Typography.bodyLarge,
    color: Colors.textPrimary,
    fontWeight: "700",
  },
  profileDesc: { color: Colors.textSecondary },
  publicLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  profileButton: { marginTop: Spacing.md, alignSelf: "flex-start" },
  card: {
    backgroundColor: Colors.primaryDark,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  content: { flexDirection: "row", alignItems: "center" },
  textCol: { flex: 1, marginRight: Spacing.md },
  title: { ...Typography.titleSmall, color: Colors.white, marginBottom: 2 },
  desc: { ...Typography.bodySmall, color: Colors.white, lineHeight: 18 },
  element: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: "700",
    marginVertical: Spacing.xs,
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
});
