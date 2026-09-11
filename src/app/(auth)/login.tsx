import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar, Logo, Input, Button } from '../../components';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Iniciar Sesión" showBack onBack={() => router.replace('/')} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
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
              <Pressable onPress={() => router.push('/(auth)/register')}>
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
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  welcomeText: {
    ...Typography.titleMedium,
    marginTop: Spacing.md,
  },
  subtitleText: {
    ...Typography.bodyMedium,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  form: {
    marginTop: Spacing.md,
  },
  loginButton: {
    marginTop: Spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    ...Typography.bodyMedium,
  },
  registerLink: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    fontWeight: '700',
  },
});
