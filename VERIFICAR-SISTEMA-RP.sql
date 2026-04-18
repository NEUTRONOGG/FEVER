-- ============================================
-- VERIFICAR SISTEMA DE RP COMPLETO
-- ============================================

-- 1. Verificar tabla cortesias existe
SELECT 
  'Tabla cortesias' as tabla,
  COUNT(*) as registros
FROM cortesias;

-- 2. Verificar tabla limites_cortesias_rp existe
SELECT 
  'Tabla limites_cortesias_rp' as tabla,
  COUNT(*) as registros
FROM limites_cortesias_rp;

-- 3. Verificar RPs configurados
SELECT 
  rp_nombre,
  shots_disponibles,
  shots_usados,
  descuento_botella_disponible,
  descuento_botella_usado,
  perlas_negras_disponibles,
  perlas_negras_usadas,
  shots_bienvenida_disponibles,
  shots_bienvenida_usados,
  activo
FROM limites_cortesias_rp
ORDER BY rp_nombre;

-- 4. Verificar campo 'rp' en tabla mesas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mesas' 
AND column_name = 'rp';

-- 5. Verificar cantidad de mesas
SELECT 
  'Total mesas' as info,
  COUNT(*) as cantidad
FROM mesas;

-- 6. Verificar mesas por estado
SELECT 
  estado,
  COUNT(*) as cantidad
FROM mesas
GROUP BY estado
ORDER BY estado;

-- 7. Verificar clientes
SELECT 
  'Total clientes' as info,
  COUNT(*) as cantidad
FROM clientes;

-- 8. Verificar cortesías autorizadas
SELECT 
  'Total cortesías' as info,
  COUNT(*) as cantidad
FROM cortesias;

-- ============================================
-- RESUMEN FINAL
-- ============================================

SELECT '✅ VERIFICACIÓN COMPLETA' as resultado;

-- Si todo está bien, debes ver:
-- ✅ Tabla cortesias: 0 registros (al inicio)
-- ✅ Tabla limites_cortesias_rp: 3 registros (Carlos RP, Ana RP, Luis RP)
-- ✅ Campo 'rp' existe en mesas
-- ✅ Total mesas: 30
-- ✅ Mesas disponibles: 30
-- ✅ Total clientes: 0 (sistema limpio)
-- ✅ Total cortesías: 0 (al inicio)
