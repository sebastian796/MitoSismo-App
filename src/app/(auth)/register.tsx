import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { DEFAULT_COUNTRY } from "../../constants/countries";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/authService";
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
};
export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [pais, setPais] = useState<string>(DEFAULT_COUNTRY);
  const [ciudad, setCiudad] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const clear = (key: keyof Errors) => {
    setErrors((p) => ({ ...p, [key]: undefined }));
    setFormError("");
  };
  const handleRegister = async () => {
    setFormError("");
    const next: Errors = {
      nombreUsuario: validateUsername(nombreUsuario),
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: !confirm
        ? "Confirma tu contraseña."
        : password !== confirm
          ? "Las contraseñas no coinciden."
          : undefined,
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    if (ciudad.trim().length > 100) {
      setFormError("La ciudad no puede superar los 100 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await register({ nombreUsuario, email, password, pais, ciudad });
      router.replace("/(tabs)");
    } catch (e) {
      setFormError(
        e instanceof ApiError ? e.message : "Ocurrió un error inesperado.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
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
              maxLength={20}
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
            <CountryPicker label="País" value={pais} onChange={setPais} />
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
              onSubmitEditing={handleRegister}
            />
            <Button
              title="Registrarse"
              onPress={handleRegister}
              size="large"
              loading={loading}
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
  registerButton: { marginTop: Spacing.md },
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