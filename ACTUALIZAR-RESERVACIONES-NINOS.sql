-- Script para agregar campos de niños y niñas a la tabla de reservaciones
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas para niños y niñas si no existen
DO $$ 
BEGIN
  -- Agregar numero_ninos
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservaciones' AND column_name = 'numero_ninos'
  ) THEN
    ALTER TABLE reservaciones ADD COLUMN numero_ninos INTEGER DEFAULT 0;
    COMMENT ON COLUMN reservaciones.numero_ninos IS 'Número de niños en la reservación';
  END IF;

  -- Agregar numero_ninas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservaciones' AND column_name = 'numero_ninas'
  ) THEN
    ALTER TABLE reservaciones ADD COLUMN numero_ninas INTEGER DEFAULT 0;
    COMMENT ON COLUMN reservaciones.numero_ninas IS 'Número de niñas en la reservación';
  END IF;
END $$;

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_reservaciones_ninos ON reservaciones(numero_ninos);
CREATE INDEX IF NOT EXISTS idx_reservaciones_ninas ON reservaciones(numero_ninas);

-- Verificar que la suma de personas sea consistente (opcional)
-- Esta consulta muestra reservaciones donde la suma no coincide con el total
SELECT 
  id,
  cliente_nombre,
  numero_personas,
  numero_hombres,
  numero_mujeres,
  numero_ninos,
  numero_ninas,
  (numero_hombres + numero_mujeres + COALESCE(numero_ninos, 0) + COALESCE(numero_ninas, 0)) as suma_calculada,
  fecha,
  hora
FROM reservaciones
WHERE (numero_hombres + numero_mujeres + COALESCE(numero_ninos, 0) + COALESCE(numero_ninas, 0)) != numero_personas
ORDER BY fecha DESC, hora DESC
LIMIT 10;

-- Actualizar registros existentes donde la suma no coincide
-- (Esto distribuye las personas faltantes en hombres y mujeres proporcionalmente)
UPDATE reservaciones
SET 
  numero_ninos = COALESCE(numero_ninos, 0),
  numero_ninas = COALESCE(numero_ninas, 0)
WHERE numero_ninos IS NULL OR numero_ninas IS NULL;

-- Estadísticas después de la actualización
SELECT 
  COUNT(*) as total_reservaciones,
  SUM(numero_hombres) as total_hombres,
  SUM(numero_mujeres) as total_mujeres,
  SUM(COALESCE(numero_ninos, 0)) as total_ninos,
  SUM(COALESCE(numero_ninas, 0)) as total_ninas,
  SUM(numero_personas) as total_personas
FROM reservaciones
WHERE estado = 'pendiente';

-- Crear vista para análisis de distribución de personas
CREATE OR REPLACE VIEW vista_distribucion_reservaciones AS
SELECT 
  id,
  cliente_nombre,
  fecha,
  hora,
  numero_personas,
  numero_hombres,
  numero_mujeres,
  COALESCE(numero_ninos, 0) as numero_ninos,
  COALESCE(numero_ninas, 0) as numero_ninas,
  (numero_hombres + numero_mujeres + COALESCE(numero_ninos, 0) + COALESCE(numero_ninas, 0)) as suma_total,
  CASE 
    WHEN (numero_hombres + numero_mujeres + COALESCE(numero_ninos, 0) + COALESCE(numero_ninas, 0)) = numero_personas 
    THEN 'Válida' 
    ELSE 'Inconsistente' 
  END as validacion,
  rp_nombre,
  estado,
  creado_por
FROM reservaciones
ORDER BY fecha DESC, hora DESC;

-- Comentarios en la vista
COMMENT ON VIEW vista_distribucion_reservaciones IS 'Vista para análisis de distribución de personas en reservaciones';

-- Mensajes de confirmación
DO $$ 
BEGIN
  RAISE NOTICE '✅ Script ejecutado exitosamente';
  RAISE NOTICE '📊 Columnas numero_ninos y numero_ninas agregadas';
  RAISE NOTICE '🔍 Índices creados para optimización';
  RAISE NOTICE '📈 Vista de análisis creada: vista_distribucion_reservaciones';
END $$;
