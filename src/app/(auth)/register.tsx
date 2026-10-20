import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Input, TopBar } from "../../components";
import { CountryPicker } from "../../components/auth/CountryPicker";
import { CreatureAvatar } from "../../components/creatures/CreatureAvatar";
import { COUNTRIES, DEFAULT_COUNTRY } from "../../constants/countries";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { ApiError, fetchStarterCreatures } from "../../services/authService";
import type { CreatureInfo } from "../../types/auth";
import {
  passwordChecks,
  validateEmail,
  validatePassword,
  validateUsername,
} from "../../utils/validation";

type Errors = {
  nombreUsuario?: string;
  email?: string;
  password?: string;
  confirm?: string;
  criatura?: string;
  pais?: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [pais, setPais] = useState<string>(DEFAULT_COUNTRY);
  const [countryOpen, setCountryOpen] = useState(false);
  const [ciudad, setCiudad] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  // El backend exige elegir una criatura inicial (criaturaId obligatorio).
  const [starters, setStarters] = useState<CreatureInfo[]>([]);
  const [criaturaId, setCriaturaId] = useState<number | null>(null);
  const [loadingStarters, setLoadingStarters] = useState(true);
  const [startersError, setStartersError] = useState("");

  const loadStarters = useCallback(async () => {
    setLoadingStarters(true);
    setStartersError("");
    try {
      const list = await fetchStarterCreatures();
      setStarters(list);
      if (list.length === 0) {
        setStartersError(
          "Todavía no hay criaturas disponibles en el servidor. Avisa al equipo del backend.",
        );
      }
    } catch (e) {
      setStartersError(
        e instanceof ApiError
          ? e.message
          : "No se pudieron cargar las criaturas.",
      );
    } finally {
      setLoadingStarters(false);
    }
  }, []);

  useEffect(() => {
    loadStarters();
  }, [loadStarters]);

  const clear = (key: keyof Errors) => {
    setErrors((p) => ({ ...p, [key]: undefined }));
    setFormError("");
  };

  const selected = starters.find((c) => c.id === criaturaId) ?? null;

  const handleRegister = async () => {
    if (loading) return; // evita enviar dos veces
    setFormError("");
    const next: Errors = {
      nombreUsuario: validateUsername(nombreUsuario),
      email: validateEmail(email),
      pais: COUNTRIES.some((country) => country.value === pais)
        ? undefined
        : "Selecciona un país válido.",
      password: validatePassword(password),
      confirm: !confirm
        ? "Confirma tu contraseña."
        : password !== confirm
          ? "Las contraseñas no coinciden."
          : undefined,
      criatura:
        criaturaId === null ? "Elige una criatura para comenzar." : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean) || criaturaId === null) return;
    if (ciudad.trim().length > 100) {
      setFormError("La ciudad no puede superar los 100 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await register({
        nombreUsuario,
        email,
        password,
        pais,
        ciudad,
        criaturaId,
      });
      router.replace("/(tabs)");
    } catch (e) {
      if (e instanceof ApiError) {
        // Errores por campo que devuelve el backend (validación @Valid)
        const fe = e.fieldErrors;
        if (fe) {
          setErrors({
            nombreUsuario: fe.nombreUsuario,
            email: fe.email,
            password: fe.password,
            criatura: fe.criaturaId,
            pais: fe.pais,
          });
        }
        setFormError(e.message);
      } else {
        setFormError("Ocurrió un error inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
      onTouchStart={() => setCountryOpen(false)}
      onPointerDown={() => setCountryOpen(false)}
    >
      <TopBar title="Crear Cuenta" showBack onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Únete a MitoSismo</Text>
            <Text style={styles.subtitleText}>
              Prepárate, ayuda a tu comunidad y descubre los mitos protectores
            </Text>
          </View>

          {!!formError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#B71C1C" />
              <Text style={styles.errorText}>{formError}</Text>
            </View>
          )}

          <View style={styles.form}>
            <Input
              label="Nombre de usuario"
              placeholder="juanperez"
              value={nombreUsuario}
              onChangeText={(t) => {
                setNombreUsuario(t);
                clear("nombreUsuario");
              }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={50}
              error={errors.nombreUsuario}
            />
            <Input
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                clear("email");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />
            <CountryPicker
              label="País"
              value={pais}
              open={countryOpen}
              onOpenChange={setCountryOpen}
              onChange={(value) => {
                setPais(value);
                clear("pais");
              }}
            />
            {!!errors.pais && (
              <Text style={styles.fieldError}>{errors.pais}</Text>
            )}
            <Input
              label="Ciudad (opcional)"
              placeholder="Lima"
              value={ciudad}
              onChangeText={setCiudad}
              maxLength={100}
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                clear("password");
              }}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
            />

            {password.length > 0 && (
              <View style={styles.checklist}>
                {passwordChecks(password).map((c) => (
                  <View key={c.label} style={styles.checkRow}>
                    <Ionicons
                      name={c.ok ? "checkmark-circle" : "ellipse-outline"}
                      size={14}
                      color={c.ok ? "#2E7D32" : Colors.textMuted}
                    />
                    <Text
                      style={[styles.checkText, c.ok && styles.checkTextOk]}
                    >
                      {c.label}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            <Input
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={confirm}
              onChangeText={(t) => {
                setConfirm(t);
                clear("confirm");
              }}
              secureTextEntry
              autoCapitalize="none"
              error={errors.confirm}
            />

            {/* Criatura inicial */}
            <Text style={styles.sectionLabel}>Elige tu criatura guardiana</Text>
            {loadingStarters ? (
              <View style={styles.startersState}>
                <ActivityIndicator color={Colors.accent} />
                <Text style={styles.startersText}>Cargando criaturas…</Text>
              </View>
            ) : startersError ? (
              <View style={styles.startersState}>
                <Text style={styles.startersText}>{startersError}</Text>
                <Pressable onPress={loadStarters} style={styles.retry}>
                  <Text style={styles.retryText}>Reintentar</Text>
                </Pressable>
              </View>
            ) : (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.starterRow}
                >
                  {starters.map((c) => {
                    const isSelected = c.id === criaturaId;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => {
                          setCriaturaId(c.id);
                          clear("criatura");
                        }}
                        style={[
                          styles.starterCard,
                          isSelected && styles.starterSelected,
                        ]}
                      >
                        <CreatureAvatar
                          nombre={c.nombre}
                          elemento={c.elemento}
                          imageUrl={c.imageUrl}
                          size={56}
                        />
                        <Text style={styles.starterName}>{c.nombre}</Text>
                        {!!c.elemento && (
                          <Text style={styles.starterElement}>
                            {c.elemento}
                          </Text>
                        )}
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={Colors.accent}
                            style={styles.starterCheck}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>
                {selected && (
                  <Text style={styles.starterDesc}>
                    {selected.titulo ?? selected.descripcion ?? ""}
                  </Text>
                )}
              </>
            )}
            {!!errors.criatura && (
              <Text style={styles.fieldError}>{errors.criatura}</Text>
            )}

            <Button
              title="Registrarse"
              onPress={handleRegister}
              size="large"
              loading={loading}
              disabled={loadingStarters || starters.length === 0}
              style={styles.registerButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
              <Pressable onPress={() => router.back()}>
                <Text style={styles.loginLink}>Inicia sesión</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xxxl },
  header: { marginVertical: Spacing.lg },
  welcomeText: { ...Typography.titleLarge },
  subtitleText: { ...Typography.bodyMedium, marginTop: Spacing.xs },
  errorBox: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  errorText: { flex: 1, fontSize: 13, color: "#B71C1C" },
  form: { marginTop: Spacing.sm },
  checklist: { marginTop: -Spacing.xs, marginBottom: Spacing.md, gap: 4 },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkText: { fontSize: 12, color: Colors.textMuted },
  checkTextOk: { color: "#2E7D32" },
  sectionLabel: {
    ...Typography.bodyMedium,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  startersState: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
  },
  startersText: { ...Typography.bodySmall, textAlign: "center" },
  retry: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radii.full,
    backgroundColor: Colors.accent,
  },
  retryText: { color: Colors.white, fontWeight: "700", fontSize: 13 },
  starterRow: { gap: Spacing.md, paddingVertical: Spacing.xs },
  starterCard: {
    width: 110,
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  starterSelected: { borderColor: Colors.accent, backgroundColor: "#FFF3E0" },
  starterName: {
    ...Typography.bodyMedium,
    fontWeight: "700",
    marginTop: Spacing.sm,
  },
  starterElement: { fontSize: 10, color: Colors.textSecondary, marginTop: 2 },
  starterCheck: { position: "absolute", top: 6, right: 6 },
  starterDesc: { ...Typography.bodySmall, marginTop: Spacing.sm },
  fieldError: { fontSize: 12, color: "#B71C1C", marginTop: Spacing.xs },
  registerButton: { marginTop: Spacing.lg },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  footerText: { ...Typography.bodyMedium },
  loginLink: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    fontWeight: "700",
  },
});
