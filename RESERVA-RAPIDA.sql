-- ============================================
-- RESERVA RÁPIDA - EJECUTAR EN SUPABASE SQL EDITOR
-- ============================================

-- 1. Crear cliente para la reserva
INSERT INTO clientes (
  nombre,
  telefono,
  email,
  genero,
  nivel_fidelidad,
  puntos_rewards,
  activo
) VALUES (
  'María González',
  '+52 555 987 6543',
  'maria.gonzalez@email.com',
  'femenino',
  'oro',
  450,
  true
) ON CONFLICT (telefono) DO NOTHING;

-- 2. Crear la reserva en mesa 5
UPDATE mesas 
SET 
  estado = 'reservada',
  cliente_id = (SELECT id FROM clientes WHERE telefono = '+52 555 987 6543'),
  cliente_nombre = 'María González',
  numero_personas = 4,
  hostess = 'Sistema',
  hora_entrada = NOW() + INTERVAL '2 hours',
  notas = '🎂 Cumpleaños - Mesa preferencial'
WHERE numero = '5';

-- 3. Ver resultado
SELECT 
  numero as "Mesa",
  estado as "Estado",
  cliente_nombre as "Cliente",
  numero_personas as "Personas",
  TO_CHAR(hora_entrada, 'HH24:MI') as "Hora Reserva",
  notas as "Notas"
FROM mesas 
WHERE numero = '5';
