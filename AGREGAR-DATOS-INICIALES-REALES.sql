-- =====================================================
-- DATOS INICIALES REALES - CONFIGURACIÓN ÚNICA
-- =====================================================
-- Ejecuta este script UNA SOLA VEZ después de limpiar los datos mock
-- Aquí agregas: Productos reales, RPs, Socios, Meseros, Hostess

-- =====================================================
-- 1. PRODUCTOS REALES DEL MENÚ
-- =====================================================
-- IMPORTANTE: Reemplaza estos productos con tu menú real

INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES

-- BEBIDAS ALCOHÓLICAS (Ejemplos - ajusta a tu menú real)
('Don Julio 70', 'Tequila', 450.00, 10, 3, 'botella', 300.00, 'Licores Premium'),
('Clase Azul Reposado', 'Tequila', 850.00, 5, 2, 'botella', 600.00, 'Licores Premium'),
('Grey Goose', 'Vodka', 380.00, 8, 3, 'botella', 250.00, 'Licores Premium'),
('Hennessy VS', 'Cognac', 420.00, 6, 2, 'botella', 280.00, 'Licores Premium'),

-- SHOTS Y COPAS (Ejemplos)
('Shot Tequila', 'Shots', 80.00, 100, 20, 'unidad', 40.00, 'Licores Premium'),
('Copa Vino Tinto', 'Vinos', 120.00, 50, 10, 'unidad', 60.00, 'Vinos Selectos'),

-- BEBIDAS SIN ALCOHOL (Ejemplos)
('Agua Mineral', 'Bebidas', 35.00, 100, 30, 'unidad', 15.00, 'Distribuidora Local'),
('Refresco', 'Bebidas', 40.00, 100, 30, 'unidad', 18.00, 'Distribuidora Local'),
('Red Bull', 'Energizantes', 60.00, 50, 15, 'unidad', 30.00, 'Distribuidora Local'),

-- COMIDA (Si aplica - ejemplos)
('Tabla de Quesos', 'Comida', 180.00, 20, 5, 'unidad', 90.00, 'Proveedor Gourmet'),
('Alitas BBQ', 'Comida', 150.00, 30, 10, 'unidad', 75.00, 'Proveedor Gourmet')

ON CONFLICT DO NOTHING;

-- =====================================================
-- 2. RPs (RELACIONES PÚBLICAS) REALES
-- =====================================================
-- 13 RPs con sus credenciales de acceso
-- LÍMITES DE CORTESÍAS:
-- - 5 Covers (shots_bienvenida_disponibles)
-- - 0 Perlas Negras
-- - 0 Shots
-- - 0 Botellas Sembradas (descuento_botella)

INSERT INTO limites_cortesias_rp (
    rp_nombre,
    shots_disponibles,
    perlas_negras_disponibles,
    descuento_botella_disponible,
    shots_bienvenida_disponibles,
    activo,
    password
) VALUES
    ('Elsa Vela', 0, 0, 0, 5, true, 'elsa2025'),
    ('Leah Vazquez', 0, 0, 0, 5, true, 'leah2025'),
    ('Emiliano Fox', 0, 0, 0, 5, true, 'emiliano2025'),
    ('Oscar Navarro', 0, 0, 0, 5, true, 'oscar2025'),
    ('Patricio García', 0, 0, 0, 5, true, 'patricio2025'),
    ('Silvana Noriega', 0, 0, 0, 5, true, 'silvana2025'),
    ('Fernanda Lira', 0, 0, 0, 5, true, 'fernanda2025'),
    ('Daniela Navarro', 0, 0, 0, 5, true, 'daniela2025'),
    ('Ximena Muñoz', 0, 0, 0, 5, true, 'ximena2025'),
    ('Milton Guerrero', 0, 0, 0, 5, true, 'milton2025'),
    ('Alejandra Urteaga', 0, 0, 0, 5, true, 'alejandra2025'),
    ('Regina Rodríguez', 0, 0, 0, 5, true, 'regina2025'),
    ('Diego Oliveros', 0, 0, 0, 5, true, 'diego2025')
ON CONFLICT (rp_nombre) DO NOTHING;

-- =====================================================
-- 3. SOCIOS PREMIUM REALES
-- =====================================================
-- IMPORTANTE: Reemplaza con los datos reales de tus socios
-- Contraseña por defecto: 'socio2024' (cámbiala después)

INSERT INTO socios (nombre, telefono, password, limite_cortesias) VALUES
    ('Roberto Martínez', '5551234567', 'socio2024', 1500),
    ('Patricia López', '5559876543', 'socio2024', 1500),
    ('Fernando Sánchez', '5555555555', 'socio2024', 1500)
ON CONFLICT (telefono) DO NOTHING;

-- =====================================================
-- 4. MESEROS REALES
-- =====================================================
-- IMPORTANTE: Ajusta según tu estructura de tabla meseros

-- Si tienes tabla meseros, descomenta y ajusta:
-- INSERT INTO meseros (nombre, telefono, activo) VALUES
--     ('Juan Pérez', '5551111111', true),
--     ('María González', '5552222222', true),
--     ('Pedro Ramírez', '5553333333', true)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- 5. HOSTESS REALES
-- =====================================================
-- IMPORTANTE: Ajusta según tu estructura de tabla hostess

-- Si tienes tabla hostess, descomenta y ajusta:
-- INSERT INTO hostess (nombre, telefono, activo) VALUES
--     ('Laura Martínez', '5554444444', true),
--     ('Sofía Torres', '5555555555', true)
-- ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. VERIFICACIÓN
-- =====================================================

SELECT '✅ DATOS INICIALES AGREGADOS' as mensaje;

-- Verificar productos
SELECT 
    '📦 Productos' as tipo,
    COUNT(*) as total,
    STRING_AGG(DISTINCT categoria, ', ') as categorias
FROM productos;

-- Verificar RPs
SELECT 
    '👑 RPs' as tipo,
    COUNT(*) as total,
    STRING_AGG(rp_nombre, ', ') as nombres
FROM limites_cortesias_rp
WHERE activo = true;

-- Verificar Socios
SELECT 
    '💎 Socios' as tipo,
    COUNT(*) as total,
    STRING_AGG(nombre, ', ') as nombres
FROM socios;

SELECT '🚀 Sistema listo para operar con datos reales!' as estado;
