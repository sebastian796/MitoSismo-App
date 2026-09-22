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
import { Colors, Spacing, Typography } from "../../constants/theme";

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = () => {
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!name.trim()) {
      setError("Ingresa tu nombre completo.");
      return;
    }

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
      setError("Ingresa una contraseña.");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("Confirma tu contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
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

          <View style={styles.form}>
            <Input
              label="Nombre Completo"
              placeholder="Juan Pérez"
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError("");
              }}
            />

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

            <Input
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setError("");
              }}
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
    marginVertical: Spacing.lg,
  },

  welcomeText: {
    ...Typography.titleLarge,
  },

  subtitleText: {
    ...Typography.bodyMedium,
    marginTop: Spacing.xs,
  },

  form: {
    marginTop: Spacing.sm,
  },

  errorText: {
    color: "#B71C1C",
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: "center",
  },

  registerButton: {
    marginTop: Spacing.md,
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

  loginLink: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    fontWeight: "700",
  },
});
