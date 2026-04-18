-- ============================================
-- VERIFICAR QUE TODO ESTÁ CORRECTO
-- ============================================

-- 1. Verificar que las tablas existen
SELECT 
  'Tablas existentes:' as verificacion,
  COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('clientes', 'mesas', 'visitas', 'tickets');
-- Debe mostrar: 4

-- 2. Verificar estructura de mesas
SELECT 
  'Estructura de mesas:' as verificacion,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'mesas'
ORDER BY ordinal_position;

-- 3. Verificar que las mesas están disponibles
SELECT 
  'Estado de mesas:' as verificacion,
  numero,
  capacidad,
  estado
FROM mesas
ORDER BY CAST(numero AS INTEGER);

-- Debe mostrar 12 mesas, todas disponibles

-- 4. Verificar políticas RLS
SELECT 
  'Políticas RLS:' as verificacion,
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename IN ('clientes', 'mesas', 'visitas', 'tickets');

-- 5. Verificar que no hay datos de prueba
SELECT 
  'Datos en tablas:' as verificacion,
  'clientes' as tabla,
  COUNT(*) as registros
FROM clientes
UNION ALL
SELECT 'Datos en tablas:', 'visitas', COUNT(*) FROM visitas
UNION ALL
SELECT 'Datos en tablas:', 'tickets', COUNT(*) FROM tickets
UNION ALL
SELECT 'Datos en tablas:', 'mesas ocupadas', COUNT(*) FROM mesas WHERE estado != 'disponible';

-- Todo debe mostrar 0

-- 6. Verificar índices
SELECT 
  'Índices:' as verificacion,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('clientes', 'mesas', 'visitas', 'tickets')
ORDER BY tablename, indexname;

-- 7. Resumen final
SELECT 
  '✅ SISTEMA LISTO PARA PRODUCCIÓN' as estado,
  (SELECT COUNT(*) FROM mesas WHERE estado = 'disponible') as mesas_disponibles,
  (SELECT COUNT(*) FROM clientes) as clientes_registrados,
  (SELECT COUNT(*) FROM visitas) as visitas_totales,
  (SELECT COUNT(*) FROM tickets) as tickets_generados;

-- Resultado esperado:
-- mesas_disponibles: 12
-- clientes_registrados: 0
-- visitas_totales: 0
-- tickets_generados: 0
