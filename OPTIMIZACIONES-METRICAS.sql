-- Script para optimizar base de datos para métricas de CRM
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- 1. AGREGAR COLUMNAS NECESARIAS
-- ============================================

-- Agregar RP a tickets si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'rp_nombre'
  ) THEN
    ALTER TABLE tickets ADD COLUMN rp_nombre VARCHAR(100);
    COMMENT ON COLUMN tickets.rp_nombre IS 'RP que generó la mesa/venta';
  END IF;
END $$;

-- Agregar mesa_numero a tickets si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'mesa_numero'
  ) THEN
    ALTER TABLE tickets ADD COLUMN mesa_numero INTEGER;
    COMMENT ON COLUMN tickets.mesa_numero IS 'Número de mesa del ticket';
  END IF;
END $$;

-- ============================================
-- 2. CREAR ÍNDICES PARA OPTIMIZACIÓN
-- ============================================

-- Índices en tickets
CREATE INDEX IF NOT EXISTS idx_tickets_cliente_id ON tickets(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tickets_rp_nombre ON tickets(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_tickets_mesa_numero ON tickets(mesa_numero);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_total ON tickets(total);

-- Índices en mesas
CREATE INDEX IF NOT EXISTS idx_mesas_rp ON mesas(rp);
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);
CREATE INDEX IF NOT EXISTS idx_mesas_cliente_nombre ON mesas(cliente_nombre);

-- Índices en reservaciones
CREATE INDEX IF NOT EXISTS idx_reservaciones_rp_nombre ON reservaciones(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_reservaciones_estado ON reservaciones(estado);
CREATE INDEX IF NOT EXISTS idx_reservaciones_fecha ON reservaciones(fecha);

-- Índices en clientes
CREATE INDEX IF NOT EXISTS idx_clientes_calificacion ON clientes(calificacion_promedio);
CREATE INDEX IF NOT EXISTS idx_clientes_consumo_total ON clientes(consumo_total);
CREATE INDEX IF NOT EXISTS idx_clientes_nivel ON clientes(nivel_fidelidad);

-- ============================================
-- 3. VISTAS PARA MÉTRICAS DE RPs
-- ============================================

-- Vista: Métricas de RPs
CREATE OR REPLACE VIEW vista_metricas_rps AS
SELECT 
  rp_nombre,
  COUNT(DISTINCT mesa_numero) as total_mesas,
  SUM(total) as consumo_total,
  AVG(total) as ticket_promedio,
  COUNT(*) as total_tickets,
  MIN(created_at) as primera_venta,
  MAX(created_at) as ultima_venta
FROM tickets
WHERE rp_nombre IS NOT NULL
GROUP BY rp_nombre
ORDER BY consumo_total DESC;

COMMENT ON VIEW vista_metricas_rps IS 'Métricas generales de desempeño por RP';

-- Vista: Reservas vs Asistencia por RP
CREATE OR REPLACE VIEW vista_conversion_rps AS
SELECT 
  rp_nombre,
  COUNT(*) as total_reservas,
  COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as asistencias,
  COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as cancelaciones,
  COUNT(CASE WHEN estado = 'no_asistio' THEN 1 END) as no_asistencias,
  ROUND(
    COUNT(CASE WHEN estado = 'confirmada' THEN 1 END)::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    2
  ) as tasa_conversion
FROM reservaciones
WHERE rp_nombre IS NOT NULL
GROUP BY rp_nombre
ORDER BY tasa_conversion DESC;

COMMENT ON VIEW vista_conversion_rps IS 'Tasa de conversión de reservas a asistencias por RP';

-- Vista: Consumo por Mesa
CREATE OR REPLACE VIEW vista_consumo_mesas AS
SELECT 
  m.numero as mesa_numero,
  m.cliente_nombre,
  m.rp,
  m.estado,
  COALESCE(SUM(t.total), 0) as consumo_actual,
  COUNT(t.id) as tickets_generados,
  MAX(t.created_at) as ultimo_ticket,
  MIN(t.created_at) as primer_ticket
FROM mesas m
LEFT JOIN tickets t ON m.numero::integer = t.mesa_numero 
  AND DATE(t.created_at) = CURRENT_DATE
WHERE m.estado = 'ocupada'
GROUP BY m.numero, m.cliente_nombre, m.rp, m.estado
ORDER BY m.numero;

COMMENT ON VIEW vista_consumo_mesas IS 'Consumo actual de cada mesa ocupada del día';

-- Vista: Historial de Consumos por Cliente
CREATE OR REPLACE VIEW vista_historial_cliente AS
SELECT 
  t.id as ticket_id,
  t.cliente_id,
  c.nombre as cliente_nombre,
  t.mesa_numero,
  t.total,
  t.rp_nombre,
  t.created_at as fecha_consumo,
  EXTRACT(HOUR FROM t.created_at) as hora_consumo,
  DATE(t.created_at) as dia_consumo
FROM tickets t
LEFT JOIN clientes c ON t.cliente_id = c.id
ORDER BY t.created_at DESC;

COMMENT ON VIEW vista_historial_cliente IS 'Historial completo de consumos por cliente';

-- Vista: Mesas por RP (Semana y Mes)
CREATE OR REPLACE VIEW vista_mesas_rp_periodo AS
SELECT 
  rp_nombre,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as mesas_semana,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as mesas_mes,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN total ELSE 0 END) as consumo_semana,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN total ELSE 0 END) as consumo_mes
