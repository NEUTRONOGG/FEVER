-- =====================================================
-- SINCRONIZAR VISITAS HISTÓRICAS
-- Genera visitas en la tabla `visitas` a partir de
-- los tickets históricos existentes, y actualiza
-- total_visitas y ultima_visita en `clientes`.
-- 
-- EJECUTAR EN: Supabase → SQL Editor
-- =====================================================

-- PASO 1: Insertar visitas desde tickets históricos
-- (solo las que NO tienen ya un registro en visitas para ese ticket)
INSERT INTO visitas (
  cliente_id,
  mesa_numero,
  numero_personas,
  hora_llegada,
  fecha,
  total_consumo,
  productos_consumidos,
  mesero,
  created_at
)
SELECT
  t.cliente_id,
  CAST(t.mesa_numero AS TEXT),
  1,                              -- no se guarda numero_personas en tickets
  t.created_at,                   -- hora del ticket = hora de la visita
  t.created_at,
  COALESCE(t.total, 0),
  COALESCE(t.productos, '[]'::jsonb),
  t.mesero,
  t.created_at
FROM tickets t
WHERE t.cliente_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM visitas v
    WHERE v.cliente_id = t.cliente_id
      AND ABS(EXTRACT(EPOCH FROM (v.created_at - t.created_at))) < 300  -- evita duplicados (±5 min)
  );

-- PASO 2: Actualizar total_visitas y ultima_visita en clientes
-- basado en la cantidad de visitas y la más reciente
UPDATE clientes c
SET
  total_visitas = sub.cantidad,
  ultima_visita  = sub.ultima
FROM (
  SELECT
    cliente_id,
    COUNT(*)              AS cantidad,
    MAX(created_at)       AS ultima
  FROM visitas
  WHERE cliente_id IS NOT NULL
  GROUP BY cliente_id
) sub
WHERE c.id = sub.cliente_id;

-- PASO 3: Verificación — cuántas visitas quedaron registradas
SELECT
  COUNT(*)                        AS total_visitas_registradas,
  COUNT(DISTINCT cliente_id)      AS clientes_con_visitas,
  MIN(fecha)                      AS visita_mas_antigua,
  MAX(fecha)                      AS visita_mas_reciente
FROM visitas;

-- PASO 4: Top 10 clientes por visitas (para confirmar que quedó bien)
SELECT
  c.nombre,
  c.apellido,
  c.total_visitas,
  c.ultima_visita
FROM clientes c
WHERE c.total_visitas > 0
ORDER BY c.total_visitas DESC
LIMIT 10;
