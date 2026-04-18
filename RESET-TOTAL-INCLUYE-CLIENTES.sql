-- =====================================================
-- RESET TOTAL - ELIMINA TODO INCLUYENDO CLIENTES
-- =====================================================
-- ADVERTENCIA: Este script eliminará ABSOLUTAMENTE TODO
-- Usar solo si quieres empezar completamente desde cero

-- =====================================================
-- 1. ELIMINAR TODAS LAS TRANSACCIONES
-- =====================================================

TRUNCATE TABLE ticket_items CASCADE;
TRUNCATE TABLE tickets CASCADE;
TRUNCATE TABLE cortesias_autorizadas CASCADE;
TRUNCATE TABLE cortesias_socios CASCADE;
TRUNCATE TABLE fevercoins_transacciones CASCADE;
TRUNCATE TABLE fevercoins_balance CASCADE;
TRUNCATE TABLE fevershop_canjes CASCADE;
TRUNCATE TABLE calificaciones_hostess CASCADE;
TRUNCATE TABLE calificaciones_clientes CASCADE;
TRUNCATE TABLE reservaciones CASCADE;
TRUNCATE TABLE historial_acceso CASCADE;

-- =====================================================
-- 2. ELIMINAR TODOS LOS CLIENTES
-- =====================================================

TRUNCATE TABLE clientes CASCADE;

-- =====================================================
-- 3. RESETEAR MESAS A DISPONIBLE
-- =====================================================

UPDATE mesas SET
  estado = 'disponible',
  cliente_id = NULL,
  cliente_nombre = NULL,
  numero_personas = NULL,
  numero_hombres = NULL,
  numero_mujeres = NULL,
  numero_ninos = NULL,
  numero_ninas = NULL,
  clientes_data = '[]'::jsonb,
  total = 0,
  mesero = NULL,
  hora_asignacion = NULL,
  rp_asignado = NULL,
  observaciones = NULL,
  pedidos_data = '[]'::jsonb,
  total_actual = 0,
  cliente_telefono = NULL,
  cliente_genero = NULL,
  hora_reservacion = NULL,
  nombre_reservacion = NULL;

-- =====================================================
-- 4. RESETEAR PRODUCTOS
-- =====================================================

UPDATE productos SET
  stock_actual = stock_inicial,
  total_vendido = 0,
  ultima_venta = NULL;

-- =====================================================
-- 5. RESETEAR LÍMITES DE RPs
-- =====================================================

UPDATE limites_cortesias_rp SET
  shots_usados = 0,
  perlas_negras_usadas = 0,
  descuento_botella_usado = 0,
  shots_bienvenida_usados = 0,
  ultima_actualizacion = NOW();

-- =====================================================
-- 6. RESETEAR SOCIOS
-- =====================================================

UPDATE socios SET
  cortesias_usadas_hoy = 0,
  ultima_actualizacion = NOW();

-- =====================================================
-- 7. VERIFICACIÓN FINAL
-- =====================================================

SELECT '✅ RESET TOTAL COMPLETADO' as status;

SELECT 
  'Mesas' as tabla,
  COUNT(*) as total,
  SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles
FROM mesas

UNION ALL

SELECT 
  'Clientes' as tabla,
  COUNT(*) as total,
  0 as disponibles
FROM clientes

UNION ALL

SELECT 
  'Tickets' as tabla,
  COUNT(*) as total,
  0 as disponibles
FROM tickets

UNION ALL

SELECT 
  'Productos' as tabla,
  COUNT(*) as total,
  SUM(CASE WHEN stock_actual > 0 THEN 1 ELSE 0 END) as con_stock
FROM productos;
