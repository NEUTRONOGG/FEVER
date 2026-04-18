-- =====================================================
-- LIBERAR MESA 7 MANUALMENTE
-- =====================================================

-- Ver estado actual de la mesa 7
SELECT 
  id,
  numero,
  estado,
  cliente_nombre,
  cliente_id,
  total_actual,
  hostess,
  mesero,
  rp_asignado
FROM mesas 
WHERE numero = '7';

-- Liberar la mesa 7
UPDATE mesas SET
  estado = 'disponible',
  cliente_id = NULL,
  cliente_nombre = NULL,
  numero_personas = 0,
  hostess = NULL,
  mesero = NULL,
  rp_asignado = NULL,
  hora_asignacion = NULL,
  pedidos_data = '[]'::jsonb,
  total_actual = 0,
  updated_at = NOW()
WHERE numero = '7';

-- Verificar que se liberó
SELECT 
  numero,
  estado,
  cliente_nombre,
  total_actual
FROM mesas 
WHERE numero = '7';

SELECT '✅ Mesa 7 liberada correctamente' as resultado;
