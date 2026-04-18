-- =====================================================
-- SCRIPT: AGREGAR MENÚ COMPLETO AL CRM
-- Descripción: Inserta todos los productos del menú
-- Fecha: 2024-11-05
-- =====================================================

-- Limpiar productos existentes (opcional, comentar si no se desea)
-- TRUNCATE TABLE productos RESTART IDENTITY CASCADE;

-- =====================================================
-- CATEGORÍA: TEQUILA
-- =====================================================

-- Centenario Plata
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Centenario Plata Copa', 'Tequila', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Centenario Plata Botella', 'Tequila', 1890.00, 50, 10, 'Botella', 945.00, 'Distribuidora de Licores');

-- Centenario Ultra
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Centenario Ultra Copa', 'Tequila', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Centenario Ultra Botella', 'Tequila', 1890.00, 50, 10, 'Botella', 945.00, 'Distribuidora de Licores');

-- Centenario Reposado
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Centenario Reposado Copa', 'Tequila', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Centenario Reposado Botella', 'Tequila', 1890.00, 50, 10, 'Botella', 945.00, 'Distribuidora de Licores');

-- 1800 Cristalino
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('1800 Cristalino Copa', 'Tequila', 200.00, 100, 20, 'Copa', 100.00, 'Distribuidora de Licores'),
  ('1800 Cristalino Botella', 'Tequila', 2990.00, 40, 8, 'Botella', 1495.00, 'Distribuidora de Licores'),
  ('1800 Cristalino Patona 1750ml', 'Tequila', 5990.00, 20, 5, 'Botella', 2995.00, 'Distribuidora de Licores');

-- Dobel Diamante
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Dobel Diamante Copa', 'Tequila', 240.00, 100, 20, 'Copa', 120.00, 'Distribuidora de Licores'),
  ('Dobel Diamante Botella', 'Tequila', 2290.00, 40, 8, 'Botella', 1145.00, 'Distribuidora de Licores'),
  ('Dobel Diamante 1750ml', 'Tequila', 5990.00, 20, 5, 'Botella', 2995.00, 'Distribuidora de Licores');

-- Dobel Blanco
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Dobel Blanco Copa', 'Tequila', 180.00, 100, 20, 'Copa', 90.00, 'Distribuidora de Licores'),
  ('Dobel Blanco Botella', 'Tequila', 2140.00, 40, 8, 'Botella', 1070.00, 'Distribuidora de Licores');

-- Don Julio 70
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Don Julio 70 Copa', 'Tequila', 240.00, 100, 20, 'Copa', 120.00, 'Distribuidora de Licores'),
  ('Don Julio 70 Botella', 'Tequila', 3170.00, 30, 6, 'Botella', 1585.00, 'Distribuidora de Licores');

-- Don Julio Reposado
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Don Julio Reposado Copa', 'Tequila', 200.00, 100, 20, 'Copa', 100.00, 'Distribuidora de Licores'),
  ('Don Julio Reposado Botella', 'Tequila', 2340.00, 30, 6, 'Botella', 1170.00, 'Distribuidora de Licores');

-- Don Julio 1942
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Don Julio 1942 Botella', 'Tequila', 7990.00, 15, 3, 'Botella', 3995.00, 'Distribuidora de Licores');

-- Herradura Plata
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Herradura Plata Copa', 'Tequila', 150.00, 100, 20, 'Copa', 75.00, 'Distribuidora de Licores'),
  ('Herradura Plata Botella', 'Tequila', 2240.00, 40, 8, 'Botella', 1120.00, 'Distribuidora de Licores');

