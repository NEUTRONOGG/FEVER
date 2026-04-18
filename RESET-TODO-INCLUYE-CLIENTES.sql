-- =====================================================
-- RESET TOTAL - BORRA TODO INCLUYENDO CLIENTES
-- ⚠️⚠️⚠️ SUPER CUIDADO: BORRA ABSOLUTAMENTE TODO ⚠️⚠️⚠️
-- Solo usar si quieres empezar COMPLETAMENTE de cero
-- =====================================================

BEGIN;

-- =====================================================
-- BORRAR TODA LA DATA OPERATIVA Y CLIENTES
-- =====================================================

TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;
TRUNCATE TABLE reservaciones RESTART IDENTITY CASCADE;
TRUNCATE TABLE cortesias RESTART IDENTITY CASCADE;
TRUNCATE TABLE clientes RESTART IDENTITY CASCADE;

-- Limpiar cortesías activas (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cortesias_activas') THEN
    TRUNCATE TABLE cortesias_activas RESTART IDENTITY CASCADE;
  END IF;
END $$;

-- Limpiar cortesías de socios (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cortesias_socios') THEN
    TRUNCATE TABLE cortesias_socios RESTART IDENTITY CASCADE;
  END IF;
END $$;

-- Limpiar emergencias
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'emergencias') THEN
    TRUNCATE TABLE emergencias RESTART IDENTITY CASCADE;
  END IF;
END $$;

-- Limpiar FeverShop
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevercoins_transacciones') THEN
    TRUNCATE TABLE fevercoins_transacciones RESTART IDENTITY CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevershop_compras') THEN
    TRUNCATE TABLE fevershop_compras RESTART IDENTITY CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevercoins_balance') THEN
    TRUNCATE TABLE fevercoins_balance RESTART IDENTITY CASCADE;
  END IF;
END $$;

-- Resetear mesas
UPDATE mesas SET
  estado = 'disponible',
  cliente_id = NULL,
  cliente_nombre = NULL,
  numero_personas = 0,
  hora_asignacion = NULL,
  hostess_asignada = NULL,
  mesero_asignado = NULL,
  rp_asignado = NULL,
  total_actual = 0,
  pedidos_data = '[]'::jsonb;

-- Resetear límites de RPs
UPDATE rps SET
  shots_usados = 0,
  descuento_botella_usado = 0,
  perlas_negras_usadas = 0,
  bienvenidas_usadas = 0;

-- Resetear límites de socios
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'socios') THEN
    UPDATE socios SET cortesias_usadas_hoy = 0;
  END IF;
END $$;

-- Resetear contador
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contador_personas') THEN
    UPDATE contador_personas SET total = 0;
  END IF;
END $$;

COMMIT;

-- Verificación
SELECT 'tickets' as tabla, COUNT(*) FROM tickets
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'reservaciones', COUNT(*) FROM reservaciones
UNION ALL
SELECT 'cortesias', COUNT(*) FROM cortesias
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'mesas_disponibles', COUNT(*) FROM mesas WHERE estado = 'disponible';

-- =====================================================
-- ⚠️ ESTE SCRIPT BORRÓ:
-- =====================================================
-- ✅ Todos los tickets
-- ✅ Todos los clientes (incluyendo su historial)
-- ✅ Todas las reservaciones
-- ✅ Todas las cortesías
-- ✅ Todos los FeverCoins
-- ✅ Todas las compras de FeverShop
-- ✅ Todas las emergencias
-- ✅ Estado de mesas reseteado
-- ✅ Límites de cortesías reseteados
