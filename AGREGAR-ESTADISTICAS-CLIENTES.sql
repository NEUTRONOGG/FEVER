-- ============================================
-- AGREGAR ESTADÍSTICAS DE PREFERENCIAS A CLIENTES
-- ============================================

-- 1. Agregar columnas nuevas a la tabla clientes
ALTER TABLE clientes
ADD COLUMN IF NOT EXISTS dia_favorito TEXT,
ADD COLUMN IF NOT EXISTS productos_favoritos TEXT[];

-- 2. Función para calcular el día favorito basado en visitas
CREATE OR REPLACE FUNCTION calcular_dia_favorito(cliente_id_param UUID)
RETURNS TEXT AS $$
DECLARE
  dia_resultado TEXT;
BEGIN
  -- Obtener el día de la semana con más visitas
  SELECT 
    CASE EXTRACT(DOW FROM fecha_visita)
      WHEN 0 THEN 'Domingo'
      WHEN 1 THEN 'Lunes'
      WHEN 2 THEN 'Martes'
      WHEN 3 THEN 'Miércoles'
      WHEN 4 THEN 'Jueves'
      WHEN 5 THEN 'Viernes'
      WHEN 6 THEN 'Sábado'
    END INTO dia_resultado
  FROM mesas
  WHERE cliente_id = cliente_id_param
    AND fecha_visita IS NOT NULL
  GROUP BY EXTRACT(DOW FROM fecha_visita)
  ORDER BY COUNT(*) DESC
  LIMIT 1;
  
  RETURN COALESCE(dia_resultado, 'Viernes');
END;
$$ LANGUAGE plpgsql;

-- 3. Función para obtener productos favoritos basado en pedidos
CREATE OR REPLACE FUNCTION calcular_productos_favoritos(cliente_id_param UUID)
RETURNS TEXT[] AS $$
DECLARE
  productos TEXT[];
BEGIN
  -- Obtener los productos más pedidos
  SELECT ARRAY_AGG(producto_nombre ORDER BY cantidad DESC)
  INTO productos
  FROM (
    SELECT 
      unnest(string_to_array(pedidos, ',')) as producto_nombre,
      COUNT(*) as cantidad
    FROM mesas
    WHERE cliente_id = cliente_id_param
      AND pedidos IS NOT NULL
      AND pedidos != ''
    GROUP BY producto_nombre
    ORDER BY cantidad DESC
    LIMIT 3
  ) subquery;
  
  -- Si no hay productos, devolver valores por defecto
  IF productos IS NULL OR array_length(productos, 1) IS NULL THEN
    productos := ARRAY['Whisky Premium', 'Vodka', 'Botana Premium'];
  END IF;
  
  RETURN productos;
END;
$$ LANGUAGE plpgsql;

-- 4. Actualizar estadísticas para todos los clientes existentes
UPDATE clientes
SET 
  dia_favorito = calcular_dia_favorito(id),
  productos_favoritos = calcular_productos_favoritos(id);

-- 5. Trigger para actualizar automáticamente cuando hay nueva visita
CREATE OR REPLACE FUNCTION actualizar_estadisticas_cliente()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar estadísticas del cliente cuando se libera una mesa
  IF OLD.cliente_id IS NOT NULL AND NEW.cliente_id IS NULL THEN
    UPDATE clientes
    SET 
      dia_favorito = calcular_dia_favorito(OLD.cliente_id),
      productos_favoritos = calcular_productos_favoritos(OLD.cliente_id)
    WHERE id = OLD.cliente_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estadisticas_cliente
AFTER UPDATE ON mesas
FOR EACH ROW
EXECUTE FUNCTION actualizar_estadisticas_cliente();

-- 6. Verificar resultados
SELECT 
  nombre,
  total_visitas,
  dia_favorito,
  productos_favoritos
FROM clientes
ORDER BY total_visitas DESC
LIMIT 10;

-- ============================================
-- DATOS DE EJEMPLO (si no hay datos reales)
-- ============================================

-- Si quieres agregar datos de ejemplo manualmente:
/*
UPDATE clientes
SET 
  dia_favorito = 'Viernes',
  productos_favoritos = ARRAY['Whisky Premium', 'Vodka', 'Botana Premium']
WHERE nombre = 'Juan Pérez';

UPDATE clientes
SET 
  dia_favorito = 'Sábado',
  productos_favoritos = ARRAY['Tequila', 'Cerveza Premium', 'Alitas']
WHERE nombre = 'María García';
*/

-- ============================================
-- CONSULTA PARA VER ESTADÍSTICAS
-- ============================================

SELECT 
  nombre,
  telefono,
  total_visitas,
  consumo_total,
  dia_favorito,
  productos_favoritos,
  nivel_fidelidad
FROM clientes
WHERE total_visitas > 0
ORDER BY total_visitas DESC;
