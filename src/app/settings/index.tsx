import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card, TopBar } from "../../components";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useNotificationSettings } from "../../context/NotificationSettingsContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

function SettingsRow(props: {
  icon: IconName;
  title: string;
  subtitle: string;
  badge?: string;
  badgeOn?: boolean;
  onPress?: () => void;
}) {
  const disabled = !props.onPress;
  return (
    <Pressable
      onPress={props.onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.row,
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.55 },
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons name={props.icon} size={22} color={Colors.accent} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{props.title}</Text>
        <Text style={styles.rowSub}>{props.subtitle}</Text>
      </View>
      {props.badge ? (
        <View style={[styles.badge, props.badgeOn && styles.badgeOn]}>
          <Text style={[styles.badgeText, props.badgeOn && styles.badgeTextOn]}>
            {props.badge}
          </Text>
        </View>
      ) : null}
      {!disabled && (
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      )}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const { settings } = useNotificationSettings();

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Configuración" showBack onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.card}>
          <SettingsRow
            icon="notifications-outline"
            title="Notificaciones"
            subtitle="Alertas de sismos, consejos y recordatorios"
            badge={settings.enabled ? "Activadas" : "Desactivadas"}
            badgeOn={settings.enabled}
            onPress={() => router.push("/settings/notifications")}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="person-circle-outline"
            title="Cuenta"
            subtitle="Próximamente"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="language-outline"
            title="Idioma y país"
            subtitle="Próximamente"
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="information-circle-outline"
            title="Acerca de MitoSismo"
            subtitle="Próximamente"
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  card: { paddingHorizontal: Spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1 },
  rowTitle: { ...Typography.bodyLarge, fontWeight: "600" },
  rowSub: { ...Typography.bodySmall, marginTop: 2 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    backgroundColor: Colors.surfaceAlt,
  },
  badgeOn: { backgroundColor: "#E8F5E9" },
  badgeText: { fontSize: 10, fontWeight: "700", color: Colors.textSecondary },
  badgeTextOn: { color: "#2E7D32" },
  divider: { height: 1, backgroundColor: Colors.border },
});
