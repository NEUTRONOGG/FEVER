-- =====================================================
-- ADMIN: REPONER CORTESÍAS DE RPs
-- =====================================================
-- Este script lo ejecuta el ADMIN cuando decide reponer
-- las cortesías de los RPs (semanal, quincenal, etc.)

-- =====================================================
-- OPCIÓN 1: REPONER CORTESÍAS DE TODOS LOS RPs
-- =====================================================

UPDATE limites_cortesias_rp SET
    shots_bienvenida_usados = 0,
    perlas_negras_usadas = 0,
    shots_usados = 0,
    descuento_botella_usado = 0,
    ultima_actualizacion = NOW()
WHERE activo = true;

SELECT '✅ Cortesías repuestas para TODOS los RPs' as mensaje;

-- Verificar
SELECT 
    rp_nombre,
    (shots_bienvenida_disponibles - shots_bienvenida_usados) as covers_restantes,
    (perlas_negras_disponibles - perlas_negras_usadas) as perlas_restantes,
    (shots_disponibles - shots_usados) as shots_restantes,
    (descuento_botella_disponible - descuento_botella_usado) as botellas_restantes
FROM limites_cortesias_rp
WHERE activo = true;

-- =====================================================
-- OPCIÓN 2: REPONER CORTESÍAS DE UN RP ESPECÍFICO
-- =====================================================

-- Descomenta y edita el nombre del RP:
/*
UPDATE limites_cortesias_rp SET
    shots_bienvenida_usados = 0,
    perlas_negras_usadas = 0,
    shots_usados = 0,
    descuento_botella_usado = 0,
    ultima_actualizacion = NOW()
WHERE rp_nombre = 'Carlos Mendoza' AND activo = true;

SELECT '✅ Cortesías repuestas para: Carlos Mendoza' as mensaje;
*/

-- =====================================================
-- OPCIÓN 3: AUMENTAR LÍMITES (DARLES MÁS CORTESÍAS)
-- =====================================================

-- Ejemplo: Darle 10 covers en lugar de 5 a todos los RPs
/*
UPDATE limites_cortesias_rp SET
    shots_bienvenida_disponibles = 10,
    shots_bienvenida_usados = 0,
    ultima_actualizacion = NOW()
WHERE activo = true;

SELECT '✅ Límite de covers aumentado a 10 para todos los RPs' as mensaje;
*/

-- =====================================================
-- OPCIÓN 4: DARLE CORTESÍAS EXTRA A UN RP ESPECÍFICO
-- =====================================================

-- Ejemplo: Darle 3 perlas negras a un RP específico
/*
UPDATE limites_cortesias_rp SET
    perlas_negras_disponibles = 3,
    perlas_negras_usadas = 0,
    ultima_actualizacion = NOW()
WHERE rp_nombre = 'Carlos Mendoza' AND activo = true;

SELECT '✅ 3 Perlas Negras asignadas a: Carlos Mendoza' as mensaje;
*/

-- =====================================================
-- HISTORIAL: VER QUÉ CORTESÍAS SE USARON
-- =====================================================

-- Ver todas las cortesías autorizadas (últimos 7 días)
SELECT 
    rp_nombre,
    tipo_cortesia,
    COUNT(*) as total_autorizadas,
    SUM(cantidad) as cantidad_total,
    SUM(CASE WHEN canjeado THEN 1 ELSE 0 END) as canjeadas,
    SUM(CASE WHEN NOT canjeado THEN 1 ELSE 0 END) as pendientes
FROM cortesias_autorizadas
WHERE fecha_autorizacion >= NOW() - INTERVAL '7 days'
GROUP BY rp_nombre, tipo_cortesia
ORDER BY rp_nombre, tipo_cortesia;

-- Ver detalle de cortesías por RP
SELECT 
    rp_nombre,
    fecha_autorizacion,
    tipo_cortesia,
    mesa_numero,
    cliente_nombre,
    cantidad,
    CASE WHEN canjeado THEN '✓ Canjeado' ELSE 'Pendiente' END as estado
FROM cortesias_autorizadas
WHERE fecha_autorizacion >= NOW() - INTERVAL '7 days'
ORDER BY fecha_autorizacion DESC;
