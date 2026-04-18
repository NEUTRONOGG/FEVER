-- =====================================================
-- AGREGAR PRODUCTOS AL MENÚ FEVER
-- Script optimizado y rápido
-- =====================================================

-- Limpiar productos existentes
TRUNCATE TABLE productos RESTART IDENTITY CASCADE;

-- =====================================================
-- INSERTAR TODOS LOS PRODUCTOS EN UNA SOLA TRANSACCIÓN
-- =====================================================

BEGIN;

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
-- TEQUILA
('Centenario Plata Copa', 'Tequila', 120, 100, 20, 'Copa', 60, 'Distribuidora'),
('Centenario Plata Botella', 'Tequila', 1890, 50, 10, 'Botella', 945, 'Distribuidora'),
('Centenario Ultra Copa', 'Tequila', 120, 100, 20, 'Copa', 60, 'Distribuidora'),
('Centenario Ultra Botella', 'Tequila', 1890, 50, 10, 'Botella', 945, 'Distribuidora'),
('Centenario Reposado Copa', 'Tequila', 120, 100, 20, 'Copa', 60, 'Distribuidora'),
('Centenario Reposado Botella', 'Tequila', 1890, 50, 10, 'Botella', 945, 'Distribuidora'),
('1800 Cristalino Copa', 'Tequila', 200, 100, 20, 'Copa', 100, 'Distribuidora'),
('1800 Cristalino Botella', 'Tequila', 2990, 40, 8, 'Botella', 1495, 'Distribuidora'),
('1800 Cristalino Patona 1750ml', 'Tequila', 5990, 20, 5, 'Botella', 2995, 'Distribuidora'),
('Dobel Diamante Copa', 'Tequila', 240, 100, 20, 'Copa', 120, 'Distribuidora'),
('Dobel Diamante Botella', 'Tequila', 2290, 40, 8, 'Botella', 1145, 'Distribuidora'),
('Dobel Diamante 1750ml', 'Tequila', 5990, 20, 5, 'Botella', 2995, 'Distribuidora'),
('Dobel Blanco Copa', 'Tequila', 180, 100, 20, 'Copa', 90, 'Distribuidora'),
('Dobel Blanco Botella', 'Tequila', 2140, 40, 8, 'Botella', 1070, 'Distribuidora'),
('Don Julio 70 Copa', 'Tequila', 240, 100, 20, 'Copa', 120, 'Distribuidora'),
('Don Julio 70 Botella', 'Tequila', 3170, 30, 6, 'Botella', 1585, 'Distribuidora'),
('Don Julio Reposado Copa', 'Tequila', 200, 100, 20, 'Copa', 100, 'Distribuidora'),
('Don Julio Reposado Botella', 'Tequila', 2340, 30, 6, 'Botella', 1170, 'Distribuidora'),
('Don Julio 1942 Botella', 'Tequila', 7990, 15, 3, 'Botella', 3995, 'Distribuidora'),
('Herradura Plata Copa', 'Tequila', 150, 100, 20, 'Copa', 75, 'Distribuidora'),
('Herradura Plata Botella', 'Tequila', 2240, 40, 8, 'Botella', 1120, 'Distribuidora'),
('Herradura Ultra Copa', 'Tequila', 220, 100, 20, 'Copa', 110, 'Distribuidora'),
('Herradura Ultra Botella', 'Tequila', 2965, 30, 6, 'Botella', 1482, 'Distribuidora'),

-- VODKA
('Smirnoff Copa', 'Vodka', 100, 100, 20, 'Copa', 50, 'Distribuidora'),
('Smirnoff Botella', 'Vodka', 1490, 60, 12, 'Botella', 745, 'Distribuidora'),
('Stolichnaya Copa', 'Vodka', 120, 100, 20, 'Copa', 60, 'Distribuidora'),
('Stolichnaya Botella', 'Vodka', 1840, 50, 10, 'Botella', 920, 'Distribuidora'),
('Smirnoff Tamarindo Copa', 'Vodka', 110, 100, 20, 'Copa', 55, 'Distribuidora'),
('Smirnoff Tamarindo Botella', 'Vodka', 1490, 50, 10, 'Botella', 745, 'Distribuidora'),
('Absolut Copa', 'Vodka', 120, 100, 20, 'Copa', 60, 'Distribuidora'),
('Absolut Botella', 'Vodka', 1690, 50, 10, 'Botella', 845, 'Distribuidora'),
('Grey Goose Copa', 'Vodka', 190, 80, 15, 'Copa', 95, 'Distribuidora'),
('Grey Goose Botella', 'Vodka', 2690, 30, 6, 'Botella', 1345, 'Distribuidora'),

