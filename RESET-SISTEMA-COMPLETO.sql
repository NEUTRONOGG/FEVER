-- =====================================================
-- RESET COMPLETO DEL SISTEMA PARA INAUGURACIÓN
-- ⚠️ CUIDADO: Este script BORRA TODA LA DATA
-- Fecha: 2024-11-05
-- =====================================================

-- =====================================================
-- PASO 1: LIMPIAR TODAS LAS TABLAS DE DATOS
-- =====================================================

BEGIN;

-- Limpiar tickets y consumos
TRUNCATE TABLE tickets RESTART IDENTITY CASCADE;

-- Limpiar mesas (resetear a disponible)
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

-- Limpiar reservaciones
TRUNCATE TABLE reservaciones RESTART IDENTITY CASCADE;

-- Limpiar cortesías
TRUNCATE TABLE cortesias RESTART IDENTITY CASCADE;

-- Limpiar cortesías activas (si existe la tabla)
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

-- Resetear límites de RPs (volver a disponibles)
UPDATE rps SET
  shots_usados = 0,
  descuento_botella_usado = 0,
  perlas_negras_usadas = 0,
  bienvenidas_usadas = 0;

-- Resetear límites de socios (si existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'socios') THEN
    UPDATE socios SET cortesias_usadas_hoy = 0;
  END IF;
END $$;

-- Limpiar emergencias
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'emergencias') THEN
    TRUNCATE TABLE emergencias RESTART IDENTITY CASCADE;
  END IF;
END $$;

-- Limpiar FeverShop (transacciones y compras)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevercoins_transacciones') THEN
    TRUNCATE TABLE fevercoins_transacciones RESTART IDENTITY CASCADE;
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'fevershop_compras') THEN
    TRUNCATE TABLE fevershop_compras RESTART IDENTITY CASCADE;
  END IF;
END $$;

-- Resetear contador de personas en entrada
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contador_personas') THEN
    UPDATE contador_personas SET total = 0;
  END IF;
END $$;

COMMIT;

-- =====================================================
-- PASO 2: MANTENER DATOS MAESTROS (NO BORRAR)
-- =====================================================

-- ✅ MANTENER:
-- - clientes (historial de clientes)
-- - productos (menú)
-- - rps (usuarios RP)
-- - hostess (usuarios hostess)
-- - meseros (usuarios meseros)
-- - socios (usuarios socios)
-- - fevershop_productos (catálogo)
-- - fevercoins_balance (saldos de clientes)

-- =====================================================
-- PASO 3: VERIFICACIÓN
-- =====================================================

-- Ver estado de las tablas principales
SELECT 'tickets' as tabla, COUNT(*) as registros FROM tickets
UNION ALL
SELECT 'mesas_ocupadas', COUNT(*) FROM mesas WHERE estado = 'ocupada'
UNION ALL
SELECT 'reservaciones', COUNT(*) FROM reservaciones
UNION ALL
SELECT 'cortesias', COUNT(*) FROM cortesias
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'productos', COUNT(*) FROM productos
UNION ALL
SELECT 'rps', COUNT(*) FROM rps
UNION ALL
SELECT 'hostess', COUNT(*) FROM hostess
UNION ALL
SELECT 'meseros', COUNT(*) FROM meseros;

-- Ver estado de mesas
SELECT 
  estado,
  COUNT(*) as cantidad
FROM mesas
GROUP BY estado
ORDER BY estado;

-- =====================================================
-- RESUMEN DE LO QUE SE BORRÓ
-- =====================================================

/*
✅ DATOS BORRADOS (Operaciones del día):
- Todos los tickets/consumos
- Todas las reservaciones
- Todas las cortesías autorizadas
- Todas las emergencias
- Todas las compras de FeverShop
- Todas las transacciones de FeverCoins
- Estado de todas las mesas (ahora disponibles)
- Contador de personas en entrada

✅ DATOS MANTENIDOS (Información importante):
- Clientes registrados (con su historial)
- Productos del menú
- Usuarios (RPs, Hostess, Meseros, Socios)
- Catálogo de FeverShop
- Saldos de FeverCoins de clientes
- Estructura de mesas

✅ LÍMITES RESETEADOS:
- Cortesías de RPs vuelven a estar disponibles
- Cortesías de Socios vuelven a estar disponibles
*/

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================

/*
🎉 SISTEMA LISTO PARA INAUGURACIÓN

El sistema está completamente limpio y listo para empezar.

PRÓXIMOS PASOS:
1. Verificar que los productos estén cargados
2. Verificar que los usuarios (RPs, Hostess, Meseros) estén activos
3. Verificar que las mesas estén en estado "disponible"
4. Hacer pruebas de:
   - Asignar mesa
   - Registrar pedido
   - Autorizar cortesía
   - Cerrar cuenta

CREDENCIALES DE ACCESO:
- Admin: admin@fever.com / admin123
- RPs: Ver tabla rps (teléfono + contraseña)
- Hostess: hostess@fever.com / hostess123
- Meseros: mesero@fever.com / mesero123
- Socios: 5550000001 / socio2024

¡ÉXITO EN LA INAUGURACIÓN! 🎉🍾
*/
