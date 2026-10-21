import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Spacing, Typography } from "../constants/theme";
import { Card } from "./ui/Card";

/** Información local, visible para cualquier visitante; no se atribuye al servidor. */
export function ProfilePreventionCard() {
  return (
    <Card style={styles.card}>
      <Ionicons
        name="shield-checkmark-outline"
        size={22}
        color={Colors.accent}
      />
      <View style={styles.text}>
        <Text style={styles.title}>Recuerda prevenir</Text>
        <Text style={styles.phrase}>
          Identifica tus zonas seguras y acuerda un punto de encuentro con tu
          familia.
        </Text>
        <Text style={styles.source}>Consejo informativo local</Text>
      </View>
    </Card>
  );
}
const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  text: { flex: 1 },
  title: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  phrase: { ...Typography.bodySmall, marginTop: Spacing.xs, lineHeight: 19 },
  source: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    marginTop: Spacing.xs,
  },
});
