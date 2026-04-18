-- =====================================================
-- RESET DEFINITIVO - BASADO EN TU ESTRUCTURA REAL
-- =====================================================
-- Este script resetea TODAS las tablas que existen en tu BD

-- =====================================================
-- 1. ELIMINAR DATOS DE TRANSACCIONES
-- =====================================================

-- Tickets y ventas
DO $$ 
BEGIN
    -- Tickets (historial de consumos)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tickets') THEN
        DELETE FROM tickets;
        RAISE NOTICE '✓ tickets limpiada';
    END IF;
    
    -- Ventas
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ventas') THEN
        DELETE FROM ventas;
        RAISE NOTICE '✓ ventas limpiada';
    END IF;
    
    -- Visitas
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'visitas') THEN
        DELETE FROM visitas;
        RAISE NOTICE '✓ visitas limpiada';
    END IF;
END $$;

-- Cortesías
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cortesias_autorizadas') THEN
        DELETE FROM cortesias_autorizadas;
        RAISE NOTICE '✓ cortesias_autorizadas limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cortesias') THEN
        DELETE FROM cortesias;
        RAISE NOTICE '✓ cortesias limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cortesias_activas') THEN
        DELETE FROM cortesias_activas;
        RAISE NOTICE '✓ cortesias_activas limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cortesias_socios') THEN
        DELETE FROM cortesias_socios;
        RAISE NOTICE '✓ cortesias_socios limpiada';
    END IF;
END $$;

-- FeverCoins
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevercoins_transacciones') THEN
        DELETE FROM fevercoins_transacciones;
        RAISE NOTICE '✓ fevercoins_transacciones limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevercoins_balance') THEN
        DELETE FROM fevercoins_balance;
        RAISE NOTICE '✓ fevercoins_balance limpiada';
    END IF;
END $$;

-- FeverShop
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevershop_canjes') THEN
        DELETE FROM fevershop_canjes;
        RAISE NOTICE '✓ fevershop_canjes limpiada';
    END IF;
END $$;

-- Calificaciones
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'calificaciones_hostess') THEN
        DELETE FROM calificaciones_hostess;
        RAISE NOTICE '✓ calificaciones_hostess limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'calificaciones_clientes') THEN
        DELETE FROM calificaciones_clientes;
        RAISE NOTICE '✓ calificaciones_clientes limpiada';
    END IF;
END $$;

-- Reservaciones
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reservaciones') THEN
        DELETE FROM reservaciones;
        RAISE NOTICE '✓ reservaciones limpiada';
    END IF;
END $$;

-- Historial de acceso
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'historial_acceso') THEN
        DELETE FROM historial_acceso;
        RAISE NOTICE '✓ historial_acceso limpiada';
    END IF;
END $$;

-- Encuestas
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'encuestas') THEN
        DELETE FROM encuestas;
        RAISE NOTICE '✓ encuestas limpiada';
    END IF;
END $$;

-- Rewards y Rachas
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rewards') THEN
        DELETE FROM rewards;
        RAISE NOTICE '✓ rewards limpiada';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'rachas') THEN
        DELETE FROM rachas;
        RAISE NOTICE '✓ rachas limpiada';
    END IF;
END $$;

-- Fila de espera
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fila_espera') THEN
        DELETE FROM fila_espera;
        RAISE NOTICE '✓ fila_espera limpiada';
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
          nombre_reservacion = NULL,
          updated_at = NOW();
        RAISE NOTICE '✓ Mesas reseteadas a disponible';
    END IF;
END $$;

-- =====================================================
-- 3. ELIMINAR CLIENTES (OPCIONAL - COMENTADO)
-- =====================================================

-- DESCOMENTAR SI QUIERES ELIMINAR TODOS LOS CLIENTES:
-- DO $$ 
-- BEGIN
--     IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') THEN
--         DELETE FROM clientes;
--         RAISE NOTICE '✓ clientes eliminados';
--     END IF;
-- END $$;

