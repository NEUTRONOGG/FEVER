-- ============================================
-- PASO 1: CREAR TABLAS BÁSICAS
-- ============================================
-- Ejecutar SOLO este archivo primero

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT UNIQUE,
  email TEXT,
  genero TEXT CHECK (genero IN ('masculino', 'femenino', 'otro', 'no_especifica')),
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
  puntos_rewards INTEGER DEFAULT 0,
  nivel_fidelidad TEXT DEFAULT 'bronce' CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino', 'diamante')),
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mesas
CREATE TABLE IF NOT EXISTS mesas (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'limpieza')),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT,
  numero_personas INTEGER,
  pedidos_data JSONB DEFAULT '[]'::jsonb,
  total_actual DECIMAL(10,2) DEFAULT 0,
  hostess TEXT,
  mesero TEXT,
  hora_entrada TIMESTAMP WITH TIME ZONE,
  hora_salida TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de visitas
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

-- Tabla de tickets
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

-- Verificar que se crearon
SELECT 'Tablas creadas correctamente' as mensaje;
