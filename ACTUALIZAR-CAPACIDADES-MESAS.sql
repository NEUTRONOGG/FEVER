-- =====================================================
-- ACTUALIZAR CAPACIDADES DE MESAS
-- =====================================================
-- Actualiza la capacidad de personas por mesa
-- Solo actualiza las mesas que existen
-- =====================================================

-- Actualizar capacidades según especificación
UPDATE mesas SET capacidad = 10 WHERE numero = '1';
UPDATE mesas SET capacidad = 7 WHERE numero = '2';
UPDATE mesas SET capacidad = 6 WHERE numero = '4';
UPDATE mesas SET capacidad = 4 WHERE numero = '5';
UPDATE mesas SET capacidad = 6 WHERE numero = '6';
UPDATE mesas SET capacidad = 7 WHERE numero = '7';
UPDATE mesas SET capacidad = 10 WHERE numero = '10';
UPDATE mesas SET capacidad = 10 WHERE numero = '11';
UPDATE mesas SET capacidad = 10 WHERE numero = '12';
UPDATE mesas SET capacidad = 10 WHERE numero = '13';
UPDATE mesas SET capacidad = 10 WHERE numero = '14';
UPDATE mesas SET capacidad = 10 WHERE numero = '15';
UPDATE mesas SET capacidad = 10 WHERE numero = '16';
UPDATE mesas SET capacidad = 10 WHERE numero = '20';
UPDATE mesas SET capacidad = 10 WHERE numero = '21';
UPDATE mesas SET capacidad = 10 WHERE numero = '22';
UPDATE mesas SET capacidad = 10 WHERE numero = '23';
UPDATE mesas SET capacidad = 10 WHERE numero = '24';
UPDATE mesas SET capacidad = 10 WHERE numero = '25';
UPDATE mesas SET capacidad = 10 WHERE numero = '26';
UPDATE mesas SET capacidad = 10 WHERE numero = '30';
UPDATE mesas SET capacidad = 10 WHERE numero = '31';
UPDATE mesas SET capacidad = 10 WHERE numero = '32';
UPDATE mesas SET capacidad = 6 WHERE numero = '33';
UPDATE mesas SET capacidad = 10 WHERE numero = '34';
UPDATE mesas SET capacidad = 10 WHERE numero = '35';
UPDATE mesas SET capacidad = 10 WHERE numero = '36';
UPDATE mesas SET capacidad = 7 WHERE numero = '37';

-- Verificación: Mostrar todas las mesas con sus nuevas capacidades
SELECT 
  numero as "Mesa",
  capacidad as "Capacidad",
  estado as "Estado",
  CASE 
    WHEN estado = 'disponible' THEN '🟢'
    WHEN estado = 'ocupada' THEN '🔴'
    WHEN estado = 'reservada' THEN '🟡'
  END as "Icono"
FROM mesas
ORDER BY CAST(numero AS INTEGER);

SELECT '✅ Capacidades de mesas actualizadas correctamente' as resultado;
