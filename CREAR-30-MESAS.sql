-- ============================================
-- CREAR 30 MESAS EN SUPABASE
-- ============================================

-- Primero, limpiar mesas existentes
DELETE FROM mesas;

-- Insertar 30 mesas
INSERT INTO mesas (id, numero, capacidad, estado) VALUES
(1, '1', 4, 'disponible'),
(2, '2', 4, 'disponible'),
(3, '3', 4, 'disponible'),
(4, '4', 6, 'disponible'),
(5, '5', 2, 'disponible'),
(6, '6', 6, 'disponible'),
(7, '7', 8, 'disponible'),
(8, '8', 8, 'disponible'),
(9, '9', 2, 'disponible'),
(10, '10', 2, 'disponible'),
(11, '11', 10, 'disponible'),
(12, '12', 10, 'disponible'),
(13, '13', 4, 'disponible'),
(14, '14', 4, 'disponible'),
(15, '15', 4, 'disponible'),
(16, '16', 6, 'disponible'),
(17, '17', 6, 'disponible'),
(18, '18', 8, 'disponible'),
(19, '19', 8, 'disponible'),
(20, '20', 2, 'disponible'),
(21, '21', 2, 'disponible'),
(22, '22', 4, 'disponible'),
(23, '23', 4, 'disponible'),
(24, '24', 6, 'disponible'),
(25, '25', 6, 'disponible'),
(26, '26', 8, 'disponible'),
(27, '27', 8, 'disponible'),
(28, '28', 10, 'disponible'),
(29, '29', 10, 'disponible'),
(30, '30', 12, 'disponible');

-- Verificar
SELECT 
  'Total mesas:' as info,
  COUNT(*) as cantidad
FROM mesas
UNION ALL
SELECT 
  'Disponibles:',
  COUNT(*)
FROM mesas
WHERE estado = 'disponible';

-- Debe mostrar:
-- Total mesas: 30
-- Disponibles: 30

SELECT '✅ 30 mesas creadas correctamente' as resultado;
