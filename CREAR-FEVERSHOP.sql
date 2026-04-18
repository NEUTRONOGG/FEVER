-- ============================================
-- FEVERSHOP - SISTEMA DE TIENDA CON FEVERCOINS
-- ============================================

-- Tabla de FeverCoins (moneda virtual)
CREATE TABLE IF NOT EXISTS fevercoins_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_ganados INTEGER DEFAULT 0,
  total_gastados INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cliente_id)
);

-- Tabla de transacciones de FeverCoins
CREATE TABLE IF NOT EXISTS fevercoins_transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL, -- 'ganado', 'canjeado', 'comprado', 'gastado'
  cantidad INTEGER NOT NULL,
  concepto TEXT NOT NULL,
  puntos_usados INTEGER DEFAULT 0, -- Si se canjearon puntos por coins
  producto_id UUID, -- Si se compró un producto
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos de FeverShop
CREATE TABLE IF NOT EXISTS fevershop_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_fevercoins INTEGER NOT NULL,
  categoria VARCHAR(100) NOT NULL, -- 'bebidas', 'alimentos', 'merchandising', 'experiencias', 'descuentos'
  stock INTEGER DEFAULT 0,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de compras en FeverShop
CREATE TABLE IF NOT EXISTS fevershop_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES fevershop_productos(id) ON DELETE SET NULL,
  producto_nombre VARCHAR(255) NOT NULL,
  precio_fevercoins INTEGER NOT NULL,
  cantidad INTEGER DEFAULT 1,
  total_fevercoins INTEGER NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'entregado', 'cancelado'
  canjeado BOOLEAN DEFAULT false,
  fecha_canje TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_fevercoins_balance_cliente ON fevercoins_balance(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fevercoins_transacciones_cliente ON fevercoins_transacciones(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fevercoins_transacciones_fecha ON fevercoins_transacciones(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fevershop_productos_categoria ON fevershop_productos(categoria);
CREATE INDEX IF NOT EXISTS idx_fevershop_productos_activo ON fevershop_productos(activo);
CREATE INDEX IF NOT EXISTS idx_fevershop_compras_cliente ON fevershop_compras(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fevershop_compras_estado ON fevershop_compras(estado);

-- ============================================
-- INSERTAR PRODUCTOS INICIALES DE FEVERSHOP
-- ============================================

INSERT INTO fevershop_productos (nombre, descripcion, precio_fevercoins, categoria, stock, activo, destacado) VALUES
-- BEBIDAS
('Cerveza Premium', 'Cerveza artesanal de la casa', 150, 'bebidas', 100, true, true),
('Coctel Signature', 'Coctel especial del bartender', 200, 'bebidas', 50, true, true),
('Shot de Tequila', 'Shot de tequila premium', 80, 'bebidas', 200, true, false),
('Botella de Vino', 'Vino tinto reserva', 500, 'bebidas', 30, true, true),
('Refresco Premium', 'Refresco artesanal', 50, 'bebidas', 150, true, false),

-- ALIMENTOS
('Hamburguesa Fever', 'Hamburguesa especial de la casa', 250, 'alimentos', 50, true, true),
('Alitas Picantes', 'Orden de alitas con salsa especial', 180, 'alimentos', 80, true, false),
('Nachos Supreme', 'Nachos con todos los toppings', 150, 'alimentos', 100, true, false),
('Pizza Personal', 'Pizza individual de pepperoni', 200, 'alimentos', 60, true, false),
('Papas Fever', 'Papas fritas con salsa especial', 100, 'alimentos', 120, true, false),

-- MERCHANDISING
('Playera Fever', 'Playera oficial del club', 800, 'merchandising', 50, true, true),
('Gorra Fever', 'Gorra bordada con logo', 500, 'merchandising', 40, true, false),
('Vaso Térmico', 'Vaso térmico con logo Fever', 400, 'merchandising', 30, true, false),
('Llavero Fever', 'Llavero metálico premium', 150, 'merchandising', 100, true, false),
('Sudadera Fever', 'Sudadera con capucha', 1200, 'merchandising', 25, true, true),

-- EXPERIENCIAS
('Mesa VIP 1 Noche', 'Mesa VIP para 4 personas', 2000, 'experiencias', 10, true, true),
('Meet & Greet DJ', 'Conoce al DJ de la noche', 1500, 'experiencias', 5, true, true),
('Botella Sparklers', 'Botella con sparklers y show', 3000, 'experiencias', 8, true, true),
('Entrada Fast Pass', 'Entrada sin fila por 1 mes', 1000, 'experiencias', 20, true, false),
('Cumpleaños VIP', 'Paquete cumpleaños con decoración', 2500, 'experiencias', 5, true, true),

-- DESCUENTOS
('10% Descuento', 'Cupón 10% en tu próxima visita', 300, 'descuentos', 999, true, false),
('20% Descuento', 'Cupón 20% en tu próxima visita', 600, 'descuentos', 999, true, true),
('Entrada Gratis', 'Entrada gratis para ti y un amigo', 400, 'descuentos', 999, true, true),
('2x1 en Bebidas', 'Cupón 2x1 en bebidas seleccionadas', 350, 'descuentos', 999, true, false),
('Cover Gratis', 'Cover gratis por 1 mes', 800, 'descuentos', 999, true, true);

-- ============================================
-- CREAR 3 USUARIOS DE PRUEBA CON FEVERCOINS
-- ============================================

-- Usuario 1: Carlos Méndez (Cliente VIP con muchos coins)
INSERT INTO clientes (nombre, telefono, email, fecha_nacimiento, nivel_fidelidad, puntos_rewards, total_visitas, activo)
VALUES ('Carlos Méndez', '5551234567', 'carlos.mendez@fever.com', '1990-05-15', 'platino', 5000, 25, true)
ON CONFLICT (telefono) DO UPDATE SET
  puntos_rewards = 5000,
  nivel_fidelidad = 'platino',
  total_visitas = 25;

-- Usuario 2: Ana García (Cliente frecuente)
INSERT INTO clientes (nombre, telefono, email, fecha_nacimiento, nivel_fidelidad, puntos_rewards, total_visitas, activo)
VALUES ('Ana García', '5559876543', 'ana.garcia@fever.com', '1995-08-22', 'oro', 3000, 15, true)
ON CONFLICT (telefono) DO UPDATE SET
  puntos_rewards = 3000,
  nivel_fidelidad = 'oro',
  total_visitas = 15;

-- Usuario 3: Roberto Silva (Cliente nuevo con potencial)
INSERT INTO clientes (nombre, telefono, email, fecha_nacimiento, nivel_fidelidad, puntos_rewards, total_visitas, activo)
VALUES ('Roberto Silva', '5552468135', 'roberto.silva@fever.com', '1988-12-10', 'plata', 1500, 8, true)
ON CONFLICT (telefono) DO UPDATE SET
  puntos_rewards = 1500,
  nivel_fidelidad = 'plata',
  total_visitas = 8;

-- Asignar FeverCoins iniciales a los usuarios de prueba
-- Carlos Méndez: 2500 FeverCoins (cliente VIP)
INSERT INTO fevercoins_balance (cliente_id, balance, total_ganados)
SELECT id, 2500, 2500 FROM clientes WHERE telefono = '5551234567'
ON CONFLICT (cliente_id) DO UPDATE SET
  balance = 2500,
  total_ganados = 2500;

-- Ana García: 1500 FeverCoins
INSERT INTO fevercoins_balance (cliente_id, balance, total_ganados)
SELECT id, 1500, 1500 FROM clientes WHERE telefono = '5559876543'
ON CONFLICT (cliente_id) DO UPDATE SET
  balance = 1500,
  total_ganados = 1500;

-- Roberto Silva: 750 FeverCoins
INSERT INTO fevercoins_balance (cliente_id, balance, total_ganados)
SELECT id, 750, 750 FROM clientes WHERE telefono = '5552468135'
ON CONFLICT (cliente_id) DO UPDATE SET
  balance = 750,
  total_ganados = 750;

-- Registrar transacciones iniciales
INSERT INTO fevercoins_transacciones (cliente_id, tipo, cantidad, concepto)
SELECT id, 'ganado', 2500, 'FeverCoins de bienvenida - Cliente VIP' FROM clientes WHERE telefono = '5551234567';

INSERT INTO fevercoins_transacciones (cliente_id, tipo, cantidad, concepto)
SELECT id, 'ganado', 1500, 'FeverCoins de bienvenida - Cliente Frecuente' FROM clientes WHERE telefono = '5559876543';

INSERT INTO fevercoins_transacciones (cliente_id, tipo, cantidad, concepto)
SELECT id, 'ganado', 750, 'FeverCoins de bienvenida - Cliente Nuevo' FROM clientes WHERE telefono = '5552468135';

-- ============================================
-- FUNCIÓN PARA CANJEAR PUNTOS POR FEVERCOINS
-- ============================================
-- Tasa de conversión: 100 puntos = 50 FeverCoins

CREATE OR REPLACE FUNCTION canjear_puntos_por_fevercoins(
  p_cliente_id UUID,
  p_puntos INTEGER
) RETURNS JSON AS $$
DECLARE
  v_fevercoins INTEGER;
  v_puntos_actuales INTEGER;
  v_result JSON;
BEGIN
  -- Calcular FeverCoins (100 puntos = 50 FeverCoins)
  v_fevercoins := (p_puntos / 100) * 50;
  
  -- Verificar puntos disponibles
  SELECT puntos_rewards INTO v_puntos_actuales
  FROM clientes
  WHERE id = p_cliente_id;
  
  IF v_puntos_actuales < p_puntos THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Puntos insuficientes'
    );
  END IF;
  
  -- Descontar puntos
  UPDATE clientes
  SET puntos_rewards = puntos_rewards - p_puntos
  WHERE id = p_cliente_id;
  
  -- Agregar FeverCoins
  INSERT INTO fevercoins_balance (cliente_id, balance, total_ganados)
  VALUES (p_cliente_id, v_fevercoins, v_fevercoins)
  ON CONFLICT (cliente_id) DO UPDATE SET
    balance = fevercoins_balance.balance + v_fevercoins,
    total_ganados = fevercoins_balance.total_ganados + v_fevercoins,
    updated_at = NOW();
  
  -- Registrar transacción
  INSERT INTO fevercoins_transacciones (cliente_id, tipo, cantidad, concepto, puntos_usados)
  VALUES (p_cliente_id, 'canjeado', v_fevercoins, 
          format('Canjeados %s puntos por %s FeverCoins', p_puntos, v_fevercoins),
          p_puntos);
  
  RETURN json_build_object(
    'success', true,
    'fevercoins_obtenidos', v_fevercoins,
    'puntos_usados', p_puntos,
    'message', format('¡Canjeaste %s puntos por %s FeverCoins!', p_puntos, v_fevercoins)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN PARA COMPRAR PRODUCTO EN FEVERSHOP
-- ============================================

CREATE OR REPLACE FUNCTION comprar_producto_fevershop(
  p_cliente_id UUID,
  p_producto_id UUID,
  p_cantidad INTEGER DEFAULT 1
) RETURNS JSON AS $$
DECLARE
  v_producto RECORD;
  v_balance INTEGER;
  v_total_coins INTEGER;
  v_compra_id UUID;
BEGIN
  -- Obtener producto
  SELECT * INTO v_producto
  FROM fevershop_productos
  WHERE id = p_producto_id AND activo = true;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Producto no disponible');
  END IF;
  
  -- Calcular total
  v_total_coins := v_producto.precio_fevercoins * p_cantidad;
  
  -- Verificar balance
  SELECT balance INTO v_balance
  FROM fevercoins_balance
  WHERE cliente_id = p_cliente_id;
  
  IF v_balance IS NULL OR v_balance < v_total_coins THEN
    RETURN json_build_object('success', false, 'message', 'FeverCoins insuficientes');
  END IF;
  
  -- Verificar stock
  IF v_producto.stock < p_cantidad THEN
    RETURN json_build_object('success', false, 'message', 'Stock insuficiente');
  END IF;
  
  -- Descontar FeverCoins
  UPDATE fevercoins_balance
  SET balance = balance - v_total_coins,
      total_gastados = total_gastados + v_total_coins,
      updated_at = NOW()
  WHERE cliente_id = p_cliente_id;
  
  -- Descontar stock
  UPDATE fevershop_productos
  SET stock = stock - p_cantidad,
      updated_at = NOW()
  WHERE id = p_producto_id;
  
  -- Crear compra
  INSERT INTO fevershop_compras (
    cliente_id, producto_id, producto_nombre, 
    precio_fevercoins, cantidad, total_fevercoins
  ) VALUES (
    p_cliente_id, p_producto_id, v_producto.nombre,
    v_producto.precio_fevercoins, p_cantidad, v_total_coins
  ) RETURNING id INTO v_compra_id;
  
  -- Registrar transacción
  INSERT INTO fevercoins_transacciones (
    cliente_id, tipo, cantidad, concepto, producto_id
  ) VALUES (
    p_cliente_id, 'gastado', v_total_coins,
    format('Compra: %s x%s', v_producto.nombre, p_cantidad),
    p_producto_id
  );
  
  RETURN json_build_object(
    'success', true,
    'compra_id', v_compra_id,
    'producto', v_producto.nombre,
    'total_coins', v_total_coins,
    'balance_restante', v_balance - v_total_coins,
    'message', format('¡Compraste %s x%s!', v_producto.nombre, p_cantidad)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VISTA PARA DASHBOARD DE FEVERSHOP
-- ============================================

CREATE OR REPLACE VIEW vista_fevershop_stats AS
SELECT
  COUNT(DISTINCT fc.cliente_id) as total_clientes_activos,
  COALESCE(SUM(fc.balance), 0) as total_fevercoins_circulacion,
  COALESCE(SUM(fc.total_ganados), 0) as total_fevercoins_emitidos,
  COALESCE(SUM(fc.total_gastados), 0) as total_fevercoins_gastados,
  COUNT(DISTINCT CASE WHEN fsc.created_at >= CURRENT_DATE THEN fsc.id END) as compras_hoy,
  COALESCE(SUM(CASE WHEN fsc.created_at >= CURRENT_DATE THEN fsc.total_fevercoins END), 0) as coins_gastados_hoy
FROM fevercoins_balance fc
LEFT JOIN fevershop_compras fsc ON fc.cliente_id = fsc.cliente_id;

COMMENT ON TABLE fevercoins_balance IS 'Balance de FeverCoins por cliente';
COMMENT ON TABLE fevercoins_transacciones IS 'Historial de transacciones de FeverCoins';
COMMENT ON TABLE fevershop_productos IS 'Catálogo de productos de FeverShop';
COMMENT ON TABLE fevershop_compras IS 'Compras realizadas en FeverShop';

-- ============================================
-- PERMISOS
-- ============================================

-- Asegurar que las tablas sean accesibles
ALTER TABLE fevercoins_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fevercoins_transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE fevershop_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fevershop_compras ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (ajustar según necesidades de seguridad)
CREATE POLICY "Enable read access for all users" ON fevercoins_balance FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON fevercoins_transacciones FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON fevershop_productos FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON fevershop_compras FOR SELECT USING (true);

SELECT 'FeverShop instalado correctamente! ✅' as status;
