-- ============================================
-- SCHEMA CRM - VERSIÓN LIMPIA
-- Ejecutar este script completo en Supabase SQL Editor
-- ============================================

-- Limpiar todo primero (por si acaso)
DROP TABLE IF EXISTS fila_espera CASCADE;
DROP TABLE IF EXISTS rachas CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS calificaciones_hostess CASCADE;
DROP TABLE IF EXISTS mesas_clientes CASCADE;
DROP TABLE IF EXISTS visitas CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;

DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
DROP TRIGGER IF EXISTS update_mesas_updated_at ON mesas_clientes;
DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
DROP TRIGGER IF EXISTS trigger_actualizar_metricas ON visitas;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS actualizar_metricas_cliente() CASCADE;
DROP FUNCTION IF EXISTS calcular_racha_consecutiva(UUID) CASCADE;

DROP VIEW IF EXISTS vista_clientes_activos CASCADE;
DROP VIEW IF EXISTS vista_top_clientes CASCADE;
DROP VIEW IF EXISTS vista_metricas_genero CASCADE;

-- ============================================
-- CREAR TABLAS
-- ============================================

-- TABLA CLIENTES
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT UNIQUE,
  email TEXT,
  genero TEXT CHECK (genero IN ('masculino', 'femenino', 'otro', 'no_especifica')),
  fecha_nacimiento DATE,
  foto_url TEXT,
  total_visitas INTEGER DEFAULT 0,
  visitas_consecutivas INTEGER DEFAULT 0,
  ultima_visita TIMESTAMP WITH TIME ZONE,
  primera_visita TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consumo_total DECIMAL(10,2) DEFAULT 0,
  consumo_promedio DECIMAL(10,2) DEFAULT 0,
  ticket_mas_alto DECIMAL(10,2) DEFAULT 0,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  producto_favorito TEXT,
  horario_preferido TEXT,
  puntos_rewards INTEGER DEFAULT 0,
  nivel_fidelidad TEXT DEFAULT 'bronce' CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino', 'diamante')),
  qr_wallet_id TEXT UNIQUE,
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA VISITAS
CREATE TABLE visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mesa_numero TEXT NOT NULL,
  numero_personas INTEGER DEFAULT 1,
  hora_llegada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_salida TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER,
  total_consumo DECIMAL(10,2) DEFAULT 0,
  productos_consumidos JSONB DEFAULT '[]'::jsonb,
  hostess TEXT,
  mesero TEXT,
  calificacion_hostess DECIMAL(3,2),
  calificacion_servicio DECIMAL(3,2),
  calificacion_comida DECIMAL(3,2),
  comentarios TEXT,
  puntos_ganados INTEGER DEFAULT 0,
  recompensa_aplicada TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA MESAS
CREATE TABLE mesas_clientes (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'limpieza')),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT,
  numero_personas INTEGER DEFAULT 0,
  hostess TEXT,
  mesero TEXT,
  hora_asignacion TIMESTAMP WITH TIME ZONE,
  pedidos_data JSONB DEFAULT '[]'::jsonb,
  total_actual DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA CALIFICACIONES HOSTESS
