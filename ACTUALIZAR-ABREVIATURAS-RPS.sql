-- =====================================================
-- ACTUALIZACIÓN: SISTEMA DE ABREVIATURAS DE RPs (CORREGIDO)
-- Usa tabla existente: limites_cortesias_rp
-- =====================================================

-- 1. Agregar columna de abreviatura a la tabla existente de RPs
ALTER TABLE limites_cortesias_rp 
ADD COLUMN IF NOT EXISTS abreviatura VARCHAR(2) UNIQUE,
ADD COLUMN IF NOT EXISTS abreviatura_asignada_por VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_abreviatura_asignada TIMESTAMP WITH TIME ZONE;

-- 2. Crear índice para búsqueda rápida por abreviatura
CREATE INDEX IF NOT EXISTS idx_limites_cortesias_rp_abreviatura ON limites_cortesias_rp(abreviatura);

-- 3. Agregar columna de abreviatura a reservaciones para ligarlas
ALTER TABLE reservaciones
ADD COLUMN IF NOT EXISTS rp_abreviatura VARCHAR(2),
ADD COLUMN IF NOT EXISTS confirmada_por VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_confirmacion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS hora_llegada TIME,
ADD COLUMN IF NOT EXISTS num_personas_llegaron INTEGER;

-- 4. Crear índice para ligar reservaciones con abreviaturas
CREATE INDEX IF NOT EXISTS idx_reservaciones_abreviatura ON reservaciones(rp_abreviatura);
CREATE INDEX IF NOT EXISTS idx_reservaciones_confirmacion ON reservaciones(fecha_confirmacion);

-- 5. Vista para ver reservaciones con datos del RP incluyendo abreviatura
CREATE OR REPLACE VIEW vista_reservaciones_rp AS
SELECT 
  r.*,
  lcr.abreviatura as rp_abreviatura_real,
  lcr.rp_nombre as rp_nombre_completo
FROM reservaciones r
LEFT JOIN limites_cortesias_rp lcr ON r.rp_nombre = lcr.rp_nombre;

-- 6. Vista de rendimiento por abreviatura
CREATE OR REPLACE VIEW vista_rendimiento_por_abreviatura AS
SELECT 
  lcr.abreviatura,
  lcr.rp_nombre,
  COUNT(res.id) as total_reservas,
  SUM(CASE WHEN res.estado = 'completada' THEN 1 ELSE 0 END) as reservas_completadas,
  SUM(CASE WHEN res.estado = 'confirmada' THEN 1 ELSE 0 END) as reservas_confirmadas,
  SUM(CASE WHEN res.estado = 'no_asistio' THEN 1 ELSE 0 END) as reservas_no_asistieron,
  ROUND(
    (SUM(CASE WHEN res.estado = 'completada' THEN 1 ELSE 0 END)::NUMERIC / 
    NULLIF(COUNT(res.id), 0) * 100), 
    2
  ) as tasa_conversion_pct
FROM limites_cortesias_rp lcr
LEFT JOIN reservaciones res ON lcr.rp_nombre = res.rp_nombre
GROUP BY lcr.abreviatura, lcr.rp_nombre
ORDER BY total_reservas DESC;

-- 7. Trigger para actualizar la abreviatura en reservaciones automáticamente
CREATE OR REPLACE FUNCTION actualizar_abreviatura_reservacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se asignó un RP, buscar su abreviatura
  IF NEW.rp_nombre IS NOT NULL THEN
    SELECT abreviatura INTO NEW.rp_abreviatura
    FROM limites_cortesias_rp 
    WHERE rp_nombre = NEW.rp_nombre;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Crear el trigger
DROP TRIGGER IF EXISTS trigger_actualizar_abreviatura ON reservaciones;
CREATE TRIGGER trigger_actualizar_abreviatura
  BEFORE INSERT OR UPDATE OF rp_nombre ON reservaciones
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_abreviatura_reservacion();

