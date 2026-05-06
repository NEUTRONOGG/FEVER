-- =====================================================
-- ACTUALIZACIÓN: SISTEMA DE ABREVIATURAS DE RPs
-- =====================================================

-- 1. Agregar columna de abreviatura a la tabla de RPs
ALTER TABLE rps 
ADD COLUMN IF NOT EXISTS abreviatura VARCHAR(2) UNIQUE,
ADD COLUMN IF NOT EXISTS abreviatura_asignada_por VARCHAR(255),
ADD COLUMN IF NOT EXISTS fecha_abreviatura_asignada TIMESTAMP WITH TIME ZONE;

-- 2. Crear índice para búsqueda rápida por abreviatura
CREATE INDEX IF NOT EXISTS idx_rps_abreviatura ON rps(abreviatura);

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
  rp.abreviatura as rp_abreviatura_real,
  rp.nombre as rp_nombre_completo
FROM reservaciones r
LEFT JOIN rps rp ON r.rp_nombre = rp.nombre;

-- 6. Vista de rendimiento por abreviatura
CREATE OR REPLACE VIEW vista_rendimiento_por_abreviatura AS
SELECT 
  rp.abreviatura,
  rp.nombre as rp_nombre,
  COUNT(res.id) as total_reservas,
  SUM(CASE WHEN res.estado = 'completada' THEN 1 ELSE 0 END) as reservas_completadas,
  SUM(CASE WHEN res.estado = 'confirmada' THEN 1 ELSE 0 END) as reservas_confirmadas,
  SUM(CASE WHEN res.estado = 'no_asistio' THEN 1 ELSE 0 END) as reservas_no_asistieron,
  ROUND(
    (SUM(CASE WHEN res.estado = 'completada' THEN 1 ELSE 0 END)::NUMERIC / 
    NULLIF(COUNT(res.id), 0) * 100), 
    2
  ) as tasa_conversion_pct
FROM rps rp
LEFT JOIN reservaciones res ON rp.nombre = res.rp_nombre
GROUP BY rp.abreviatura, rp.nombre
ORDER BY total_reservas DESC;

-- 7. Trigger para actualizar la abreviatura en reservaciones automáticamente
CREATE OR REPLACE FUNCTION actualizar_abreviatura_reservacion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se asignó un RP, buscar su abreviatura
  IF NEW.rp_nombre IS NOT NULL THEN
    SELECT abreviatura INTO NEW.rp_abreviatura
    FROM rps 
    WHERE nombre = NEW.rp_nombre;
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
  SELECT nombre INTO v_existente 
  FROM rps 
  WHERE abreviatura = p_abreviatura 
  AND nombre != p_rp_nombre;
  
  IF v_existente IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, 'La abreviatura ' || p_abreviatura || ' ya está asignada a ' || v_existente;
    RETURN;
  END IF;
  
  -- Actualizar el RP con la nueva abreviatura
  UPDATE rps 
  SET 
    abreviatura = p_abreviatura,
    abreviatura_asignada_por = p_asignado_por,
    fecha_abreviatura_asignada = NOW()
  WHERE nombre = p_rp_nombre;
  
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
  
  RETURN QUERY SELECT TRUE, 'Reserva confirmada: ' || v_reserva.cliente_nombre || ' llegó correctamente';
END;
$$ LANGUAGE plpgsql;

-- 11. Función para marcar no asistió
CREATE OR REPLACE FUNCTION marcar_no_asistio(
  p_reserva_id BIGINT,
  p_marcado_por VARCHAR(255)
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
    confirmada_por = p_marcado_por,
    fecha_confirmacion = NOW()
  WHERE id = p_reserva_id;
  
  RETURN QUERY SELECT TRUE, 'Marcado como no asistió: ' || v_reserva.cliente_nombre;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DATOS DE EJEMPLO (opcional, ejecutar solo si quieres probar)
-- =====================================================

-- Ejemplo: Asignar abreviaturas a RPs existentes
-- SELECT * FROM asignar_abreviatura_rp('Alejandro Maciel', 'AM', 'Admin');
-- SELECT * FROM asignar_abreviatura_rp('Roberto Sánchez', 'RS', 'Admin');

-- Ejemplo: Confirmar llegada
-- SELECT * FROM confirmar_llegada_reserva(1, 'Hostess', 4);

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Ver RPs con abreviaturas
-- SELECT nombre, abreviatura, abreviatura_asignada_por, fecha_abreviatura_asignada 
-- FROM rps 
-- WHERE abreviatura IS NOT NULL;

-- Ver reservaciones con abreviaturas
-- SELECT cliente_nombre, rp_nombre, rp_abreviatura, estado, confirmada_por 
-- FROM reservaciones 
-- WHERE fecha >= CURRENT_DATE;
