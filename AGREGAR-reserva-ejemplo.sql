-- ============================================
-- AGREGAR RESERVA DE EJEMPLO
-- ============================================
-- Este script crea una reserva de ejemplo para probar el sistema

-- 1. Primero, asegurarnos de que existe un cliente
INSERT INTO clientes (
  nombre,
  telefono,
  email,
  genero,
  fecha_nacimiento,
  nivel_fidelidad,
  puntos_rewards,
  activo
) VALUES (
  'María González',
  '+52 555 987 6543',
  'maria.gonzalez@email.com',
  'femenino',
  '1992-05-15',
  'oro',
  450,
  true
) ON CONFLICT (telefono) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email;

-- 2. Obtener el ID del cliente (o usar uno existente)
-- Para este ejemplo, usaremos el cliente que acabamos de crear

-- 3. Crear una mesa reservada
UPDATE mesas 
SET 
  estado = 'reservada',
  cliente_id = (SELECT id FROM clientes WHERE telefono = '+52 555 987 6543'),
  cliente_nombre = 'María González',
  numero_personas = 4,
  hostess = 'Sistema',
  hora_entrada = NOW() + INTERVAL '2 hours',  -- Reserva para dentro de 2 horas
  notas = 'Reserva para celebración de cumpleaños. Mesa preferencial cerca de la ventana.'
WHERE numero = '5'  -- Mesa 5
  AND estado = 'disponible';

-- 4. Crear una visita programada
INSERT INTO visitas (
  cliente_id,
  mesa_numero,
  numero_personas,
  hostess,
  hora_entrada,
  estado,
  notas
) VALUES (
  (SELECT id FROM clientes WHERE telefono = '+52 555 987 6543'),
  '5',
  4,
  'Sistema',
  NOW() + INTERVAL '2 hours',
  'reservada',
  'Reserva para celebración de cumpleaños. Mesa preferencial cerca de la ventana.'
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver la mesa reservada
SELECT 
  numero,
  estado,
  cliente_nombre,
  numero_personas,
  hora_entrada,
  notas
FROM mesas 
WHERE estado = 'reservada';

-- Ver el cliente
SELECT 
  nombre,
  telefono,
  email,
  nivel_fidelidad,
  puntos_rewards
FROM clientes 
WHERE telefono = '+52 555 987 6543';

-- Ver la visita
SELECT 
  v.id,
  c.nombre as cliente,
  v.mesa_numero,
  v.numero_personas,
  v.hora_entrada,
  v.estado,
  v.notas
FROM visitas v
JOIN clientes c ON v.cliente_id = c.id
WHERE v.estado = 'reservada'
ORDER BY v.hora_entrada DESC
LIMIT 5;

-- ============================================
-- NOTAS
-- ============================================
/*
Esta reserva de ejemplo:
- Cliente: María González
- Mesa: 5
- Personas: 4
- Hora: Dentro de 2 horas desde ahora
- Motivo: Celebración de cumpleaños
- Estado: Reservada

Para ver la reserva en el CRM:
1. Ve al Dashboard
2. La mesa 5 debe aparecer con estado "Reservada"
3. Debe mostrar el nombre del cliente
4. Debe mostrar la hora de la reserva

Para liberar la reserva (si necesitas):
UPDATE mesas SET 
  estado = 'disponible',
  cliente_id = NULL,
  cliente_nombre = NULL,
  numero_personas = NULL,
  hora_entrada = NULL,
  notas = NULL
WHERE numero = '5';
*/