-- 9. Función para asignar abreviatura a RP
CREATE OR REPLACE FUNCTION asignar_abreviatura_rp(
  p_rp_nombre VARCHAR(255),
  p_abreviatura VARCHAR(2),
  p_asignado_por VARCHAR(255)
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_existente VARCHAR(255);
BEGIN
  -- Verificar si la abreviatura ya está en uso por otro RP
  SELECT rp_nombre INTO v_existente 
  FROM limites_cortesias_rp 
  WHERE abreviatura = p_abreviatura 
  AND rp_nombre != p_rp_nombre;
  
  IF v_existente IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'La abreviatura ' || p_abreviatura || ' ya está asignada a ' || v_existente;
    RETURN;
  END IF;
  
  -- Actualizar el RP con la nueva abreviatura
  UPDATE limites_cortesias_rp 
  SET 
    abreviatura = p_abreviatura,
    abreviatura_asignada_por = p_asignado_por,
    fecha_abreviatura_asignada = NOW()
  WHERE rp_nombre = p_rp_nombre;
  
  -- Actualizar todas las reservaciones existentes de este RP
  UPDATE reservaciones
  SET rp_abreviatura = p_abreviatura
  WHERE rp_nombre = p_rp_nombre;
  
  RETURN QUERY SELECT TRUE, 'Abreviatura ' || p_abreviatura || ' asignada correctamente a ' || p_rp_nombre;
END;
$$ LANGUAGE plpgsql;

-- 10. Función para confirmar llegada de reserva
CREATE OR REPLACE FUNCTION confirmar_llegada_reserva(
  p_reserva_id BIGINT,
  p_confirmado_por VARCHAR(255),
  p_num_personas INTEGER DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_reserva RECORD;
BEGIN
  -- Obtener la reserva
  SELECT * INTO v_reserva FROM reservaciones WHERE id = p_reserva_id;
  
  IF v_reserva IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Reserva no encontrada';
    RETURN;
  END IF;
  
  IF v_reserva.estado = 'completada' THEN
    RETURN QUERY SELECT FALSE, 'La reserva ya fue marcada como completada';
    RETURN;
  END IF;
  
  -- Actualizar la reserva
  UPDATE reservaciones
  SET 
    estado = 'completada',
    asistio = TRUE,
    confirmada_por = p_confirmado_por,
    fecha_confirmacion = NOW(),
    hora_llegada = CURRENT_TIME,
    num_personas_llegaron = COALESCE(p_num_personas, numero_personas)
  WHERE id = p_reserva_id;
  
  RETURN QUERY SELECT TRUE, 'Reserva de ' || v_reserva.cliente_nombre || ' marcada como completada';
END;
$$ LANGUAGE plpgsql;

-- 11. Función para marcar no asistió
CREATE OR REPLACE FUNCTION marcar_no_asistio(
  p_reserva_id BIGINT,
  p_confirmado_por VARCHAR(255)
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_reserva RECORD;
BEGIN
  SELECT * INTO v_reserva FROM reservaciones WHERE id = p_reserva_id;
  
  IF v_reserva IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Reserva no encontrada';
    RETURN;
  END IF;
  
  UPDATE reservaciones
  SET 
    estado = 'no_asistio',
    asistio = FALSE,
    confirmada_por = p_confirmado_por,
    fecha_confirmacion = NOW()
  WHERE id = p_reserva_id;
  
  RETURN QUERY SELECT TRUE, v_reserva.cliente_nombre || ' marcado como no asistió';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar columnas agregadas
SELECT 
  'limites_cortesias_rp' as tabla,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'limites_cortesias_rp'
AND column_name IN ('abreviatura', 'abreviatura_asignada_por', 'fecha_abreviatura_asignada')
ORDER BY ordinal_position;

-- Verificar columnas en reservaciones
SELECT 
  'reservaciones' as tabla,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'reservaciones'
AND column_name IN ('rp_abreviatura', 'confirmada_por', 'fecha_confirmacion', 'hora_llegada', 'num_personas_llegaron')
ORDER BY ordinal_position;

-- Mensaje de éxito
DO $$ 
BEGIN
  RAISE NOTICE '✅ Sistema de abreviaturas de RPs instalado correctamente';
  RAISE NOTICE '';
  RAISE NOTICE '📝 TABLA USADA: limites_cortesias_rp';
  RAISE NOTICE '🔧 FUNCIONES CREADAS:';
  RAISE NOTICE '   • asignar_abreviatura_rp(nombre, abreviatura, asignado_por)';
  RAISE NOTICE '   • confirmar_llegada_reserva(id, confirmado_por, num_personas)';
  RAISE NOTICE '   • marcar_no_asistio(id, confirmado_por)';
  RAISE NOTICE '';
  RAISE NOTICE '👁️ VISTAS CREADAS:';
  RAISE NOTICE '   • vista_reservaciones_rp';
  RAISE NOTICE '   • vista_rendimiento_por_abreviatura';
END $$;
