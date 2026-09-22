-- =========================
-- TABLA: usuarios
-- =========================
CREATE TABLE usuarios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('USUARIO','ADMIN')),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =========================
-- TABLA: configuraciones_usuario
-- =========================
CREATE TABLE configuraciones_usuario (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    notif_sismos BOOLEAN DEFAULT TRUE,
    notif_consejos BOOLEAN DEFAULT TRUE,
    alerta_sonora BOOLEAN DEFAULT FALSE,
    magnitud_minima NUMERIC(3,1) DEFAULT 4.5 CHECK (magnitud_minima >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_config_usuario_id ON configuraciones_usuario(usuario_id);

-- =========================
-- TABLA: criaturas (catálogo maestro)
-- =========================
CREATE TABLE criaturas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE,
    titulo VARCHAR(150),
    elemento VARCHAR(50),
    descripcion TEXT,
    mito_lore TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_criaturas_nombre ON criaturas(nombre);

-- =========================
-- TABLA: usuario_criaturas
-- =========================
CREATE TABLE usuario_criaturas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    criatura_id INTEGER REFERENCES criaturas(id) ON DELETE RESTRICT,
    nivel INTEGER DEFAULT 1 CHECK (nivel >= 1),
    xp_actual INTEGER DEFAULT 0 CHECK (xp_actual >= 0),
    activa BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_usuario_criaturas_usuario ON usuario_criaturas(usuario_id);
CREATE INDEX idx_usuario_criaturas_criatura ON usuario_criaturas(criatura_id);

-- =========================
-- TABLA: misiones
-- =========================
CREATE TABLE misiones (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150),
    descripcion TEXT,
    xp_recompensa INTEGER,
    icono VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_misiones_titulo ON misiones(titulo);

-- =========================
-- TABLA: usuario_misiones
-- =========================
CREATE TABLE usuario_misiones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    mision_id INTEGER REFERENCES misiones(id) ON DELETE CASCADE,
    progreso INTEGER DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
    completada BOOLEAN DEFAULT FALSE,
    fecha_completada TIMESTAMPTZ,
    UNIQUE(usuario_id, mision_id)
);
CREATE INDEX idx_usuario_misiones_usuario ON usuario_misiones(usuario_id);
CREATE INDEX idx_usuario_misiones_mision ON usuario_misiones(mision_id);

-- =========================
-- TABLA: insignias
-- =========================
CREATE TABLE insignias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    color_fondo VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_insignias_nombre ON insignias(nombre);

-- =========================
-- TABLA: usuario_insignias
-- =========================
CREATE TABLE usuario_insignias (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    insignia_id INTEGER REFERENCES insignias(id) ON DELETE CASCADE,
    desbloqueada BOOLEAN DEFAULT TRUE,
    fecha_desbloqueo TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, insignia_id)
);
CREATE INDEX idx_usuario_insignias_usuario ON usuario_insignias(usuario_id);
CREATE INDEX idx_usuario_insignias_insignia ON usuario_insignias(insignia_id);

-- =========================
-- TABLA: reportes_seguridad
-- =========================
CREATE TABLE reportes_seguridad (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    sismo_externo_id VARCHAR(50),
    estado_seguridad VARCHAR(50) DEFAULT 'A SALVO'
        CHECK (estado_seguridad IN ('A SALVO','EN PELIGRO','DESCONOCIDO')),
    sentido BOOLEAN DEFAULT TRUE,
    latitud NUMERIC(9,6),
    longitud NUMERIC(9,6),
    comentario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_reportes_usuario ON reportes_seguridad(usuario_id);
CREATE INDEX idx_reportes_estado ON reportes_seguridad(estado_seguridad);

-- =========================
-- TABLA: items_mochila (catálogo maestro)
-- =========================
CREATE TABLE items_mochila (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150),
    descripcion TEXT,
    obligatorio BOOLEAN DEFAULT TRUE,
    orden INTEGER DEFAULT 0
);
CREATE INDEX idx_items_mochila_nombre ON items_mochila(nombre);

-- =========================
-- TABLA: usuario_mochila_items
-- =========================
CREATE TABLE usuario_mochila_items (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE CASCADE,
    item_mochila_id INTEGER REFERENCES items_mochila(id) ON DELETE CASCADE,
    marcado BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(usuario_id, item_mochila_id)
);
CREATE INDEX idx_usuario_mochila_usuario ON usuario_mochila_items(usuario_id);
CREATE INDEX idx_usuario_mochila_item ON usuario_mochila_items(item_mochila_id);

-- =========================
-- TABLA: fases_prevencion (catálogo maestro)
-- =========================
CREATE TABLE fases_prevencion (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(20) UNIQUE,
    titulo VARCHAR(100),
    icono VARCHAR(50)
);
CREATE INDEX idx_fases_prevencion_clave ON fases_prevencion(clave);

-- =========================
-- TABLA: consejos_prevencion
-- =========================
CREATE TABLE consejos_prevencion (
    id SERIAL PRIMARY KEY,
    fase_id INTEGER REFERENCES fases_prevencion(id) ON DELETE RESTRICT,
    consejo TEXT,
    orden INTEGER DEFAULT 0
);
CREATE INDEX idx_consejos_fase ON consejos_prevencion(fase_id);

-- =========================
-- TABLA: contactos_emergencia (catálogo maestro)
-- =========================
CREATE TABLE contactos_emergencia (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    numero VARCHAR(20),
    descripcion TEXT,
    icono VARCHAR(50),
    pais VARCHAR(50) DEFAULT 'Perú',
    orden INTEGER DEFAULT 0
);
CREATE INDEX idx_contactos_nombre ON contactos_emergencia(nombre);
