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
import { Colors, Spacing, Typography } from "../../constants/theme";

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!email.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }

    if (!emailRegex.test(email.trim())) {
      setError(
        "Ingresa un correo electrónico válido. Ejemplo: usuario@gmail.com",
      );
      return;
    }

    if (!password.trim()) {
      setError("Ingresa tu contraseña.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.replace("/(tabs)");
    }, 600);
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

          <View style={styles.form}>
            <Input
              label="Correo Electrónico"
              placeholder="ejemplo@correo.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError("");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError("");
              }}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },

  header: {
    alignItems: "center",
    marginVertical: Spacing.xl,
  },

  welcomeText: {
    ...Typography.titleMedium,
    marginTop: Spacing.md,
  },

  subtitleText: {
    ...Typography.bodyMedium,
    textAlign: "center",
    marginTop: Spacing.xs,
  },

  form: {
    marginTop: Spacing.md,
  },

  errorText: {
    color: "#B71C1C",
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: "center",
  },

  loginButton: {
    marginTop: Spacing.lg,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },

  footerText: {
    ...Typography.bodyMedium,
  },

  registerLink: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    fontWeight: "700",
  },
});
