Fase 0

src/constants/theme.ts → corregidos colores magFuerte.dot (→
#E8521A) y magMayor.dot (→
#B71C1C) según la tabla oficial.
src/components/core/TopBar.tsx → agregado textAlign: 'center' al título para centrarlo.

Fase 1

src/app/index.tsx → agregada animación de entrada (fade + translateY) al logo con react-native-reanimated.

Fase 2

src/app/(tabs)/recent.tsx → agregado initialNumToRender={10} y keyExtractor ajustado a String(item.id).
src/app/quake/[id].tsx → agregados: tarjeta de mapa preview con pin de magnitud, botón "Compartir Reporte" con Share.share(...).

Fase 3-5

src/app/creature.tsx → agregado efecto de respiración/escala en Ignis con useAnimatedStyle + withRepeat.
src/app/(tabs)/missions.tsx → agregada barra de progreso individual por misión usando item.progress.

Sin cambios (ya cumplían el plan)

src/app/(tabs)/map.tsx, src/app/prevention.tsx, src/app/(tabs)/profile.tsx

Pendiente-------------------------------------

Módulo Back-end (feature/backend-api-services): no existe aún en el repo.

## Inicio y Notificaciones (feature/home-notificaciones)

- `src/app/(tabs)/index.tsx`: sismos reales (USGS), selector de país, pull-to-refresh, estados de carga/error, mensaje de Ignis según magnitud.
- `src/app/settings/`: menú de Configuración y pantalla de Notificaciones (persistente, con filtros de magnitud/país, consejos, misiones y sonido).
- `src/services/notificationService.ts` + context + hook: notificaciones locales; en Expo Go/web usa avisos alternativos.
- `src/services/earthquakeService.ts`: corregido el detalle de sismo (USGS devuelve un Feature) y caché de sismos.
- Pendiente: Mapa/Misiones/Perfil aún con datos simulados; notificaciones con la app cerrada requieren push desde el backend; sincronizar configuración con configuraciones_usuario.
