# Informe Técnico de Análisis y Guía de Corrección: MitoSismo (React Native)

Este documento detalla el diagnóstico integral del código frontend de **MitoSismo**, desarrollado con **React Native (Expo Router v57)**. Toda la información ha sido clasificada por gravedad y organizada según las secciones clave de la aplicación: **Inicio y Login**, **Mapa Interactivo**, **Lista de Sismos**, **Misiones** y **Configuración**.

---

## 1. Correcciones Urgentes (Bloqueantes)

Aquellos fallos que impiden la compilación de TypeScript o rompen el ciclo de vida de la autenticación.

### 1.1 Errores de Compilación TypeScript (`tsc --noEmit`)

Al ejecutar el validador estricto de tipos de TypeScript se detectan 4 errores críticos que impiden un build limpio de producción:

#### A. Incompatibilidad de referencia Web en `map.web.tsx`
* **Ubicación:** [src/app/(tabs)/map.web.tsx:119](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/map.web.tsx#L119)
* **Error:** `TS2769: Type 'RefObject<HTMLDivElement | null>' is not assignable to type 'Ref<View> | undefined'`.
* **Causa:** `mapElementRef` está tipado como `useRef<HTMLDivElement | null>(null)`. En React Native Web, pasar una referencia del DOM nativo a un componente `<View>` de React Native genera un conflicto de firmas en React 19 / TypeScript 6.
* **Solución:**
  En entorno web, renderizar un elemento nativo `div` o castear la referencia:
  ```tsx
  // Opción recomendada para entorno Web:
  <div ref={mapElementRef as any} style={StyleSheet.flatten(styles.map) as any} />
  ```

#### B. Propiedad inexistente `absoluteFillObject` en `QuakeMapPreview.tsx` y `QuakeMapPreview.web.tsx`
* **Ubicaciones:**
  - [src/components/QuakeMapPreview.tsx:54](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/components/QuakeMapPreview.tsx#L54)
  - [src/components/QuakeMapPreview.web.tsx:92](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/components/QuakeMapPreview.web.tsx#L92)
* **Error:** `TS2551: Property 'absoluteFillObject' does not exist on type 'typeof StyleSheet'. Did you mean 'absoluteFill'?`.
* **Causa:** En las definiciones actuales de React Native (`@types/react-native` y React Native moderno), la propiedad correcta exportada es `StyleSheet.absoluteFill`.
* **Solución:**
  ```tsx
  // Reemplazar:
  map: {
    ...StyleSheet.absoluteFill,
  },
  ```

#### C. Conflicto de referencia en `QuakeMapPreview.web.tsx`
* **Ubicación:** [src/components/QuakeMapPreview.web.tsx:70](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/components/QuakeMapPreview.web.tsx#L70)
* **Error:** Mismo conflicto que el punto A: `<View ref={mapElementRef} ... />` recibe un `HTMLDivElement`.
* **Solución:** Aplicar la misma solución que el punto A (`<div ref={mapElementRef as any} ... />`).

---

### 1.2 Bug Crítico en la Restauración de Sesión (Login / Sesión)
* **Ubicación:** [src/context/AuthContext.tsx:32-45](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/context/AuthContext.tsx#L32-L45)
* **Problema:**
  ```typescript
  async function restoreSession(): Promise<AuthSession | null> {
    const stored = await loadSession();
    if (!stored) return null;
    try {
      if (await isTokenValid(stored.tokens.accessToken)) return stored; // ⚠️ ERROR AQUÍ
      const tokens = await refreshTokens(stored.tokens.refreshToken);
      const renewed = { ...stored, tokens };
      await saveSession(renewed);
      return renewed;
    } catch (e) {
      ...
    }
  }
  ```
  La función `isTokenValid` invoca al endpoint `/auth/validacion`. Sin embargo, dicho endpoint en el backend está diseñado para buscar en la base de datos de **Refresh Tokens**, no tokens de acceso JWT.
* **Consecuencia:** Como se envía el `accessToken`, la validación **siempre falla (retorna `false`)**. Por lo tanto, cada vez que la app arranca o se recarga, invalida forzosamente el token y ejecuta una rotación innecesaria del `refreshToken`.
* **Cómo solucionarlo en React Native:**
  Validar la caducidad del JWT directamente en el cliente decodificando el campo `exp` del payload base64 sin hacer peticiones innecesarias a la red:
  ```typescript
  function isJwtExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;
      const decodedJson = JSON.parse(atob(payloadBase64));
      const exp = decodedJson.exp; // Timestamp en segundos
      if (!exp) return true;
      return Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  }

  // En restoreSession:
  if (!isJwtExpired(stored.tokens.accessToken)) {
    return stored;
  }
  // Solo si ya expiró el accessToken, recurrir a refreshTokens
  const tokens = await refreshTokens(stored.tokens.refreshToken);
  ```

---

## 2. Errores (Bugs y Fallas de Estabilidad)

### 2.1 Lista de Sismos: Condiciones de Carrera (*Race Conditions*)
* **Ubicación:** [src/app/(tabs)/recent.tsx:33-51](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/recent.tsx#L33-L51)
* **Problema:** Al hacer clic rápido entre los filtros de país (por ejemplo, de "Chile" a "Perú"), se disparan dos peticiones `fetchRecentEarthquakes` simultáneas. No hay identificador ni señal de cancelación. Si la petición de "Chile" tarda más en responder que la de "Perú", la respuesta de Chile sobrescribe el estado `quakes`, dejando la pantalla mostrando sismos de Chile mientras el filtro activo visualmente es "Perú".
* **Cómo solucionarlo:**
  Implementar un ID de solicitud correlativo (`useRef`) tal como se hizo en [src/app/(tabs)/index.tsx:50-72](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/index.tsx#L50-L72):
  ```typescript
  const requestId = useRef(0);

  useEffect(() => {
    const currentId = ++requestId.current;
    async function load() {
      try {
        setLoading(true);
        const data = countryFilter === 'Todos'
          ? await fetchRecentEarthquakes(20)
          : await fetchRecentEarthquakes(20, countryFilter);
        if (currentId !== requestId.current) return; // Se descarta si ya no es la última
        setQuakes(data);
      } finally {
        if (currentId === requestId.current) setLoading(false);
      }
    }
    load();
  }, [countryFilter]);
  ```

### 2.2 Lista de Sismos: Parpadeo Extremo de UI (*Flicker*)
* **Ubicación:** [src/app/(tabs)/recent.tsx:64-73](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/recent.tsx#L64-L73)
* **Problema:**
  ```tsx
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
  ```
  Cada vez que el usuario cambia de país, `loading` pasa a `true`, lo que desmonta completamente la barra de búsqueda y los botones de filtro. Esto genera un parpadeo visual molesto y pérdida de contexto.
* **Cómo solucionarlo:**
  Eliminar el retorno condicional prematuro. Dejar siempre visible la cabecera, buscador y filtros, y colocar el `ActivityIndicator` dentro del cuerpo de la lista:
  ```tsx
  {loading ? (
    <ActivityIndicator style={{ marginTop: 40 }} size="large" color={Colors.accent} />
  ) : (
    <FlatList ... />
  )}
  ```

### 2.3 Fugas de Memoria por Desmontaje (*Memory Leaks*)
* **Ubicaciones:**
  - [src/app/(tabs)/map.tsx:41-56](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/map.tsx#L41-L56)
  - [src/app/quake/[id].tsx:31-52](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/quake/[id].tsx#L31-L52)
* **Problema:** Las peticiones asíncronas no tienen una bandera de montado (`isMounted`) ni `AbortController`. Si el usuario entra a ver un sismo y vuelve atrás inmediatamente antes de que responda la API de USGS, se invoca `setLoading(false)` y `setQuake(data)` sobre un componente ya destruido.
* **Cómo solucionarlo:**
  ```typescript
  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const data = await fetchEarthquakeById(id);
        if (isMounted) setQuake(data);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { isMounted = false; };
  }, [id]);
  ```

### 2.4 Mapa Web: Importación Dinámica Innecesaria y Popups sin Navegación
* **Ubicación:** [src/app/(tabs)/map.web.tsx:77-98](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/map.web.tsx#L77-L98)
* **Problema:**
  1. En `updateMarkers()`, se ejecuta `const leaflet = await import('leaflet')` cada vez que el usuario interactúa con los filtros de magnitud (`visibleQuakes`).
  2. Los popups creados mediante `bindPopup(...)` contienen texto HTML plano que no permite navegar a la pantalla de detalle `/quake/[id]`.
* **Cómo solucionarlo:**
  Reutilizar la librería importada y registrar un evento `click` sobre el marcador:
  ```typescript
  marker.on('click', () => {
    router.push(`/quake/${quake.id}`);
  });
  ```

### 2.5 Misiones: Pérdida Total de Datos
* **Ubicación:** [src/app/(tabs)/missions.tsx:10-23](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/missions.tsx#L10-L23)
* **Problema:** El estado de las misiones completadas reside exclusivamente en `useState<Mission[]>(initialMissions)`. Al salir de la pestaña o cerrar la aplicación, se reinicia al 0%.
* **Cómo solucionarlo:**
  Persistir el progreso localmente con `AsyncStorage`:
  ```typescript
  const MISSIONS_KEY = '@mitosismo:missions';

  // Cargar al montar:
  useEffect(() => {
    AsyncStorage.getItem(MISSIONS_KEY).then(raw => {
      if (raw) setMissionsList(JSON.parse(raw));
    });
  }, []);

  // Guardar al alternar:
  const toggleMission = async (id: number) => {
    const updated = missionsList.map(m =>
      m.id === id ? { ...m, completed: !m.completed, progress: m.completed ? 0 : 100 } : m
    );
    setMissionsList(updated);
    await AsyncStorage.setItem(MISSIONS_KEY, JSON.stringify(updated));
  };
  ```

---

## 3. Inconsistencias

### 3.1 Cero Uso de Localización GPS
* **Ubicación:** Todo el proyecto ([package.json](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/package.json), [map.tsx](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/map.tsx#L12-L17), [index.tsx](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/index.tsx#L45))
* **Inconsistencia:** La aplicación se presenta como un sistema de alerta sísmica en tiempo real, pero:
  1. No tiene instalada la dependencia `expo-location`.
  2. El mapa tiene coordenadas fijas e inmutables en Perú (`lat: -9.19, lng: -75.02`).
  3. No se calcula la distancia (km) entre el usuario y los epicentros.
  4. El país inicial de la Home y del Mapa siempre es "Perú", ignorando la ubicación real del dispositivo e ignorando el país con el que se registró el usuario en `user.pais`.

### 3.2 Bounding Boxes Rígidos en la API Externa
* **Ubicación:** [src/services/earthquakeService.ts:4-35](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/services/earthquakeService.ts#L4-L35)
* **Inconsistencia:** `COUNTRY_BOUNDS` utiliza límites rectangulares (`minlatitude`, `maxlatitude`, etc.). La geografía de Sudamérica no es rectangular; sismos ocurridos en el sur de Ecuador o norte de Chile son clasificados erróneamente como Perú (y viceversa).
* **Solución recomendada:** Basar el filtrado final en la propiedad `place` o geocodificación inversa, y permitir consultar la región andina unificada.

### 3.3 Advertencia de Estilos Deprecados en Sombras
* **Ubicación:** [src/constants/theme.ts:96-124](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/constants/theme.ts#L96-L124) y [src/components/ui/Card.tsx:33](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/components/ui/Card.tsx#L33)
* **Inconsistencia:** Se usan propiedades `shadowColor`, `shadowOffset`, `shadowOpacity` y `shadowRadius` que en React Native Web y nuevas arquitecturas de React Native emiten la advertencia:
  `Web WARN "shadow*" style props are deprecated. Use "boxShadow"`.
* **Solución:**
  En `theme.ts`, definir las sombras con `Platform.select`:
  ```typescript
  import { Platform } from 'react-native';

  export const Shadows = {
    sm: Platform.select({
      web: { boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)' },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
      },
    }),
  };
  ```

### 3.4 Botón "Estoy a Salvo" Ficticio
* **Ubicación:** [src/app/quake/[id].tsx:54-60](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/quake/[id].tsx#L54-L60)
* **Inconsistencia:** La función `handleReportSafe` únicamente llama a `Alert.alert('Reporte Enviado')`. No guarda nada en el dispositivo ni permite compartir el estado vía WhatsApp o SMS con contactos de emergencia.

---

## 4. Mejoras

### 4.1 Mapa Interactivo: Animación y Centrado al Seleccionar un Sismo
* **Ubicación:** [src/app/(tabs)/map.tsx:93-115](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/map.tsx#L93-L115)
* **Mejora:** Cuando el usuario selecciona un sismo en la lista inferior (`visibleQuakes.slice(0, 20)`), el mapa no reacciona.
* **Cómo implementarlo:**
  Crear una referencia `const mapRef = useRef<MapView>(null);` y añadir:
  ```typescript
  const handleSelectQuake = (quake: Quake) => {
    setSelected(quake);
    mapRef.current?.animateToRegion({
      latitude: quake.lat,
      longitude: quake.lng,
      latitudeDelta: 2.5,
      longitudeDelta: 2.5,
    }, 800);
  };
  ```

### 4.2 Lista de Sismos: Pull-to-Refresh y Filtros Avanzados
* **Ubicación:** [src/app/(tabs)/recent.tsx](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(tabs)/recent.tsx)
* **Mejoras recomendadas:**
  1. Añadir `RefreshControl` en la `FlatList` para actualizar manualmente sin reiniciar la app.
  2. Implementar selector de magnitud mínima (`Todos`, `M≥4.0`, `M≥5.0`, `M≥6.0`) idéntico al del mapa.
  3. Soporte para ordenamiento: "Más reciente" o "Mayor magnitud".


* **Optimización:**
  Consultar a la API de USGS con una única llamada que cubra la latitud/longitud global de Sudamérica (`minmagnitude: 4.0`, `limit: 30`) y clasificar internamente los sismos en lugar de emitir 5 peticiones separadas por país.

### 4.4 Caché Offline para Modo Sin Conexión
* **Ubicación:** [src/services/earthquakeService.ts:2](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/services/earthquakeService.ts#L2)
* **Mejora:** Guardar la última respuesta exitosa en `AsyncStorage`. Si el usuario se queda sin conexión durante una emergencia, la app podrá mostrar los últimos sismos registrados y los protocolos de prevención en lugar de una pantalla de error.

---

## 5. Consejos de Arquitectura y Buenas Prácticas

1. **Configurar Google Maps para Builds Nativos (Android):**
   - Para que `react-native-maps` funcione en un APK o AAB de Android sin cerrarse, debe agregarse la API key en `app.json`:
     ```json
     "android": {
       "config": {
         "googleMaps": {
           "apiKey": "TU_GOOGLE_MAPS_API_KEY"
         }
       }
     }
     ```
2. **Implementar Geocodificación y Permisos de Ubicación (`expo-location`):**
   - Instalar `npx expo install expo-location`.
   - Crear un hook `useUserLocation` que solicite permisos, obtenga la posición actual y determine el país del usuario automáticamente al abrir la aplicación.

4. **Validación de Formularios Reactiva:**
   - En [src/app/(auth)/login.tsx](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(auth)/login.tsx) y [register.tsx](file:///home/shadow/Documentos/Proyectos/MitoSismo-App/src/app/(auth)/register.tsx), añadir soporte para la tecla "Enter / Done" en el teclado virtual (`returnKeyType="next"` y `returnKeyType="go"`) para mejorar la experiencia de usuario móvil.

---

