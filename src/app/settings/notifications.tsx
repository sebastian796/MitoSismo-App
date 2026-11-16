import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, TopBar } from "../../components";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useNotificationSettings } from "../../context/NotificationSettingsContext";
import { notificationMode } from "../../services/notificationService";
import {
  MAGNITUDE_OPTIONS,
  NOTIFICATION_COUNTRIES,
} from "../../types/notifications";

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  disabled: { opacity: 0.45, pointerEvents: "none" },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radii.lg,
    padding: Spacing.lg,
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { ...Typography.titleSmall, color: Colors.white },
  heroSub: {
    ...Typography.bodySmall,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
  },
  infoBox: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorBox: { backgroundColor: "#FFEBEE" },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17, color: "#6D4C00" },
  linkText: {
    color: Colors.accent,
    fontWeight: "700",
    fontSize: 12,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
    marginLeft: 4,
  },
  card: { paddingHorizontal: Spacing.lg },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  rowText: { flex: 1, marginRight: Spacing.md },
  rowTitle: { ...Typography.bodyLarge, fontWeight: "600" },
  rowSub: { ...Typography.bodySmall, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.border },
  options: { paddingBottom: Spacing.lg },
  summary: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.accent,
    backgroundColor: "#FFF3E0",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.sm,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  optionLabel: {
    ...Typography.bodySmall,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipSelected: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  chipText: { fontSize: 12, fontWeight: "600", color: Colors.textSecondary },
  chipTextSelected: { color: Colors.white },
  testButton: { marginTop: Spacing.xl },
  okText: {
    textAlign: "center",
    marginTop: Spacing.sm,
    color: "#2E7D32",
    fontWeight: "600",
    fontSize: 12,
  },
});
