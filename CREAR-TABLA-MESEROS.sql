-- Crear tabla de meseros
CREATE TABLE IF NOT EXISTS meseros (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columna mesero_id a la tabla mesas si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'mesas' AND column_name = 'mesero_id'
  ) THEN
    ALTER TABLE mesas ADD COLUMN mesero_id INTEGER REFERENCES meseros(id);
  END IF;
END $$;

-- Crear índice para búsquedas más rápidas
CREATE INDEX IF NOT EXISTS idx_mesas_mesero_id ON mesas(mesero_id);
CREATE INDEX IF NOT EXISTS idx_meseros_activo ON meseros(activo);

-- Insertar meseros de ejemplo
INSERT INTO meseros (nombre, apellido, telefono, email, activo) VALUES
  ('Juan', 'Pérez', '555-0101', 'juan.perez@fever.com', true),
  ('María', 'González', '555-0102', 'maria.gonzalez@fever.com', true),
  ('Carlos', 'Rodríguez', '555-0103', 'carlos.rodriguez@fever.com', true),
  ('Ana', 'Martínez', '555-0104', 'ana.martinez@fever.com', true)
ON CONFLICT DO NOTHING;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at en meseros
DROP TRIGGER IF EXISTS update_meseros_updated_at ON meseros;
CREATE TRIGGER update_meseros_updated_at
  BEFORE UPDATE ON meseros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE meseros IS 'Tabla de meseros del restaurante';
COMMENT ON COLUMN meseros.activo IS 'Indica si el mesero está activo en el sistema';
COMMENT ON COLUMN mesas.mesero_id IS 'ID del mesero asignado a la mesa';
