-- ============================================
-- PASO 1: LIMPIAR TODO
-- Ejecutar PRIMERO este script
-- ============================================

DROP TABLE IF EXISTS fila_espera CASCADE;
DROP TABLE IF EXISTS rachas CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS calificaciones_hostess CASCADE;
DROP TABLE IF EXISTS mesas_clientes CASCADE;
DROP TABLE IF EXISTS visitas CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;

DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
DROP TRIGGER IF EXISTS update_mesas_updated_at ON mesas_clientes;
DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
DROP TRIGGER IF EXISTS trigger_actualizar_metricas ON visitas;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS actualizar_metricas_cliente() CASCADE;
DROP FUNCTION IF EXISTS calcular_racha_consecutiva(UUID) CASCADE;

DROP VIEW IF EXISTS vista_clientes_activos CASCADE;
DROP VIEW IF EXISTS vista_top_clientes CASCADE;
DROP VIEW IF EXISTS vista_metricas_genero CASCADE;

DROP POLICY IF EXISTS "Permitir todo en clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir todo en visitas" ON visitas;
DROP POLICY IF EXISTS "Permitir todo en mesas" ON mesas_clientes;
DROP POLICY IF EXISTS "Permitir todo en calificaciones" ON calificaciones_hostess;
DROP POLICY IF EXISTS "Permitir todo en tickets" ON tickets;
DROP POLICY IF EXISTS "Permitir todo en rewards" ON rewards;
DROP POLICY IF EXISTS "Permitir todo en rachas" ON rachas;
DROP POLICY IF EXISTS "Permitir todo en fila" ON fila_espera;
DROP POLICY IF EXISTS "Permitir todo en productos" ON productos;
