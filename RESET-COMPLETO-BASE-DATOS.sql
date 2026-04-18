-- =====================================================
-- RESET COMPLETO DE BASE DE DATOS - SISTEMA FEVER
-- =====================================================
-- Este script limpia TODAS las tablas y las deja en estado inicial
-- ADVERTENCIA: Esto eliminará TODOS los datos del sistema

-- =====================================================
-- 1. LIMPIAR TABLAS DE TRANSACCIONES Y OPERACIONES
-- =====================================================

-- Tickets y ventas
TRUNCATE TABLE ticket_items CASCADE;
TRUNCATE TABLE tickets CASCADE;

-- Cortesías
TRUNCATE TABLE cortesias_autorizadas CASCADE;
TRUNCATE TABLE cortesias_socios CASCADE;

-- FeverCoins
TRUNCATE TABLE fevercoins_transacciones CASCADE;
TRUNCATE TABLE fevercoins_balance CASCADE;

-- FeverShop
TRUNCATE TABLE fevershop_canjes CASCADE;

-- Calificaciones
TRUNCATE TABLE calificaciones_hostess CASCADE;
TRUNCATE TABLE calificaciones_clientes CASCADE;

-- Reservaciones
TRUNCATE TABLE reservaciones CASCADE;

-- Historial de acceso
TRUNCATE TABLE historial_acceso CASCADE;

-- =====================================================
-- 2. RESETEAR MESAS A ESTADO DISPONIBLE
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
-- 3. RESETEAR CLIENTES (OPCIONAL - DESCOMENTAR SI QUIERES BORRAR CLIENTES)
-- =====================================================

-- DESCOMENTAR LAS SIGUIENTES LÍNEAS SI QUIERES ELIMINAR TODOS LOS CLIENTES:
-- TRUNCATE TABLE clientes CASCADE;

-- O SI SOLO QUIERES RESETEAR SUS MÉTRICAS:
UPDATE clientes SET
  total_visitas = 0,
  visitas_consecutivas = 0,
  ultima_visita = NULL,
  consumo_total = 0,
  ticket_promedio = 0,
  puntos_rewards = 0,
  nivel_fidelidad = 'bronce',
  calificacion_promedio = 0,
  total_calificaciones = 0,
  racha_actual = 0,
  mejor_racha = 0,
  fecha_ultima_racha = NULL;

-- =====================================================
-- 4. RESETEAR PRODUCTOS (Stock y Ventas)
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
-- 7. RESETEAR MESEROS (Opcional)
-- =====================================================

-- Si quieres resetear las estadísticas de meseros:
UPDATE meseros SET
  mesas_atendidas = 0,
  total_ventas = 0,
  calificacion_promedio = 0
WHERE TRUE; -- Ajustar según tu estructura

-- =====================================================
-- 8. VERIFICAR RESET
-- =====================================================

-- Verificar mesas disponibles
SELECT 
  COUNT(*) as total_mesas,
  SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
  SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
  SUM(CASE WHEN estado = 'reservada' THEN 1 ELSE 0 END) as reservadas
FROM mesas;

-- Verificar tickets (debe ser 0)
SELECT COUNT(*) as total_tickets FROM tickets;

-- Verificar clientes activos
SELECT COUNT(*) as total_clientes FROM clientes WHERE activo = true;

-- Verificar productos con stock
SELECT COUNT(*) as productos_con_stock FROM productos WHERE stock_actual > 0;

-- Verificar cortesías disponibles
SELECT 
  rp_nombre,
  shots_disponibles - shots_usados as shots_disponibles,
  perlas_negras_disponibles - perlas_negras_usadas as perlas_disponibles
FROM limites_cortesias_rp
WHERE activo = true;

-- =====================================================
-- 9. MENSAJE FINAL
-- =====================================================

SELECT 
  '✅ BASE DE DATOS RESETEADA CORRECTAMENTE' as mensaje,
  NOW() as fecha_reset;
