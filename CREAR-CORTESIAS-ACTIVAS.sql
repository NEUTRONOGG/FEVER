-- =====================================================
-- SISTEMA DE CORTESÍAS ACTIVAS EN TIEMPO REAL
-- =====================================================
-- Fecha: 31 de Octubre, 2025
-- Descripción: Tabla para gestionar cortesías activas con temporizador
-- =====================================================

-- 1. CREAR TABLA DE CORTESÍAS ACTIVAS
-- =====================================================
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
  tiempo_restante INTEGER NOT NULL, -- Segundos restantes (900 = 15 min)
  notificado_10min BOOLEAN DEFAULT FALSE,
  notificado_5min BOOLEAN DEFAULT FALSE,
  estado TEXT DEFAULT 'activa', -- 'activa', 'expirada', 'cerrada'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_cortesias_activas_rp ON cortesias_activas(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_cortesias_activas_mesa ON cortesias_activas(mesa_numero);
CREATE INDEX IF NOT EXISTS idx_cortesias_activas_estado ON cortesias_activas(estado);
CREATE INDEX IF NOT EXISTS idx_cortesias_activas_tiempo ON cortesias_activas(tiempo_restante);

-- 3. FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_timestamp_cortesia()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGER PARA ACTUALIZAR TIMESTAMP
-- =====================================================
DROP TRIGGER IF EXISTS trigger_actualizar_timestamp_cortesia ON cortesias_activas;
CREATE TRIGGER trigger_actualizar_timestamp_cortesia
  BEFORE UPDATE ON cortesias_activas
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_cortesia();

-- 5. FUNCIÓN PARA LIMPIAR CORTESÍAS EXPIRADAS
-- =====================================================
CREATE OR REPLACE FUNCTION limpiar_cortesias_expiradas()
RETURNS void AS $$
BEGIN
  -- Marcar como expiradas las cortesías con tiempo <= 0
  UPDATE cortesias_activas
  SET estado = 'expirada'
  WHERE tiempo_restante <= 0 AND estado = 'activa';
  
  -- Eliminar cortesías expiradas de hace más de 1 hora
  DELETE FROM cortesias_activas
  WHERE estado = 'expirada' 
    AND updated_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCIÓN PARA OBTENER CORTESÍAS ACTIVAS POR RP
-- =====================================================
-- Eliminar función existente si tiene tipo de retorno diferente
DROP FUNCTION IF EXISTS obtener_cortesias_activas_rp(text);

CREATE OR REPLACE FUNCTION obtener_cortesias_activas_rp(p_rp_nombre TEXT)
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

-- 7. FUNCIÓN PARA GENERAR FOLIO AUTOINCREMENTAL
-- =====================================================
CREATE OR REPLACE FUNCTION generar_folio_cortesia()
RETURNS TEXT AS $$
DECLARE
  ultimo_numero INTEGER;
  nuevo_folio TEXT;
BEGIN
  -- Obtener el último número de folio
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(folio FROM 'fever-cortesia-(\d+)') AS INTEGER)),
    0
  ) INTO ultimo_numero
  FROM cortesias_activas;
  
  -- Generar nuevo folio con formato fever-cortesia-XXX
  nuevo_folio := 'fever-cortesia-' || LPAD((ultimo_numero + 1)::TEXT, 3, '0');
  
  RETURN nuevo_folio;
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCIÓN PARA CREAR CORTESÍA ACTIVA
-- =====================================================
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
  -- Generar folio automáticamente
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
    900 -- 15 minutos
  );
  
  RETURN nuevo_folio; -- Retornar el folio generado
END;
$$ LANGUAGE plpgsql;

-- 8. FUNCIÓN PARA ACTUALIZAR TIEMPO RESTANTE
-- =====================================================
CREATE OR REPLACE FUNCTION actualizar_tiempo_cortesias()
RETURNS void AS $$
BEGIN
  -- Reducir 1 segundo a todas las cortesías activas
  UPDATE cortesias_activas
  SET tiempo_restante = GREATEST(tiempo_restante - 1, 0)
  WHERE estado = 'activa' AND tiempo_restante > 0;
  
  -- Marcar como expiradas las que llegaron a 0
  UPDATE cortesias_activas
  SET estado = 'expirada'
  WHERE tiempo_restante = 0 AND estado = 'activa';
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCIÓN PARA CERRAR CORTESÍA
-- =====================================================
CREATE OR REPLACE FUNCTION cerrar_cortesia_activa(p_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE cortesias_activas
  SET estado = 'cerrada'
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

-- 10. FUNCIÓN PARA MARCAR NOTIFICACIÓN
-- =====================================================
CREATE OR REPLACE FUNCTION marcar_notificacion_cortesia(
  p_id TEXT,
  p_tipo TEXT -- '10min' o '5min'
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

-- 11. VISTA DE CORTESÍAS QUE NECESITAN NOTIFICACIÓN
-- =====================================================
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
-- PERMISOS (AJUSTAR SEGÚN TU CONFIGURACIÓN)
-- =====================================================
-- ALTER TABLE cortesias_activas ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Permitir lectura de cortesías activas" ON cortesias_activas
--   FOR SELECT USING (true);

-- CREATE POLICY "Permitir inserción de cortesías activas" ON cortesias_activas
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Permitir actualización de cortesías activas" ON cortesias_activas
--   FOR UPDATE USING (true);

-- CREATE POLICY "Permitir eliminación de cortesías activas" ON cortesias_activas
--   FOR DELETE USING (true);

-- =====================================================
-- DATOS DE PRUEBA (OPCIONAL)
-- =====================================================
-- INSERT INTO cortesias_activas (
--   id, rp_nombre, mesa_id, mesa_numero, cliente_nombre,
--   tipo_cortesia, descripcion, cantidad, timestamp, tiempo_restante
-- ) VALUES (
--   '1-' || EXTRACT(EPOCH FROM NOW())::BIGINT,
--   'Carlos RP',
--   1,
--   '1',
--   'Juan Pérez',
--   'shots',
--   '5 Shots de cortesía',
--   5,
--   EXTRACT(EPOCH FROM NOW())::BIGINT * 1000,
--   900
-- );

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
-- 1. Ejecutar este script en Supabase SQL Editor
-- 2. Verificar que la tabla se creó: SELECT * FROM cortesias_activas;
-- 3. Probar función de obtener cortesías: SELECT * FROM obtener_cortesias_activas_rp('Carlos RP');
-- 4. El frontend se encargará de:
--    - Crear cortesías al autorizar
--    - Actualizar tiempo cada segundo
--    - Mostrar notificaciones
--    - Cerrar cortesías manualmente
-- =====================================================

SELECT 'Tabla cortesias_activas creada exitosamente' as status;
