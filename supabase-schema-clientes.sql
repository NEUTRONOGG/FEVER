-- Schema CRM Orientado a Clientes - Sistema FEVER
-- Ejecutar este script en el SQL Editor de Supabase

-- ============================================
-- TABLA DE CLIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT UNIQUE,
  email TEXT,
  genero TEXT CHECK (genero IN ('masculino', 'femenino', 'otro', 'no_especifica')),
  fecha_nacimiento DATE,
  foto_url TEXT,
  
  -- Métricas de fidelización
  total_visitas INTEGER DEFAULT 0,
  visitas_consecutivas INTEGER DEFAULT 0,
  ultima_visita TIMESTAMP WITH TIME ZONE,
  primera_visita TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Métricas de consumo
  consumo_total DECIMAL(10,2) DEFAULT 0,
  consumo_promedio DECIMAL(10,2) DEFAULT 0,
  ticket_mas_alto DECIMAL(10,2) DEFAULT 0,
  
  -- Calificación y preferencias
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  producto_favorito TEXT,
  horario_preferido TEXT,
  
  -- Rewards y fidelización
  puntos_rewards INTEGER DEFAULT 0,
  nivel_fidelidad TEXT DEFAULT 'bronce' CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino', 'diamante')),
  qr_wallet_id TEXT UNIQUE,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE VISITAS
-- ============================================
CREATE TABLE IF NOT EXISTS visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  -- Información de la visita
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mesa_numero TEXT NOT NULL,
  numero_personas INTEGER DEFAULT 1,
  
  -- Timing
  hora_llegada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_salida TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER,
  
  -- Consumo
  total_consumo DECIMAL(10,2) DEFAULT 0,
  productos_consumidos JSONB DEFAULT '[]'::jsonb,
  
  -- Atención
  hostess TEXT,
  mesero TEXT,
  calificacion_hostess DECIMAL(3,2),
  calificacion_servicio DECIMAL(3,2),
  calificacion_comida DECIMAL(3,2),
  comentarios TEXT,
  
  -- Rewards
  puntos_ganados INTEGER DEFAULT 0,
  recompensa_aplicada TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE MESAS CON CLIENTE
-- ============================================
CREATE TABLE IF NOT EXISTS mesas_clientes (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'limpieza')),
  
  -- Cliente actual
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT,
  numero_personas INTEGER DEFAULT 0,
  
  -- Asignación
  hostess TEXT,
  mesero TEXT,
  hora_asignacion TIMESTAMP WITH TIME ZONE,
  
  -- Pedidos actuales
  pedidos_data JSONB DEFAULT '[]'::jsonb,
  total_actual DECIMAL(10,2) DEFAULT 0,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE CALIFICACIONES HOSTESS
-- ============================================
CREATE TABLE IF NOT EXISTS calificaciones_hostess (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  hostess TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  horario TEXT NOT NULL, -- 'desayuno', 'comida', 'cena', 'tarde'
  mesa_numero TEXT NOT NULL,
  
  -- Calificaciones específicas
  calificacion_atencion DECIMAL(3,2),
  calificacion_rapidez DECIMAL(3,2),
  calificacion_amabilidad DECIMAL(3,2),
  calificacion_general DECIMAL(3,2),
  
  comentarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE TICKETS PERSONALIZADOS
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE,
  
  -- Información del ticket
  numero_ticket TEXT UNIQUE NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mesa_numero TEXT NOT NULL,
  
  -- Productos
  productos JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  propina DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Método de pago
  metodo_pago TEXT,
  
  -- Personal
  mesero TEXT NOT NULL,
  hostess TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE REWARDS Y PROMOCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('puntos', 'descuento', 'producto_gratis', 'upgrade', 'cumpleaños', 'racha')),
  descripcion TEXT NOT NULL,
  puntos INTEGER DEFAULT 0,
  valor_descuento DECIMAL(10,2) DEFAULT 0,
  
  -- Estado
  activo BOOLEAN DEFAULT true,
  usado BOOLEAN DEFAULT false,
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  fecha_uso TIMESTAMP WITH TIME ZONE,
  
  -- Condiciones
  visitas_requeridas INTEGER,
  consumo_minimo DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE RACHAS Y LOGROS
