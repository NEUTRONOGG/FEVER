-- Script para asignar mesas ocupadas a meseros
-- Ejecutar en Supabase SQL Editor

-- Primero, verificar qué mesas están ocupadas
SELECT id, numero, cliente_nombre, mesero_id, estado 
FROM mesas 
WHERE estado = 'ocupada'
ORDER BY numero;

-- Ver qué meseros están disponibles
SELECT id, nombre 
FROM meseros 
WHERE activo = true
ORDER BY nombre;

-- ============================================
-- ASIGNAR MESAS A MESEROS
-- ============================================

-- Opción 1: Si conoces los IDs específicos de las mesas y meseros
-- Reemplaza los valores con los IDs reales de tu base de datos

-- Ejemplo: Asignar mesa 1 al mesero 1
-- UPDATE mesas 
-- SET mesero_id = 1 
-- WHERE numero = '1' AND estado = 'ocupada';

-- Ejemplo: Asignar mesa 2 al mesero 2
-- UPDATE mesas 
-- SET mesero_id = 2 
-- WHERE numero = '2' AND estado = 'ocupada';

-- Ejemplo: Asignar mesa 3 al mesero 3
-- UPDATE mesas 
-- SET mesero_id = 3 
-- WHERE numero = '3' AND estado = 'ocupada';

-- ============================================
-- OPCIÓN 2: ASIGNACIÓN AUTOMÁTICA
-- ============================================
-- Este script asigna automáticamente las mesas ocupadas
-- a los primeros 3 meseros activos de forma rotativa

DO $$ 
DECLARE
  mesa_record RECORD;
  mesero_ids INTEGER[];
  mesero_index INTEGER := 0;
BEGIN
  -- Obtener IDs de los primeros 3 meseros activos
  SELECT ARRAY_AGG(id) INTO mesero_ids
  FROM (
    SELECT id 
    FROM meseros 
    WHERE activo = true 
    ORDER BY id 
    LIMIT 3
  ) sub;
  
  -- Verificar que hay meseros disponibles
  IF mesero_ids IS NULL OR array_length(mesero_ids, 1) = 0 THEN
    RAISE NOTICE '⚠️ No hay meseros activos disponibles';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ Meseros disponibles: %', mesero_ids;
  
  -- Asignar cada mesa ocupada a un mesero diferente
  FOR mesa_record IN 
    SELECT id, numero 
    FROM mesas 
    WHERE estado = 'ocupada' AND mesero_id IS NULL
    ORDER BY numero
  LOOP
    -- Asignar al mesero actual
    UPDATE mesas 
    SET mesero_id = mesero_ids[mesero_index + 1]
    WHERE id = mesa_record.id;
    
    RAISE NOTICE '✅ Mesa % asignada al mesero ID %', mesa_record.numero, mesero_ids[mesero_index + 1];
    
    -- Rotar al siguiente mesero
    mesero_index := (mesero_index + 1) % array_length(mesero_ids, 1);
  END LOOP;
  
  RAISE NOTICE '✅ Asignación completada';
END $$;

-- ============================================
-- VERIFICAR ASIGNACIÓN
-- ============================================

SELECT 
  m.numero as mesa,
  m.cliente_nombre,
  m.estado,
  mes.nombre as mesero_asignado,
  m.numero_personas
FROM mesas m
LEFT JOIN meseros mes ON m.mesero_id = mes.id
WHERE m.estado = 'ocupada'
ORDER BY m.numero;

-- ============================================
-- RESUMEN
-- ============================================

SELECT 
  mes.nombre as mesero,
  COUNT(m.id) as mesas_asignadas,
  STRING_AGG(m.numero, ', ' ORDER BY m.numero) as numeros_mesas
FROM meseros mes
LEFT JOIN mesas m ON mes.id = m.mesero_id AND m.estado = 'ocupada'
WHERE mes.activo = true
GROUP BY mes.id, mes.nombre
ORDER BY mes.nombre;
