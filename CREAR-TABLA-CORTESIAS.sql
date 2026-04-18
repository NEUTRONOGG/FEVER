-- ============================================
-- TABLA DE CORTESÍAS PARA RP
-- ============================================

-- Tabla de cortesías autorizadas
CREATE TABLE IF NOT EXISTS cortesias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rp_nombre TEXT NOT NULL,
  mesa_id INTEGER REFERENCES mesas(id),
  mesa_numero TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  tipo_cortesia TEXT NOT NULL, -- 'shots', 'descuento_botella', 'producto_gratis', 'shot_bienvenida'
  descripcion TEXT NOT NULL,
  cantidad INTEGER DEFAULT 1,
  valor_descuento DECIMAL(10,2) DEFAULT 0,
  autorizado BOOLEAN DEFAULT true,
  usado BOOLEAN DEFAULT false,
  fecha_autorizacion TIMESTAMP DEFAULT NOW(),
  fecha_uso TIMESTAMP,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de límites de cortesías por RP
CREATE TABLE IF NOT EXISTS limites_cortesias_rp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rp_nombre TEXT NOT NULL UNIQUE,
  shots_disponibles INTEGER DEFAULT 5,
  shots_usados INTEGER DEFAULT 0,
  descuento_botella_disponible INTEGER DEFAULT 1, -- Cantidad de descuentos disponibles
  descuento_botella_usado INTEGER DEFAULT 0,
  perlas_negras_disponibles INTEGER DEFAULT 3,
  perlas_negras_usadas INTEGER DEFAULT 0,
  shots_bienvenida_disponibles INTEGER DEFAULT 10,
  shots_bienvenida_usados INTEGER DEFAULT 0,
  periodo_inicio DATE DEFAULT CURRENT_DATE,
  periodo_fin DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_cortesias_rp ON cortesias(rp_nombre);
CREATE INDEX IF NOT EXISTS idx_cortesias_mesa ON cortesias(mesa_id);
CREATE INDEX IF NOT EXISTS idx_cortesias_fecha ON cortesias(fecha_autorizacion);
CREATE INDEX IF NOT EXISTS idx_cortesias_usado ON cortesias(usado);

-- Función para verificar límites antes de autorizar
CREATE OR REPLACE FUNCTION verificar_limite_cortesia(
  p_rp_nombre TEXT,
  p_tipo_cortesia TEXT,
  p_cantidad INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_disponibles INTEGER;
  v_usados INTEGER;
BEGIN
  -- Obtener límites del RP
  SELECT 
    CASE p_tipo_cortesia
      WHEN 'shots' THEN shots_disponibles - shots_usados
      WHEN 'descuento_botella' THEN descuento_botella_disponible - descuento_botella_usado
      WHEN 'perlas_negras' THEN perlas_negras_disponibles - perlas_negras_usadas
      WHEN 'shot_bienvenida' THEN shots_bienvenida_disponibles - shots_bienvenida_usados
      ELSE 0
    END INTO v_disponibles
  FROM limites_cortesias_rp
  WHERE rp_nombre = p_rp_nombre AND activo = true;
  
  -- Si no existe el RP, retornar false
  IF v_disponibles IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si hay suficientes disponibles
  RETURN v_disponibles >= p_cantidad;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar límites al autorizar cortesía
CREATE OR REPLACE FUNCTION actualizar_limite_cortesia()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.autorizado = true AND NEW.usado = false THEN
    UPDATE limites_cortesias_rp
    SET 
      shots_usados = CASE WHEN NEW.tipo_cortesia = 'shots' THEN shots_usados + NEW.cantidad ELSE shots_usados END,
      descuento_botella_usado = CASE WHEN NEW.tipo_cortesia = 'descuento_botella' THEN descuento_botella_usado + 1 ELSE descuento_botella_usado END,
      perlas_negras_usadas = CASE WHEN NEW.tipo_cortesia = 'perlas_negras' THEN perlas_negras_usadas + NEW.cantidad ELSE perlas_negras_usadas END,
      shots_bienvenida_usados = CASE WHEN NEW.tipo_cortesia = 'shot_bienvenida' THEN shots_bienvenida_usados + NEW.cantidad ELSE shots_bienvenida_usados END,
      updated_at = NOW()
    WHERE rp_nombre = NEW.rp_nombre;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar límites automáticamente
DROP TRIGGER IF EXISTS trigger_actualizar_limite_cortesia ON cortesias;
CREATE TRIGGER trigger_actualizar_limite_cortesia
  AFTER INSERT ON cortesias
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_limite_cortesia();

-- Insertar límites por defecto para RPs de ejemplo
INSERT INTO limites_cortesias_rp (rp_nombre, shots_disponibles, descuento_botella_disponible, perlas_negras_disponibles, shots_bienvenida_disponibles)
VALUES 
  ('Carlos RP', 5, 1, 3, 10),
  ('Ana RP', 5, 1, 3, 10),
  ('Luis RP', 5, 1, 3, 10)
ON CONFLICT (rp_nombre) DO NOTHING;

-- Verificar
SELECT 
  'Tabla cortesias creada' as status,
  COUNT(*) as registros
FROM cortesias
UNION ALL
SELECT 
  'Límites RP creados',
  COUNT(*)
FROM limites_cortesias_rp;

SELECT '✅ Sistema de cortesías creado correctamente' as resultado;
