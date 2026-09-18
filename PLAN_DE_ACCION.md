# 📋 Plan de Acción Maestro: Migración MitoSismo-App (Web a React Native Expo SDK 57)

Documento de referencia operativo y técnico para el equipo de desarrollo de **MitoSismo-App**. Establece las responsabilidades, ramas de trabajo, guía de equivalencias y arquitectura del proyecto para garantizar un desarrollo en paralelo sin bloqueos ni conflictos.

---

## 📌 1. Contexto y Diagnóstico

Actualmente existen dos bases de código dentro del repositorio:
1. **`material_de_migracion/` (React Web / Figma Make)**:
   - Contiene el diseño UI/UX completo y probado de **11 pantallas interactivas** (`SplashScreen`, `LoginScreen`, `RegisterScreen`, `HomeScreen`, `RecentScreen`, `QuakeDetailScreen`, `MapScreen`, `CreatureScreen`, `MissionsScreen`, `PreventionScreen`, `ProfileScreen`).
   - Implementado con etiquetas HTML para web (`<div>`, `<svg>`, `<button>`, `<input>`, Tailwind / CSS).
   - Componentes compartidos en `material_de_migracion/components/shared.tsx` y datos simulados en `material_de_migracion/data.ts`.
2. **`src/` (React Native / Expo SDK 57)**:
   - Proyecto base móvil configurado con Expo 57, TypeScript y `expo-router`.
   - Ya cuenta con dependencias clave instaladas (`react-native-svg`, `react-native-screens`, `react-native-safe-area-context`, `@expo/vector-icons`, `react-native-reanimated`).
   - Sistema de diseño listo en `src/constants/theme.ts` y componentes base en `src/components/core/` (`Button`, `Card`, `Input`, `MagBadge`, `TopBar`) y `src/components/icons/` (`Logo`, `Ignis`).

**Objetivo General:** Migrar progresivamente todas las pantallas del diseño Web a componentes nativos de React Native en Expo SDK 57, conectándolas con una arquitectura Back-end robusta y dividiendo el trabajo entre 5 integrantes (1 Team Lead/Arquitecto, 3 Desarrolladores Front-end y 1 Desarrollador Back-end).

---

## 👥 2. Matriz de Asignación y Separación de Responsabilidades

| Rol / Integrante | Rama Git Asignada | Módulos y Pantallas | Entregables Clave | Complejidad |
| :--- | :--- | :--- | :--- | :--- |
| **Team Lead / Arquitecto** | `feature/core-fundamentos` | Core, Navegación & Estilos | Layout raíz `_layout.tsx`, Tab Layout `(tabs)/_layout.tsx`, Tokens `theme.ts`, Componentes `core/`, QA e Integración en `main`. | Media |
| **Dev Front A** | `feature/frontend-auth` | Fase 1: Auth & Onboarding | `SplashScreen`, `LoginScreen`, `RegisterScreen`, Validaciones de formularios, manejo de sesión. | Baja |
| **Dev Front B** | `feature/frontend-sismos` | Fase 2: Sismicidad & Detalle | `HomeScreen`, `RecentScreen`, `QuakeDetailScreen`, Lista optimizada `FlatList`, filtros y vista de detalle. | Media-Alta |
| **Dev Front C** | `feature/frontend-mapa-features` | Fases 3, 4 y 5: Mapa, Gamificación & Prevención | `MapScreen` (Pines interactivos), `CreatureScreen` (Ignis SVG), `MissionsScreen` (XP/Progreso), `PreventionScreen` (Guías), `ProfileScreen`. | Alta |
| **Dev Back** | `feature/backend-api-services` | Arquitectura API & Servicios | Modelado de entidades (Usuario, Sismo, Misión, Reporte), Servidor/API REST, endpoints Auth, Sismos y Gamificación. | Alta |

---

## 🚀 3. Fases de Ejecución Detalladas por Desarrollador

### Fase 0: Core, Fundamentos y Base de Diseño
**Responsable:** Team Lead / Arquitecto | **Rama:** `feature/core-fundamentos`
- **Tokens de Diseño (`src/constants/theme.ts`):**
  - Primario: `#2C1810` (Tierra oscura)
  - Acento: `#E8521A` (Fuego / Mascota Ignis)
  - Fondo: `#F8F4EE` (Arena suave)
  - Alertas de Magnitud: `#4CAF50` (Leve < 4.0), `#FF9800` (Moderado 4.0–4.9), `#E8521A` (Fuerte 5.0–6.9), `#B71C1C` (Mayor ≥ 7.0).
