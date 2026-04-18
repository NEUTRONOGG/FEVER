-- ============================================
-- VERIFICAR Y LIMPIAR ESTADO DE MESAS
-- ============================================

-- 1. Ver todas las mesas y su estado actual
SELECT 
  id,
  numero,
  estado,
  cliente_nombre,
  numero_personas,
  rp_asignado,
  total_actual
FROM mesas
ORDER BY CAST(numero AS INTEGER);

-- 2. Ver específicamente la Mesa 9
SELECT * FROM mesas WHERE numero = '9';

-- 3. Ver específicamente la Mesa 12 (la que aparece con borde verde)
SELECT * FROM mesas WHERE numero = '12';

-- 4. LIMPIAR todas las mesas que tengan datos pero estado incorrecto
-- (Si tienen cliente_nombre pero estado = 'disponible', corregir a 'ocupada')
UPDATE mesas 
SET estado = 'ocupada'
WHERE cliente_nombre IS NOT NULL 
  AND cliente_nombre != ''
  AND estado = 'disponible';

-- 5. LIMPIAR mesas que estén marcadas como ocupadas pero sin cliente
-- (Si estado = 'ocupada' pero no tienen cliente, marcar como 'disponible')
UPDATE mesas 
SET estado = 'disponible',
    cliente_nombre = NULL,
    numero_personas = NULL,
    rp_asignado = NULL,
    total_actual = 0,
    pedidos_data = '[]'
WHERE estado = 'ocupada' 
  AND (cliente_nombre IS NULL OR cliente_nombre = '');

-- 6. Verificar resultado final
SELECT 
  numero,
  estado,
  cliente_nombre,
  rp_asignado
FROM mesas
WHERE estado != 'disponible'
ORDER BY CAST(numero AS INTEGER);

-- ✅ Ejecuta este script completo para limpiar inconsistencias
