-- ============================================
-- PASO 2: INSERTAR MESAS
-- ============================================
-- Ejecutar DESPUÉS del PASO 1

INSERT INTO mesas (id, numero, capacidad, estado) VALUES
  (1, '1', 4, 'disponible'),
  (2, '2', 4, 'disponible'),
  (3, '3', 4, 'disponible'),
  (4, '4', 6, 'disponible'),
  (5, '5', 6, 'disponible'),
  (6, '6', 6, 'disponible'),
  (7, '7', 8, 'disponible'),
  (8, '8', 8, 'disponible'),
  (9, '9', 2, 'disponible'),
  (10, '10', 2, 'disponible'),
  (11, '11', 10, 'disponible'),
  (12, '12', 10, 'disponible')
ON CONFLICT (id) DO NOTHING;

-- Verificar
SELECT numero, capacidad, estado FROM mesas ORDER BY CAST(numero AS INTEGER);
