Nuevas funcionalidades y correcciones — MitoSismo
Cambios implementados

1. Home y sismos

Se mejoró la presentación de Home y la consulta de sismos recientes mediante la API de USGS. Se muestran estadísticas, magnitudes, ubicaciones y actividad reciente.

2. Mascota pública

Se configuró Vindrulf como mascota del usuario público. Home y Perfil muestran sus datos obtenidos desde el backend y permiten acceder a su detalle sin iniciar sesión. Se conserva la representación visual predeterminada de Aire (nube), sin mostrar XP ni progreso privado.

3. Tarjetas y detalles de mascotas

Se unificó el diseño de las tarjetas para usuarios públicos y registrados. Se mantiene la información correspondiente a cada mascota y se protege el progreso privado.

4. Mochila de emergencia

El catálogo de materiales se obtiene desde la API y la base de datos.

Usuarios públicos: visualizan los materiales atenuados y no pueden modificarlos. Al interactuar aparece el modal de inicio de sesión.
Usuarios registrados: pueden marcar y desmarcar materiales, guardando su progreso en el backend.

Se recuperaron los seis materiales originales.

5. Números de emergencia

Se reemplazaron los números definidos localmente por consultas a la API. Se incorporaron los contactos de Policía Nacional (105), Bomberos (116) y SAMU (106), almacenados en Supabase.

6. Guías de prevención

Se implementó la consulta de consejos desde la API para las tres categorías: Antes, Durante y Después. Se incorporaron nueve consejos educativos en Supabase.

7. Perfil y sesión pública

Se restringió el acceso a configuraciones y funcionalidades privadas para usuarios invitados, reutilizando los mecanismos de autenticación existentes.

8. Notificaciones

Se ocultó el selector de horario de consejos de prevención, conservando las preferencias y la persistencia de notificaciones.

9. Misiones, XP y reportes de seguridad

Se preparó la infraestructura de backend y persistencia para misiones, progreso por usuario, recompensas de XP y reportes de seguridad asociados a eventos sísmicos.

10. Seguridad y API

Se ajustaron endpoints, servicios, consultas y permisos de acceso para separar la información pública de los datos privados de cada usuario.

Base de datos

Se incorporaron y ejecutaron manualmente en Supabase los siguientes scripts SQL:

catalogo_mochila_seed.sql: recuperación de los seis materiales.
contactos_emergencia_seed.sql: registro de números de emergencia.
consejos_prevencion_seed.sql: registro de fases y consejos de prevención.
indices_progreso_idempotentes.sql: índices únicos para evitar registros duplicados.
Observaciones
Las funcionalidades públicas no exponen información privada de usuarios.
La mochila conserva el progreso individual de las cuentas autenticadas.
La integración de misiones, XP y sismos mantiene la infraestructura preparada para completar futuras reglas de negocio.
Los recursos visuales de las mascotas utilizan representaciones predeterminadas cuando no existen imágenes propias.
