-- ============================================
-- AGREGAR SISTEMA DE CALIFICACIÓN DE CLIENTES
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Agregar columnas de calificación a la tabla clientes
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS calificacion_consumo DECIMAL(3,2) DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS calificacion_look_feel DECIMAL(3,2) DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS calificacion_vibe DECIMAL(3,2) DEFAULT 0;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS total_calificaciones INTEGER DEFAULT 0;

-- Crear tabla de calificaciones individuales
CREATE TABLE IF NOT EXISTS calificaciones_clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE,
  
  -- Calificaciones (1-5 estrellas)
  calificacion_consumo DECIMAL(3,2) NOT NULL CHECK (calificacion_consumo >= 1 AND calificacion_consumo <= 5),
  calificacion_look_feel DECIMAL(3,2) NOT NULL CHECK (calificacion_look_feel >= 1 AND calificacion_look_feel <= 5),
  calificacion_vibe DECIMAL(3,2) NOT NULL CHECK (calificacion_vibe >= 1 AND calificacion_vibe <= 5),
  calificacion_promedio DECIMAL(3,2) GENERATED ALWAYS AS ((calificacion_consumo + calificacion_look_feel + calificacion_vibe) / 3) STORED,
  
  -- Metadata
  calificado_por TEXT NOT NULL, -- Nombre de quien calificó (hostess, mesero, etc)
  comentarios TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_calificaciones_cliente ON calificaciones_clientes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_fecha ON calificaciones_clientes(fecha DESC);

-- Función para actualizar calificaciones promedio del cliente
CREATE OR REPLACE FUNCTION actualizar_calificaciones_cliente()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clientes
  SET 
    calificacion_consumo = (
      SELECT AVG(calificacion_consumo) 
      FROM calificaciones_clientes 
      WHERE cliente_id = NEW.cliente_id
    ),
    calificacion_look_feel = (
      SELECT AVG(calificacion_look_feel) 
      FROM calificaciones_clientes 
      WHERE cliente_id = NEW.cliente_id
    ),
    calificacion_vibe = (
      SELECT AVG(calificacion_vibe) 
      FROM calificaciones_clientes 
      WHERE cliente_id = NEW.cliente_id
    ),
    calificacion_promedio = (
      SELECT AVG(calificacion_promedio) 
      FROM calificaciones_clientes 
      WHERE cliente_id = NEW.cliente_id
    ),
    total_calificaciones = (
      SELECT COUNT(*) 
      FROM calificaciones_clientes 
      WHERE cliente_id = NEW.cliente_id
    ),
    updated_at = NOW()
  WHERE id = NEW.cliente_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente
DROP TRIGGER IF EXISTS trigger_actualizar_calificaciones_cliente ON calificaciones_clientes;
CREATE TRIGGER trigger_actualizar_calificaciones_cliente
  AFTER INSERT ON calificaciones_clientes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_calificaciones_cliente();

-- Seguridad (RLS)
ALTER TABLE calificaciones_clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo en calificaciones_clientes" ON calificaciones_clientes FOR ALL USING (true) WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE calificaciones_clientes IS 'Calificaciones de clientes por visita (Consumo, Look & Feel, Vibe)';
COMMENT ON COLUMN calificaciones_clientes.calificacion_consumo IS 'Calificación de consumo del cliente (1-5 estrellas)';
COMMENT ON COLUMN calificaciones_clientes.calificacion_look_feel IS 'Calificación de apariencia y presentación (1-5 estrellas)';
COMMENT ON COLUMN calificaciones_clientes.calificacion_vibe IS 'Calificación de energía y actitud (1-5 estrellas)';
