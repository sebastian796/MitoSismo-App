import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { useNotificationSettings } from "../../context/NotificationSettingsContext";
import { notificationMode } from "../../services/notificationService";
import {
  MAGNITUDE_OPTIONS,
  NOTIFICATION_COUNTRIES,
  TIPS_HOUR_OPTIONS,
} from "../../types/notifications";
function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}
function SwitchRow(props: {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{props.title}</Text>
        <Text style={styles.rowSub}>{props.subtitle}</Text>
      </View>
      <Switch
        value={props.value}
        onValueChange={props.onChange}
        trackColor={{ false: Colors.border, true: Colors.accent }}
        thumbColor={Colors.white}
      />
    </View>
  );
}
function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}
const MODE_INFO: Record<string, string | null> = {
  web: "Versión web: la prueba y las alertas de sismo usan notificaciones del navegador. Los consejos y recordatorios programados solo funcionan en la app del celular.",
  "expo-go":
    "Expo Go en Android no admite notificaciones del sistema. Aquí las alertas se muestran como avisos dentro de la app. Para notificaciones reales usa un development build.",
  native: null,
};
export default function NotificationsSettingsScreen() {
  const router = useRouter();
  const { settings, setEnabled, update, sendTest } = useNotificationSettings();
  const [feedback, setFeedback] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);
  const off = !settings.enabled;
  const modeInfo = MODE_INFO[notificationMode];
  const handleMaster = async (value: boolean) => {
    setFeedback(null);
    const result = await setEnabled(value);
    if (result === "denied") {
      setFeedback({
        ok: false,
        text:
          notificationMode === "web"
            ? "El navegador bloqueó las notificaciones. Permítelas desde el candado junto a la URL y vuelve a intentarlo."
            : "Falta el permiso del sistema. Actívalo en los ajustes del teléfono.",
      });
    }
  };
  const handleTest = async () => {
    const ok = await sendTest();
    setFeedback(
      ok
        ? { ok: true, text: "Notificación enviada." }
        : {
            ok: false,
            text: "No se pudo enviar. Verifica que las notificaciones estén activadas y con permiso.",
          },
    );
  };
  const toggleCountry = (c: string) => {
    const has = settings.countries.includes(c);
    update({
      countries: has
        ? settings.countries.filter((x) => x !== c)
        : [...settings.countries, c],
    });
  };
  const quakeSummary = `M ≥ ${settings.minMagnitude.toFixed(1)} · ${
    settings.countries.length
      ? settings.countries.join(", ")
      : "todos los países"
  }`;
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Notificaciones" showBack onBack={() => router.back()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name={settings.enabled ? "notifications" : "notifications-off"}
              size={22}
              color={Colors.white}
            />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.heroTitle}>
              {settings.enabled
                ? "Notificaciones activadas"
                : "Notificaciones desactivadas"}
            </Text>
            <Text style={styles.heroSub}>
              {settings.enabled
                ? "Elige abajo qué quieres recibir"
                : "Actívalas para recibir alertas"}
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={handleMaster}
            trackColor={{
              false: "rgba(255,255,255,0.25)",
              true: Colors.accent,
            }}
            thumbColor={Colors.white}
          />
        </View>
        {modeInfo && (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color="#8A5A00" />
            <Text style={styles.infoText}>{modeInfo}</Text>
          </View>
        )}
        {feedback && !feedback.ok && (
          <View style={[styles.infoBox, styles.errorBox]}>
            <Ionicons name="alert-circle" size={18} color="#B71C1C" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoText, { color: "#B71C1C" }]}>
                {feedback.text}
              </Text>
              {notificationMode === "native" && (
                <Pressable onPress={() => Linking.openSettings()}>
                  <Text style={styles.linkText}>Abrir ajustes</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
        <View style={off ? styles.disabled : undefined}>
          {}
          <SectionLabel>SISMOS</SectionLabel>
          <Card style={styles.card}>
            <SwitchRow
              title="Alertas de sismos"
              subtitle="Te avisamos cuando ocurra uno que cumpla tus filtros"
              value={settings.quakes}
              onChange={(v) => update({ quakes: v })}
            />
            {settings.quakes && (
              <View style={styles.options}>
                <Text style={styles.summary}>Recibirás: {quakeSummary}</Text>
                <Text style={styles.optionLabel}>Magnitud mínima</Text>
                <View style={styles.chips}>
                  {MAGNITUDE_OPTIONS.map((m) => (
                    <Chip
                      key={m}
                      label={`M ≥ ${m.toFixed(1)}`}
                      selected={settings.minMagnitude === m}
                      onPress={() => update({ minMagnitude: m })}
                    />
                  ))}
                </View>
                <Text style={[styles.optionLabel, { marginTop: Spacing.lg }]}>
                  Países
                </Text>
                <View style={styles.chips}>
                  <Chip
                    label="Todos"
                    selected={settings.countries.length === 0}
                    onPress={() => update({ countries: [] })}
                  />
                  {NOTIFICATION_COUNTRIES.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      selected={settings.countries.includes(c)}
                      onPress={() => toggleCountry(c)}
                    />
                  ))}
                </View>
              </View>
            )}
          </Card>
          {}
          <SectionLabel>PREVENCIÓN</SectionLabel>
          <Card style={styles.card}>
            <SwitchRow
              title="Consejos de prevención"
              subtitle="Un consejo distinto cada día"
              value={settings.tips}
              onChange={(v) => update({ tips: v })}
            />
            {settings.tips && (
              <View style={styles.options}>
                <Text style={styles.optionLabel}>Hora del consejo</Text>
                <View style={styles.chips}>
                  {TIPS_HOUR_OPTIONS.map((h) => (
                    <Chip
                      key={h}
                      label={`${h}:00`}
                      selected={settings.tipsHour === h}
                      onPress={() => update({ tipsHour: h })}
                    />
                  ))}
                </View>
              </View>
            )}
            <View style={styles.divider} />
            <SwitchRow
              title="Recordatorio de misiones"
              subtitle="Todos los días a las 19:00"
              value={settings.missions}
              onChange={(v) => update({ missions: v })}
            />
          </Card>
          {}
          <SectionLabel>SONIDO</SectionLabel>
          <Card style={styles.card}>
            <SwitchRow
              title="Alerta sonora"
              subtitle="Sonido y vibración en las alertas de sismos"
              value={settings.sound}
              onChange={(v) => update({ sound: v })}
            />
          </Card>
          {}
          <Button
            title="Enviar notificación de prueba"
            variant="outline"
            onPress={handleTest}
            style={styles.testButton}
          />
          {feedback?.ok && <Text style={styles.okText}>✓ {feedback.text}</Text>}
        </View>
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