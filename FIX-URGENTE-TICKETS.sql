-- ============================================
-- FIX URGENTE - TABLA TICKETS
-- EJECUTAR ESTO AHORA EN SUPABASE
-- ============================================

-- 1. BORRAR TABLA SI EXISTE (para empezar limpio)
DROP TABLE IF EXISTS tickets CASCADE;

-- 2. CREAR TABLA TICKETS CORRECTA
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Cliente
  cliente_id UUID,
  cliente_nombre TEXT,
  
  -- Mesa
  mesa_numero INTEGER,
  
  -- Productos
  items TEXT,
  
  -- Montos
  total DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  propina DECIMAL(10,2) DEFAULT 0,
  
  -- Personal
  mesero TEXT,
  
  -- Pago
  metodo_pago TEXT DEFAULT 'efectivo',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. ÍNDICES
CREATE INDEX idx_tickets_fecha ON tickets(created_at);
CREATE INDEX idx_tickets_cliente ON tickets(cliente_nombre);
CREATE INDEX idx_tickets_mesa ON tickets(mesa_numero);

-- 4. TRIGGER
CREATE OR REPLACE FUNCTION actualizar_timestamp_tickets()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_tickets
BEFORE UPDATE ON tickets
FOR EACH ROW
EXECUTE FUNCTION actualizar_timestamp_tickets();

-- 5. VERIFICAR
SELECT 'Tabla tickets creada correctamente' as resultado;

-- 6. INSERTAR TICKET DE PRUEBA
INSERT INTO tickets (
  cliente_nombre,
  mesa_numero,
  items,
  total,
  subtotal,
  propina,
  mesero,
  metodo_pago
) VALUES (
  'Cliente Prueba',
  1,
  'Producto de prueba x1',
  100.00,
  90.00,
  10.00,
  'Mesero',
  'efectivo'
);

-- 7. VERIFICAR INSERCIÓN
SELECT * FROM tickets ORDER BY created_at DESC LIMIT 1;

-- ============================================
-- SI FUNCIONA, BORRAR EL TICKET DE PRUEBA:
-- DELETE FROM tickets WHERE cliente_nombre = 'Cliente Prueba';
-- ============================================
