-- ============================================
-- AGREGAR CONTRASEÑAS A RPs
-- ============================================

-- Agregar columna de contraseña
ALTER TABLE limites_cortesias_rp 
ADD COLUMN IF NOT EXISTS password TEXT;

-- Actualizar contraseñas para RPs existentes
-- NOTA: En producción, usar contraseñas hasheadas
UPDATE limites_cortesias_rp 
SET password = 'carlos123' 
WHERE rp_nombre = 'Carlos RP';

UPDATE limites_cortesias_rp 
SET password = 'ana123' 
WHERE rp_nombre = 'Ana RP';

UPDATE limites_cortesias_rp 
SET password = 'luis123' 
WHERE rp_nombre = 'Luis RP';

-- Verificar
SELECT 
  rp_nombre,
  password,
  activo
FROM limites_cortesias_rp
ORDER BY rp_nombre;

SELECT '✅ Contraseñas agregadas a RPs' as resultado;

-- ============================================
-- NOTA DE SEGURIDAD
-- ============================================
-- En producción, las contraseñas deben estar hasheadas
-- Usar bcrypt o similar para hashear contraseñas
-- Ejemplo: password = '$2b$10$...'