-- O RESETEAR SOLO SUS MÉTRICAS (RECOMENDADO):
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
          fecha_ultima_racha = NULL,
          updated_at = NOW();
        RAISE NOTICE '✓ Métricas de clientes reseteadas';
    END IF;
END $$;

-- =====================================================
-- 4. RESETEAR PRODUCTOS
-- =====================================================

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'productos') THEN
        UPDATE productos SET
          stock = COALESCE(stock_inicial, stock),
          total_vendido = 0,
          ultima_venta = NULL,
          updated_at = NOW()
        WHERE TRUE;
        RAISE NOTICE '✓ Productos reseteados';
    END IF;
END $$;

-- Si la columna se llama stock_actual en lugar de stock:
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'stock_actual'
    ) THEN
        UPDATE productos SET
          stock_actual = COALESCE(stock_inicial, stock_actual),
          total_vendido = 0,
          ultima_venta = NULL,
          updated_at = NOW()
        WHERE TRUE;
        RAISE NOTICE '✓ Productos reseteados (stock_actual)';
    END IF;
END $$;

-- =====================================================
-- 5. RESETEAR LÍMITES DE RPs
-- =====================================================
-- Límites correctos: 5 Covers, 0 Perlas, 0 Shots, 0 Botellas

DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'limites_cortesias_rp') THEN
        UPDATE limites_cortesias_rp SET
          shots_disponibles = 0,
          shots_usados = 0,
          perlas_negras_disponibles = 0,
          perlas_negras_usadas = 0,
          descuento_botella_disponible = 0,
          descuento_botella_usado = 0,
          shots_bienvenida_disponibles = 5,
          shots_bienvenida_usados = 0,
          ultima_actualizacion = NOW();
        RAISE NOTICE '✓ Límites de RPs reseteados (5 Covers, 0 Perlas, 0 Shots, 0 Botellas)';
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
-- 7. VERIFICACIÓN FINAL
-- =====================================================

SELECT '✅ RESET COMPLETADO EXITOSAMENTE' as mensaje, NOW() as fecha;

-- Verificar mesas
DO $$
DECLARE
    total_mesas INTEGER;
    disponibles INTEGER;
    ocupadas INTEGER;
    reservadas INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'mesas') THEN
        SELECT 
            COUNT(*),
            SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END),
            SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END),
            SUM(CASE WHEN estado = 'reservada' THEN 1 ELSE 0 END)
        INTO total_mesas, disponibles, ocupadas, reservadas
        FROM mesas;
        
        RAISE NOTICE '📊 MESAS: Total=%, Disponibles=%, Ocupadas=%, Reservadas=%', 
            total_mesas, disponibles, ocupadas, reservadas;
    END IF;
END $$;

-- Verificar clientes
DO $$
DECLARE
    total_clientes INTEGER;
    sin_visitas INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes') THEN
        SELECT 
            COUNT(*),
            SUM(CASE WHEN COALESCE(total_visitas, 0) = 0 THEN 1 ELSE 0 END)
        INTO total_clientes, sin_visitas
        FROM clientes;
        
        RAISE NOTICE '👥 CLIENTES: Total=%, Sin visitas=%', total_clientes, sin_visitas;
    END IF;
END $$;

-- Verificar tickets
DO $$
DECLARE
    total_tickets INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tickets') THEN
        SELECT COUNT(*) INTO total_tickets FROM tickets;
        RAISE NOTICE '🎫 TICKETS: Total=%', total_tickets;
    END IF;
END $$;

-- Verificar productos
DO $$
DECLARE
    total_productos INTEGER;
    con_stock INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'productos') THEN
        SELECT 
            COUNT(*),
            SUM(CASE WHEN COALESCE(stock, stock_actual, 0) > 0 THEN 1 ELSE 0 END)
        INTO total_productos, con_stock
        FROM productos;
        
        RAISE NOTICE '📦 PRODUCTOS: Total=%, Con stock=%', total_productos, con_stock;
    END IF;
END $$;

SELECT '🎉 Sistema listo para empezar desde cero!' as estado_final;
