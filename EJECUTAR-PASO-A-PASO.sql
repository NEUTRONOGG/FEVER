-- =====================================================
-- PASO 1: CREAR TABLA
-- =====================================================
-- Ejecuta esto primero

CREATE TABLE IF NOT EXISTS cortesias_activas (
  id TEXT PRIMARY KEY,
  folio TEXT UNIQUE NOT NULL,
  rp_nombre TEXT NOT NULL,
  mesa_id INTEGER NOT NULL,
  mesa_numero TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  tipo_cortesia TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad INTEGER NOT NULL,
  fecha_autorizacion BIGINT NOT NULL,
  tiempo_restante INTEGER NOT NULL,
  notificado_10min BOOLEAN DEFAULT FALSE,
  notificado_5min BOOLEAN DEFAULT FALSE,
  estado TEXT DEFAULT 'activa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 2: CREAR ÍNDICES
-- =====================================================
-- Ejecuta esto después

CREATE INDEX IF NOT EXISTS idx_cortesias_activas_rp ON cortesias_activas(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_cortesias_activas_mesa ON cortesias_activas(mesa_numero);
CREATE INDEX IF NOT EXISTS idx_cortesias_activas_estado ON cortesias_activas(estado);
CREATE INDEX IF NOT EXISTS idx_cortesias_activas_tiempo ON cortesias_activas(tiempo_restante);

-- =====================================================
-- PASO 3: FUNCIÓN ACTUALIZAR TIMESTAMP
-- =====================================================
-- Ejecuta esto después

CREATE OR REPLACE FUNCTION actualizar_timestamp_cortesia()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 4: TRIGGER
-- =====================================================
-- Ejecuta esto después

DROP TRIGGER IF EXISTS trigger_actualizar_timestamp_cortesia ON cortesias_activas;
CREATE TRIGGER trigger_actualizar_timestamp_cortesia
  BEFORE UPDATE ON cortesias_activas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_cortesia();

-- =====================================================
-- PASO 5: FUNCIÓN LIMPIAR EXPIRADAS
-- =====================================================
-- Ejecuta esto después

CREATE OR REPLACE FUNCTION limpiar_cortesias_expiradas()
RETURNS void AS $$
BEGIN
  UPDATE cortesias_activas
  SET estado = 'expirada'
  WHERE tiempo_restante <= 0 AND estado = 'activa';
  
  DELETE FROM cortesias_activas
  WHERE estado = 'expirada' 
    AND updated_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 6: FUNCIÓN OBTENER CORTESÍAS (IMPORTANTE)
-- =====================================================
-- Ejecuta esto después

DROP FUNCTION IF EXISTS obtener_cortesias_activas_rp(text);

CREATE FUNCTION obtener_cortesias_activas_rp(p_rp_nombre TEXT)
RETURNS TABLE (
  id TEXT,
  folio TEXT,
  rp_nombre TEXT,
  mesa_id INTEGER,
  mesa_numero TEXT,
  cliente_nombre TEXT,
  tipo_cortesia TEXT,
  descripcion TEXT,
  cantidad INTEGER,
  fecha_autorizacion BIGINT,
  tiempo_restante INTEGER,
  notificado_10min BOOLEAN,
  notificado_5min BOOLEAN,
  estado TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ca.id,
    ca.folio,
    ca.rp_nombre,
    ca.mesa_id,
    ca.mesa_numero,
    ca.cliente_nombre,
    ca.tipo_cortesia,
    ca.descripcion,
    ca.cantidad,
    ca.fecha_autorizacion,
    ca.tiempo_restante,
    ca.notificado_10min,
    ca.notificado_5min,
    ca.estado
  FROM cortesias_activas ca
  WHERE ca.rp_nombre = p_rp_nombre
    AND ca.estado = 'activa'
    AND ca.tiempo_restante > 0
  ORDER BY ca.tiempo_restante ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 7: FUNCIÓN GENERAR FOLIO
-- =====================================================
-- Ejecuta esto después

CREATE OR REPLACE FUNCTION generar_folio_cortesia()
RETURNS TEXT AS $$
DECLARE
  ultimo_numero INTEGER;
  nuevo_folio TEXT;
BEGIN
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(folio FROM 'fever-cortesia-(\d+)') AS INTEGER)),
    0
  ) INTO ultimo_numero
  FROM cortesias_activas;
  
  nuevo_folio := 'fever-cortesia-' || LPAD((ultimo_numero + 1)::TEXT, 3, '0');
  
  RETURN nuevo_folio;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 8: FUNCIÓN CREAR CORTESÍA
