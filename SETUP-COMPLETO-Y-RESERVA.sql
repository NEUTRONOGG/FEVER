-- ============================================
-- SETUP COMPLETO + RESERVA DE EJEMPLO
-- ============================================
-- Ejecutar TODO este script en Supabase SQL Editor

-- ============================================
-- 1. CREAR TABLA CLIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT UNIQUE,
  email TEXT,
  genero TEXT CHECK (genero IN ('masculino', 'femenino', 'otro', 'no_especifica')),
  fecha_nacimiento DATE,
  foto_url TEXT,
  
  -- Métricas
  total_visitas INTEGER DEFAULT 0,
  visitas_consecutivas INTEGER DEFAULT 0,
  ultima_visita TIMESTAMP WITH TIME ZONE,
  primera_visita TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consumo_total DECIMAL(10,2) DEFAULT 0,
  consumo_promedio DECIMAL(10,2) DEFAULT 0,
  ticket_mas_alto DECIMAL(10,2) DEFAULT 0,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  
  -- Rewards
  puntos_rewards INTEGER DEFAULT 0,
  nivel_fidelidad TEXT DEFAULT 'bronce' CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino', 'diamante')),
  
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. CREAR TABLA MESAS
-- ============================================
CREATE TABLE IF NOT EXISTS mesas (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'limpieza')),
  
  -- Cliente actual
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT,
  numero_personas INTEGER,
  
  -- Pedidos y consumo
  pedidos_data JSONB DEFAULT '[]'::jsonb,
  total_actual DECIMAL(10,2) DEFAULT 0,
  
  -- Control
  hostess TEXT,
  mesero TEXT,
  hora_entrada TIMESTAMP WITH TIME ZONE,
  hora_salida TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREAR TABLA VISITAS
-- ============================================
CREATE TABLE IF NOT EXISTS visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  mesa_numero TEXT,
  numero_personas INTEGER,
  hostess TEXT,
  mesero TEXT,
  hora_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_salida TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER,
  estado TEXT DEFAULT 'activa' CHECK (estado IN ('activa', 'finalizada', 'cancelada', 'reservada')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. CREAR TABLA TICKETS
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  numero_ticket TEXT UNIQUE NOT NULL,
  mesa_numero TEXT,
  productos JSONB DEFAULT '[]'::jsonb,
  subtotal DECIMAL(10,2) NOT NULL,
  propina DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT CHECK (metodo_pago IN ('efectivo', 'tarjeta', 'transferencia')),
  mesero TEXT,
  hostess TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. INSERTAR MESAS (1-12)
-- ============================================
INSERT INTO mesas (id, numero, capacidad, estado) VALUES
  (1, '1', 4, 'disponible'),
  (2, '2', 4, 'disponible'),
  (3, '3', 4, 'disponible'),
  (4, '4', 6, 'disponible'),
  (5, '5', 6, 'disponible'),
  (6, '6', 6, 'disponible'),
  (7, '7', 8, 'disponible'),
  (8, '8', 8, 'disponible'),
  (9, '9', 2, 'disponible'),
  (10, '10', 2, 'disponible'),
  (11, '11', 10, 'disponible'),
  (12, '12', 10, 'disponible')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. HABILITAR RLS (Row Level Security)
-- ============================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes (si existen)
DROP POLICY IF EXISTS "Permitir todo en clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir todo en mesas" ON mesas;
DROP POLICY IF EXISTS "Permitir todo en visitas" ON visitas;
DROP POLICY IF EXISTS "Permitir todo en tickets" ON tickets;

-- Crear políticas permisivas (permitir todo)
CREATE POLICY "Permitir todo en clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en mesas" ON mesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en visitas" ON visitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 7. CREAR CLIENTE PARA RESERVA
-- ============================================
INSERT INTO clientes (
  nombre,
  telefono,
  email,
  genero,
  nivel_fidelidad,
  puntos_rewards,
  activo
) VALUES (
  'María González',
  '+52 555 987 6543',
  'maria.gonzalez@email.com',
  'femenino',
  'oro',
  450,
  true
) ON CONFLICT (telefono) DO NOTHING;

-- ============================================
-- 8. CREAR RESERVA EN MESA 5
-- ============================================
UPDATE mesas 
SET 
  estado = 'reservada',
  cliente_id = (SELECT id FROM clientes WHERE telefono = '+52 555 987 6543'),
  cliente_nombre = 'María González',
  numero_personas = 4,
  hostess = 'Sistema',
  hora_entrada = NOW() + INTERVAL '2 hours',
  notas = '🎂 Cumpleaños - Mesa preferencial'
WHERE numero = '5';

-- ============================================
-- 9. VERIFICAR RESULTADOS
-- ============================================

-- Ver todas las mesas
SELECT 
  numero as "Mesa",
  capacidad as "Cap",
  estado as "Estado",
  cliente_nombre as "Cliente",
  numero_personas as "Personas",
  TO_CHAR(hora_entrada, 'HH24:MI') as "Hora",
  notas as "Notas"
FROM mesas 
ORDER BY CAST(numero AS INTEGER);

-- Ver clientes
SELECT 
  nombre as "Cliente",
  telefono as "Teléfono",
  nivel_fidelidad as "Nivel",
  puntos_rewards as "Puntos"
FROM clientes
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
/*
Mesa 5 debe mostrar:
- Estado: reservada
- Cliente: María González
- Personas: 4
- Hora: Dentro de 2 horas
- Notas: 🎂 Cumpleaños - Mesa preferencial

Ahora ve al CRM y deberías ver la reserva!
*/
