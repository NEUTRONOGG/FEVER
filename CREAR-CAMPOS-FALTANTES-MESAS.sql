-- ============================================
-- CREAR TODOS LOS CAMPOS FALTANTES EN MESAS
-- ============================================

-- 1. Agregar TODOS los campos necesarios
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS rp_asignado VARCHAR(100);
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS total_actual DECIMAL(10,2) DEFAULT 0;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS pedidos_data JSONB DEFAULT '[]';
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS reservacion_id UUID;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS hora_asignacion TIMESTAMP;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS hora_entrada TIMESTAMP;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS hora_salida TIMESTAMP;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS cliente_id UUID;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS hostess VARCHAR(100);
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS mesero VARCHAR(100);
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS mesero_id INTEGER;

-- 2. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_mesas_rp_asignado ON mesas(rp_asignado);
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);
CREATE INDEX IF NOT EXISTS idx_mesas_cliente_id ON mesas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_mesas_reservacion_id ON mesas(reservacion_id);

-- 3. Verificar que todos los campos existen
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'mesas'
ORDER BY ordinal_position;

-- ✅ Ejecuta este script COMPLETO
