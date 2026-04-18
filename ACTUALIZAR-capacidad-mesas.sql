-- ============================================
-- ACTUALIZAR CAPACIDAD DE MESAS A 10
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ============================================
-- ACTUALIZAR CAPACIDAD DE TODAS LAS MESAS A 10
-- ============================================

-- 1. Ver capacidades actuales
SELECT 
  capacidad,
  COUNT(*) as cantidad_mesas
FROM mesas
GROUP BY capacidad
ORDER BY capacidad;

-- 2. Actualizar TODAS las mesas a capacidad 10
UPDATE mesas
SET capacidad = 10;

-- 3. Verificar que se actualizaron
SELECT 
  'Mesas actualizadas' as resultado,
  COUNT(*) as total_mesas,
  MIN(capacidad) as capacidad_minima,
  MAX(capacidad) as capacidad_maxima
FROM mesas;

-- 4. Ver todas las mesas con nueva capacidad
SELECT 
  numero,
  capacidad,
  estado,
  cliente_nombre
FROM mesas
ORDER BY numero;

-- Verificar
SELECT id, numero, capacidad, estado FROM mesas_clientes ORDER BY id;
