-- ⚡ SCRIPT RÁPIDO - EJECUTAR AHORA EN SUPABASE
-- Copia y pega TODO esto en SQL Editor y da RUN

-- 1. Eliminar triggers problemáticos
DROP TRIGGER IF EXISTS crear_ticket_trigger ON mesas CASCADE;
DROP TRIGGER IF EXISTS trigger_crear_ticket_liberar_mesa ON mesas CASCADE;
DROP FUNCTION IF EXISTS crear_ticket_al_liberar_mesa() CASCADE;

-- 2. Agregar columnas necesarias
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS mesero TEXT;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS clientes_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS pedidos_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0;

-- 3. Resetear TODAS las mesas a disponible
UPDATE mesas SET
  estado = 'disponible',
  mesero = NULL,
  clientes_data = '[]'::jsonb,
  pedidos_data = '[]'::jsonb,
  total = 0
WHERE id BETWEEN 1 AND 12;

-- 4. Verificar
SELECT id, numero, estado, mesero FROM mesas ORDER BY id;
