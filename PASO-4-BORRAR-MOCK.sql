-- =====================================================
-- PASO 4: BORRAR SOLO DATOS MOCK ESPECÍFICOS
-- =====================================================
-- Ejecuta esto DESPUÉS de agregar tus datos reales
-- y verificar que todo funcione correctamente

-- =====================================================
-- 1. BORRAR PRODUCTOS MOCK
-- =====================================================

DELETE FROM productos 
WHERE nombre IN (
    -- Productos de ejemplo del schema original
    'Hamburguesa Clásica',
    'Pizza Margarita',
    'Tacos al Pastor',
    'Alitas Picantes',
    'Ensalada César',
    'Sushi Roll',
    'Cerveza Corona',
    'Margarita',
    'Mojito',
    'Café Americano',
    'Refresco',
    'Tequila Blanco'
);

SELECT '✅ Productos mock eliminados' as paso_1;

-- =====================================================
-- 2. BORRAR RPs MOCK (si existen)
-- =====================================================

DELETE FROM limites_cortesias_rp 
WHERE rp_nombre IN (
    'Carlos Mendoza',
    'Ana García',
    'Luis Rodríguez',
    'RP Prueba',
    'Test RP'
);

SELECT '✅ RPs mock eliminados' as paso_2;

-- =====================================================
-- 3. BORRAR SOCIOS MOCK
-- =====================================================

DELETE FROM socios 
WHERE telefono IN (
    '5550000001',  -- Socio de prueba del sistema
    '5551234567',  -- Roberto Martínez (ejemplo)
    '5559876543',  -- Patricia López (ejemplo)
    '5555555555'   -- Fernando Sánchez (ejemplo)
);

SELECT '✅ Socios mock eliminados' as paso_3;

-- =====================================================
-- 4. BORRAR CLIENTES DE PRUEBA
-- =====================================================

DELETE FROM clientes 
WHERE nombre LIKE '%Prueba%' 
   OR nombre LIKE '%Test%'
   OR nombre LIKE '%Mock%'
   OR telefono LIKE '555%';

SELECT '✅ Clientes de prueba eliminados' as paso_4;

-- =====================================================
-- 5. BORRAR TRANSACCIONES ANTIGUAS
-- =====================================================

DELETE FROM tickets WHERE created_at < NOW() - INTERVAL '7 days';
DELETE FROM visitas WHERE fecha < NOW() - INTERVAL '7 days';
DELETE FROM cortesias_autorizadas WHERE fecha_autorizacion < NOW() - INTERVAL '7 days';
DELETE FROM reservaciones WHERE fecha_reservacion < NOW() - INTERVAL '7 days';

SELECT '✅ Transacciones antiguas eliminadas' as paso_5;

-- =====================================================
-- 6. RESETEAR TODAS LAS MESAS
-- =====================================================

UPDATE mesas SET
    estado = 'disponible',
    cliente_id = NULL,
    cliente_nombre = NULL,
    numero_personas = NULL,
    numero_hombres = NULL,
    numero_mujeres = NULL,
    numero_ninos = NULL,
    numero_ninas = NULL,
    clientes_data = '[]'::jsonb,
    total = 0,
    mesero = NULL,
    hora_asignacion = NULL,
    rp_asignado = NULL,
    observaciones = NULL,
    pedidos_data = '[]'::jsonb,
    total_actual = 0,
    cliente_telefono = NULL,
    cliente_genero = NULL,
    hora_reservacion = NULL,
    nombre_reservacion = NULL
WHERE estado != 'disponible';

SELECT '✅ Mesas reseteadas' as paso_6;

-- =====================================================
-- 7. VERIFICACIÓN FINAL
-- =====================================================

SELECT '🎉 DATOS MOCK ELIMINADOS EXITOSAMENTE' as mensaje;

-- Ver productos restantes
SELECT 
    '📦 Productos' as tipo,
    COUNT(*) as total,
    STRING_AGG(DISTINCT categoria, ', ') as categorias
FROM productos;

-- Ver RPs activos
SELECT 
    '👑 RPs' as tipo,
    COUNT(*) as total,
    STRING_AGG(rp_nombre, ', ') as nombres
FROM limites_cortesias_rp
WHERE activo = true;

-- Ver Socios
SELECT 
    '💎 Socios' as tipo,
    COUNT(*) as total
FROM socios;

-- Ver Clientes
SELECT 
    '👥 Clientes' as tipo,
    COUNT(*) as total
FROM clientes;

-- Ver Mesas
SELECT 
    '🪑 Mesas' as tipo,
    COUNT(*) as total,
    SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles
FROM mesas;

SELECT '✅ Sistema listo con solo datos reales!' as estado_final;
