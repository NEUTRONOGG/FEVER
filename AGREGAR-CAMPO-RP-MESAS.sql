-- ============================================
-- AGREGAR CAMPO RP A TABLA MESAS
-- ============================================

-- Agregar columna rp a mesas
ALTER TABLE mesas 
ADD COLUMN IF NOT EXISTS rp TEXT;

-- Verificar que se agregó
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mesas' 
AND column_name = 'rp';

-- Debe mostrar:
-- column_name | data_type
-- rp          | text

SELECT '✅ Campo RP agregado a tabla mesas' as resultado;
