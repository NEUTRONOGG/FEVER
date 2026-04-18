-- =====================================================
-- BORRAR TODOS LOS RPs
-- =====================================================
-- Elimina todos los registros de RPs de la tabla limites_cortesias_rp
-- Esto permite empezar de cero con los RPs
-- =====================================================

-- 1. BORRAR TODOS LOS RPs
-- =====================================================

DELETE FROM limites_cortesias_rp;

SELECT '✅ Todos los RPs han sido eliminados' as mensaje;

-- 2. VERIFICACIÓN
-- =====================================================

-- Contar RPs (debe ser 0)
SELECT COUNT(*) as total_rps FROM limites_cortesias_rp;

SELECT '🔄 Tabla de RPs limpia. Lista para agregar nuevos RPs' as resultado;

-- =====================================================
-- SIGUIENTE PASO
-- =====================================================
-- Ahora ejecuta: CONFIGURAR-RPS-COMPLETO.sql
-- Para agregar los 13 RPs configurados
-- =====================================================