CREATE TABLE calificaciones_hostess (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  hostess TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  horario TEXT NOT NULL,
  mesa_numero TEXT NOT NULL,
  calificacion_atencion DECIMAL(3,2),
  calificacion_rapidez DECIMAL(3,2),
  calificacion_amabilidad DECIMAL(3,2),
  calificacion_general DECIMAL(3,2),
  comentarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA TICKETS
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE,
  numero_ticket TEXT UNIQUE NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mesa_numero TEXT NOT NULL,
  productos JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  propina DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT,
  mesero TEXT NOT NULL,
  hostess TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA REWARDS
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('puntos', 'descuento', 'producto_gratis', 'upgrade', 'cumpleaños', 'racha')),
  descripcion TEXT NOT NULL,
  puntos INTEGER DEFAULT 0,
  valor_descuento DECIMAL(10,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  usado BOOLEAN DEFAULT false,
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  fecha_uso TIMESTAMP WITH TIME ZONE,
  visitas_requeridas INTEGER,
  consumo_minimo DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA RACHAS
CREATE TABLE rachas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('fines_semana', 'semanal', 'mensual', 'especial')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  visitas_actuales INTEGER DEFAULT 0,
  visitas_objetivo INTEGER NOT NULL,
  completada BOOLEAN DEFAULT false,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_completada TIMESTAMP WITH TIME ZONE,
  recompensa_tipo TEXT,
  recompensa_valor DECIMAL(10,2),
  recompensa_otorgada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA FILA DE ESPERA
CREATE TABLE fila_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  numero_personas INTEGER NOT NULL,
  estado TEXT DEFAULT 'esperando' CHECK (estado IN ('esperando', 'notificado', 'sentado', 'cancelado')),
  posicion INTEGER,
  hora_llegada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tiempo_espera_estimado INTEGER,
  hora_notificacion TIMESTAMP WITH TIME ZONE,
  hora_asignacion TIMESTAMP WITH TIME ZONE,
  mesa_asignada TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABLA PRODUCTOS
CREATE TABLE productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL,
  precio_compra DECIMAL(10,2) NOT NULL,
  proveedor TEXT NOT NULL,
  veces_vendido INTEGER DEFAULT 0,
  rating_promedio DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================

CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_nivel ON clientes(nivel_fidelidad);
CREATE INDEX idx_clientes_activo ON clientes(activo);
CREATE INDEX idx_clientes_genero ON clientes(genero);

CREATE INDEX idx_visitas_cliente ON visitas(cliente_id);
CREATE INDEX idx_visitas_fecha ON visitas(fecha DESC);
CREATE INDEX idx_visitas_mesa ON visitas(mesa_numero);
CREATE INDEX idx_visitas_hostess ON visitas(hostess);

CREATE INDEX idx_mesas_estado ON mesas_clientes(estado);
CREATE INDEX idx_mesas_cliente ON mesas_clientes(cliente_id);

CREATE INDEX idx_calificaciones_hostess ON calificaciones_hostess(hostess);
CREATE INDEX idx_calificaciones_fecha ON calificaciones_hostess(fecha DESC);
CREATE INDEX idx_calificaciones_horario ON calificaciones_hostess(horario);

CREATE INDEX idx_tickets_cliente ON tickets(cliente_id);
CREATE INDEX idx_tickets_fecha ON tickets(fecha DESC);
CREATE INDEX idx_tickets_numero ON tickets(numero_ticket);

CREATE INDEX idx_rewards_cliente ON rewards(cliente_id);
CREATE INDEX idx_rewards_activo ON rewards(activo, usado);

CREATE INDEX idx_rachas_cliente ON rachas(cliente_id);
CREATE INDEX idx_rachas_completada ON rachas(completada);

CREATE INDEX idx_fila_estado ON fila_espera(estado);
CREATE INDEX idx_fila_posicion ON fila_espera(posicion);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesas_updated_at
  BEFORE UPDATE ON mesas_clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar 12 mesas
INSERT INTO mesas_clientes (id, numero, capacidad, estado) VALUES
  (1, '1', 4, 'disponible'),
  (2, '2', 2, 'disponible'),
  (3, '3', 6, 'disponible'),
  (4, '4', 4, 'disponible'),
  (5, '5', 8, 'disponible'),
  (6, '6', 2, 'disponible'),
  (7, '7', 4, 'disponible'),
  (8, '8', 4, 'disponible'),
  (9, '9', 6, 'disponible'),
  (10, '10', 2, 'disponible'),
  (11, '11', 4, 'disponible'),
  (12, '12', 4, 'disponible');

-- Insertar productos
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Hamburguesa Clásica', 'Comida', 15.00, 50, 20, 'unidades', 8.00, 'Distribuidora ABC'),
  ('Pizza Margarita', 'Comida', 18.00, 30, 15, 'unidades', 10.00, 'Distribuidora ABC'),
  ('Tacos al Pastor', 'Comida', 12.00, 40, 20, 'porciones', 6.00, 'Carnicería El Buen Corte'),
  ('Alitas Picantes', 'Comida', 12.00, 35, 15, 'porciones', 6.00, 'Pollería El Gallo'),
  ('Ensalada César', 'Comida', 10.00, 25, 10, 'porciones', 5.00, 'Frutas y Verduras'),
  ('Cerveza Corona', 'Bebidas', 8.00, 100, 24, 'unidades', 5.00, 'Distribuidora ABC'),
  ('Margarita', 'Bebidas', 20.00, 50, 20, 'unidades', 12.00, 'Licores Premium'),
  ('Mojito', 'Bebidas', 15.00, 50, 20, 'unidades', 8.00, 'Licores Premium'),
  ('Café Americano', 'Bebidas', 5.00, 80, 30, 'unidades', 2.00, 'Café Premium'),
  ('Refresco', 'Bebidas', 4.00, 120, 50, 'unidades', 2.00, 'Distribuidora ABC');

-- ============================================
-- SEGURIDAD (RLS)
-- ============================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones_hostess ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rachas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_espera ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo en clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en visitas" ON visitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en mesas" ON mesas_clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en calificaciones" ON calificaciones_hostess FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en rewards" ON rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en rachas" ON rachas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en fila" ON fila_espera FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en productos" ON productos FOR ALL USING (true) WITH CHECK (true);