-- ============================================
CREATE TABLE IF NOT EXISTS rachas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  tipo TEXT NOT NULL CHECK (tipo IN ('fines_semana', 'semanal', 'mensual', 'especial')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  
  -- Progreso
  visitas_actuales INTEGER DEFAULT 0,
  visitas_objetivo INTEGER NOT NULL,
  completada BOOLEAN DEFAULT false,
  
  -- Fechas
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_completada TIMESTAMP WITH TIME ZONE,
  
  -- Recompensa
  recompensa_tipo TEXT,
  recompensa_valor DECIMAL(10,2),
  recompensa_otorgada BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE FILAS/WAITLIST
-- ============================================
CREATE TABLE IF NOT EXISTS fila_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  numero_personas INTEGER NOT NULL,
  
  -- Estado
  estado TEXT DEFAULT 'esperando' CHECK (estado IN ('esperando', 'notificado', 'sentado', 'cancelado')),
  posicion INTEGER,
  
  -- Timing
  hora_llegada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tiempo_espera_estimado INTEGER, -- minutos
  hora_notificacion TIMESTAMP WITH TIME ZONE,
  hora_asignacion TIMESTAMP WITH TIME ZONE,
  
  -- Asignación
  mesa_asignada TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DE PRODUCTOS (actualizada)
-- ============================================
CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL,
  precio_compra DECIMAL(10,2) NOT NULL,
  proveedor TEXT NOT NULL,
  
  -- Métricas de popularidad
  veces_vendido INTEGER DEFAULT 0,
  rating_promedio DECIMAL(3,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA RENDIMIENTO
-- ============================================

-- Clientes
CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);
CREATE INDEX IF NOT EXISTS idx_clientes_nivel ON clientes(nivel_fidelidad);
CREATE INDEX IF NOT EXISTS idx_clientes_activo ON clientes(activo);
CREATE INDEX IF NOT EXISTS idx_clientes_genero ON clientes(genero);

-- Visitas
CREATE INDEX IF NOT EXISTS idx_visitas_cliente ON visitas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_visitas_fecha ON visitas(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_visitas_mesa ON visitas(mesa_numero);
CREATE INDEX IF NOT EXISTS idx_visitas_hostess ON visitas(hostess);

-- Mesas
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas_clientes(estado);
CREATE INDEX IF NOT EXISTS idx_mesas_cliente ON mesas_clientes(cliente_id);

-- Calificaciones
CREATE INDEX IF NOT EXISTS idx_calificaciones_hostess ON calificaciones_hostess(hostess);
CREATE INDEX IF NOT EXISTS idx_calificaciones_fecha ON calificaciones_hostess(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_calificaciones_horario ON calificaciones_hostess(horario);

-- Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_cliente ON tickets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tickets_fecha ON tickets(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_numero ON tickets(numero_ticket);

-- Rewards
CREATE INDEX IF NOT EXISTS idx_rewards_cliente ON rewards(cliente_id);
CREATE INDEX IF NOT EXISTS idx_rewards_activo ON rewards(activo, usado);

-- Rachas
CREATE INDEX IF NOT EXISTS idx_rachas_cliente ON rachas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_rachas_completada ON rachas(completada);

-- Fila de espera
CREATE INDEX IF NOT EXISTS idx_fila_estado ON fila_espera(estado);
CREATE INDEX IF NOT EXISTS idx_fila_posicion ON fila_espera(posicion);

-- ============================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
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
-- FUNCIÓN: Actualizar métricas del cliente
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_metricas_cliente()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar métricas cuando se completa una visita
  IF NEW.hora_salida IS NOT NULL AND OLD.hora_salida IS NULL THEN
    UPDATE clientes
    SET 
      total_visitas = total_visitas + 1,
      ultima_visita = NEW.fecha,
      consumo_total = consumo_total + NEW.total_consumo,
      consumo_promedio = (consumo_total + NEW.total_consumo) / (total_visitas + 1),
      ticket_mas_alto = GREATEST(ticket_mas_alto, NEW.total_consumo),
      updated_at = NOW()
    WHERE id = NEW.cliente_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_metricas
  AFTER UPDATE ON visitas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_metricas_cliente();

-- ============================================
-- FUNCIÓN: Calcular rachas consecutivas
-- ============================================
CREATE OR REPLACE FUNCTION calcular_racha_consecutiva(p_cliente_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_racha INTEGER := 0;
  v_fecha_anterior DATE;
  v_fecha_actual DATE;
BEGIN
  FOR v_fecha_actual IN 
    SELECT DATE(fecha) as fecha
    FROM visitas
    WHERE cliente_id = p_cliente_id
    ORDER BY fecha DESC
  LOOP
    IF v_fecha_anterior IS NULL THEN
      v_racha := 1;
    ELSIF v_fecha_anterior - v_fecha_actual <= 7 THEN
      v_racha := v_racha + 1;
    ELSE
      EXIT;
    END IF;
    v_fecha_anterior := v_fecha_actual;
  END LOOP;
  
  RETURN v_racha;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar mesas
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
  (12, '12', 4, 'disponible')
ON CONFLICT DO NOTHING;

-- Insertar productos iniciales
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Hamburguesa Clásica', 'Comida', 15.00, 50, 20, 'unidades', 8.00, 'Distribuidora ABC'),
  ('Pizza Margarita', 'Comida', 18.00, 30, 15, 'unidades', 10.00, 'Distribuidora ABC'),
  ('Tacos al Pastor', 'Comida', 12.00, 40, 20, 'porciones', 6.00, 'Carnicería El Buen Corte'),
  ('Alitas Picantes', 'Comida', 12.00, 35, 15, 'porciones', 6.00, 'Pollería El Gallo'),
  ('Ensalada César', 'Comida', 10.00, 25, 10, 'porciones', 5.00, 'Frutas y Verduras La Huerta'),
  ('Sushi Roll', 'Comida', 25.00, 20, 10, 'porciones', 15.00, 'Distribuidora ABC'),
  ('Cerveza Corona', 'Bebidas', 8.00, 100, 24, 'unidades', 5.00, 'Distribuidora ABC'),
  ('Margarita', 'Bebidas', 20.00, 50, 20, 'unidades', 12.00, 'Licores Premium'),
  ('Mojito', 'Bebidas', 15.00, 50, 20, 'unidades', 8.00, 'Licores Premium'),
  ('Café Americano', 'Bebidas', 5.00, 80, 30, 'unidades', 2.00, 'Café Premium'),
  ('Refresco', 'Bebidas', 4.00, 120, 50, 'unidades', 2.00, 'Distribuidora ABC'),
  ('Tequila Blanco', 'Bebidas', 45.00, 12, 6, 'botellas', 25.00, 'Licores Premium')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
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

-- Políticas de acceso (permitir todo para desarrollo)
CREATE POLICY "Permitir todo en clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en visitas" ON visitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en mesas" ON mesas_clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en calificaciones" ON calificaciones_hostess FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en rewards" ON rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en rachas" ON rachas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en fila" ON fila_espera FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en productos" ON productos FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Clientes activos con métricas
CREATE OR REPLACE VIEW vista_clientes_activos AS
SELECT 
  c.*,
  COUNT(v.id) as total_visitas_real,
  MAX(v.fecha) as ultima_visita_real,
  AVG(v.total_consumo) as consumo_promedio_real,
  AVG(v.calificacion_servicio) as calificacion_promedio_real
FROM clientes c
LEFT JOIN visitas v ON c.id = v.cliente_id
WHERE c.activo = true
GROUP BY c.id;

-- Vista: Top clientes por consumo
CREATE OR REPLACE VIEW vista_top_clientes AS
SELECT 
  c.id,
  c.nombre,
  c.apellido,
  c.genero,
  c.nivel_fidelidad,
  c.total_visitas,
  c.consumo_total,
  c.consumo_promedio,
  c.ultima_visita
FROM clientes c
WHERE c.activo = true
ORDER BY c.consumo_total DESC
LIMIT 50;

-- Vista: Métricas por género
CREATE OR REPLACE VIEW vista_metricas_genero AS
SELECT 
  genero,
  COUNT(*) as total_clientes,
  SUM(total_visitas) as total_visitas,
  AVG(consumo_promedio) as consumo_promedio,
  AVG(calificacion_promedio) as calificacion_promedio
FROM clientes
WHERE activo = true AND genero IS NOT NULL
GROUP BY genero;

-- ============================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE clientes IS 'Perfil completo de clientes con métricas de fidelización y consumo';
COMMENT ON TABLE visitas IS 'Registro detallado de cada visita del cliente al restaurante';
COMMENT ON TABLE mesas_clientes IS 'Estado en tiempo real de mesas con información del cliente asignado';
COMMENT ON TABLE calificaciones_hostess IS 'Calificaciones específicas de hostess por mesa y horario';
COMMENT ON TABLE tickets IS 'Tickets personalizados por cliente con detalle de consumo';
COMMENT ON TABLE rewards IS 'Sistema de recompensas y promociones para fidelización';
COMMENT ON TABLE rachas IS 'Seguimiento de rachas y logros de clientes';
COMMENT ON TABLE fila_espera IS 'Gestión de fila de espera y waitlist';
