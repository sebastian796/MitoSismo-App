import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TopBar, QuakeCard } from '../../components';
import { fetchRecentEarthquakes } from '../../services/earthquakeService';
import type { Quake } from '../../types/earthquake';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';

export default function RecentScreen() {
  const router = useRouter();

  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('Todos');
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const countries = [
    'Todos',
    'Perú',
    'Chile',
    'Ecuador',
    'Colombia',
    'México',
  ];

  useEffect(() => {
    async function loadEarthquakes() {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchRecentEarthquakes(20);
        setQuakes(data);
      } catch (err) {
        console.error('Error al cargar sismos:', err);
        setError('No se pudieron cargar los sismos');
      } finally {
        setLoading(false);
      }
    }

    loadEarthquakes();
  }, []);

  const filteredQuakes = quakes.filter((q) => {
    const matchesSearch =
      q.place.toLowerCase().includes(search.toLowerCase()) ||
      q.country.toLowerCase().includes(search.toLowerCase());

    const matchesCountry =
      countryFilter === 'Todos' || q.country === countryFilter;

    return matchesSearch && matchesCountry;
  });

  const renderQuakeItem = ({ item }: { item: Quake }) => (
    <QuakeCard
      quake={item}
      onPress={() => router.push(`/quake/${item.id}`)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar title="Sismos Recientes" />

        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Cargando sismos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar title="Sismos Recientes" />

      {error && (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={48}
            color={Colors.textMuted}
          />
          <Text style={styles.emptyTitle}>{error}</Text>
          <Text style={styles.emptySub}>
            Verifica tu conexión a internet e inténtalo nuevamente.
          </Text>
        </View>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color={Colors.textMuted}
          style={styles.searchIcon}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ciudad o país..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons
              name="close-circle"
              size={18}
              color={Colors.textMuted}
            />
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
                <Text
                  style={[
                    styles.chipText,
                    active && styles.chipTextActive,
                  ]}
                >
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
        keyExtractor={(item) => item.id}
        renderItem={renderQuakeItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={48}
              color={Colors.textMuted}
            />
            <Text style={styles.emptyTitle}>
              No se encontraron sismos
            </Text>
            <Text style={styles.emptySub}>
              Prueba ajustando los filtros de búsqueda
            </Text>
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
