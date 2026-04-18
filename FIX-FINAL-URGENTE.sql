-- 🚨 SCRIPT FINAL URGENTE - EJECUTAR AHORA
-- Este script arregla TODO de una vez

-- 1. Eliminar triggers
DROP TRIGGER IF EXISTS crear_ticket_trigger ON mesas CASCADE;
DROP TRIGGER IF EXISTS trigger_crear_ticket_liberar_mesa ON mesas CASCADE;
DROP FUNCTION IF EXISTS crear_ticket_al_liberar_mesa() CASCADE;

-- 2. Agregar columnas a mesas
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS mesero TEXT;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS clientes_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS pedidos_data JSONB DEFAULT '[]'::jsonb;
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS total DECIMAL(10,2) DEFAULT 0;

-- 3. Eliminar tabla tickets si existe (para recrearla correctamente)
DROP TABLE IF EXISTS tickets CASCADE;

-- 4. Crear tabla tickets CORRECTAMENTE
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID,
  cliente_nombre TEXT NOT NULL,
  mesa_numero INTEGER NOT NULL,
  items TEXT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2),
  propina DECIMAL(10,2) DEFAULT 0,
  mesero TEXT,
  metodo_pago TEXT DEFAULT 'Efectivo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS en tickets
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura de tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "Permitir inserción de tickets" ON tickets FOR INSERT WITH CHECK (true);

-- 6. RESETEAR TODAS LAS MESAS
UPDATE mesas SET 
  estado = 'disponible',
  mesero = NULL,
  clientes_data = '[]'::jsonb,
  pedidos_data = '[]'::jsonb,
  total = 0
WHERE id BETWEEN 1 AND 30;

-- 7. Crear tabla clientes si no existe
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT,
  email TEXT,
  genero TEXT,
  fecha_nacimiento DATE,
  foto_url TEXT,
  total_visitas INTEGER DEFAULT 0,
  visitas_consecutivas INTEGER DEFAULT 0,
  ultima_visita TIMESTAMP WITH TIME ZONE,
  primera_visita TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consumo_total DECIMAL(10,2) DEFAULT 0,
  consumo_promedio DECIMAL(10,2) DEFAULT 0,
  ticket_mas_alto DECIMAL(10,2) DEFAULT 0,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  producto_favorito TEXT,
  horario_preferido TEXT,
  puntos_rewards INTEGER DEFAULT 0,
  nivel_fidelidad TEXT DEFAULT 'bronce',
  qr_wallet_id TEXT UNIQUE,
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. DESHABILITAR RLS en todas las tablas (permitir acceso total)
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE mesas DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets DISABLE ROW LEVEL SECURITY;

-- 9. Verificar tablas
SELECT 'Clientes:' as tabla, COUNT(*) as total FROM clientes
UNION ALL
SELECT 'Mesas:', COUNT(*) FROM mesas
UNION ALL
SELECT 'Tickets:', COUNT(*) FROM tickets;