-- =====================================================
-- ELIMINAR TODOS LOS DATOS MOCK/PRUEBA
-- =====================================================
-- Este script elimina ABSOLUTAMENTE TODO:
-- - Clientes de prueba
-- - Productos de prueba
-- - RPs de prueba
-- - Socios de prueba
-- - Meseros de prueba
-- - Hostess de prueba
-- - Todas las transacciones
-- Sistema 100% LIMPIO para producción

-- =====================================================
-- 1. ELIMINAR TODAS LAS TRANSACCIONES
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '🗑️ Eliminando transacciones...';
    
    -- Tickets y ventas
    DELETE FROM tickets WHERE TRUE;
    DELETE FROM ventas WHERE TRUE;
    DELETE FROM visitas WHERE TRUE;
    
    -- Cortesías
    DELETE FROM cortesias_autorizadas WHERE TRUE;
    DELETE FROM cortesias WHERE TRUE;
    DELETE FROM cortesias_activas WHERE TRUE;
    DELETE FROM cortesias_socios WHERE TRUE;
    
    -- FeverCoins
    DELETE FROM fevercoins_transacciones WHERE TRUE;
    DELETE FROM fevercoins_balance WHERE TRUE;
    
    -- FeverShop
    DELETE FROM fevershop_canjes WHERE TRUE;
    
    -- Calificaciones
    DELETE FROM calificaciones_hostess WHERE TRUE;
    DELETE FROM calificaciones_clientes WHERE TRUE;
    
    -- Reservaciones
    DELETE FROM reservaciones WHERE TRUE;
    
    -- Historial
    DELETE FROM historial_acceso WHERE TRUE;
    
    -- Encuestas
    DELETE FROM encuestas WHERE TRUE;
    
    -- Rewards y Rachas
    DELETE FROM rewards WHERE TRUE;
    DELETE FROM rachas WHERE TRUE;
    
    -- Fila de espera
    DELETE FROM fila_espera WHERE TRUE;
    
    RAISE NOTICE '✅ Transacciones eliminadas';
END $$;

-- =====================================================
-- 2. ELIMINAR TODOS LOS CLIENTES DE PRUEBA
-- =====================================================

DO $$ 
DECLARE
    clientes_eliminados INTEGER;
BEGIN
    RAISE NOTICE '🗑️ Eliminando clientes de prueba...';
    
    SELECT COUNT(*) INTO clientes_eliminados FROM clientes;
    DELETE FROM clientes WHERE TRUE;
    
    RAISE NOTICE '✅ % clientes eliminados', clientes_eliminados;
END $$;

-- =====================================================
-- 3. ELIMINAR TODOS LOS PRODUCTOS DE PRUEBA
-- =====================================================

DO $$ 
DECLARE
    productos_eliminados INTEGER;
BEGIN
    RAISE NOTICE '🗑️ Eliminando productos de prueba...';
    
    SELECT COUNT(*) INTO productos_eliminados FROM productos;
    DELETE FROM productos WHERE TRUE;
    
    RAISE NOTICE '✅ % productos eliminados', productos_eliminados;
END $$;

-- =====================================================
-- 4. ELIMINAR TODOS LOS RPs DE PRUEBA
-- =====================================================

DO $$ 
DECLARE
    rps_eliminados INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'limites_cortesias_rp') THEN
        RAISE NOTICE '🗑️ Eliminando RPs de prueba...';
        
        SELECT COUNT(*) INTO rps_eliminados FROM limites_cortesias_rp;
        DELETE FROM limites_cortesias_rp WHERE TRUE;
        
        RAISE NOTICE '✅ % RPs eliminados', rps_eliminados;
    END IF;
END $$;

-- =====================================================
-- 5. ELIMINAR TODOS LOS SOCIOS DE PRUEBA
-- =====================================================

DO $$ 
DECLARE
    socios_eliminados INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'socios') THEN
        RAISE NOTICE '🗑️ Eliminando socios de prueba...';
        
        SELECT COUNT(*) INTO socios_eliminados FROM socios;
        DELETE FROM socios WHERE TRUE;
        
        RAISE NOTICE '✅ % socios eliminados', socios_eliminados;
    END IF;
END $$;

-- =====================================================
-- 6. ELIMINAR TODOS LOS MESEROS DE PRUEBA
-- =====================================================

