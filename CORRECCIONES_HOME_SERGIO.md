# Correcciones de Home y Sesión Pública — MitoSismo

## Cambios implementados

### 1. Mascota pública

La pantalla Home y el Perfil muestran los datos de la mascota pública obtenidos desde la API REST de Spring Boot. Se presenta su nombre, descripción y elemento, sin asignar niveles ni experiencia a los invitados. Se incluye un ícono alternativo cuando la imagen no está disponible.

### 2. Pantalla Home

Se retiraron los filtros por países de la pantalla principal. Los sismos recientes se consultan desde la API de USGS, mostrando su magnitud, ubicación y profundidad.

Los indicadores de sismos listados y mayor magnitud se calculan a partir de los eventos recibidos. La sección Actividad Reciente presenta los últimos registros y permite actualizar la información.

### 3. Guías de prevención

Las secciones Antes, Durante y Después consultan los consejos mediante la API REST de Spring Boot. Se incorporaron estados de carga, mensajes de error y opciones para reintentar las consultas.

### 4. Registro de usuarios

El formulario de Registro cuenta con un menú desplegable para seleccionar el país. Las opciones corresponden a los valores definidos en el enum `Pais.java` del backend.

### 5. Navegación y recursos

Se incorporaron transiciones suaves entre pantallas y se corrigieron recursos PNG que presentaban errores de lectura.

## Observaciones

- Las guías de prevención muestran un mensaje cuando el servidor no devuelve consejos registrados.
- La mascota pública utiliza un ícono representativo cuando su imagen no está disponible.
- Se mantienen las restricciones de autenticación para las funcionalidades privadas.

Nuevas correcciones — Sesión Pública y Perfil

6. Restricción de misiones

Se reforzó la seguridad de las misiones para impedir que los usuarios invitados accedan a su contenido, incluso mediante rutas directas. El acceso requiere iniciar sesión y se mantienen las funcionalidades para usuarios autenticados.

7. Números de emergencia

Se integró la consulta de contactos de emergencia mediante la API REST de Spring Boot, considerando el país del usuario. Cuando no existen datos disponibles, se muestran los números gratuitos de Perú: Policía Nacional (105), Bomberos (116) y SAMU (106).

8. Perfil de usuario

Se eliminó la sección de Medallas e Insignias y se incorporó una tarjeta con una recomendación de prevención sísmica, visible tanto para invitados como para usuarios autenticados.

9. Mejoras visuales

Se ajustaron los márgenes y espacios entre elementos de Perfil y Prevención. También se corrigió la alineación del título de Perfil y se mejoró la presentación del directorio de emergencia.

10. Seguridad y compatibilidad

Se actualizaron las reglas de acceso del backend para proteger las misiones y permitir la consulta pública de contactos de emergencia, conservando las demás funcionalidades de la aplicación.
