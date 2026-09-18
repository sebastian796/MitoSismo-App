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
import { TopBar, Input, Button } from '../../components';
import { Colors, Spacing, Typography } from '../../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Crear Cuenta" showBack onBack={() => router.back()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              onChangeText={setName}
            />
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
            <Input
              label="Confirmar Contraseña"
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
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
  registerButton: {
    marginTop: Spacing.md,
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
  loginLink: {
    ...Typography.bodyMedium,
    color: Colors.accent,
    fontWeight: '700',
  },
});