DO $$ 
DECLARE
    meseros_eliminados INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'meseros') THEN
        RAISE NOTICE '🗑️ Eliminando meseros de prueba...';
        
        SELECT COUNT(*) INTO meseros_eliminados FROM meseros;
        DELETE FROM meseros WHERE TRUE;
        
        RAISE NOTICE '✅ % meseros eliminados', meseros_eliminados;
    END IF;
END $$;

-- =====================================================
-- 7. ELIMINAR TODAS LAS HOSTESS DE PRUEBA
-- =====================================================

DO $$ 
DECLARE
    hostess_eliminadas INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hostess') THEN
        RAISE NOTICE '🗑️ Eliminando hostess de prueba...';
        
        SELECT COUNT(*) INTO hostess_eliminadas FROM hostess;
        DELETE FROM hostess WHERE TRUE;
        
        RAISE NOTICE '✅ % hostess eliminadas', hostess_eliminadas;
    END IF;
END $$;

-- =====================================================
-- 8. RESETEAR MESAS A ESTADO INICIAL
-- =====================================================

DO $$ 
BEGIN
    RAISE NOTICE '🔄 Reseteando mesas...';
    
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
      
    RAISE NOTICE '✅ Mesas reseteadas';
END $$;

-- =====================================================
-- 9. VERIFICACIÓN FINAL
-- =====================================================

SELECT '🎉 SISTEMA COMPLETAMENTE LIMPIO - SIN DATOS MOCK' as mensaje;
SELECT '📅 ' || NOW() as fecha_limpieza;

-- Verificar que TODO esté en 0
DO $$
DECLARE
    v_clientes INTEGER;
    v_productos INTEGER;
    v_tickets INTEGER;
    v_rps INTEGER := 0;
    v_socios INTEGER := 0;
    v_meseros INTEGER := 0;
    v_hostess INTEGER := 0;
    v_mesas_disponibles INTEGER;
    v_mesas_total INTEGER;
BEGIN
    -- Contar registros
    SELECT COUNT(*) INTO v_clientes FROM clientes;
    SELECT COUNT(*) INTO v_productos FROM productos;
    SELECT COUNT(*) INTO v_tickets FROM tickets;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'limites_cortesias_rp') THEN
        SELECT COUNT(*) INTO v_rps FROM limites_cortesias_rp;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'socios') THEN
        SELECT COUNT(*) INTO v_socios FROM socios;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'meseros') THEN
        SELECT COUNT(*) INTO v_meseros FROM meseros;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'hostess') THEN
        SELECT COUNT(*) INTO v_hostess FROM hostess;
    END IF;
    
    SELECT 
        COUNT(*),
        SUM(CASE WHEN estado = 'disponible' THEN 1 ELSE 0 END)
    INTO v_mesas_total, v_mesas_disponibles
    FROM mesas;
    
    -- Mostrar resumen
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '           RESUMEN FINAL';
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '👥 Clientes:           %', v_clientes;
    RAISE NOTICE '📦 Productos:          %', v_productos;
    RAISE NOTICE '🎫 Tickets:            %', v_tickets;
    RAISE NOTICE '👑 RPs:                %', v_rps;
    RAISE NOTICE '💎 Socios:             %', v_socios;
    RAISE NOTICE '🍽️  Meseros:            %', v_meseros;
    RAISE NOTICE '🎀 Hostess:            %', v_hostess;
    RAISE NOTICE '🪑 Mesas disponibles:  % de %', v_mesas_disponibles, v_mesas_total;
    RAISE NOTICE '═══════════════════════════════════════';
    RAISE NOTICE '';
    
    IF v_clientes = 0 AND v_productos = 0 AND v_tickets = 0 AND 
       v_rps = 0 AND v_socios = 0 AND v_meseros = 0 AND v_hostess = 0 THEN
        RAISE NOTICE '✅ PERFECTO: Sistema 100%% limpio';
        RAISE NOTICE '🚀 Listo para agregar datos reales de producción';
    ELSE
        RAISE NOTICE '⚠️  ADVERTENCIA: Aún hay algunos datos';
    END IF;
END $$;

-- =====================================================
-- 10. INSTRUCCIONES SIGUIENTES
-- =====================================================

SELECT '📝 SIGUIENTES PASOS:' as titulo;
SELECT '1. Agregar productos reales del menú' as paso_1;
SELECT '2. Crear cuentas de RPs reales' as paso_2;
SELECT '3. Crear cuentas de Socios reales' as paso_3;
SELECT '4. Crear cuentas de Meseros reales' as paso_4;
SELECT '5. Crear cuentas de Hostess reales' as paso_5;
SELECT '6. Sistema listo para operar!' as paso_6;
