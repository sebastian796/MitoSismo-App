import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Card, TopBar } from "../../components";
import { Colors, Radii, Spacing, Typography } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        title="Mi Perfil"
        rightElement={
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.gearButton}
            hitSlop={8}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={Colors.primary}
            />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        <Card style={styles.userCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={Colors.white} />
          </View>
          <Text style={styles.userName}>
            {user?.nombreUsuario ?? "Invitado"}
          </Text>
          <Text style={styles.userRole}>
            {user ? user.email : "Inicia sesión para guardar tu progreso"}
          </Text>
        </Card>
        {}
        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Sismos Reportados</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Misiones Hechas</Text>
          </Card>
          <Card style={styles.statBox}>
            <Text style={styles.statNumber}>
              {user?.dataMascota?.xpActual ?? 0}
            </Text>
            <Text style={styles.statLabel}>XP Total</Text>
          </Card>
        </View>
        {}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Medallas e Insignias
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.badgesRow}
        >
          <Card style={styles.badgeCard}>
            <View style={[styles.badgeIconBox, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="shield-checkmark" size={24} color="#2E7D32" />
            </View>
            <Text style={styles.badgeName}>Zona Segura</Text>
            <Text style={styles.badgeStatus}>Desbloqueado</Text>
          </Card>
          <Card style={styles.badgeCard}>
            <View style={[styles.badgeIconBox, { backgroundColor: "#FFF3E0" }]}>
              <Ionicons name="bag" size={24} color="#E65100" />
            </View>
            <Text style={styles.badgeName}>Mochila Lista</Text>
            <Text style={styles.badgeStatus}>En progreso</Text>
          </Card>
          <Card style={styles.badgeCard}>
            <View style={[styles.badgeIconBox, { backgroundColor: "#EDE7F6" }]}>
              <Ionicons name="flame" size={24} color="#512DA8" />
            </View>
            <Text style={styles.badgeName}>Amigo de Ignis</Text>
            <Text style={styles.badgeStatus}>Desbloqueado</Text>
          </Card>
        </ScrollView>
        {}
        {}
        {user ? (
          <Button
            title="Cerrar Sesión"
            variant="outline"
            onPress={async () => {
              await logout();
              router.replace("/");
            }}
            style={styles.logoutButton}
          />
        ) : (
          <Button
            title="Iniciar Sesión"
            onPress={() => router.push("/(auth)/login")}
            style={styles.logoutButton}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  userCard: {
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  userName: {
    ...Typography.titleMedium,
  },
  userRole: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    padding: Spacing.md,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.accent,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 2,
    fontWeight: "600",
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  badgesRow: {
    gap: Spacing.md,
  },
  badgeCard: {
    width: 120,
    padding: Spacing.md,
    alignItems: "center",
  },
  badgeIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radii.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  badgeStatus: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  settingTextCol: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    ...Typography.bodyLarge,
    fontWeight: "600",
  },
  settingSub: {
    ...Typography.bodySmall,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  logoutButton: {
    marginTop: Spacing.xl,
  },
  gearButton: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
});