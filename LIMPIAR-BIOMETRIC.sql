-- =====================================================
-- LIMPIAR CREDENCIALES BIOMÉTRICAS (Face ID / Touch ID)
-- =====================================================

-- ============================================
-- OPCIÓN 1: Limpiar TODAS las credenciales
-- ============================================
UPDATE limites_cortesias_rp
SET 
  biometric_credential = NULL,
  biometric_enabled = FALSE,
  biometric_registered_at = NULL
WHERE biometric_enabled = TRUE;

-- Verificar resultado
SELECT 
  COUNT(*) as total_limpiados
FROM limites_cortesias_rp
WHERE biometric_credential IS NULL;

-- ============================================
-- OPCIÓN 2: Limpiar credencial de UN RP específico
-- ============================================

-- Por nombre del RP
UPDATE limites_cortesias_rp
SET 
  biometric_credential = NULL,
  biometric_enabled = FALSE,
  biometric_registered_at = NULL
WHERE rp_nombre = 'Carlos RP';  -- Cambiar por el nombre del RP

-- Por ID del RP
UPDATE limites_cortesias_rp
SET 
  biometric_credential = NULL,
  biometric_enabled = FALSE,
  biometric_registered_at = NULL
WHERE id = 'uuid-del-rp'::UUID;  -- Cambiar por el UUID del RP

-- ============================================
-- OPCIÓN 3: Usar la función creada
-- ============================================

-- Desactivar biométrica de un RP por ID
SELECT desactivar_biometric_rp('uuid-del-rp'::UUID);

-- ============================================
-- VERIFICAR ESTADO DESPUÉS DE LIMPIAR
-- ============================================

-- Ver todos los RPs y su estado biométrico
SELECT 
  id,
  rp_nombre,
  biometric_enabled,
  biometric_registered_at,
  CASE 
    WHEN biometric_credential IS NOT NULL THEN 'Tiene credencial'
    ELSE 'Sin credencial'
  END as estado_credencial
FROM limites_cortesias_rp
WHERE activo = TRUE
ORDER BY rp_nombre;

-- Contar por estado
SELECT 
  biometric_enabled,
  COUNT(*) as total
FROM limites_cortesias_rp
WHERE activo = TRUE
GROUP BY biometric_enabled;

-- ============================================
-- LIMPIAR CREDENCIALES ANTIGUAS (Opcional)
-- ============================================

-- Limpiar credenciales de más de 30 días sin uso
UPDATE limites_cortesias_rp
SET 
  biometric_credential = NULL,
  biometric_enabled = FALSE
WHERE 
  biometric_enabled = TRUE
  AND biometric_registered_at < NOW() - INTERVAL '30 days';

-- Limpiar credenciales de más de 90 días
UPDATE limites_cortesias_rp
SET 
  biometric_credential = NULL,
  biometric_enabled = FALSE
WHERE 
  biometric_enabled = TRUE
  AND biometric_registered_at < NOW() - INTERVAL '90 days';

-- ============================================
-- RESETEO COMPLETO (CUIDADO!)
-- ============================================

-- Esto limpia TODAS las credenciales de TODOS los RPs
-- Usar solo si quieres empezar completamente de cero
UPDATE limites_cortesias_rp
SET 
  biometric_credential = NULL,
  biometric_enabled = FALSE,
  biometric_registered_at = NULL;

-- Confirmar que todo está limpio
SELECT 
  'Total RPs' as descripcion,
  COUNT(*) as cantidad
FROM limites_cortesias_rp
WHERE activo = TRUE

UNION ALL

SELECT 
  'RPs con Face ID' as descripcion,
  COUNT(*) as cantidad
FROM limites_cortesias_rp
WHERE activo = TRUE AND biometric_enabled = TRUE

UNION ALL

SELECT 
  'RPs sin Face ID' as descripcion,
  COUNT(*) as cantidad
FROM limites_cortesias_rp
WHERE activo = TRUE AND biometric_enabled = FALSE;

-- ============================================
-- COMANDOS ÚTILES
-- ============================================

-- Ver RPs que tienen Face ID registrado
SELECT 
  rp_nombre,
  biometric_registered_at,
  AGE(NOW(), biometric_registered_at) as tiempo_registrado
FROM limites_cortesias_rp
WHERE biometric_enabled = TRUE
ORDER BY biometric_registered_at DESC;

-- Ver último RP que registró Face ID
SELECT 
  rp_nombre,
  biometric_registered_at
FROM limites_cortesias_rp
WHERE biometric_enabled = TRUE
ORDER BY biometric_registered_at DESC
LIMIT 1;

-- Buscar RP por nombre para obtener su ID
SELECT 
  id,
  rp_nombre,
  biometric_enabled
FROM limites_cortesias_rp
WHERE rp_nombre ILIKE '%carlos%'  -- Cambiar por el nombre a buscar
  AND activo = TRUE;

-- =====================================================
-- RESULTADO ESPERADO DESPUÉS DE LIMPIAR
-- =====================================================

/*
Después de ejecutar el reseteo completo, deberías ver:

| descripcion        | cantidad |
| ------------------ | -------- |
| Total RPs          | 16       |
| RPs con Face ID    | 0        |
| RPs sin Face ID    | 16       |

Todos los RPs estarán listos para registrar Face ID nuevamente.
*/
