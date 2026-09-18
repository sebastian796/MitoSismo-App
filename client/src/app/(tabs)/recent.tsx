import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, Card, MagBadge } from '../../components';
import { quakes } from '../../constants/data';
import { Quake } from '../../types';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

export default function RecentScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('Todos');

  const countries = ['Todos', 'Perú', 'Chile', 'Ecuador', 'Colombia', 'México'];

  const filteredQuakes = quakes.filter((q) => {
    const matchesSearch =
      q.place.toLowerCase().includes(search.toLowerCase()) ||
      q.country.toLowerCase().includes(search.toLowerCase());
    const matchesCountry = countryFilter === 'Todos' || q.country === countryFilter;
    return matchesSearch && matchesCountry;
  });

  const renderQuakeItem = ({ item }: { item: Quake }) => (
    <Pressable
      onPress={() => router.push(`/quake/${item.id}`)}
      style={styles.quakeItemPressable}
    >
      <Card style={styles.quakeCard}>
        <View style={styles.cardHeader}>
          <View style={styles.magBadgeBox}>
            <Text style={styles.magValue}>{item.mag.toFixed(1)}</Text>
          </View>
          <View style={styles.cardHeaderInfo}>
            <View style={styles.badgeRow}>
              <MagBadge mag={item.mag} />
              <Text style={styles.quakeCountry}>{item.country}</Text>
            </View>
            <Text style={styles.quakePlace} numberOfLines={1}>
              {item.place}
            </Text>
          </View>
        </View>

        <View style={styles.cardDivider} />

        <View style={styles.cardFooter}>
          <View style={styles.footerItem}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{item.time}</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="swap-vertical-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>Prof: {item.depth} km</Text>
          </View>
          <View style={styles.footerItem}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.footerText}>{item.coords.split('  ')[0]}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Sismos Recientes" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ciudad o país..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Country Filter Chips */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={countries}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.chipsList}
          renderItem={({ item }) => {
            const active = countryFilter === item;
            return (
              <Pressable
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCountryFilter(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Quakes List */}
      <FlatList
        data={filteredQuakes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderQuakeItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No se encontraron sismos</Text>
            <Text style={styles.emptySub}>Prueba ajustando los filtros de búsqueda</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  chipsContainer: {
    marginVertical: Spacing.md,
  },
  chipsList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  quakeItemPressable: {
    marginBottom: Spacing.md,
  },
  quakeCard: {
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  magBadgeBox: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  magValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.primary,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  quakeCountry: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  quakePlace: {
    ...Typography.bodyMedium,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyTitle: {
    ...Typography.titleSmall,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptySub: {
    ...Typography.bodyMedium,
    marginTop: 4,
  },
});
