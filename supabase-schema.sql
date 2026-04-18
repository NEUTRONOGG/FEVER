-- Schema para Supabase - Sistema CRM/POS FEVER
-- Ejecutar este script en el SQL Editor de Supabase

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL,
  precio_compra DECIMAL(10,2) NOT NULL,
  proveedor TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id INTEGER NOT NULL,
  mesa_numero TEXT NOT NULL,
  mesero TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'pagada',
  clientes_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Mesas (estado en tiempo real)
CREATE TABLE IF NOT EXISTS mesas (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'disponible',
  mesero TEXT,
  clientes_data JSONB DEFAULT '[]'::jsonb,
  pedidos_data JSONB DEFAULT '[]'::jsonb,
  total DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_stock ON productos(stock);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_ventas_mesero ON ventas(mesero);
CREATE INDEX IF NOT EXISTS idx_mesas_estado ON mesas(estado);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesas_updated_at
  BEFORE UPDATE ON mesas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insertar productos iniciales
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Hamburguesa Clásica', 'Comida', 15.00, 50, 20, 'unidades', 8.00, 'Distribuidora ABC'),
  ('Pizza Margarita', 'Comida', 18.00, 30, 15, 'unidades', 10.00, 'Distribuidora ABC'),
  ('Tacos al Pastor', 'Comida', 12.00, 40, 20, 'porciones', 6.00, 'Carnicería El Buen Corte'),
  ('Alitas Picantes', 'Comida', 12.00, 35, 15, 'porciones', 6.00, 'Pollería El Gallo'),
  ('Ensalada César', 'Comida', 10.00, 25, 10, 'porciones', 5.00, 'Frutas y Verduras La Huerta'),
  ('Sushi Roll', 'Comida', 25.00, 20, 10, 'porciones', 15.00, 'Distribuidora ABC'),
  ('Cerveza Corona', 'Bebidas', 8.00, 100, 24, 'unidades', 5.00, 'Distribuidora ABC'),
  ('Margarita', 'Bebidas', 20.00, 50, 20, 'unidades', 12.00, 'Licores Premium'),
  ('Mojito', 'Bebidas', 15.00, 50, 20, 'unidades', 8.00, 'Licores Premium'),
  ('Café Americano', 'Bebidas', 5.00, 80, 30, 'unidades', 2.00, 'Café Premium'),
  ('Refresco', 'Bebidas', 4.00, 120, 50, 'unidades', 2.00, 'Distribuidora ABC'),
  ('Tequila Blanco', 'Bebidas', 45.00, 12, 6, 'botellas', 25.00, 'Licores Premium')
ON CONFLICT DO NOTHING;

-- Insertar mesas iniciales (12 mesas)
INSERT INTO mesas (id, numero, capacidad, estado) VALUES
  (1, '1', 4, 'disponible'),
  (2, '2', 2, 'disponible'),
  (3, '3', 6, 'disponible'),
  (4, '4', 4, 'disponible'),
  (5, '5', 8, 'disponible'),
  (6, '6', 2, 'disponible'),
  (7, '7', 4, 'disponible'),
  (8, '8', 4, 'disponible'),
  (9, '9', 6, 'disponible'),
  (10, '10', 2, 'disponible'),
  (11, '11', 4, 'disponible'),
  (12, '12', 4, 'disponible')
ON CONFLICT DO NOTHING;

-- Habilitar Row Level Security (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (permitir todo para desarrollo)
-- En producción, ajustar según roles de usuario

CREATE POLICY "Permitir lectura de productos" ON productos
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualización de productos" ON productos
  FOR UPDATE USING (true);

CREATE POLICY "Permitir inserción de productos" ON productos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura de ventas" ON ventas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de ventas" ON ventas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura de mesas" ON mesas
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualización de mesas" ON mesas
  FOR UPDATE USING (true);

CREATE POLICY "Permitir inserción de mesas" ON mesas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir lectura de encuestas" ON encuestas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de encuestas" ON encuestas
  FOR INSERT WITH CHECK (true);

-- Tabla de Encuestas de Satisfacción
CREATE TABLE IF NOT EXISTS encuestas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_numero TEXT NOT NULL,
  mesero TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  respuestas JSONB NOT NULL,
  promedio DECIMAL(3,2) NOT NULL,
  recompensa_otorgada BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para encuestas
CREATE INDEX IF NOT EXISTS idx_encuestas_fecha ON encuestas(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_encuestas_mesero ON encuestas(mesero);
CREATE INDEX IF NOT EXISTS idx_encuestas_promedio ON encuestas(promedio);

-- Comentarios para documentación
COMMENT ON TABLE productos IS 'Catálogo de productos del restaurante con control de inventario';
COMMENT ON TABLE ventas IS 'Registro de ventas con detalle de consumo individual por cliente';
COMMENT ON TABLE mesas IS 'Estado en tiempo real de las mesas del restaurante';
COMMENT ON TABLE encuestas IS 'Encuestas de satisfacción de clientes con sistema de recompensas';
