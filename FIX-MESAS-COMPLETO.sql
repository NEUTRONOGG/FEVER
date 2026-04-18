-- Script completo para arreglar tabla de mesas
-- Ejecuta esto en Supabase SQL Editor

-- 0. Eliminar triggers problemáticos
DROP TRIGGER IF EXISTS crear_ticket_trigger ON mesas;
DROP TRIGGER IF EXISTS trigger_crear_ticket_liberar_mesa ON mesas;
DROP FUNCTION IF EXISTS crear_ticket_al_liberar_mesa() CASCADE;

-- 1. Agregar columnas faltantes si no existen
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS mesero TEXT;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS clientes_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS pedidos_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Permitir lectura de mesas" ON mesas;
DROP POLICY IF EXISTS "Permitir actualización de mesas" ON mesas;
DROP POLICY IF EXISTS "Permitir inserción de mesas" ON mesas;

-- 3. Crear políticas correctas
CREATE POLICY "Permitir lectura de mesas" ON mesas
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualización de mesas" ON mesas
  FOR UPDATE USING (true);

CREATE POLICY "Permitir inserción de mesas" ON mesas
  FOR INSERT WITH CHECK (true);

-- 4. Resetear todas las mesas a disponible
UPDATE mesas SET
  estado = 'disponible',
  mesero = NULL,
  clientes_data = '[]'::jsonb,
  pedidos_data = '[]'::jsonb,
  total = 0
WHERE id BETWEEN 1 AND 12;

-- 5. Verificar resultado
SELECT id, numero, estado, mesero, total FROM mesas ORDER BY id;
