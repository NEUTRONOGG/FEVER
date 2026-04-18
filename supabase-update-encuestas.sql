-- Script para agregar SOLO la tabla de encuestas
-- Ejecuta esto si ya tienes las otras tablas creadas

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

-- Habilitar Row Level Security
ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Permitir lectura de encuestas" ON encuestas
  FOR SELECT USING (true);

CREATE POLICY "Permitir inserción de encuestas" ON encuestas
  FOR INSERT WITH CHECK (true);

-- Comentario
COMMENT ON TABLE encuestas IS 'Encuestas de satisfacción de clientes con sistema de recompensas';
