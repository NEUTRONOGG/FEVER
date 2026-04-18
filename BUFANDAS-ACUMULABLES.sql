-- =====================================================
-- BUFANDAS ROSA ACUMULABLES POR RESERVACIÓN
-- =====================================================
-- Cada vez que una reservación se marca como "llegó" (asistio = true),
-- se agregan 3 bufandas rosa al RP correspondiente
-- =====================================================

-- 1. FUNCIÓN TRIGGER: Agregar bufandas cuando llega reservación
-- =====================================================

CREATE OR REPLACE FUNCTION agregar_bufandas_por_llegada()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo ejecutar cuando asistio cambia de false/null a true
  IF (NEW.asistio = true AND (OLD.asistio IS NULL OR OLD.asistio = false)) THEN
    
    -- Verificar que la reservación tenga un RP asignado
    IF NEW.rp_nombre IS NOT NULL AND NEW.rp_nombre != '' AND NEW.rp_nombre != 'sin_rp' THEN
      
      -- Agregar 3 bufandas al RP
      UPDATE limites_cortesias_rp
      SET 
        bufandas_rosa_disponibles = bufandas_rosa_disponibles + 3,
        updated_at = NOW()
      WHERE rp_nombre = NEW.rp_nombre AND activo = true;
      
      -- Si el RP no existe en límites, crearlo
      IF NOT FOUND THEN
        INSERT INTO limites_cortesias_rp (
          rp_nombre, 
          bufandas_rosa_disponibles, 
          bufandas_rosa_usadas,
          shots_disponibles,
          perlas_negras_disponibles,
          descuento_botella_disponible,
          shots_bienvenida_disponibles
        ) VALUES (
          NEW.rp_nombre, 
          3,  -- 3 bufandas iniciales
          0,
          0, 0, 0, 0
        );
      END IF;
      
      -- Log para debugging (opcional)
      RAISE NOTICE '🧣 +3 bufandas para RP: % (Reservación: %)', NEW.rp_nombre, NEW.cliente_nombre;
      
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. CREAR TRIGGER EN TABLA RESERVACIONES
-- =====================================================

DROP TRIGGER IF EXISTS trigger_bufandas_por_llegada ON reservaciones;

CREATE TRIGGER trigger_bufandas_por_llegada
  AFTER UPDATE ON reservaciones
  FOR EACH ROW
  EXECUTE FUNCTION agregar_bufandas_por_llegada();

-- 3. RESETEAR BUFANDAS A 0 PARA EMPEZAR LIMPIO
-- =====================================================
-- Las bufandas ahora se acumulan por cada llegada, no son fijas

UPDATE limites_cortesias_rp SET
  bufandas_rosa_disponibles = 0,
  bufandas_rosa_usadas = 0,
  updated_at = NOW()
WHERE activo = true;

-- 4. FUNCIÓN PARA RESETEAR BUFANDAS AL INICIO DEL DÍA
-- =====================================================

CREATE OR REPLACE FUNCTION resetear_bufandas_diarias()
RETURNS void AS $$
BEGIN
  -- Resetear todas las bufandas a 0 al inicio del día
  UPDATE limites_cortesias_rp
  SET 
    bufandas_rosa_disponibles = 0,
    bufandas_rosa_usadas = 0,
    updated_at = NOW()
  WHERE activo = true;
END;
$$ LANGUAGE plpgsql;

-- 5. VISTA PARA VER BUFANDAS POR RP
-- =====================================================

CREATE OR REPLACE VIEW vista_bufandas_rp AS
SELECT 
  l.rp_nombre,
  l.bufandas_rosa_disponibles as total_ganadas,
  l.bufandas_rosa_usadas as usadas,
  (l.bufandas_rosa_disponibles - l.bufandas_rosa_usadas) as disponibles,
  (SELECT COUNT(*) FROM reservaciones r 
   WHERE r.rp_nombre = l.rp_nombre 
   AND r.asistio = true 
   AND DATE(r.fecha) = CURRENT_DATE) as reservaciones_llegaron_hoy
FROM limites_cortesias_rp l
WHERE l.activo = true
ORDER BY disponibles DESC;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT '✅ Sistema de bufandas acumulables activado' as mensaje;
SELECT '🧣 Cada reservación que llega = +3 bufandas para el RP' as regla;

-- Ver estado actual
SELECT 
  rp_nombre,
  bufandas_rosa_disponibles as "Total Ganadas",
  bufandas_rosa_usadas as "Usadas",
  (bufandas_rosa_disponibles - bufandas_rosa_usadas) as "Disponibles"
FROM limites_cortesias_rp
WHERE activo = true
ORDER BY rp_nombre;

SELECT '💡 Las bufandas se resetean a 0 cada día y se acumulan con cada llegada' as nota;
