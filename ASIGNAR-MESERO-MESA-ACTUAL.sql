-- Script para asignar mesero a la mesa ocupada actual
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- PASO 1: Ver mesas ocupadas
-- ============================================
SELECT id, numero, cliente_nombre, estado, mesero_id
FROM mesas
WHERE estado = 'ocupada'
ORDER BY numero;

-- ============================================
-- PASO 2: Ver meseros disponibles
-- ============================================
SELECT id, nombre, activo
FROM meseros
WHERE activo = true
ORDER BY id;

-- ============================================
-- PASO 3: ASIGNAR MESERO A LA MESA
-- ============================================

-- Opción 1: Asignar al primer mesero activo
UPDATE mesas
SET mesero_id = (
  SELECT id 
  FROM meseros 
  WHERE activo = true 
  ORDER BY id 
  LIMIT 1
)
WHERE estado = 'ocupada'
AND mesero_id IS NULL;

-- ============================================
-- PASO 4: VERIFICAR ASIGNACIÓN
-- ============================================
SELECT 
  m.numero as mesa,
  m.cliente_nombre,
  m.estado,
  me.nombre as mesero_asignado,
  me.id as mesero_id
FROM mesas m
LEFT JOIN meseros me ON m.mesero_id = me.id
WHERE m.estado = 'ocupada'
ORDER BY m.numero;

-- ============================================
-- ALTERNATIVA: Asignar a un mesero específico
-- ============================================

-- Si quieres asignar a un mesero específico por su ID:
-- UPDATE mesas
-- SET mesero_id = 1  -- Cambia el 1 por el ID del mesero que quieras
-- WHERE numero = '1'  -- Cambia el número de mesa si es diferente
-- AND estado = 'ocupada';

-- ============================================
-- NOTA IMPORTANTE
-- ============================================
-- Después de ejecutar este script:
-- 1. El mesero verá la mesa en su panel
-- 2. Podrá tomar pedidos
-- 3. Podrá cerrar la cuenta