- **Componentes Base Reutilizables (`src/components/core/`):**
  - `Button`: Variantes primario, secundario, outline, con soporte de carga y deshabilitado.
  - `Card`: Contenedor con borde `#DDD5C5` y sombra sutil nativa.
  - `Input`: Campo con etiqueta, placeholder estilizado y manejo de errores.
  - `MagBadge`: Insignia de magnitud con color dinámico mediante función `magInfo(mag)`.
  - `TopBar`: Header móvil reutilizable con botón atrás y título centrado.
- **Navegación Base:**
  - Configurar `src/app/_layout.tsx` (Stack principal) y `src/app/(tabs)/_layout.tsx` (Bottom Tabs).

---

### Fase 1: Flujo de Autenticación & Splash
**Responsable:** Dev Front A | **Rama:** `feature/frontend-auth`
- **Archivos Web de Referencia:**
  - `material_de_migracion/screens/SplashScreen.tsx`
  - `material_de_migracion/screens/LoginScreen.tsx`
  - `material_de_migracion/screens/RegisterScreen.tsx`
- **Archivos Expo a Desarrollar:**
  - `src/app/index.tsx` (Splash inicial con temporizador o verificación de sesión)
  - `src/app/(auth)/login.tsx` (Inicio de sesión)
  - `src/app/(auth)/register.tsx` (Registro de usuario)
  - `src/app/(auth)/_layout.tsx` (Stack para autenticación)
- **Instrucciones Clave para Dev Front A:**
  1. Reemplazar `<div>` y `<form>` por `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>` y `<ScrollView>`.
  2. Sustituir `<input>` por `<TextInput>` usando `src/components/core/Input.tsx`.
  3. Utilizar `<Button>` de `src/components/core/Button.tsx` para las acciones principales.
  4. Animación suave del logo en Splash mediante `react-native-reanimated` o `Animated.timing`.
  5. Navegación:
     - De Login a Tabs: `router.replace('/(tabs)')`
     - De Login a Registro: `router.push('/(auth)/register')`

---

### Fase 2: Módulo Sísmico Principal & Detalle
**Responsable:** Dev Front B | **Rama:** `feature/frontend-sismos`
- **Archivos Web de Referencia:**
  - `material_de_migracion/screens/HomeScreen.tsx`
  - `material_de_migracion/screens/RecentScreen.tsx`
  - `material_de_migracion/screens/QuakeDetailScreen.tsx`
- **Archivos Expo a Desarrollar:**
  - `src/app/(tabs)/index.tsx` (HomeScreen / Dashboard principal)
  - `src/app/(tabs)/recent.tsx` (RecentScreen / Lista de sismos)
  - `src/app/quake/[id].tsx` (QuakeDetailScreen / Ficha técnica del sismo)
  - `src/components/quake/QuakeCard.tsx` (Tarjeta de sismo reutilizable)
- **Instrucciones Clave para Dev Front B:**
  1. **HomeScreen:** Banner de última alerta destacada con color de magnitud dinámico, acceso directo a la criatura Ignis y botón rápido para ver más sismos.
  2. **RecentScreen:** Utilizar `<FlatList>` (NO `ScrollView`) con `keyExtractor={(item) => String(item.id)}`, `initialNumToRender={10}` y filtros por país o rango de magnitud con chips horizontales.
  3. **QuakeDetailScreen:** Recibir el parámetro `id` mediante `useLocalSearchParams<{ id: string }>()`, mostrar mapa preview, coordenadas, profundidad, fecha/hora y botón para compartir reporte con `Share.share(...)`.

---

### Fase 3, 4 y 5: Mapa Interactivo, Gamificación, Prevención y Perfil
**Responsable:** Dev Front C | **Rama:** `feature/frontend-mapa-features`
- **Archivos Web de Referencia:**
  - `material_de_migracion/screens/MapScreen.tsx`
  - `material_de_migracion/screens/CreatureScreen.tsx`
  - `material_de_migracion/screens/MissionsScreen.tsx`
  - `material_de_migracion/screens/PreventionScreen.tsx`
  - `material_de_migracion/screens/ProfileScreen.tsx`
- **Archivos Expo a Desarrollar:**
  - `src/app/(tabs)/map.tsx` (Pantalla de mapa con pines)
  - `src/app/creature.tsx` (Mascota Ignis y lore mitológico)
  - `src/app/(tabs)/missions.tsx` (Misiones de preparación y XP)
  - `src/app/prevention.tsx` (Guía de prevención y números de auxilio)
  - `src/app/(tabs)/profile.tsx` (Perfil de usuario, logros y configuración)
