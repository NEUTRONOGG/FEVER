-- ============================================
-- RESET COMPLETO DE MESAS (SIN ERRORES)
-- ============================================

-- 1. Primero, crear TODOS los campos necesarios
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

-- 2. Ahora SÍ, liberar TODAS las mesas
UPDATE mesas 
SET 
  estado = 'disponible',
  cliente_id = NULL,
  cliente_nombre = NULL,
  numero_personas = NULL,
  rp_asignado = NULL,
  total_actual = 0,
  hora_asignacion = NULL,
  hora_entrada = NULL,
  hora_salida = NULL,
  hostess = NULL,
  mesero = NULL,
  mesero_id = NULL,
  pedidos_data = '[]',
  reservacion_id = NULL;

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS idx_mesas_rp_asignado ON mesas(rp_asignado);
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);
CREATE INDEX IF NOT EXISTS idx_mesas_cliente_id ON mesas(cliente_id);

-- 4. Verificar resultado
SELECT 
  COUNT(*) as total_mesas,
  COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as disponibles,
  COUNT(CASE WHEN estado = 'ocupada' THEN 1 END) as ocupadas,
  COUNT(CASE WHEN estado = 'reservada' THEN 1 END) as reservadas
FROM mesas;

-- 5. Ver estructura completa
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'mesas' 
ORDER BY ordinal_position;

-- ✅ Ejecuta este script COMPLETO en Supabase
