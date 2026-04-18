-- ============================================
-- FIX URGENTE - EJECUTAR EN SUPABASE
-- ============================================

-- 1. Agregar columna rp_asignado a mesas
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS rp_asignado VARCHAR(100);

-- 2. Agregar columnas necesarias a tickets
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS rp_nombre VARCHAR(100);
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS mesa_numero INTEGER;

-- 3. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_mesas_rp_asignado ON mesas(rp_asignado);
CREATE INDEX IF NOT EXISTS idx_tickets_rp_nombre ON tickets(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_reservaciones_rp_nombre ON reservaciones(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);

-- 4. Verificar que las columnas existen
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mesas' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tickets' 
ORDER BY ordinal_position;

-- ✅ Ejecuta este script completo en Supabase SQL Editor
