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
import { Button, Input, Logo, TopBar } from "../../components";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/authService";
import { validateEmail } from "../../utils/validation";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setFormError("");
    const next = {
      email: validateEmail(email),
      password: password ? undefined : "Ingresa tu contraseña.",
    };
    setErrors(next);
    if (next.email || next.password) return;

    setLoading(true);
    try {
      await login(email, password);
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
      <TopBar
        title="Iniciar Sesión"
        showBack
        onBack={() => router.replace("/")}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Logo size={64} />
            <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>
            <Text style={styles.subtitleText}>
              Accede a tus alertas personalizadas y misiones
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
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                setErrors((p) => ({ ...p, email: undefined }));
                setFormError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={errors.email}
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                setErrors((p) => ({ ...p, password: undefined }));
                setFormError("");
              }}
              secureTextEntry
              autoCapitalize="none"
              error={errors.password}
              onSubmitEditing={handleLogin}
            />

            <Button
              title="Ingresar"
              onPress={handleLogin}
              size="large"
              loading={loading}
              style={styles.loginButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
              <Pressable onPress={() => router.push("/(auth)/register")}>
                <Text style={styles.registerLink}>Regístrate aquí</Text>
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
  header: { alignItems: "center", marginVertical: Spacing.xl },
  welcomeText: { ...Typography.titleMedium, marginTop: Spacing.md },
  subtitleText: {
    ...Typography.bodyMedium,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  errorBox: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    borderRadius: Radii.md,
    padding: Spacing.md,
  },
  errorText: { flex: 1, fontSize: 13, color: "#B71C1C" },
  form: { marginTop: Spacing.md },
  loginButton: { marginTop: Spacing.lg },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  footerText: { ...Typography.bodyMedium },
  registerLink: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    fontWeight: "700",
  },
});
