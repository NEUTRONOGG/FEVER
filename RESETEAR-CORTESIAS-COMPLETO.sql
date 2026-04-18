-- =====================================================
-- RESETEAR TODAS LAS CORTESÍAS
-- =====================================================
-- Elimina todas las cortesías y resetea los límites a 0
-- =====================================================

-- 1. BORRAR CORTESÍAS ACTIVAS
-- =====================================================

DELETE FROM cortesias_activas;

SELECT '✅ Cortesías activas eliminadas' as mensaje;

-- 2. BORRAR HISTORIAL DE CORTESÍAS
-- =====================================================

DELETE FROM cortesias;

SELECT '✅ Historial de cortesías eliminado' as mensaje;

-- 3. RESETEAR LÍMITES DE CORTESÍAS PARA TODOS LOS RPs
-- =====================================================

UPDATE limites_cortesias_rp SET
  shots_disponibles = 0,
  shots_usados = 0,
  descuento_botella_disponible = 0,
  descuento_botella_usado = 0,
  perlas_negras_disponibles = 0,
  perlas_negras_usadas = 0,
  shots_bienvenida_disponibles = 0,
  shots_bienvenida_usados = 0,
  bufandas_rosa_disponibles = 0,
  bufandas_rosa_usadas = 0,
  updated_at = NOW()
WHERE activo = true;

SELECT '✅ Límites de cortesías reseteados a 0 para todos los RPs' as mensaje;

-- 4. VERIFICACIÓN
-- =====================================================

-- Ver cortesías activas (debe ser 0)
SELECT COUNT(*) as cortesias_activas FROM cortesias_activas;

-- Ver historial de cortesías (debe ser 0)
SELECT COUNT(*) as historial_cortesias FROM cortesias;

-- Ver límites de cortesías por RP
SELECT 
  rp_nombre,
  shots_disponibles as "Shots",
  perlas_negras_disponibles as "Perlas",
  descuento_botella_disponible as "Botellas",
  shots_bienvenida_disponibles as "Shots Bienvenida",
  bufandas_rosa_disponibles as "Bufandas Rosa",
  activo
FROM limites_cortesias_rp
ORDER BY rp_nombre;

SELECT '🔄 Todas las cortesías han sido reseteadas completamente' as resultado;