-- =====================================================
-- Ejecuta esto después

CREATE OR REPLACE FUNCTION crear_cortesia_activa(
  p_id TEXT,
  p_rp_nombre TEXT,
  p_mesa_id INTEGER,
  p_mesa_numero TEXT,
  p_cliente_nombre TEXT,
  p_tipo_cortesia TEXT,
  p_descripcion TEXT,
  p_cantidad INTEGER,
  p_fecha_autorizacion BIGINT
)
RETURNS TEXT AS $$
DECLARE
  nuevo_folio TEXT;
BEGIN
  nuevo_folio := generar_folio_cortesia();
  
  INSERT INTO cortesias_activas (
    id,
    folio,
    rp_nombre,
    mesa_id,
    mesa_numero,
    cliente_nombre,
    tipo_cortesia,
    descripcion,
    cantidad,
    fecha_autorizacion,
    tiempo_restante
  ) VALUES (
    p_id,
    nuevo_folio,
    p_rp_nombre,
    p_mesa_id,
    p_mesa_numero,
    p_cliente_nombre,
    p_tipo_cortesia,
    p_descripcion,
    p_cantidad,
    p_fecha_autorizacion,
    900
  );
  
  RETURN nuevo_folio;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 9: FUNCIÓN ACTUALIZAR TIEMPO
-- =====================================================
-- Ejecuta esto después

CREATE OR REPLACE FUNCTION actualizar_tiempo_cortesias()
RETURNS void AS $$
BEGIN
  UPDATE cortesias_activas
  SET tiempo_restante = GREATEST(tiempo_restante - 1, 0)
  WHERE estado = 'activa' AND tiempo_restante > 0;
  
  UPDATE cortesias_activas
  SET estado = 'expirada'
  WHERE tiempo_restante = 0 AND estado = 'activa';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 10: FUNCIÓN CERRAR CORTESÍA
-- =====================================================
-- Ejecuta esto después

CREATE OR REPLACE FUNCTION cerrar_cortesia_activa(p_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE cortesias_activas
  SET estado = 'cerrada'
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 11: FUNCIÓN MARCAR NOTIFICACIÓN
-- =====================================================
-- Ejecuta esto después

CREATE OR REPLACE FUNCTION marcar_notificacion_cortesia(
  p_id TEXT,
  p_tipo TEXT
)
RETURNS void AS $$
BEGIN
  IF p_tipo = '10min' THEN
    UPDATE cortesias_activas
    SET notificado_10min = TRUE
    WHERE id = p_id;
  ELSIF p_tipo = '5min' THEN
    UPDATE cortesias_activas
    SET notificado_5min = TRUE
    WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PASO 12: VISTA DE NOTIFICACIONES
-- =====================================================
-- Ejecuta esto al final

CREATE OR REPLACE VIEW vista_cortesias_notificar AS
SELECT 
  id,
  rp_nombre,
  mesa_numero,
  descripcion,
  tiempo_restante,
  CASE 
    WHEN tiempo_restante <= 300 AND NOT notificado_5min THEN '5min'
    WHEN tiempo_restante <= 600 AND NOT notificado_10min THEN '10min'
    ELSE NULL
  END as tipo_notificacion
FROM cortesias_activas
WHERE estado = 'activa'
  AND (
    (tiempo_restante <= 300 AND NOT notificado_5min) OR
    (tiempo_restante <= 600 AND NOT notificado_10min)
  );

-- =====================================================
-- ✅ VERIFICACIÓN FINAL
-- =====================================================
-- Ejecuta esto para verificar que todo está bien

SELECT 'Tabla cortesias_activas creada exitosamente' as status;
SELECT COUNT(*) as total_cortesias FROM cortesias_activas;
