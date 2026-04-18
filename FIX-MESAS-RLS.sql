-- Script para verificar y corregir políticas de mesas
-- Ejecuta esto en Supabase SQL Editor

-- 1. Eliminar políticas existentes si hay conflictos
DROP POLICY IF EXISTS "Permitir lectura de mesas" ON mesas;
DROP POLICY IF EXISTS "Permitir actualización de mesas" ON mesas;
DROP POLICY IF EXISTS "Permitir inserción de mesas" ON mesas;

-- 2. Crear políticas correctas
CREATE POLICY "Permitir lectura de mesas" ON mesas
  FOR SELECT USING (true);

CREATE POLICY "Permitir actualización de mesas" ON mesas
  FOR UPDATE USING (true);

CREATE POLICY "Permitir inserción de mesas" ON mesas
  FOR INSERT WITH CHECK (true);

-- 3. Verificar que las mesas existen
SELECT * FROM mesas ORDER BY id;

-- 4. Si no hay mesas, insertarlas
INSERT INTO mesas (id, numero, capacidad, estado) VALUES
  (1, '1', 4, 'disponible'),
  (2, '2', 2, 'disponible'),
  (3, '3', 6, 'disponible'),
  (4, '4', 4, 'disponible'),
  (5, '5', 8, 'disponible'),
  (6, '6', 2, 'disponible'),
  (7, '7', 4, 'disponible'),
  (8, '8', 4, 'disponible'),
  (9, '9', 6, 'disponible'),
  (10, '10', 2, 'disponible'),
  (11, '11', 4, 'disponible'),
  (12, '12', 4, 'disponible')
ON CONFLICT (id) DO UPDATE SET
  estado = 'disponible',
  mesero = NULL,
  clientes_data = '[]'::jsonb,
  pedidos_data = '[]'::jsonb,
  total = 0;

-- 5. Verificar resultado
SELECT id, numero, estado FROM mesas ORDER BY id;
