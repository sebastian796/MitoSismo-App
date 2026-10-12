import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/Button";

/**
 * Aviso dentro de la app (no usa alertas del navegador) que aparece cuando un
 * invitado intenta usar una función que requiere cuenta. Se muestra desde
 * `requireAuth()` de AuthContext y se monta una sola vez en el layout raíz.
 */
export function AuthRequiredModal() {
  const router = useRouter();
  const { authPrompt, closeAuthPrompt } = useAuth();

  const go = (path: "/(auth)/login" | "/(auth)/register") => {
    closeAuthPrompt();
    router.push(path);
  };

  return (
    <Modal
      visible={authPrompt.visible}
      transparent
      animationType="fade"
      onRequestClose={closeAuthPrompt}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed" size={24} color={Colors.accent} />
          </View>
          <Text style={styles.title}>{authPrompt.title}</Text>
          <Text style={styles.message}>{authPrompt.message}</Text>

          <Button
            title="Iniciar sesión"
            onPress={() => go("/(auth)/login")}
            style={styles.button}
          />
          <Button
            title="Registrarse"
            variant="outline"
            onPress={() => go("/(auth)/register")}
            style={styles.button}
          />
          <Pressable onPress={closeAuthPrompt} style={styles.cancel}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  sheet: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: Colors.background,
    borderRadius: Radii.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#FFF3E0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: { ...Typography.titleSmall, textAlign: "center" },
  message: {
    ...Typography.bodyMedium,
    textAlign: "center",
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  button: { width: "100%", marginTop: Spacing.sm },
  cancel: { paddingVertical: Spacing.md },
  cancelText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});
