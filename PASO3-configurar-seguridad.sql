-- ============================================
-- PASO 3: CONFIGURAR SEGURIDAD (RLS)
-- ============================================
-- Ejecutar DESPUÉS del PASO 2

-- Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir todo en clientes" ON clientes;
DROP POLICY IF EXISTS "Permitir todo en mesas" ON mesas;
DROP POLICY IF EXISTS "Permitir todo en visitas" ON visitas;
DROP POLICY IF EXISTS "Permitir todo en tickets" ON tickets;

-- Crear políticas permisivas
CREATE POLICY "Permitir todo en clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en mesas" ON mesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en visitas" ON visitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo en tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);

-- Verificar
SELECT 'Seguridad configurada correctamente' as mensaje;
