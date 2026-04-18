-- ============================================
-- LIMPIAR TODA LA DATA DE PRUEBA
-- ============================================
-- ⚠️ ADVERTENCIA: Esto borrará TODOS los datos
-- Ejecutar SOLO si quieres empezar de cero

-- 1. Limpiar todas las tablas (en orden por dependencias)
TRUNCATE TABLE tickets CASCADE;
TRUNCATE TABLE visitas CASCADE;
TRUNCATE TABLE clientes CASCADE;

-- 2. Resetear mesas a estado inicial
UPDATE mesas SET
  estado = 'disponible',
  cliente_id = NULL,
  cliente_nombre = NULL,
  numero_personas = NULL,
  hostess = NULL,
  mesero = NULL,
  hora_entrada = NULL,
  hora_salida = NULL,
  pedidos_data = '[]'::jsonb,
  total_actual = 0,
  notas = NULL,
  updated_at = NOW();

-- 3. Verificar que todo está limpio
SELECT 'Clientes:' as tabla, COUNT(*) as registros FROM clientes
UNION ALL
SELECT 'Visitas:', COUNT(*) FROM visitas
UNION ALL
SELECT 'Tickets:', COUNT(*) FROM tickets
UNION ALL
SELECT 'Mesas disponibles:', COUNT(*) FROM mesas WHERE estado = 'disponible'
UNION ALL
SELECT 'Mesas ocupadas:', COUNT(*) FROM mesas WHERE estado = 'ocupada'
UNION ALL
SELECT 'Mesas reservadas:', COUNT(*) FROM mesas WHERE estado = 'reservada';

-- Resultado esperado:
-- Clientes: 0
-- Visitas: 0
-- Tickets: 0
-- Mesas disponibles: 12
-- Mesas ocupadas: 0
-- Mesas reservadas: 0

SELECT '✅ Base de datos limpia y lista para producción' as mensaje;
