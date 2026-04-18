-- =====================================================
-- RESETEAR RESERVACIONES Y BUFANDAS A 0
-- =====================================================
-- Este script borra todas las reservaciones y resetea
-- las bufandas rosa a 0 para todos los RPs
-- =====================================================

-- 1. BORRAR TODAS LAS RESERVACIONES
-- =====================================================

DELETE FROM reservaciones;

SELECT '✅ Todas las reservaciones han sido eliminadas' as mensaje;

-- 2. RESETEAR BUFANDAS ROSA A 0 PARA TODOS LOS RPs
-- =====================================================

UPDATE limites_cortesias_rp SET
  bufandas_rosa_disponibles = 0,
  bufandas_rosa_usadas = 0,
  updated_at = NOW()
WHERE activo = true;

SELECT '✅ Bufandas rosa reseteadas a 0 para todos los RPs' as mensaje;

-- 3. BORRAR CORTESÍAS ACTIVAS (OPCIONAL)
-- =====================================================

DELETE FROM cortesias_activas;

SELECT '✅ Cortesías activas eliminadas' as mensaje;

-- 4. BORRAR HISTORIAL DE CORTESÍAS (OPCIONAL)
-- =====================================================

DELETE FROM cortesias;

SELECT '✅ Historial de cortesías eliminado' as mensaje;

-- 5. VERIFICACIÓN
-- =====================================================

-- Ver estado de reservaciones
SELECT COUNT(*) as total_reservaciones FROM reservaciones;

-- Ver estado de bufandas por RP
SELECT 
  rp_nombre,
  bufandas_rosa_disponibles as "Disponibles",
  bufandas_rosa_usadas as "Usadas",
  activo
FROM limites_cortesias_rp
ORDER BY rp_nombre;

-- Ver cortesías activas
SELECT COUNT(*) as cortesias_activas FROM cortesias_activas;

-- Ver historial de cortesías
SELECT COUNT(*) as historial_cortesias FROM cortesias;

SELECT '🔄 Sistema reseteado completamente' as resultado;