-- MEZCAL
('400 Conejos Espadín Copa', 'Mezcal', 150, 100, 20, 'Copa', 75, 'Distribuidora'),
('400 Conejos Espadín Botella', 'Mezcal', 1940, 40, 8, 'Botella', 970, 'Distribuidora'),
('Unión Joven Copa', 'Mezcal', 149, 100, 20, 'Copa', 74, 'Distribuidora'),
('Unión Joven Botella', 'Mezcal', 1890, 40, 8, 'Botella', 945, 'Distribuidora'),
('Monte Lobos Tobala Copa', 'Mezcal', 180, 80, 15, 'Copa', 90, 'Distribuidora'),
('Monte Lobos Tobala Botella', 'Mezcal', 2490, 30, 6, 'Botella', 1245, 'Distribuidora'),

-- GINEBRA
('Tanqueray London Copa', 'Ginebra', 160, 100, 20, 'Copa', 80, 'Distribuidora'),
('Tanqueray London Botella', 'Ginebra', 2240, 40, 8, 'Botella', 1120, 'Distribuidora'),
('Tanqueray Ten Copa', 'Ginebra', 180, 80, 15, 'Copa', 90, 'Distribuidora'),
('Tanqueray Ten Botella', 'Ginebra', 2590, 30, 6, 'Botella', 1295, 'Distribuidora'),
('Beefeater Copa', 'Ginebra', 150, 100, 20, 'Copa', 75, 'Distribuidora'),
('Beefeater Botella', 'Ginebra', 2090, 40, 8, 'Botella', 1045, 'Distribuidora'),
('Bombay Copa', 'Ginebra', 150, 100, 20, 'Copa', 75, 'Distribuidora'),
('Bombay Botella', 'Ginebra', 1990, 40, 8, 'Botella', 995, 'Distribuidora'),

-- RON
('Bacardi Blanco Copa', 'Ron', 100, 100, 20, 'Copa', 50, 'Distribuidora'),
('Bacardi Blanco Botella', 'Ron', 1440, 60, 12, 'Botella', 720, 'Distribuidora'),
('Bacardi Blanco 1750ml', 'Ron', 2990, 30, 6, 'Botella', 1495, 'Distribuidora'),
('Matusalem Platino Copa', 'Ron', 100, 100, 20, 'Copa', 50, 'Distribuidora'),
('Matusalem Platino Botella', 'Ron', 1390, 50, 10, 'Botella', 695, 'Distribuidora'),
('Matusalem Clásico Copa', 'Ron', 120, 100, 20, 'Copa', 60, 'Distribuidora'),
('Matusalem Clásico Botella', 'Ron', 1550, 50, 10, 'Botella', 775, 'Distribuidora'),
('Habana 7 Copa', 'Ron', 120, 100, 20, 'Copa', 60, 'Distribuidora'),
('Habana 7 Botella', 'Ron', 1940, 40, 8, 'Botella', 970, 'Distribuidora'),
('Zacapa 23 Copa', 'Ron', 240, 80, 15, 'Copa', 120, 'Distribuidora'),
('Zacapa 23 Botella', 'Ron', 2290, 25, 5, 'Botella', 1145, 'Distribuidora'),

-- WHISKY
('Red Label Copa', 'Whisky', 130, 100, 20, 'Copa', 65, 'Distribuidora'),
('Red Label Botella', 'Whisky', 1990, 50, 10, 'Botella', 995, 'Distribuidora'),
('Black Label Copa', 'Whisky', 190, 80, 15, 'Copa', 95, 'Distribuidora'),
('Black Label Botella', 'Whisky', 2490, 40, 8, 'Botella', 1245, 'Distribuidora'),
('Buchanan''s 12 Copa', 'Whisky', 190, 80, 15, 'Copa', 95, 'Distribuidora'),
('Buchanan''s 12 Botella', 'Whisky', 2290, 40, 8, 'Botella', 1145, 'Distribuidora'),
('Buchanan''s 18 Botella', 'Whisky', 5990, 15, 3, 'Botella', 2995, 'Distribuidora'),

-- BRANDY
('Torres X Copa', 'Brandy', 130, 100, 20, 'Copa', 65, 'Distribuidora'),
('Torres X Botella', 'Brandy', 1990, 40, 8, 'Botella', 995, 'Distribuidora'),

