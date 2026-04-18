-- ============================================
-- FIX: ELIMINAR COLUMNA mesa_numero DE TABLA mesas
-- Esta columna no debería existir en la tabla mesas
-- ============================================

-- Eliminar columna mesa_numero si existe
ALTER TABLE mesas 
DROP COLUMN IF EXISTS mesa_numero;

-- Verificar las columnas actuales de la tabla mesas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mesas' 
ORDER BY ordinal_position;

-- Debe mostrar solo estas columnas:
-- id, numero, capacidad, estado, cliente_id, cliente_nombre, 
-- numero_personas, hostess, mesero, rp, hora_entrada, hora_salida,
-- pedidos_data, total_actual, updated_at

SELECT '✅ Columna mesa_numero eliminada de tabla mesas' as resultado;
