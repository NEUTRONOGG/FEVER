-- =====================================================
-- FUNCIONES AUXILIARES PARA GESTIÓN DE MENÚ
-- Descripción: Funciones SQL para facilitar operaciones
-- Fecha: 2024-11-05
-- =====================================================

-- =====================================================
-- FUNCIÓN: Registrar Venta de Producto
-- Actualiza stock y contador de ventas
-- =====================================================

CREATE OR REPLACE FUNCTION registrar_venta_producto(
  p_producto_id BIGINT,
  p_cantidad INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_stock_actual INTEGER;
BEGIN
  -- Verificar stock disponible
  SELECT stock INTO v_stock_actual
  FROM productos
  WHERE id = p_producto_id;
  
  IF v_stock_actual IS NULL THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  -- Para productos preparados (stock = 0), no validar
  IF v_stock_actual > 0 AND v_stock_actual < p_cantidad THEN
    RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', v_stock_actual, p_cantidad;
  END IF;
  
  -- Actualizar stock y ventas
  UPDATE productos
  SET 
    stock = CASE 
      WHEN stock > 0 THEN stock - p_cantidad 
      ELSE 0 
    END,
    veces_vendido = veces_vendido + p_cantidad,
    updated_at = NOW()
  WHERE id = p_producto_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Reabastecer Producto
-- Agrega stock al inventario
-- =====================================================

CREATE OR REPLACE FUNCTION reabastecer_producto(
  p_producto_id BIGINT,
  p_cantidad INTEGER,
  p_precio_compra DECIMAL DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE productos
  SET 
    stock = stock + p_cantidad,
    precio_compra = COALESCE(p_precio_compra, precio_compra),
    updated_at = NOW()
  WHERE id = p_producto_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Buscar Productos
-- Búsqueda flexible por nombre, categoría o precio
-- =====================================================

CREATE OR REPLACE FUNCTION buscar_productos(
  p_busqueda TEXT DEFAULT NULL,
  p_categoria TEXT DEFAULT NULL,
  p_precio_min DECIMAL DEFAULT NULL,
  p_precio_max DECIMAL DEFAULT NULL,
  p_solo_disponibles BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id BIGINT,
  nombre TEXT,
  categoria TEXT,
  precio DECIMAL,
  stock INTEGER,
  unidad TEXT,
  disponible BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nombre,
    p.categoria,
    p.precio,
    p.stock,
    p.unidad,
    CASE 
      WHEN p.stock > 0 OR p.stock = 0 AND p.unidad IN ('Coctel', 'Vaso', 'Jarra') THEN TRUE
      ELSE FALSE
    END as disponible
  FROM productos p
  WHERE 
    (p_busqueda IS NULL OR p.nombre ILIKE '%' || p_busqueda || '%')
    AND (p_categoria IS NULL OR p.categoria = p_categoria)
    AND (p_precio_min IS NULL OR p.precio >= p_precio_min)
    AND (p_precio_max IS NULL OR p.precio <= p_precio_max)
    AND (
      NOT p_solo_disponibles 
      OR p.stock > 0 
      OR (p.stock = 0 AND p.unidad IN ('Coctel', 'Vaso', 'Jarra'))
    )
  ORDER BY p.categoria, p.nombre;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Productos con Stock Bajo
-- Lista productos que necesitan reabastecimiento
-- =====================================================

CREATE OR REPLACE FUNCTION productos_stock_bajo()
RETURNS TABLE (
  id BIGINT,
  nombre TEXT,
  categoria TEXT,
  stock INTEGER,
  stock_minimo INTEGER,
  diferencia INTEGER,
  proveedor TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nombre,
    p.categoria,
    p.stock,
    p.stock_minimo,
    (p.stock_minimo - p.stock) as diferencia,
    p.proveedor
  FROM productos p
  WHERE p.stock <= p.stock_minimo
    AND p.stock > 0  -- Excluir productos preparados
  ORDER BY diferencia DESC, p.categoria;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Top Productos Vendidos
-- Productos más vendidos en un período
-- =====================================================

CREATE OR REPLACE FUNCTION top_productos_vendidos(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE,
  p_fecha_fin DATE DEFAULT CURRENT_DATE,
  p_limite INTEGER DEFAULT 20
)
RETURNS TABLE (
  producto TEXT,
  categoria TEXT,
  unidades_vendidas BIGINT,
  total_ventas NUMERIC,
  precio_promedio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    item->>'nombre' as producto,
    p.categoria,
    SUM((item->>'cantidad')::INTEGER)::BIGINT as unidades_vendidas,
    SUM((item->>'precio')::NUMERIC * (item->>'cantidad')::INTEGER) as total_ventas,
    AVG((item->>'precio')::NUMERIC) as precio_promedio
  FROM tickets t,
    jsonb_array_elements(t.productos) as item
  LEFT JOIN productos p ON p.nombre = item->>'nombre'
  WHERE DATE(t.created_at) BETWEEN p_fecha_inicio AND p_fecha_fin
  GROUP BY item->>'nombre', p.categoria
  ORDER BY total_ventas DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Estadísticas de Ventas por Categoría
-- Resumen de ventas agrupadas por categoría
-- =====================================================

CREATE OR REPLACE FUNCTION stats_ventas_por_categoria(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE,
  p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  categoria TEXT,
  num_productos BIGINT,
  unidades_vendidas BIGINT,
  total_ventas NUMERIC,
  ticket_promedio NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.categoria,
    COUNT(DISTINCT item->>'nombre')::BIGINT as num_productos,
    SUM((item->>'cantidad')::INTEGER)::BIGINT as unidades_vendidas,
    SUM((item->>'precio')::NUMERIC * (item->>'cantidad')::INTEGER) as total_ventas,
    AVG((item->>'precio')::NUMERIC * (item->>'cantidad')::INTEGER) as ticket_promedio
  FROM tickets t,
    jsonb_array_elements(t.productos) as item
  LEFT JOIN productos p ON p.nombre = item->>'nombre'
  WHERE DATE(t.created_at) BETWEEN p_fecha_inicio AND p_fecha_fin
  GROUP BY p.categoria
  ORDER BY total_ventas DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Análisis de Rentabilidad
-- Calcula ganancia por producto
-- =====================================================

CREATE OR REPLACE FUNCTION analisis_rentabilidad(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE,
  p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  producto TEXT,
  categoria TEXT,
  precio_venta NUMERIC,
  precio_compra NUMERIC,
  ganancia_unitaria NUMERIC,
  margen_porcentaje NUMERIC,
  unidades_vendidas BIGINT,
  ganancia_total NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.nombre as producto,
    p.categoria,
    p.precio as precio_venta,
    p.precio_compra,
    (p.precio - p.precio_compra) as ganancia_unitaria,
    ROUND(((p.precio - p.precio_compra) / p.precio * 100)::NUMERIC, 2) as margen_porcentaje,
    COALESCE(v.unidades, 0)::BIGINT as unidades_vendidas,
    COALESCE((p.precio - p.precio_compra) * v.unidades, 0) as ganancia_total
  FROM productos p
  LEFT JOIN (
    SELECT 
      item->>'nombre' as nombre,
      SUM((item->>'cantidad')::INTEGER) as unidades
    FROM tickets t,
      jsonb_array_elements(t.productos) as item
    WHERE DATE(t.created_at) BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY item->>'nombre'
  ) v ON v.nombre = p.nombre
  WHERE p.precio_compra > 0
  ORDER BY ganancia_total DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCIÓN: Actualizar Precio de Producto
-- Actualiza precio y registra el cambio
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_precio_producto(
  p_producto_id BIGINT,
  p_nuevo_precio DECIMAL,
  p_usuario TEXT DEFAULT 'Sistema'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_precio_anterior DECIMAL;
  v_nombre_producto TEXT;
BEGIN
  -- Obtener precio actual
  SELECT precio, nombre INTO v_precio_anterior, v_nombre_producto
  FROM productos
  WHERE id = p_producto_id;
  
  IF v_precio_anterior IS NULL THEN
    RAISE EXCEPTION 'Producto no encontrado';
  END IF;
  
  -- Actualizar precio
  UPDATE productos
  SET 
    precio = p_nuevo_precio,
    updated_at = NOW()
  WHERE id = p_producto_id;
  
  -- Registrar cambio en log (opcional, si existe tabla de logs)
  -- INSERT INTO logs_cambios_precios (producto_id, producto_nombre, precio_anterior, precio_nuevo, usuario)
  -- VALUES (p_producto_id, v_nombre_producto, v_precio_anterior, p_nuevo_precio, p_usuario);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VISTA: Productos Disponibles
-- Vista optimizada de productos disponibles para venta
-- =====================================================

CREATE OR REPLACE VIEW vista_productos_disponibles AS
SELECT 
  id,
  nombre,
  categoria,
  precio,
  stock,
  unidad,
  CASE 
    WHEN stock > 0 THEN TRUE
    WHEN stock = 0 AND unidad IN ('Coctel', 'Vaso', 'Jarra') THEN TRUE
    ELSE FALSE
  END as disponible,
  CASE
    WHEN stock = 0 THEN 'Sin stock'
    WHEN stock <= stock_minimo THEN 'Stock bajo'
    ELSE 'Disponible'
  END as estado_stock,
  veces_vendido,
  rating_promedio
FROM productos
ORDER BY categoria, nombre;

-- =====================================================
-- VISTA: Resumen de Inventario
-- Vista con información clave del inventario
-- =====================================================

CREATE OR REPLACE VIEW vista_resumen_inventario AS
SELECT 
  categoria,
  COUNT(*) as total_productos,
  SUM(stock) as stock_total,
  SUM(CASE WHEN stock <= stock_minimo AND stock > 0 THEN 1 ELSE 0 END) as productos_stock_bajo,
  SUM(CASE WHEN stock = 0 AND unidad NOT IN ('Coctel', 'Vaso', 'Jarra') THEN 1 ELSE 0 END) as productos_sin_stock,
  SUM(stock * precio_compra) as valor_inventario,
  SUM(veces_vendido) as total_ventas
FROM productos
GROUP BY categoria
ORDER BY categoria;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índice para búsquedas por nombre (ya existe en PASO2)
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));

-- Índice para ordenamiento por ventas
CREATE INDEX IF NOT EXISTS idx_productos_ventas ON productos(veces_vendido DESC);

-- Índice para productos con stock bajo
CREATE INDEX IF NOT EXISTS idx_productos_stock_bajo ON productos(stock) WHERE stock <= stock_minimo;

-- Índice compuesto para filtros comunes
CREATE INDEX IF NOT EXISTS idx_productos_categoria_precio ON productos(categoria, precio);

-- =====================================================
-- TRIGGER: Actualizar timestamp automáticamente
-- =====================================================

CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_timestamp ON productos;
CREATE TRIGGER trigger_actualizar_timestamp
  BEFORE UPDATE ON productos
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp();

-- =====================================================
-- EJEMPLOS DE USO
-- =====================================================

-- Ejemplo 1: Buscar productos
-- SELECT * FROM buscar_productos('tequila', NULL, NULL, NULL, TRUE);

-- Ejemplo 2: Registrar venta
-- SELECT registrar_venta_producto(1, 2);

-- Ejemplo 3: Productos con stock bajo
-- SELECT * FROM productos_stock_bajo();

-- Ejemplo 4: Top 10 productos del día
-- SELECT * FROM top_productos_vendidos(CURRENT_DATE, CURRENT_DATE, 10);

-- Ejemplo 5: Estadísticas por categoría
-- SELECT * FROM stats_ventas_por_categoria(CURRENT_DATE, CURRENT_DATE);

-- Ejemplo 6: Análisis de rentabilidad
-- SELECT * FROM analisis_rentabilidad(CURRENT_DATE, CURRENT_DATE);

-- Ejemplo 7: Reabastecer producto
-- SELECT reabastecer_producto(1, 50, 60.00);

-- Ejemplo 8: Actualizar precio
-- SELECT actualizar_precio_producto(1, 150.00, 'Admin');

-- Ejemplo 9: Ver productos disponibles
-- SELECT * FROM vista_productos_disponibles WHERE categoria = 'Tequila';

-- Ejemplo 10: Resumen de inventario
-- SELECT * FROM vista_resumen_inventario;

-- =====================================================
-- COMENTARIOS EN FUNCIONES
-- =====================================================

COMMENT ON FUNCTION registrar_venta_producto IS 'Registra la venta de un producto, actualizando stock y contador de ventas';
COMMENT ON FUNCTION reabastecer_producto IS 'Agrega stock a un producto existente';
COMMENT ON FUNCTION buscar_productos IS 'Búsqueda flexible de productos con múltiples filtros';
COMMENT ON FUNCTION productos_stock_bajo IS 'Lista productos que necesitan reabastecimiento';
COMMENT ON FUNCTION top_productos_vendidos IS 'Retorna los productos más vendidos en un período';
COMMENT ON FUNCTION stats_ventas_por_categoria IS 'Estadísticas de ventas agrupadas por categoría';
COMMENT ON FUNCTION analisis_rentabilidad IS 'Análisis de ganancia y margen por producto';
COMMENT ON FUNCTION actualizar_precio_producto IS 'Actualiza el precio de un producto';

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
