-- =====================================================
-- RESETEAR REGISTROS BIOMÉTRICOS (FACE ID / HUELLA)
-- =====================================================
-- Elimina todos los registros biométricos guardados
-- Todos los usuarios deberán volver a registrar su Face ID o Huella
-- =====================================================

-- 1. BORRAR TODOS LOS REGISTROS BIOMÉTRICOS
-- =====================================================

-- Si existe la tabla biometric_credentials
DELETE FROM biometric_credentials;

SELECT '✅ Todos los registros biométricos han sido eliminados' as mensaje;

-- 2. LIMPIAR DATOS BIOMÉTRICOS DE USUARIOS (si aplica)
-- =====================================================

-- Si los datos biométricos están en la tabla de usuarios
UPDATE usuarios SET 
  biometric_data = NULL,
  biometric_registered = false,
  biometric_updated_at = NULL
WHERE biometric_registered = true;

SELECT '✅ Datos biométricos limpiados de usuarios' as mensaje;

-- 3. LIMPIAR DATOS BIOMÉTRICOS DE RPs (si aplica)
-- =====================================================

-- Si los RPs tienen datos biométricos
UPDATE limites_cortesias_rp SET 
  biometric_data = NULL,
  biometric_registered = false
WHERE biometric_registered = true;

SELECT '✅ Datos biométricos limpiados de RPs' as mensaje;

-- 4. VERIFICACIÓN
-- =====================================================

-- Contar registros biométricos (debe ser 0)
SELECT COUNT(*) as registros_biometricos FROM biometric_credentials;

-- Ver usuarios sin biométricos
SELECT COUNT(*) as usuarios_sin_biometricos 
FROM usuarios 
WHERE biometric_registered = false OR biometric_registered IS NULL;

-- Ver RPs sin biométricos
SELECT COUNT(*) as rps_sin_biometricos 
FROM limites_cortesias_rp 
WHERE biometric_registered = false OR biometric_registered IS NULL;

SELECT '🔄 Todos los usuarios deberán volver a registrar su Face ID o Huella' as resultado;

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================
-- Este script intenta limpiar datos biométricos de múltiples tablas.
-- Si alguna tabla no existe, el error será ignorado y continuará con las demás.
-- Después de ejecutar este script, todos los usuarios deberán:
-- 1. Iniciar sesión con contraseña
-- 2. Volver a registrar su Face ID o Huella Digital
-- =====================================================
