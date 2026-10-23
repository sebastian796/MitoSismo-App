import React, { useEffect, useRef, useState } from 'react';
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
import { fetchRecentEarthquakePage } from '../../services/earthquakeService';
import type { Quake } from '../../types/earthquake';
import { Colors, Spacing, Typography, Radii } from '../../constants/theme';
export default function RecentScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('Todos');
  const [quakes, setQuakes] = useState<Quake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const requestId = useRef(0);
  const countries = [
    'Todos',
    'Perú',
    'Chile',
    'Ecuador',
    'Colombia',
    'México',
    'Internacional',
  ];
  useEffect(() => {
    let active = true;
    const currentRequest = ++requestId.current;
    async function loadEarthquakes() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchRecentEarthquakePage(
          page,
          10,
          countryFilter === 'Todos' ? undefined : countryFilter,
        );
        if (!active || currentRequest !== requestId.current) return;
        setQuakes(result.quakes);
        setHasNextPage(result.hasNextPage);
      } catch (err) {
        if (!active || currentRequest !== requestId.current) return;
        console.error('Error al cargar sismos:', err);
        setError('No se pudieron cargar los sismos');
      } finally {
        if (active && currentRequest === requestId.current) setLoading(false);
      }
    }
    loadEarthquakes();
    const timer = setInterval(() => { void loadEarthquakes(); }, 60_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [countryFilter, page]);

  const changeCountry = (country: string) => {
    setPage(1);
    setCountryFilter(country);
  };
  const filteredQuakes = quakes.filter((q) => {
    const matchesSearch =
      q.place.toLowerCase().includes(search.toLowerCase()) ||
      q.country.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
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
      {}
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
      {}
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
      {/* Filtros para seleccionar un país. */}
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
                onPress={() => changeCountry(item)}
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
      {/* Lista de sismos encontrados. */}
      <FlatList
        data={filteredQuakes}
        keyExtractor={(item) => item.id}
        initialNumToRender={10}
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
        ListFooterComponent={
          !error && (quakes.length > 0 || page > 1) ? (
            <View style={styles.pagination}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Página anterior"
                disabled={page === 1 || loading}
                style={[styles.pageButton, (page === 1 || loading) && styles.pageButtonDisabled]}
                onPress={() => setPage((value) => Math.max(1, value - 1))}
              >
                <Ionicons name="chevron-back" size={17} color={Colors.white} />
                <Text style={styles.pageButtonText}>Anterior</Text>
              </Pressable>
              <Text style={styles.pageIndicator}>Página {page}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Página siguiente"
                disabled={!hasNextPage || loading}
                style={[styles.pageButton, (!hasNextPage || loading) && styles.pageButtonDisabled]}
                onPress={() => setPage((value) => value + 1)}
              >
                <Text style={styles.pageButtonText}>Siguiente</Text>
                <Ionicons name="chevron-forward" size={17} color={Colors.white} />
              </Pressable>
            </View>
          ) : null
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
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  pageButtonDisabled: { opacity: 0.4 },
  pageButtonText: { color: Colors.white, fontWeight: '600', fontSize: 12 },
  pageIndicator: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
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
