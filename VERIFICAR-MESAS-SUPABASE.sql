-- ============================================
-- VERIFICAR MESAS EN SUPABASE
-- ============================================

-- 1. Ver TODAS las mesas
SELECT 
  numero,
  capacidad,
  estado,
  cliente_nombre,
  numero_personas
FROM mesas
ORDER BY numero;

-- 2. Ver cuántas mesas hay por estado
SELECT 
  COALESCE(estado, 'sin estado') as estado,
  COUNT(*) as cantidad
FROM mesas
GROUP BY estado;

-- 3. Ver solo mesas disponibles (sin cliente)
SELECT 
  numero,
  capacidad,
  estado,
  cliente_nombre
FROM mesas
WHERE cliente_nombre IS NULL 
   OR cliente_nombre = ''
   OR estado = 'disponible'
ORDER BY numero;

-- 4. Si NO hay mesas disponibles, liberar algunas
-- (SOLO ejecutar si todas están ocupadas)
-- DESCOMENTA ESTO SI NECESITAS LIBERAR MESAS:
/*
UPDATE mesas
SET estado = 'disponible',
    cliente_id = NULL,
    cliente_nombre = NULL,
    numero_personas = NULL,
    hostess = NULL,
    rp = NULL,
    mesero = NULL
WHERE numero IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
*/

-- 5. Verificar resultado
SELECT 
  'Total mesas' as tipo,
  COUNT(*) as cantidad
FROM mesas

UNION ALL

SELECT 
  'Mesas disponibles (sin cliente)' as tipo,
  COUNT(*) as cantidad
FROM mesas
WHERE cliente_nombre IS NULL 
   OR cliente_nombre = ''
   OR estado = 'disponible';
