-- ============================================
-- TABLA DE RESERVACIONES
-- ============================================

CREATE TABLE IF NOT EXISTS reservaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Información del cliente
  cliente_id UUID REFERENCES clientes(id),
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  
  -- Información de la reservación
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  numero_personas INTEGER NOT NULL,
  rp_nombre TEXT,  -- Con quién tiene reservación
  
  -- Estado de la reservación
  estado TEXT DEFAULT 'pendiente',  -- pendiente, confirmada, cancelada, completada
  
  -- Información de asistencia
  asistio BOOLEAN DEFAULT false,
  hora_llegada TIMESTAMP,
  mesa_asignada INTEGER,  -- Se asigna cuando llega
  
  -- Notas
  notas TEXT,
  
  -- Auditoría
  creado_por TEXT,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  activo BOOLEAN DEFAULT true
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_reservaciones_fecha ON reservaciones(fecha);
CREATE INDEX IF NOT EXISTS idx_reservaciones_estado ON reservaciones(estado);
CREATE INDEX IF NOT EXISTS idx_reservaciones_cliente ON reservaciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_reservaciones_rp ON reservaciones(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_reservaciones_telefono ON reservaciones(cliente_telefono);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION actualizar_timestamp_reservaciones()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_reservaciones
BEFORE UPDATE ON reservaciones
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_reservaciones();

-- ============================================
-- ESTADOS DE RESERVACIÓN
-- ============================================

-- pendiente: Reservación creada, esperando fecha
-- confirmada: Cliente confirmó que asistirá
-- cancelada: Reservación cancelada
-- completada: Cliente llegó y se le asignó mesa

-- ============================================
-- VERIFICAR TABLA
-- ============================================

SELECT 
  'Tabla reservaciones creada correctamente' as resultado,
  COUNT(*) as total_reservaciones
FROM reservaciones;

-- ============================================
-- EJEMPLO DE INSERCIÓN
-- ============================================

-- Reservación de ejemplo
INSERT INTO reservaciones (
  cliente_nombre,
  cliente_telefono,
  fecha,
  hora,
  numero_personas,
  rp_nombre,
  estado,
  notas,
  creado_por
) VALUES (
  'Juan Pérez',
  '+52 555 123 4567',
  '2025-10-15',
  '21:00',
  4,
  'Carlos RP',
  'pendiente',
  'Mesa cerca de la pista',
  'Hostess'
);

SELECT 
  '✅ Reservación de ejemplo creada' as resultado,
  * 
FROM reservaciones 
ORDER BY creado_en DESC 
LIMIT 1;
