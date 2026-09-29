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

## Autenticación (feature/auth-conectado)

Login y registro del front conectados al contrato de la API de autenticación, con validaciones, sesión persistente y un modo simulado para desarrollar sin backend. Solo se modifica `src/`, `package.json` y `app.json`; no se toca `server/`.

### Flujo

- **Pantalla inicial** (`src/app/index.tsx`): espera a que `AuthContext` restaure la sesión. Con sesión válida redirige a `/(tabs)`. Sin sesión ofrece Iniciar Sesión, Crear Cuenta o Explorar sin cuenta (invitado).
- **Registro** (`src/app/(auth)/register.tsx`): nombre de usuario (3–20), correo, país (lista, por defecto Perú), ciudad opcional, contraseña con lista de requisitos en vivo y confirmación. Se valida antes de enviar.
- **Login** (`src/app/(auth)/login.tsx`): valida correo y contraseña no vacía; los errores del servidor se muestran en un aviso, sin cerrar la app.
- **Sesión** (`src/context/AuthContext.tsx`): expone `user`, `isAuthenticated`, `loading`, `login`, `register` y `logout` mediante `useAuth()`. Al abrir la app valida el access token (`/validacion`), lo renueva con el refresh token (`/reflesh`) si venció y, si no hay conexión, conserva la sesión guardada.
- **Perfil e Inicio**: muestran el nombre, correo y XP del usuario autenticado; como invitado, el Perfil muestra "Invitado" y un botón de Iniciar Sesión. Cerrar sesión borra los tokens, llama a `/invalidacion` y vuelve a la pantalla inicial.

### Archivos

| Archivo                                 | Función                                                                                                |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `src/config/api.ts`                     | URL base (autodetecta la IP del equipo de desarrollo), `DEFAULT_CREATURE_ID` y bandera `USE_MOCK_AUTH` |
| `src/services/authService.ts`           | Llamadas a la API, timeout de 12 s y traducción de errores a mensajes claros                           |
| `src/services/apiError.ts`              | Clase `ApiError` (status 0 = sin conexión)                                                             |
| `src/services/sessionStorage.ts`        | Tokens en `expo-secure-store` (en web, `AsyncStorage`); usuario en `AsyncStorage`                      |
| `src/services/mockAuth.ts`              | Servidor simulado local (solo desarrollo)                                                              |
| `src/context/AuthContext.tsx`           | Estado de sesión global                                                                                |
| `src/utils/validation.ts`               | Reglas de validación idénticas a las del backend                                                       |
| `src/constants/countries.ts`            | Lista de países con los valores del enum `Pais`                                                        |
| `src/components/auth/CountryPicker.tsx` | Selector de país                                                                                       |
| `src/types/auth.ts`                     | Tipos de usuario, sesión y criatura                                                                    |

### Contrato con el backend

| Acción        | Endpoint                              | Envía                                                                       | Recibe                                                                              |
| ------------- | ------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Registro      | `POST /api/auth/registrar`            | `nombreUsuario`, `email`, `password`, `pais` (enum), `ciudad`, `criaturaId` | `id`, `nombreUsuario`, `email`, `rol`, `accessToken`, `refreshToken`, `dataMascota` |
| Login         | `POST /api/auth/login`                | `email`, `password`                                                         | igual que registro                                                                  |
| Validar token | `POST /api/auth/validacion`           | `{ token }`                                                                 | `boolean`                                                                           |
| Renovar       | `POST /api/auth/reflesh`              | `{ token }` (refresh)                                                       | `{ accessToken, refreshToken }`                                                     |
| Cerrar sesión | `POST /api/auth/invalidacion?userId=` | —                                                                           | 200                                                                                 |

Reglas de validación (espejo de `UserCreateRequest`): `nombreUsuario` de 3 a 20 caracteres; contraseña de mínimo 6 con al menos una letra, un número y un símbolo de `@$!%*?&`, y solo esos caracteres; país obligatorio.

Errores: los fallos de credenciales y correo repetido hoy llegan como HTTP 500 con `message` ("Correo Registrado", "Usuario No Existente", "Password Incorrecto"). El front los distingue por ese texto y también reconoce 401 y 409 si se cambian. Un 400 en login se muestra como credenciales incorrectas.

### Requisitos para usar el servidor real

- Servidor Spring en el puerto 8080 con PostgreSQL y la variable `JWT_SECRET`.
- Tabla `criaturas` con Ignis en `id = 1` (o ajustar `DEFAULT_CREATURE_ID`); el registro falla si no existe.
- CORS habilitado en el backend para probar en web (`localhost:8081`).
- Emulador Android: `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080/api`. En celular físico se usa la IP de la PC y el puerto 8080 debe estar permitido en el firewall.

### Modo simulado (sin backend)

Crear `.env.local` en la raíz (ignorado por git) con `EXPO_PUBLIC_USE_MOCK_AUTH=true` y reiniciar con `npx expo start -c`. Los usuarios se guardan en el propio dispositivo con contraseñas sin cifrar; es solo para desarrollo. Sin ese archivo, la app usa el backend real.

### Pendiente

- Estadísticas del Perfil (sismos reportados, misiones) y medallas siguen con datos fijos hasta contar con endpoints.
- Cuando existan endpoints de perfil o XP, sustituir los datos guardados en el dispositivo por consultas con el `accessToken`.
- Sincronizar la configuración de notificaciones con `configuraciones_usuario`.
