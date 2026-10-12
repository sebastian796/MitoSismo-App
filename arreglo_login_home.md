## Cambios implementados

### 1. Autenticación y registro

- Integración de login y registro con la API REST de Spring Boot.
- Adaptación al nuevo `TokensDTO` y recuperación de los datos reales del usuario.
- Validación de formularios, manejo de errores y estados de carga.
- Eliminación de la autenticación simulada.

### 2. Persistencia de sesión

- Almacenamiento de tokens mediante SecureStore en dispositivos móviles.
- Uso de AsyncStorage para datos no sensibles y preferencias.
- Restauración de sesión, renovación de tokens y cierre de sesión.

### 3. Restricciones para invitados

- Acceso público a Inicio, Sismos, Mapa y Prevención.
- Restricción de funciones privadas mediante comprobación de autenticación.
- Incorporación de un modal con opciones para iniciar sesión o registrarse.

### 4. Corrección de filtros sísmicos

- Mejora de la clasificación geográfica de sismos mediante límites territoriales.
- Corrección de eventos asociados incorrectamente a países vecinos.
- Consideración de fronteras y eventos marítimos.

### 5. Mascota y perfil

- Mascota Ignis únicamente ilustrativa para invitados, sin progreso ficticio.
- Recuperación de datos reales de la criatura del usuario autenticado.
- Visualización de nivel, experiencia y características de la mascota.
- Corrección de errores de renderizado y manejo de imágenes.
- Ajuste del endpoint de consulta de criatura en Spring Boot.

### 6. Configuraciones y notificaciones

- Persistencia local de preferencias de notificaciones por usuario.
- Restricción de acceso a configuraciones privadas para invitados.

## Tecnologías utilizadas

React Native, Expo Router, TypeScript, React Hooks, Spring Boot, API REST, AsyncStorage y Expo SecureStore.

## Verificación

Pruebas manuales de navegación, autenticación y visualización de datos en Expo Web y Expo Go.
