import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, TopBar } from "../components";
import { emergencyContacts } from "../constants/data";
import { Colors, Radii, Spacing, Typography } from "../constants/theme";
import {
  fetchPreventionTips,
  type PreventionPhase,
  type PreventionTip,
} from "../services/publicContentService";
export default function PreventionScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PreventionPhase>("durante");
  const kitItems = [
    { title: "Agua embotellada (2L por persona)", checked: true },
    { title: "Alimentos no perecibles (latas, barras)", checked: true },
    { title: "Linterna y pilas de repuesto", checked: false },
    { title: "Botiquín de primeros auxilios", checked: true },
    { title: "Radio a pilas y silbato de auxilio", checked: false },
    { title: "Copia de documentos de identidad", checked: false },
  ];
  const [tips, setTips] = useState<PreventionTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setTips([]);
    void fetchPreventionTips(activeTab, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setTips(data);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "No se pudieron cargar los consejos. Revisa tu conexión.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [activeTab, retry]);
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        title="Guía de Prevención"
        showBack
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.phaseTabs}>
          {(["antes", "durante", "despues"] as const).map((phase) => {
            const active = activeTab === phase;
            const label =
              phase === "antes"
                ? "Antes"
                : phase === "durante"
                  ? "Durante"
                  : "Después";
            return (
              <Pressable
                key={phase}
                style={[styles.phaseTab, active && styles.phaseTabActive]}
                onPress={() => {
                  if (phase !== activeTab) {
                    setLoading(true);
                    setTips([]);
                    setActiveTab(phase);
                  }
                }}
              >
                <Text
                  style={[
                    styles.phaseTabText,
                    active && styles.phaseTabTextActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons
              name={
                activeTab === "antes"
                  ? "shield-checkmark"
                  : activeTab === "durante"
                    ? "alert-circle"
                    : "medical"
              }
              size={22}
              color={Colors.accent}
            />
            <Text style={styles.tipsTitle}>
              {activeTab === "antes"
                ? "Preparación Previa"
                : activeTab === "durante"
                  ? "Acciones Inmediatas"
                  : "Recuperación y Cuidado"}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator
              color={Colors.accent}
              accessibilityLabel="Cargando consejos"
            />
          ) : error ? (
            <View>
              <Text style={styles.tipText}>{error}</Text>
              <Button
                title="Reintentar"
                onPress={() => setRetry((value) => value + 1)}
              />
            </View>
          ) : tips.length === 0 ? (
            <Text style={styles.tipText}>
              El servidor no tiene consejos registrados para esta fase.
            </Text>
          ) : (
            tips.map((tip, idx) => (
              <View key={idx} style={styles.tipItem}>
                <View style={styles.tipNumber}>
                  <Text style={styles.tipNumberText}>{idx + 1}</Text>
                </View>
                <Text style={styles.tipText}>{tip.consejo}</Text>
              </View>
            ))
          )}
        </Card>
        {}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Mochila de Emergencia (Kit Esencial)
        </Text>
        <Card style={styles.kitCard}>
          {kitItems.map((item, index) => (
            <View key={index} style={styles.kitRow}>
              <Ionicons
                name={item.checked ? "checkbox" : "square-outline"}
                size={20}
                color={item.checked ? "#2E7D32" : Colors.textMuted}
              />
              <Text
                style={[styles.kitText, item.checked && styles.kitTextChecked]}
              >
                {item.title}
              </Text>
            </View>
          ))}
        </Card>
        {}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Líneas de Emergencia Directas
        </Text>
        <View style={styles.contactsGrid}>
          {emergencyContacts.map((contact, index) => (
            <Pressable
              key={index}
              style={styles.contactCard}
              onPress={() => handleCall(contact.number)}
            >
              <View style={styles.contactLeft}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactSub}>{contact.description}</Text>
              </View>
              <View style={styles.callBadge}>
                <Ionicons name="call" size={14} color={Colors.white} />
                <Text style={styles.callNumber}>{contact.number}</Text>
              </View>
            </Pressable>
          ))}
        </View>
        {}
        <Button
          title="Regresar"
          variant="outline"
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
  phaseTabs: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  phaseTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: Radii.sm,
  },
  phaseTabActive: {
    backgroundColor: Colors.primary,
  },
  phaseTabText: {
    ...Typography.bodySmall,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  phaseTabTextActive: {
    color: Colors.white,
  },
  tipsCard: {
    padding: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    ...Typography.titleSmall,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  tipNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
    marginTop: 1,
  },
  tipNumberText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
  },
  tipText: {
    ...Typography.bodyMedium,
    flex: 1,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  kitCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  kitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  kitText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  kitTextChecked: {
    color: Colors.textSecondary,
  },
  contactsGrid: {
    gap: Spacing.sm,
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  contactName: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  contactSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  callBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C62828",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 4,
  },
  callNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: Colors.white,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});
