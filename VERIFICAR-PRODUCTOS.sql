-- =====================================================
-- VERIFICACIÓN RÁPIDA DE PRODUCTOS
-- =====================================================

-- 1. Contar total de productos
SELECT COUNT(*) as total_productos FROM productos;
-- Esperado: 119

-- 2. Ver productos por categoría
SELECT 
  categoria,
  COUNT(*) as cantidad,
  MIN(precio) as precio_min,
  MAX(precio) as precio_max
FROM productos
GROUP BY categoria
ORDER BY categoria;

-- 3. Ver primeros 10 productos
SELECT id, nombre, categoria, precio, unidad
FROM productos
ORDER BY categoria, nombre
LIMIT 10;

-- 4. Verificar si hay productos duplicados
SELECT nombre, COUNT(*) as veces
FROM productos
GROUP BY nombre
HAVING COUNT(*) > 1;

-- 5. Ver todas las categorías disponibles
SELECT DISTINCT categoria
FROM productos
ORDER BY categoria;

-- =====================================================
-- Si el total es menor a 119, ejecuta esto:
-- =====================================================

-- Opción 1: Limpiar y volver a insertar
-- TRUNCATE TABLE productos RESTART IDENTITY CASCADE;
-- Luego ejecuta AGREGAR-MENU-COMPLETO.sql

-- Opción 2: Ver qué productos faltan
SELECT 
  'Tequila' as categoria_esperada, 
  25 as cantidad_esperada,
  COUNT(*) as cantidad_actual
FROM productos WHERE categoria = 'Tequila'
UNION ALL
SELECT 'Vodka', 10, COUNT(*) FROM productos WHERE categoria = 'Vodka'
UNION ALL
SELECT 'Mezcal', 6, COUNT(*) FROM productos WHERE categoria = 'Mezcal'
UNION ALL
SELECT 'Ginebra', 8, COUNT(*) FROM productos WHERE categoria = 'Ginebra'
UNION ALL
SELECT 'Ron', 11, COUNT(*) FROM productos WHERE categoria = 'Ron'
UNION ALL
SELECT 'Whisky', 7, COUNT(*) FROM productos WHERE categoria = 'Whisky'
UNION ALL
SELECT 'Brandy', 2, COUNT(*) FROM productos WHERE categoria = 'Brandy'
UNION ALL
SELECT 'Cognac', 2, COUNT(*) FROM productos WHERE categoria = 'Cognac'
UNION ALL
SELECT 'Champagne', 3, COUNT(*) FROM productos WHERE categoria = 'Champagne'
UNION ALL
SELECT 'Shots', 4, COUNT(*) FROM productos WHERE categoria = 'Shots'
UNION ALL
SELECT 'Coctelería', 10, COUNT(*) FROM productos WHERE categoria = 'Coctelería'
UNION ALL
SELECT 'Cerveza', 5, COUNT(*) FROM productos WHERE categoria = 'Cerveza'
UNION ALL
SELECT 'Mixología', 9, COUNT(*) FROM productos WHERE categoria = 'Mixología'
UNION ALL
SELECT 'Energizantes', 5, COUNT(*) FROM productos WHERE categoria = 'Energizantes'
UNION ALL
SELECT 'Refrescos', 12, COUNT(*) FROM productos WHERE categoria = 'Refrescos';
