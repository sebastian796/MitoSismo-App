# Persistencia de Configuraciones de Usuario — MitoSismo

## Funcionalidades implementadas

### 1. Configuraciones por usuario

Se implementó la persistencia de ocho preferencias de notificaciones, asociadas a cada usuario autenticado mediante PostgreSQL.

### 2. Integración con API REST

Se integraron los endpoints `GET /api/usuario/getConfig` y `PUT /api/usuario/updateConfig` para consultar y actualizar las configuraciones.

### 3. Sincronización de preferencias

Las configuraciones se recuperan al iniciar sesión y se actualizan automáticamente cuando el usuario modifica sus preferencias.

### 4. Configuraciones disponibles

Se incorporó la persistencia de activación general, alertas sísmicas, magnitud mínima, países seleccionados, consejos de prevención, horarios, recordatorios de misiones y alertas sonoras.

### 5. Seguridad de usuario

El acceso a las configuraciones requiere autenticación JWT. Cada usuario únicamente puede consultar y actualizar sus propias preferencias.

### 6. Control de errores

Se incorporaron estados de carga, confirmación de guardado, gestión de errores y control de actualizaciones simultáneas para evitar sobrescrituras.

### 7. Integración con PostgreSQL

Se actualizaron la entidad, los DTO y los servicios para admitir las ocho preferencias en la tabla `configuraciones_usuario`.

## Estado de integración

La implementación del frontend y backend está preparada. La persistencia completa requiere incorporar las cuatro columnas adicionales en PostgreSQL y realizar las pruebas de integración correspondientes.