-- COGNAC
('Martell VSOP Copa', 'Cognac', 210, 80, 15, 'Copa', 105, 'Distribuidora'),
('Martell VSOP Botella', 'Cognac', 3140, 25, 5, 'Botella', 1570, 'Distribuidora'),

-- CHAMPAGNE
('Moët Brut Botella', 'Champagne', 3990, 30, 6, 'Botella', 1995, 'Distribuidora'),
('Moët Ice Botella', 'Champagne', 4790, 25, 5, 'Botella', 2395, 'Distribuidora'),
('Dom Pérignon Luminus', 'Champagne', 22290, 10, 2, 'Botella', 11145, 'Distribuidora'),

-- SHOTS
('Perla Negra 230', 'Shots', 230, 200, 40, 'Shot', 115, 'Distribuidora'),
('Bufanda Azul 230', 'Shots', 230, 200, 40, 'Shot', 115, 'Distribuidora'),
('Revolver 350', 'Shots', 350, 150, 30, 'Shot', 175, 'Distribuidora'),
('Turbina 280', 'Shots', 280, 150, 30, 'Shot', 140, 'Distribuidora'),

-- COCTELERÍA
('Negroni', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Margarita', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Mojito', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Fernanditos', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Hanky Panky', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('St-Germain Spritz', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Aperol Spritz', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Limoncello Spritz', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Campari Spritz', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Moscow Mule', 'Coctelería', 180, 0, 0, 'Coctel', 90, 'Preparación'),

-- CERVEZA
('XX', 'Cerveza', 80, 300, 60, 'Botella', 40, 'Cervecería'),
('XX Lager', 'Cerveza', 80, 300, 60, 'Botella', 40, 'Cervecería'),
('Ultra', 'Cerveza', 80, 300, 60, 'Botella', 40, 'Cervecería'),
('Bohemia Cristal', 'Cerveza', 80, 250, 50, 'Botella', 40, 'Cervecería'),
('Heineken', 'Cerveza', 80, 300, 60, 'Botella', 40, 'Cervecería'),

-- MIXOLOGÍA
('Moon Milk', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Apple Balkan', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Xococol', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Agave Soul', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Harry Night', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Mezcal Mirage', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Berry Ron', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Sunrise', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),
('Café Quina', 'Mixología', 180, 0, 0, 'Coctel', 90, 'Preparación'),

-- ENERGIZANTES
('RedBull', 'Energizantes', 90, 200, 40, 'Lata', 45, 'Red Bull'),
('RedBull Sugar Free', 'Energizantes', 90, 150, 30, 'Lata', 45, 'Red Bull'),
('RedBull Tropical', 'Energizantes', 90, 150, 30, 'Lata', 45, 'Red Bull'),
('RedBull Sandía', 'Energizantes', 90, 150, 30, 'Lata', 45, 'Red Bull'),
('Boost', 'Energizantes', 90, 150, 30, 'Lata', 45, 'Distribuidora'),

-- REFRESCOS
('Agua Mineral', 'Refrescos', 55, 300, 60, 'Botella', 27, 'Coca-Cola'),
('Coca Cola', 'Refrescos', 55, 300, 60, 'Botella', 27, 'Coca-Cola'),
('Coca Cola Sin Azúcar', 'Refrescos', 55, 200, 40, 'Botella', 27, 'Coca-Cola'),
('Squirt', 'Refrescos', 55, 200, 40, 'Botella', 27, 'Coca-Cola'),
('Sprite', 'Refrescos', 55, 200, 40, 'Botella', 27, 'Coca-Cola'),
('Agua Natural', 'Refrescos', 55, 300, 60, 'Botella', 27, 'Distribuidora'),
('Mundet', 'Refrescos', 55, 150, 30, 'Botella', 27, 'Coca-Cola'),
('Tónica', 'Refrescos', 55, 150, 30, 'Botella', 27, 'Distribuidora'),
('Naranjada', 'Refrescos', 50, 0, 0, 'Vaso', 25, 'Preparación'),
('Limonada', 'Refrescos', 50, 0, 0, 'Vaso', 25, 'Preparación'),
('Vaso de Jugo', 'Refrescos', 50, 0, 0, 'Vaso', 25, 'Preparación'),
('Jarra de Jugo', 'Refrescos', 150, 0, 0, 'Jarra', 75, 'Preparación');

COMMIT;

-- Verificar
SELECT 
  categoria,
  COUNT(*) as productos
FROM productos
GROUP BY categoria
ORDER BY categoria;

SELECT COUNT(*) as total FROM productos;