- **Instrucciones Clave para Dev Front C:**
  1. **MapScreen:** Vista interactiva de sismos. Usar pines visuales con círculos de color según magnitud y tarjeta inferior flotante al seleccionar un punto.
  2. **CreatureScreen:** Migrar a Ignis usando `src/components/icons/Ignis.tsx` con `react-native-svg`. Añadir efecto sutil de respiración/escala con `useAnimatedStyle`.
  3. **MissionsScreen:** Barra de progreso nativa (`<View style={{ width: `${item.progress}%` }} />`), tarjetas con checks interactivos y suma de experiencia.
  4. **PreventionScreen:** Acordeón de pestañas (Antes, Durante, Después), lista de chequeo para la mochila salvadora y botón de llamada rápida de emergencia usando `Linking.openURL('tel:116')`.
  5. **ProfileScreen:** Resumen de puntos, nivel de preparación sísmica y switch de notificaciones de alerta con `<Switch>`.

---

### Módulo Back-end: Arquitectura de API, Base de Datos y Servicios
**Responsable:** Dev Back | **Rama:** `feature/backend-api-services`
- **Entregables Clave:**
  1. **Modelado y Entidades de Base de Datos:**
     - `User`: `id`, `name`, `email`, `passwordHash`, `level`, `xp`, `createdAt`.
     - `Quake`: `id`, `mag`, `place`, `depth`, `lat`, `lng`, `time`, `country`, `coords`, `fullDate`.
     - `Mission`: `id`, `title`, `description`, `xp`, `completed`, `icon`.
     - `PreventionTip`: `id`, `phase` (ANTES/DURANTE/DESPUES), `title`, `description`, `category`.
     - `CitizenReport`: `id`, `quakeId`, `userId`, `feltIntensity`, `comment`, `createdAt`.
  2. **Servidor y API REST:**
     - Configuración de entorno (`.env`), middlewares de CORS, autenticación JWT y rate limiting.
     - Endpoint de salud: `GET /api/health`.
  3. **Endpoints de Autenticación:**
     - `POST /api/auth/register` (Crea usuario, valida contraseña, devuelve JWT).
     - `POST /api/auth/login` (Autentica credenciales, devuelve JWT y perfil).
     - `GET /api/auth/profile` (Obtiene datos del usuario autenticado).
  4. **Endpoints Sísmicos:**
     - `GET /api/quakes` (Lista de sismos con query params: `minMag`, `country`, `limit`).
     - `GET /api/quakes/recent` (Últimos sismos registrados).
     - `GET /api/quakes/:id` (Detalle técnico completo).
     - Sincronización o scraper periódico con fuentes oficiales (IGP Perú / USGS) o servicio mock estructurado.
  5. **Endpoints de Gamificación:**
     - `GET /api/missions` (Lista de misiones del usuario).
     - `POST /api/missions/:id/claim` (Reclamar puntos XP al completar misión).

---

## 🗺️ 4. Arquitectura de Archivos en `MitoSismo` (Expo Router)

```
MitoSismo/
├── src/
│   ├── app/
│   │   ├── _layout.tsx               # Root Stack Layout (Theme Provider, Status Bar)
│   │   ├── index.tsx                 # Splash / Onboarding inicial (Fase 1 - Dev A)
│   │   ├── (auth)/
│   │   │   ├── _layout.tsx           # Stack para Login/Registro
│   │   │   ├── login.tsx             # Pantalla de Login nativa (Fase 1 - Dev A)
│   │   │   └── register.tsx          # Pantalla de Registro nativa (Fase 1 - Dev A)
│   │   ├── (tabs)/
│   │   │   ├── _layout.tsx           # Bottom Tabs Navigation (Inicio, Mapa, Sismos, Misiones, Perfil)
│   │   │   ├── index.tsx             # HomeScreen - Dashboard (Fase 2 - Dev B)
│   │   │   ├── map.tsx               # MapScreen (Fase 3 - Dev C)
│   │   │   ├── recent.tsx            # RecentScreen - Lista de sismos (Fase 2 - Dev B)
│   │   │   ├── missions.tsx          # MissionsScreen - Gamificación (Fase 4 - Dev C)
│   │   │   └── profile.tsx           # ProfileScreen - Usuario y configuración (Fase 5 - Dev C)
│   │   ├── quake/
│   │   │   └── [id].tsx              # QuakeDetailScreen - Detalle sísmico (Fase 2 - Dev B)
│   │   ├── creature.tsx              # CreatureScreen - Mascota Ignis / Lore (Fase 4 - Dev C)
│   │   └── prevention.tsx            # PreventionScreen - Guías y emergencias (Fase 5 - Dev C)
│   ├── components/
│   │   ├── core/
│   │   │   ├── Button.tsx            # Botón primario, secundario y con icono
│   │   │   ├── Input.tsx             # Campo de texto estilizado
│   │   │   ├── Card.tsx              # Contenedor con borde y sombra suave
│   │   │   ├── MagBadge.tsx          # Insignia de magnitud con color dinámico
│   │   │   └── TopBar.tsx            # Header nativo reutilizable
│   │   ├── icons/
│   │   │   ├── Logo.tsx              # Logo MitoSismo en react-native-svg
│   │   │   ├── Ignis.tsx             # Mascota Ignis en react-native-svg
│   │   │   └── TabIcons.tsx          # Iconos vectoriales para la barra inferior
│   │   └── quake/
│   │       ├── QuakeCard.tsx         # Tarjeta de sismo para listas
│   │       └── QuakeStats.tsx        # Indicadores de profundidad, epicentro, hora
│   ├── constants/
│   │   ├── theme.ts                  # Paleta de colores (Tierra, Fuego, Alertas), espaciados
│   │   └── data.ts                   # Datos simulados tipados de sismos y misiones
│   └── types/
│       └── index.ts                  # Interfaces TypeScript (Quake, Mission, Creature, User)
```

