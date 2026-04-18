-- ============================================
-- FIX: Agregar estado RESERVADA a mesas
-- ============================================

-- 1. Verificar estados actuales
SELECT DISTINCT estado FROM mesas;

-- 2. Las mesas pueden tener estos estados:
-- 'disponible' - Mesa libre
-- 'reservada' - Mesa con reservación pendiente
-- 'ocupada' - Mesa con cliente sentado

-- 3. Agregar columna para guardar ID de reservación
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS reservacion_id UUID;

-- 4. Crear índice
CREATE INDEX IF NOT EXISTS idx_mesas_reservacion_id ON mesas(reservacion_id);

-- ✅ Listo! Ahora las mesas pueden tener estado 'reservada'
