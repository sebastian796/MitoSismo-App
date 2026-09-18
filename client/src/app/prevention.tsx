import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, Card, Button } from '../components';
import { emergencyContacts } from '../constants/data';
import { Colors, Spacing, Typography, Radii } from '../constants/theme';

export default function PreventionScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'antes' | 'durante' | 'despues'>('durante');

  const kitItems = [
    { title: 'Agua embotellada (2L por persona)', checked: true },
    { title: 'Alimentos no perecibles (latas, barras)', checked: true },
    { title: 'Linterna y pilas de repuesto', checked: false },
    { title: 'Botiquín de primeros auxilios', checked: true },
    { title: 'Radio a pilas y silbato de auxilio', checked: false },
    { title: 'Copia de documentos de identidad', checked: false },
  ];

  const tips = {
    antes: [
      'Ubica y señaliza las zonas seguras internas y externas de tu casa o trabajo.',
      'Asegura repisas, cuadros, televisores y objetos pesados que puedan caer.',
      'Ten preparada tu mochila para emergencias cerca a la puerta de salida.',
      'Participa activamente en los simulacros nacionales de sismo.',
    ],
    durante: [
      'Mantén la calma y ubícate en la Zona Segura interna (columnas y muros portantes).',
      'Aléjate inmediatamente de ventanas, espejos y objetos de vidrio.',
      'Si estás en la calle, protégete de cables eléctricos y cornisas.',
      'No uses ascensores durante ni inmediatamente después del sismo.',
    ],
    despues: [
      'Cierra las llaves de gas y corta el suministro eléctrico principal.',
      'Utiliza mensajes de texto o internet para comunicarte y no saturar las líneas.',
      'Evacúa ordenadamente hacia el punto de reunión comunitario.',
      'Mantente informado únicamente por canales oficiales (INDECI, IGP).',
    ],
  };

  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Guía de Prevención" showBack onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase Selector Tabs */}
        <View style={styles.phaseTabs}>
          {(['antes', 'durante', 'despues'] as const).map((phase) => {
            const active = activeTab === phase;
            const label = phase === 'antes' ? 'Antes' : phase === 'durante' ? 'Durante' : 'Después';
            return (
              <Pressable
                key={phase}
                style={[styles.phaseTab, active && styles.phaseTabActive]}
                onPress={() => setActiveTab(phase)}
              >
                <Text style={[styles.phaseTabText, active && styles.phaseTabTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Phase Tips Card */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons
              name={
                activeTab === 'antes'
                  ? 'shield-checkmark'
                  : activeTab === 'durante'
                  ? 'alert-circle'
                  : 'medical'
              }
              size={22}
              color={Colors.accent}
            />
            <Text style={styles.tipsTitle}>
              {activeTab === 'antes'
                ? 'Preparación Previa'
                : activeTab === 'durante'
                ? 'Acciones Inmediatas'
                : 'Recuperación y Cuidado'}
            </Text>
          </View>

          {tips[activeTab].map((tip, idx) => (
            <View key={idx} style={styles.tipItem}>
              <View style={styles.tipNumber}>
                <Text style={styles.tipNumberText}>{idx + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </Card>

        {/* Emergency Backpack Kit */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Mochila de Emergencia (Kit Esencial)
        </Text>

        <Card style={styles.kitCard}>
          {kitItems.map((item, index) => (
            <View key={index} style={styles.kitRow}>
              <Ionicons
                name={item.checked ? 'checkbox' : 'square-outline'}
                size={20}
                color={item.checked ? '#2E7D32' : Colors.textMuted}
              />
              <Text
                style={[
                  styles.kitText,
                  item.checked && styles.kitTextChecked,
                ]}
              >
                {item.title}
              </Text>
            </View>
          ))}
        </Card>

        {/* Fast Emergency Numbers */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
          Líneas de Emergencia Directas
        </Text>

        <View style={styles.contactsGrid}>
          {emergencyContacts.map((contact, index) => (
            <Pressable
              key={index}
              style={styles.contactCard}
              onPress={() => handleCall(contact.number)}
            >
              <View style={styles.contactLeft}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactSub}>{contact.description}</Text>
              </View>
              <View style={styles.callBadge}>
                <Ionicons name="call" size={14} color={Colors.white} />
                <Text style={styles.callNumber}>{contact.number}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Back Button */}
        <Button
          title="Regresar"
          variant="outline"
          onPress={() => router.back()}
          style={styles.backButton}
        />
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
  phaseTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  phaseTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  phaseTabActive: {
    backgroundColor: Colors.primary,
  },
  phaseTabText: {
    ...Typography.bodySmall,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  phaseTabTextActive: {
    color: Colors.white,
  },
  tipsCard: {
    padding: Spacing.lg,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipsTitle: {
    ...Typography.titleSmall,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  tipNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 1,
  },
  tipNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.primary,
  },
  tipText: {
    ...Typography.bodyMedium,
    flex: 1,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  sectionTitle: {
    ...Typography.titleSmall,
    marginBottom: Spacing.md,
  },
  kitCard: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  kitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  kitText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  kitTextChecked: {
    color: Colors.textSecondary,
  },
  contactsGrid: {
    gap: Spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  contactName: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  contactSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  callBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C62828',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    gap: 4,
  },
  callNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.white,
  },
  backButton: {
    marginTop: Spacing.xl,
  },
});