FROM tickets
WHERE rp_nombre IS NOT NULL
GROUP BY rp_nombre
ORDER BY mesas_mes DESC;

COMMENT ON VIEW vista_mesas_rp_periodo IS 'Mesas y consumo por RP en diferentes períodos';

-- ============================================
-- 4. FUNCIONES ÚTILES
-- ============================================

-- Función: Calcular bono de RP
CREATE OR REPLACE FUNCTION calcular_bono_rp(p_rp_nombre VARCHAR)
RETURNS TABLE (
  rp_nombre VARCHAR,
  mesas_mes INTEGER,
  consumo_total NUMERIC,
  ticket_promedio NUMERIC,
  calificacion_promedio NUMERIC,
  bono_calculado NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p_rp_nombre,
    CAST(COUNT(DISTINCT mesa_numero) AS INTEGER) as mesas_mes,
    CAST(SUM(total) AS NUMERIC) as consumo_total,
    CAST(AVG(total) AS NUMERIC) as ticket_promedio,
    CAST(4.5 AS NUMERIC) as calificacion_promedio, -- TODO: Calcular desde calificaciones reales
    CAST(
      1000 + -- Bono base
      (COUNT(DISTINCT mesa_numero) * 50) + -- $50 por mesa
      ((SUM(total) / 10000) * 100) + -- Bonus por consumo
      (4.5 * 200) -- Bonus por calificación
    AS NUMERIC) as bono_calculado
  FROM tickets
  WHERE rp_nombre = p_rp_nombre
    AND created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calcular_bono_rp IS 'Calcula el bono mensual de un RP basado en su desempeño';

-- ============================================
-- 5. CONSULTAS DE VERIFICACIÓN
-- ============================================

-- Verificar columnas agregadas
SELECT 
  table_name,
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name IN ('tickets', 'mesas', 'reservaciones', 'clientes')
  AND column_name IN ('rp_nombre', 'mesa_numero', 'calificacion_promedio')
ORDER BY table_name, column_name;

-- Verificar índices creados
SELECT 
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('tickets', 'mesas', 'reservaciones', 'clientes')
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Verificar vistas creadas
SELECT 
  table_name as vista_nombre,
  view_definition
FROM information_schema.views
WHERE table_name LIKE 'vista_%'
ORDER BY table_name;

-- ============================================
-- 6. DATOS DE PRUEBA (OPCIONAL)
-- ============================================

-- Actualizar tickets existentes con RP aleatorio (solo para testing)
-- DESCOMENTAR SOLO SI QUIERES DATOS DE PRUEBA
/*
UPDATE tickets 
SET rp_nombre = (
  SELECT rp_nombre 
  FROM limites_cortesias_rp 
  WHERE activo = true 
  ORDER BY RANDOM() 
  LIMIT 1
)
WHERE rp_nombre IS NULL 
  AND created_at >= NOW() - INTERVAL '30 days';
*/

-- ============================================
-- 7. ESTADÍSTICAS FINALES
-- ============================================

-- Resumen de métricas por RP
SELECT * FROM vista_metricas_rps LIMIT 10;

-- Resumen de conversión
SELECT * FROM vista_conversion_rps LIMIT 10;

-- Consumo actual de mesas
SELECT * FROM vista_consumo_mesas LIMIT 10;

-- Mensajes de confirmación
DO $$ 
BEGIN
  RAISE NOTICE '✅ Script ejecutado exitosamente';
  RAISE NOTICE '📊 Columnas agregadas: rp_nombre, mesa_numero';
  RAISE NOTICE '🔍 Índices creados para optimización';
  RAISE NOTICE '📈 Vistas creadas: vista_metricas_rps, vista_conversion_rps, vista_consumo_mesas, vista_historial_cliente, vista_mesas_rp_periodo';
  RAISE NOTICE '⚡ Función creada: calcular_bono_rp';
  RAISE NOTICE '🎯 Base de datos optimizada para métricas de CRM';
END $$;
