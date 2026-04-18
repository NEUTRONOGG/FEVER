-- ⚡ SCRIPT DEFINITIVO - EJECUTAR EN SUPABASE AHORA
-- Este script crea TODAS las tablas y configuraciones necesarias

-- 1. Eliminar triggers problemáticos
DROP TRIGGER IF EXISTS crear_ticket_trigger ON mesas CASCADE;
DROP TRIGGER IF EXISTS trigger_crear_ticket_liberar_mesa ON mesas CASCADE;
DROP FUNCTION IF EXISTS crear_ticket_al_liberar_mesa() CASCADE;

-- 2. Agregar columnas a mesas
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS mesero TEXT;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS clientes_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS pedidos_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0;

-- 3. Crear tabla tickets (Historial de Consumos)
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID,
  cliente_nombre TEXT NOT NULL,
  mesa_numero INTEGER NOT NULL,
  items TEXT,
  productos JSONB,
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2),
  propina DECIMAL(10,2) DEFAULT 0,
  mesero TEXT,
  metodo_pago TEXT DEFAULT 'Efectivo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Habilitar RLS en tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- 5. Eliminar políticas existentes de tickets
DROP POLICY IF EXISTS "Permitir lectura de tickets" ON tickets;
DROP POLICY IF EXISTS "Permitir inserción de tickets" ON tickets;
DROP POLICY IF EXISTS "Permitir todo en tickets" ON tickets;

-- 6. Crear políticas para tickets
CREATE POLICY "Permitir lectura de tickets" ON tickets
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de tickets" ON tickets
  FOR INSERT WITH CHECK (true);

-- 7. Resetear todas las mesas
UPDATE mesas SET 
  estado = 'disponible', 
  mesero = NULL, 
  clientes_data = '[]'::jsonb, 
  pedidos_data = '[]'::jsonb, 
  total = 0
WHERE id BETWEEN 1 AND 12;

-- 8. Verificar que todo está correcto
SELECT 'Mesas:' as tabla, COUNT(*) as registros FROM mesas
UNION ALL
SELECT 'Tickets:', COUNT(*) FROM tickets
UNION ALL
SELECT 'Ventas:', COUNT(*) FROM ventas;

-- 9. Mostrar estructura de tickets
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tickets'
ORDER BY ordinal_position;
