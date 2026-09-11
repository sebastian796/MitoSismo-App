import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Logo, Button } from '../components';
import { Colors, Spacing, Typography } from '../constants/theme';

export default function SplashScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Logo size={96} />
          
          <Text style={styles.title}>MitoSismo</Text>
          <Text style={styles.subtitle}>
            Alerta, prevención y sabiduría ancestral ante sismos
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Ingresar a la App"
            onPress={() => router.replace('/(tabs)')}
            size="large"
            style={styles.mainButton}
          />
          <Button
            title="Iniciar Sesión"
            variant="outline"
            onPress={() => router.push('/(auth)/login')}
            size="medium"
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...Typography.titleLarge,
    fontSize: 32,
    color: Colors.primary,
    marginTop: Spacing.xl,
    letterSpacing: 0.5,
  },
  subtitle: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 260,
    lineHeight: 20,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  mainButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});
