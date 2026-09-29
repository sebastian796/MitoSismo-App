import { Redirect, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Logo } from "../components";
import { Colors, Spacing, Typography } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { loading, isAuthenticated } = useAuth();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });
    translateY.value = withTiming(0, {
      duration: 700,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!loading && isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animated.View style={[styles.content, animatedStyle]}>
          <Logo size={96} />
          <Text style={styles.title}>MitoSismo</Text>
          <Text style={styles.subtitle}>
            Alerta, prevención y sabiduría ancestral ante sismos
          </Text>
        </Animated.View>

        <View style={styles.actions}>
          {loading ? (
            <ActivityIndicator size="large" color={Colors.accent} />
          ) : (
            <>
              <Button
                title="Iniciar Sesión"
                onPress={() => router.push("/(auth)/login")}
                size="large"
                style={styles.button}
              />
              <Button
                title="Crear Cuenta"
                variant="outline"
                onPress={() => router.push("/(auth)/register")}
                size="medium"
                style={styles.button}
              />
              <Pressable
                onPress={() => router.replace("/(tabs)")}
                style={styles.guest}
              >
                <Text style={styles.guestText}>Explorar sin cuenta</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: {
    ...Typography.titleLarge,
    fontSize: 32,
    color: Colors.primary,
    marginTop: Spacing.xl,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...Typography.bodyMedium,
    textAlign: "center",
    marginTop: Spacing.sm,
    maxWidth: 260,
    lineHeight: 20,
  },
  actions: {
    width: "100%",
    gap: Spacing.md,
    minHeight: 150,
    justifyContent: "center",
  },
  button: { width: "100%" },
  guest: { alignItems: "center", paddingVertical: Spacing.sm },
  guestText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
});
