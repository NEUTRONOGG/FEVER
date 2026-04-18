-- =====================================================
-- RESET SEGURO - SOLO LIMPIA TABLAS QUE EXISTEN
-- =====================================================
-- Este script verifica que las tablas existan antes de limpiarlas

-- =====================================================
-- 1. LIMPIAR TABLAS DE TRANSACCIONES (SI EXISTEN)
-- =====================================================

-- Tickets y ventas
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ticket_items') THEN
        TRUNCATE TABLE ticket_items CASCADE;
        RAISE NOTICE '✓ ticket_items limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tickets') THEN
        TRUNCATE TABLE tickets CASCADE;
        RAISE NOTICE '✓ tickets limpiada';
    END IF;
END $$;

-- Cortesías
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cortesias_autorizadas') THEN
        TRUNCATE TABLE cortesias_autorizadas CASCADE;
        RAISE NOTICE '✓ cortesias_autorizadas limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cortesias_socios') THEN
        TRUNCATE TABLE cortesias_socios CASCADE;
        RAISE NOTICE '✓ cortesias_socios limpiada';
    END IF;
END $$;

-- FeverCoins
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevercoins_transacciones') THEN
        TRUNCATE TABLE fevercoins_transacciones CASCADE;
        RAISE NOTICE '✓ fevercoins_transacciones limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevercoins_balance') THEN
        TRUNCATE TABLE fevercoins_balance CASCADE;
        RAISE NOTICE '✓ fevercoins_balance limpiada';
    END IF;
END $$;

-- FeverShop
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevershop_canjes') THEN
        TRUNCATE TABLE fevershop_canjes CASCADE;
        RAISE NOTICE '✓ fevershop_canjes limpiada';
    END IF;
END $$;

-- Calificaciones
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'calificaciones_hostess') THEN
        TRUNCATE TABLE calificaciones_hostess CASCADE;
        RAISE NOTICE '✓ calificaciones_hostess limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'calificaciones_clientes') THEN
        TRUNCATE TABLE calificaciones_clientes CASCADE;
        RAISE NOTICE '✓ calificaciones_clientes limpiada';
    END IF;
END $$;

-- Reservaciones
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reservaciones') THEN
        TRUNCATE TABLE reservaciones CASCADE;
        RAISE NOTICE '✓ reservaciones limpiada';
    END IF;
END $$;

-- Historial de acceso
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'historial_acceso') THEN
        TRUNCATE TABLE historial_acceso CASCADE;
        RAISE NOTICE '✓ historial_acceso limpiada';
    END IF;
END $$;

-- =====================================================
-- 2. RESETEAR MESAS A ESTADO DISPONIBLE
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mesas') THEN
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
        RAISE NOTICE '✓ Mesas reseteadas a disponible';
    END IF;
END $$;

-- =====================================================
-- 3. RESETEAR CLIENTES (MÉTRICAS A 0)
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') THEN
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
        RAISE NOTICE '✓ Métricas de clientes reseteadas';
    END IF;
END $$;

-- =====================================================
-- 4. RESETEAR PRODUCTOS (Stock y Ventas)
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'productos') THEN
        UPDATE productos SET
          stock_actual = stock_inicial,
          total_vendido = 0,
          ultima_venta = NULL;
        RAISE NOTICE '✓ Productos reseteados';
    END IF;
END $$;

-- =====================================================
-- 5. RESETEAR LÍMITES DE RPs
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'limites_cortesias_rp') THEN
        UPDATE limites_cortesias_rp SET
          shots_usados = 0,
          perlas_negras_usadas = 0,
          descuento_botella_usado = 0,
          shots_bienvenida_usados = 0,
          ultima_actualizacion = NOW();
        RAISE NOTICE '✓ Límites de RPs reseteados';
    END IF;
END $$;

-- =====================================================
-- 6. RESETEAR SOCIOS
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'socios') THEN
        UPDATE socios SET
          cortesias_usadas_hoy = 0,
          ultima_actualizacion = NOW();
        RAISE NOTICE '✓ Socios reseteados';
    END IF;
END $$;

-- =====================================================
-- 7. VERIFICAR RESET
-- =====================================================

SELECT '✅ RESET COMPLETADO EXITOSAMENTE' as mensaje, NOW() as fecha;

-- Verificar mesas
SELECT 
  'Mesas' as tabla,
  COUNT(*) as total,
  SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END) as disponibles,
  SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
  SUM(CASE WHEN estado = 'reservada' THEN 1 ELSE 0 END) as reservadas
FROM mesas;

-- Verificar clientes
SELECT 
  'Clientes' as tabla,
  COUNT(*) as total,
  SUM(CASE WHEN total_visitas = 0 THEN 1 ELSE 0 END) as sin_visitas
FROM clientes;
