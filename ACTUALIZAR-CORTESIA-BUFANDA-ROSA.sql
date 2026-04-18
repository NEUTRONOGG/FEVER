-- =====================================================
-- ACTUALIZAR SISTEMA DE CORTESÍAS A SOLO BUFANDA ROSA
-- =====================================================
-- Fecha: Enero 2026
-- Descripción: Simplifica el sistema de cortesías a solo
--              "Bufanda Rosa" con 3 disponibles por reservación
-- =====================================================

-- =====================================================
-- 1. AGREGAR COLUMNA PARA BUFANDAS ROSA EN LÍMITES
-- =====================================================

-- Agregar columna para bufandas rosa si no existe
ALTER TABLE limites_cortesias_rp 
ADD COLUMN IF NOT EXISTS bufandas_rosa_disponibles INTEGER DEFAULT 3;

ALTER TABLE limites_cortesias_rp 
ADD COLUMN IF NOT EXISTS bufandas_rosa_usadas INTEGER DEFAULT 0;

-- =====================================================
-- 2. ACTUALIZAR TODOS LOS RPs CON NUEVOS LÍMITES
-- =====================================================

UPDATE limites_cortesias_rp SET
    -- Desactivar cortesías antiguas
    shots_disponibles = 0,
    shots_usados = 0,
    perlas_negras_disponibles = 0,
    perlas_negras_usadas = 0,
    descuento_botella_disponible = 0,
    descuento_botella_usado = 0,
    shots_bienvenida_disponibles = 0,
    shots_bienvenida_usados = 0,
    -- Activar Bufanda Rosa
    bufandas_rosa_disponibles = 3,
    bufandas_rosa_usadas = 0,
    updated_at = NOW()
WHERE activo = true;

-- =====================================================
-- 3. ACTUALIZAR FUNCIÓN DE VERIFICACIÓN DE LÍMITES
-- =====================================================

CREATE OR REPLACE FUNCTION verificar_limite_cortesia(
  p_rp_nombre TEXT,
  p_tipo_cortesia TEXT,
  p_cantidad INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_disponibles INTEGER;
BEGIN
  -- Solo verificar bufanda_rosa
  IF p_tipo_cortesia = 'bufanda_rosa' THEN
    SELECT bufandas_rosa_disponibles - bufandas_rosa_usadas 
    INTO v_disponibles
    FROM limites_cortesias_rp
    WHERE rp_nombre = p_rp_nombre AND activo = true;
    
    IF v_disponibles IS NULL THEN
      -- Si no existe el RP, permitir (se creará después)
      RETURN true;
    END IF;
    
    RETURN v_disponibles >= p_cantidad;
  END IF;
  
  -- Para cualquier otro tipo, denegar
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. ACTUALIZAR TRIGGER DE ACTUALIZACIÓN DE LÍMITES
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_limite_cortesia()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.autorizado = true AND NEW.usado = false THEN
    -- Solo actualizar si es bufanda_rosa
    IF NEW.tipo_cortesia = 'bufanda_rosa' THEN
      UPDATE limites_cortesias_rp
      SET 
        bufandas_rosa_usadas = bufandas_rosa_usadas + NEW.cantidad,
        updated_at = NOW()
      WHERE rp_nombre = NEW.rp_nombre;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNCIÓN PARA RESETEAR BUFANDAS DIARIAMENTE
-- =====================================================

CREATE OR REPLACE FUNCTION resetear_bufandas_diarias()
RETURNS void AS $$
BEGIN
  UPDATE limites_cortesias_rp
  SET 
    bufandas_rosa_usadas = 0,
    updated_at = NOW()
  WHERE activo = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNCIÓN PARA OBTENER LÍMITES DE BUFANDA ROSA
-- =====================================================

CREATE OR REPLACE FUNCTION obtener_limite_bufanda_rosa(p_rp_nombre TEXT)
RETURNS TABLE (
  disponibles INTEGER,
  usadas INTEGER,
  restantes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bufandas_rosa_disponibles as disponibles,
    bufandas_rosa_usadas as usadas,
    (bufandas_rosa_disponibles - bufandas_rosa_usadas) as restantes
  FROM limites_cortesias_rp
  WHERE rp_nombre = p_rp_nombre AND activo = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. VISTA PARA ESTADÍSTICAS DE BUFANDAS ROSA
-- =====================================================

CREATE OR REPLACE VIEW vista_bufandas_rosa_hoy AS
SELECT 
  rp_nombre,
  COUNT(*) as total_autorizadas,
  SUM(cantidad) as total_bufandas,
  COUNT(CASE WHEN usado = true THEN 1 END) as canjeadas
FROM cortesias
WHERE tipo_cortesia = 'bufanda_rosa'
  AND DATE(fecha_autorizacion) = CURRENT_DATE
GROUP BY rp_nombre
ORDER BY total_bufandas DESC;

-- =====================================================
-- 8. ACTUALIZAR LÍMITES PARA RPs EXISTENTES
-- =====================================================

-- Actualizar todos los RPs existentes con bufandas rosa
UPDATE limites_cortesias_rp SET
  bufandas_rosa_disponibles = 3,
  bufandas_rosa_usadas = 0
WHERE bufandas_rosa_disponibles IS NULL OR bufandas_rosa_disponibles = 0;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT '✅ Sistema actualizado a Bufanda Rosa' as mensaje;

-- Ver configuración actual de todos los RPs
SELECT 
    rp_nombre,
    bufandas_rosa_disponibles as "🧣 Disponibles",
    bufandas_rosa_usadas as "Usadas",
    (bufandas_rosa_disponibles - bufandas_rosa_usadas) as "Restantes",
    activo
FROM limites_cortesias_rp
ORDER BY rp_nombre;

-- Resumen
SELECT 
    COUNT(*) as total_rps,
    SUM(bufandas_rosa_disponibles) as total_bufandas_disponibles,
    '3 bufandas por RP por día' as configuracion
FROM limites_cortesias_rp
WHERE activo = true;

SELECT '🧣 CORTESÍA ÚNICA: Bufanda Rosa (3 por reservación llegada)' as tipo_cortesia;