-- Herradura Ultra
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Herradura Ultra Copa', 'Tequila', 220.00, 100, 20, 'Copa', 110.00, 'Distribuidora de Licores'),
  ('Herradura Ultra Botella', 'Tequila', 2965.00, 30, 6, 'Botella', 1482.50, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: VODKA
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Smirnoff Copa', 'Vodka', 100.00, 100, 20, 'Copa', 50.00, 'Distribuidora de Licores'),
  ('Smirnoff Botella', 'Vodka', 1490.00, 60, 12, 'Botella', 745.00, 'Distribuidora de Licores'),
  ('Stolichnaya Copa', 'Vodka', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Stolichnaya Botella', 'Vodka', 1840.00, 50, 10, 'Botella', 920.00, 'Distribuidora de Licores'),
  ('Smirnoff Tamarindo Copa', 'Vodka', 110.00, 100, 20, 'Copa', 55.00, 'Distribuidora de Licores'),
  ('Smirnoff Tamarindo Botella', 'Vodka', 1490.00, 50, 10, 'Botella', 745.00, 'Distribuidora de Licores'),
  ('Absolut Copa', 'Vodka', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Absolut Botella', 'Vodka', 1690.00, 50, 10, 'Botella', 845.00, 'Distribuidora de Licores'),
  ('Grey Goose Copa', 'Vodka', 190.00, 80, 15, 'Copa', 95.00, 'Distribuidora de Licores'),
  ('Grey Goose Botella', 'Vodka', 2690.00, 30, 6, 'Botella', 1345.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: MEZCAL
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('400 Conejos Espadín Copa', 'Mezcal', 150.00, 100, 20, 'Copa', 75.00, 'Distribuidora de Licores'),
  ('400 Conejos Espadín Botella', 'Mezcal', 1940.00, 40, 8, 'Botella', 970.00, 'Distribuidora de Licores'),
  ('Unión Joven Copa', 'Mezcal', 149.00, 100, 20, 'Copa', 74.50, 'Distribuidora de Licores'),
  ('Unión Joven Botella', 'Mezcal', 1890.00, 40, 8, 'Botella', 945.00, 'Distribuidora de Licores'),
  ('Monte Lobos Tobala Copa', 'Mezcal', 180.00, 80, 15, 'Copa', 90.00, 'Distribuidora de Licores'),
  ('Monte Lobos Tobala Botella', 'Mezcal', 2490.00, 30, 6, 'Botella', 1245.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: GINEBRA
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Tanqueray London Copa', 'Ginebra', 160.00, 100, 20, 'Copa', 80.00, 'Distribuidora de Licores'),
  ('Tanqueray London Botella', 'Ginebra', 2240.00, 40, 8, 'Botella', 1120.00, 'Distribuidora de Licores'),
  ('Tanqueray Ten Copa', 'Ginebra', 180.00, 80, 15, 'Copa', 90.00, 'Distribuidora de Licores'),
  ('Tanqueray Ten Botella', 'Ginebra', 2590.00, 30, 6, 'Botella', 1295.00, 'Distribuidora de Licores'),
  ('Beefeater Copa', 'Ginebra', 150.00, 100, 20, 'Copa', 75.00, 'Distribuidora de Licores'),
  ('Beefeater Botella', 'Ginebra', 2090.00, 40, 8, 'Botella', 1045.00, 'Distribuidora de Licores'),
  ('Bombay Copa', 'Ginebra', 150.00, 100, 20, 'Copa', 75.00, 'Distribuidora de Licores'),
  ('Bombay Botella', 'Ginebra', 1990.00, 40, 8, 'Botella', 995.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: RON
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Bacardi Blanco Copa', 'Ron', 100.00, 100, 20, 'Copa', 50.00, 'Distribuidora de Licores'),
  ('Bacardi Blanco Botella', 'Ron', 1440.00, 60, 12, 'Botella', 720.00, 'Distribuidora de Licores'),
  ('Bacardi Blanco 1750ml', 'Ron', 2990.00, 30, 6, 'Botella', 1495.00, 'Distribuidora de Licores'),
  ('Matusalem Platino Copa', 'Ron', 100.00, 100, 20, 'Copa', 50.00, 'Distribuidora de Licores'),
  ('Matusalem Platino Botella', 'Ron', 1390.00, 50, 10, 'Botella', 695.00, 'Distribuidora de Licores'),
  ('Matusalem Clásico Copa', 'Ron', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Matusalem Clásico Botella', 'Ron', 1550.00, 50, 10, 'Botella', 775.00, 'Distribuidora de Licores'),
  ('Habana 7 Copa', 'Ron', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Habana 7 Botella', 'Ron', 1940.00, 40, 8, 'Botella', 970.00, 'Distribuidora de Licores'),
  ('Zacapa 23 Copa', 'Ron', 240.00, 80, 15, 'Copa', 120.00, 'Distribuidora de Licores'),
  ('Zacapa 23 Botella', 'Ron', 2290.00, 25, 5, 'Botella', 1145.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: WHISKY
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Red Label Copa', 'Whisky', 130.00, 100, 20, 'Copa', 65.00, 'Distribuidora de Licores'),
  ('Red Label Botella', 'Whisky', 1990.00, 50, 10, 'Botella', 995.00, 'Distribuidora de Licores'),
  ('Black Label Copa', 'Whisky', 190.00, 80, 15, 'Copa', 95.00, 'Distribuidora de Licores'),
  ('Black Label Botella', 'Whisky', 2490.00, 40, 8, 'Botella', 1245.00, 'Distribuidora de Licores'),
  ('Buchanan''s 12 Copa', 'Whisky', 190.00, 80, 15, 'Copa', 95.00, 'Distribuidora de Licores'),
  ('Buchanan''s 12 Botella', 'Whisky', 2290.00, 40, 8, 'Botella', 1145.00, 'Distribuidora de Licores'),
  ('Buchanan''s 18 Botella', 'Whisky', 5990.00, 15, 3, 'Botella', 2995.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: BRANDY
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Torres X Copa', 'Brandy', 130.00, 100, 20, 'Copa', 65.00, 'Distribuidora de Licores'),
  ('Torres X Botella', 'Brandy', 1990.00, 40, 8, 'Botella', 995.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: COGNAC
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Martell VSOP Copa', 'Cognac', 210.00, 80, 15, 'Copa', 105.00, 'Distribuidora de Licores'),
  ('Martell VSOP Botella', 'Cognac', 3140.00, 25, 5, 'Botella', 1570.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: CHAMPAGNE
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Moët Brut Botella', 'Champagne', 3990.00, 30, 6, 'Botella', 1995.00, 'Distribuidora de Licores'),
  ('Moët Ice Botella', 'Champagne', 4790.00, 25, 5, 'Botella', 2395.00, 'Distribuidora de Licores'),
  ('Dom Pérignon Luminus Botella', 'Champagne', 22290.00, 10, 2, 'Botella', 11145.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: SHOTS
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Perla Negra 230', 'Shots', 230.00, 200, 40, 'Shot', 115.00, 'Distribuidora de Licores'),
  ('Bufanda Azul 230', 'Shots', 230.00, 200, 40, 'Shot', 115.00, 'Distribuidora de Licores'),
  ('Revolver 350', 'Shots', 350.00, 150, 30, 'Shot', 175.00, 'Distribuidora de Licores'),
  ('Turbina 280', 'Shots', 280.00, 150, 30, 'Shot', 140.00, 'Distribuidora de Licores');

-- =====================================================
-- CATEGORÍA: COCTELERÍA
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Negroni', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Margarita', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Mojito', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Fernanditos', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Hanky Panky', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('St-Germain Spritz', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Aperol Spritz', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Limoncello Spritz', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Campari Spritz', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Moscow Mule', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación');

-- =====================================================
-- CATEGORÍA: CERVEZA
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('XX', 'Cerveza', 80.00, 300, 60, 'Botella', 40.00, 'Cervecería Cuauhtémoc'),
  ('XX Lager', 'Cerveza', 80.00, 300, 60, 'Botella', 40.00, 'Cervecería Cuauhtémoc'),
  ('Ultra', 'Cerveza', 80.00, 300, 60, 'Botella', 40.00, 'Cervecería Cuauhtémoc'),
  ('Bohemia Cristal', 'Cerveza', 80.00, 250, 50, 'Botella', 40.00, 'Cervecería Cuauhtémoc'),
  ('Heineken', 'Cerveza', 80.00, 300, 60, 'Botella', 40.00, 'Heineken México');

-- =====================================================
-- CATEGORÍA: MIXOLOGÍA
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Moon Milk', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Apple Balkan', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Xococol', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Agave Soul', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Harry Night', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Mezcal Mirage', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Berry Ron', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Sunrise', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Café Quina', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación');

-- =====================================================
-- CATEGORÍA: ENERGIZANTES
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('RedBull', 'Energizantes', 90.00, 200, 40, 'Lata', 45.00, 'Red Bull México'),
  ('RedBull Sugar Free', 'Energizantes', 90.00, 150, 30, 'Lata', 45.00, 'Red Bull México'),
  ('RedBull Tropical', 'Energizantes', 90.00, 150, 30, 'Lata', 45.00, 'Red Bull México'),
  ('RedBull Sandía', 'Energizantes', 90.00, 150, 30, 'Lata', 45.00, 'Red Bull México'),
  ('Boost', 'Energizantes', 90.00, 150, 30, 'Lata', 45.00, 'Distribuidora de Bebidas');

-- =====================================================
-- CATEGORÍA: REFRESCOS Y BEBIDAS
-- =====================================================

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES 
  ('Agua Mineral', 'Refrescos', 55.00, 300, 60, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Coca Cola', 'Refrescos', 55.00, 300, 60, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Coca Cola Sin Azúcar', 'Refrescos', 55.00, 200, 40, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Squirt', 'Refrescos', 55.00, 200, 40, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Sprite', 'Refrescos', 55.00, 200, 40, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Agua Natural', 'Refrescos', 55.00, 300, 60, 'Botella', 27.50, 'Distribuidora de Bebidas'),
  ('Mundet', 'Refrescos', 55.00, 150, 30, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Tónica', 'Refrescos', 55.00, 150, 30, 'Botella', 27.50, 'Distribuidora de Bebidas'),
  ('Naranjada', 'Refrescos', 50.00, 0, 0, 'Vaso', 25.00, 'Preparación'),
  ('Limonada', 'Refrescos', 50.00, 0, 0, 'Vaso', 25.00, 'Preparación'),
  ('Vaso de Jugo', 'Refrescos', 50.00, 0, 0, 'Vaso', 25.00, 'Preparación'),
  ('Jarra de Jugo', 'Refrescos', 150.00, 0, 0, 'Jarra', 75.00, 'Preparación');

-- =====================================================
-- ACTUALIZAR ÍNDICES Y ESTADÍSTICAS
-- =====================================================

-- Actualizar estadísticas de la tabla
ANALYZE productos;

-- Crear índice adicional para búsquedas por categoría si no existe
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);

-- =====================================================
-- RESUMEN DE PRODUCTOS AGREGADOS
-- =====================================================

-- Contar productos por categoría
SELECT 
  categoria,
  COUNT(*) as total_productos,
  SUM(CASE WHEN unidad IN ('Copa', 'Shot', 'Coctel', 'Vaso', 'Lata') THEN 1 ELSE 0 END) as productos_individuales,
  SUM(CASE WHEN unidad IN ('Botella', 'Jarra') THEN 1 ELSE 0 END) as productos_botella
FROM productos
GROUP BY categoria
ORDER BY categoria;

-- Total general
SELECT 
  COUNT(*) as total_productos,
  COUNT(DISTINCT categoria) as total_categorias
FROM productos;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
-- 
-- 1. Los precios de compra están calculados al 50% del precio de venta
--    Ajustar según los costos reales del proveedor
--
-- 2. El stock inicial es estimado:
--    - Licores populares: 100-300 unidades
--    - Licores premium: 30-80 unidades
--    - Licores ultra premium: 10-25 unidades
--    - Cocteles/Preparados: 0 (se preparan al momento)
--
-- 3. Stock mínimo calculado al 20% del stock inicial
--
-- 4. Categorías principales:
--    - Tequila (25 productos)
--    - Vodka (10 productos)
--    - Mezcal (6 productos)
--    - Ginebra (8 productos)
--    - Ron (11 productos)
--    - Whisky (7 productos)
--    - Brandy (2 productos)
--    - Cognac (2 productos)
--    - Champagne (3 productos)
--    - Shots (4 productos)
--    - Coctelería (10 productos)
--    - Cerveza (5 productos)
--    - Mixología (9 productos)
--    - Energizantes (5 productos)
--    - Refrescos (12 productos)
--
-- TOTAL: 119 productos
--
-- =====================================================
