-- =====================================================
-- ACTUALIZAR CORTESÍAS DE RPs EXISTENTES
-- =====================================================
-- Este script actualiza los límites de cortesías de los RPs
-- que ya están en la base de datos
-- 
-- NUEVOS LÍMITES:
-- - 5 Covers (shots_bienvenida_disponibles)
-- - 0 Perlas Negras
-- - 0 Shots
-- - 0 Botellas Sembradas

-- =====================================================
-- ACTUALIZAR TODOS LOS RPs
-- =====================================================

UPDATE limites_cortesias_rp SET
    shots_disponibles = 0,
    shots_usados = 0,
    perlas_negras_disponibles = 0,
    perlas_negras_usadas = 0,
    descuento_botella_disponible = 0,
    descuento_botella_usado = 0,
    shots_bienvenida_disponibles = 5,
    shots_bienvenida_usados = 0
WHERE activo = true;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT '✅ Cortesías de RPs actualizadas' as mensaje;

-- Ver todos los RPs con sus nuevos límites
SELECT 
    rp_nombre,
    shots_bienvenida_disponibles as covers,
    perlas_negras_disponibles as perlas,
    shots_disponibles as shots,
    descuento_botella_disponible as botellas,
    activo
FROM limites_cortesias_rp
ORDER BY rp_nombre;

-- Resumen
SELECT 
    COUNT(*) as total_rps,
    SUM(CASE WHEN activo = true THEN 1 ELSE 0 END) as rps_activos,
    MAX(shots_bienvenida_disponibles) as covers_por_rp
FROM limites_cortesias_rp;

SELECT '🎯 Límites actualizados: 5 Covers, 0 Perlas, 0 Shots, 0 Botellas' as configuracion;
