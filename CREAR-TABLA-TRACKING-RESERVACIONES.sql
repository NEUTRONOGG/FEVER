-- =====================================================
-- TABLA PARA TRACKING DE DESEMPEÑO DE RPs
-- =====================================================

-- Crear tabla de tracking de reservaciones procesadas
CREATE TABLE IF NOT EXISTS reservaciones_procesadas_tracking (
  id BIGSERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  dia_semana VARCHAR(20),
  rps_procesados TEXT[] DEFAULT '{}',
  total_reservaciones INTEGER DEFAULT 0,
  archivo_original VARCHAR(255),
  archivo_storage VARCHAR(500),
  fecha_procesamiento TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  modelo_usado VARCHAR(100),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para búsquedas rápidas
CREATE INDEX idx_tracking_fecha ON reservaciones_procesadas_tracking(fecha);
CREATE INDEX idx_tracking_rps ON reservaciones_procesadas_tracking USING GIN(rps_procesados);
CREATE INDEX idx_tracking_fecha_procesamiento ON reservaciones_procesadas_tracking(fecha_procesamiento);

-- Crear tabla de desempeño por RP (agregada)
CREATE TABLE IF NOT EXISTS desempeno_rps (
  id BIGSERIAL PRIMARY KEY,
  rp_nombre VARCHAR(255) NOT NULL,
  rp_iniciales VARCHAR(10),
  fecha DATE NOT NULL,
  total_reservaciones INTEGER DEFAULT 0,
  total_personas INTEGER DEFAULT 0,
  promedio_personas_por_reserva DECIMAL(5, 2),
  fecha_procesamiento TIMESTAMP WITH TIME ZONE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(rp_nombre, fecha)
);

-- Crear índices para desempeño
CREATE INDEX idx_desempeno_rp ON desempeno_rps(rp_nombre);
CREATE INDEX idx_desempeno_fecha ON desempeno_rps(fecha);
CREATE INDEX idx_desempeno_rp_fecha ON desempeno_rps(rp_nombre, fecha);

-- Crear vista para análisis de desempeño
CREATE OR REPLACE VIEW vista_desempeno_rps_resumen AS
SELECT 
  rp_nombre,
  rp_iniciales,
  COUNT(DISTINCT fecha) as dias_trabajados,
  SUM(total_reservaciones) as total_reservaciones,
  SUM(total_personas) as total_personas,
  ROUND(AVG(promedio_personas_por_reserva), 2) as promedio_personas,
  MAX(fecha) as ultima_fecha_procesada,
  COUNT(*) as registros
FROM desempeno_rps
GROUP BY rp_nombre, rp_iniciales
ORDER BY total_reservaciones DESC;

-- Crear vista para comparativa diaria
CREATE OR REPLACE VIEW vista_desempeno_diario AS
SELECT 
  fecha,
  rp_nombre,
  rp_iniciales,
  total_reservaciones,
  total_personas,
  promedio_personas_por_reserva,
  RANK() OVER (PARTITION BY fecha ORDER BY total_reservaciones DESC) as ranking_dia
FROM desempeno_rps
ORDER BY fecha DESC, total_reservaciones DESC;

-- Crear tabla de Storage bucket (si no existe)
-- Nota: Ejecutar esto en Supabase Console:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('reservaciones-procesadas', 'reservaciones-procesadas', false);

-- Políticas de acceso para Storage
-- Nota: Ejecutar esto en Supabase Console para permitir acceso:
/*
CREATE POLICY "Allow authenticated users to read reservaciones" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'reservaciones-procesadas' AND auth.role() = 'authenticated');

CREATE POLICY "Allow service role to upload reservaciones" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'reservaciones-procesadas' AND auth.role() = 'service_role');
*/

-- =====================================================
-- INSERTAR DATOS DE EJEMPLO (OPCIONAL)
-- =====================================================

-- Ejemplo de registro de tracking
-- INSERT INTO reservaciones_procesadas_tracking (
--   fecha, dia_semana, rps_procesados, total_reservaciones, 
--   archivo_original, archivo_storage, modelo_usado
-- ) VALUES (
--   '2025-04-17', 'JUEVES', ARRAY['Juan Pérez', 'Ana García'], 15,
--   'FEVER_DATOS.xlsx', 'reservaciones/2025-04-17/timestamp-FEVER_DATOS.json',
--   'claude-3-5-haiku-20241022'
-- );

-- Ejemplo de desempeño por RP
-- INSERT INTO desempeno_rps (
--   rp_nombre, rp_iniciales, fecha, total_reservaciones, 
--   total_personas, promedio_personas_por_reserva
-- ) VALUES (
--   'Juan Pérez', 'JP', '2025-04-17', 8, 18, 2.25
-- );