---

## 🔍 5. Equivalencias Web vs. React Native (Guía Rápida para el Equipo)

| En React Web (`material_de_migracion`) | En React Native (`src/`) | Consideraciones Obligatorias |
| :--- | :--- | :--- |
| `<div>`, `<section>`, `<main>` | `<View>` | En React Native el Flexbox tiene `flexDirection: 'column'` por defecto. |
| `<p>`, `<span>`, `<h1>`, `<h2>` | `<Text>` | **Regla de oro:** Todo texto DEBE estar envuelto en `<Text>`. Los strings sueltos causan error de render. |
| `<button onClick={...}>` | `<Pressable onPress={...}>` o `<TouchableOpacity>` | Usa `<Button>` de `src/components/core/Button.tsx`. |
| `<input type="text">` | `<TextInput>` | Usa `onChangeText={(text) => ...}` en lugar de `e.target.value`. |
| `style={{ overflow: 'scroll' }}` | `<ScrollView>` o `<FlatList>` | Usa siempre `<FlatList>` para listas largas o dinámicas de sismos. |
| `<svg>`, `<circle>`, `<path>` | `react-native-svg` (`<Svg>`, `<Circle>`, `<Path>`) | Respeta las coordenadas SVG existentes. |
| `window.location` / `<a href>` | `router.push('/ruta')` de `expo-router` | Importa `useRouter` de `expo-router`. |
| CSS con px (`width: '200px'`) | Numérico sin unidades (`width: 200`) | En React Native las medidas son puntos independientes de densidad. |
| `alert("Hola")` | `Alert.alert('Título', 'Mensaje')` | Importar `Alert` desde `react-native`. |

---

## 🌿 6. Flujo de Trabajo en Git para los Desarrolladores

### Paso 1: Actualizar el repositorio local
```bash
git fetch --all
git pull origin main
```

### Paso 2: Cambiarse a la rama asignada
- **Team Lead / Arquitecto:** `git checkout feature/core-fundamentos`
- **Dev Front A:** `git checkout feature/frontend-auth`
- **Dev Front B:** `git checkout feature/frontend-sismos`
- **Dev Front C:** `git checkout feature/frontend-mapa-features`
- **Dev Back:** `git checkout feature/backend-api-services`

### Paso 3: Desarrollar y realizar commits descriptivos
```bash
git add .
git commit -m "feat(auth): transformar LoginScreen a componente nativo TextInput con validaciones"
```

### Paso 4: Subir cambios a su rama remota
```bash
git push origin <nombre-de-tu-rama>
```

### Paso 5: Crear Pull Request (PR) hacia `main`
- Abrir un Pull Request en GitHub hacia `main`.
- El Team Lead revisará el código y ejecutará las pruebas antes de realizar el merge.

---

## 🧪 7. Plan de Verificación y Pruebas

1. **Verificación de Tipos Estricta:**
   ```bash
   npx tsc --noEmit
   ```
   No debe haber errores de tipos en TypeScript antes de solicitar la revisión de PR.

2. **Prueba en Dispositivo Móvil / Emulador:**
   ```bash
   npx expo start
   ```
   - Escanear el código QR con la app **Expo Go** en Android o iOS.
   - En emulador: presionar `a` para Android o `i` para iOS simulator.

3. **Checklist de Pruebas de Navegación y UI:**
   - [ ] Splash screen transiciona correctamente a Login o a Home.
   - [ ] El teclado no tapa los campos de texto en Login/Registro (`KeyboardAvoidingView`).
   - [ ] El listado de sismos recientes tiene scroll fluido sin saltos de frames.
   - [ ] Al presionar una tarjeta de sismo, navega a `quake/[id]` con los datos correctos.
   - [ ] Los iconos y colores de magnitud cambian correctamente según el valor del sismo.
