-- =====================================================
-- INSTALACION COMPLETA - CRM FEVER RESTAURANTE
-- Ejecutar este script COMPLETO en Supabase SQL Editor
-- de tu NUEVO proyecto para crear un duplicado exacto
-- =====================================================
-- ORDEN DE EJECUCIÓN:
-- 1. Tablas base (clientes, visitas, mesas, tickets, etc.)
-- 2. Tabla mesas (sistema principal)
-- 3. Tabla meseros y hostess
-- 4. Tabla reservaciones
-- 5. Tabla cortesias y límites por RP
-- 6. Tabla socios premium
-- 7. FeverShop y FeverCoins
-- 8. Tabla emergencias
-- 9. Productos (menú completo 119 items)
-- 10. Funciones y vistas
-- 11. Permisos RLS
-- =====================================================

-- =====================================================
-- PASO 0: LIMPIAR (si es base de datos nueva, esto no hace nada)
-- =====================================================

DROP TABLE IF EXISTS fevershop_compras CASCADE;
DROP TABLE IF EXISTS fevercoins_transacciones CASCADE;
DROP TABLE IF EXISTS fevercoins_balance CASCADE;
DROP TABLE IF EXISTS fevershop_productos CASCADE;
DROP TABLE IF EXISTS cortesias_socios CASCADE;
DROP TABLE IF EXISTS socios CASCADE;
DROP TABLE IF EXISTS cortesias CASCADE;
DROP TABLE IF EXISTS limites_cortesias_rp CASCADE;
DROP TABLE IF EXISTS emergencias CASCADE;
DROP TABLE IF EXISTS reservaciones CASCADE;
DROP TABLE IF EXISTS hostess CASCADE;
DROP TABLE IF EXISTS meseros CASCADE;
DROP TABLE IF EXISTS fila_espera CASCADE;
DROP TABLE IF EXISTS rachas CASCADE;
DROP TABLE IF EXISTS rewards CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS calificaciones_hostess CASCADE;
DROP TABLE IF EXISTS visitas CASCADE;
DROP TABLE IF EXISTS mesas CASCADE;
DROP TABLE IF EXISTS mesas_clientes CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

DROP VIEW IF EXISTS vista_stats_socios CASCADE;
DROP VIEW IF EXISTS vista_metricas_rps CASCADE;
DROP VIEW IF EXISTS vista_conversion_rps CASCADE;
DROP VIEW IF EXISTS vista_consumo_mesas CASCADE;
DROP VIEW IF EXISTS vista_historial_cliente CASCADE;
DROP VIEW IF EXISTS vista_mesas_rp_periodo CASCADE;
DROP VIEW IF EXISTS vista_clientes_activos CASCADE;
DROP VIEW IF EXISTS vista_top_clientes CASCADE;
DROP VIEW IF EXISTS vista_metricas_genero CASCADE;
DROP VIEW IF EXISTS vista_productos_disponibles CASCADE;
DROP VIEW IF EXISTS vista_resumen_inventario CASCADE;
DROP VIEW IF EXISTS vista_fevershop_stats CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS actualizar_metricas_cliente() CASCADE;
DROP FUNCTION IF EXISTS calcular_racha_consecutiva(UUID) CASCADE;
DROP FUNCTION IF EXISTS actualizar_timestamp_reservaciones() CASCADE;
DROP FUNCTION IF EXISTS verificar_limite_cortesia(TEXT,TEXT,INTEGER) CASCADE;
DROP FUNCTION IF EXISTS actualizar_limite_cortesia() CASCADE;
DROP FUNCTION IF EXISTS autorizar_cortesia_socio(INTEGER,VARCHAR,INTEGER,UUID,INTEGER,DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS resetear_cortesias_socios_diarias() CASCADE;
DROP FUNCTION IF EXISTS canjear_puntos_por_fevercoins(UUID,INTEGER) CASCADE;
DROP FUNCTION IF EXISTS comprar_producto_fevershop(UUID,UUID,INTEGER) CASCADE;
DROP FUNCTION IF EXISTS registrar_venta_producto(BIGINT,INTEGER) CASCADE;
DROP FUNCTION IF EXISTS reabastecer_producto(BIGINT,INTEGER,DECIMAL) CASCADE;
DROP FUNCTION IF EXISTS buscar_productos(TEXT,TEXT,DECIMAL,DECIMAL,BOOLEAN) CASCADE;
DROP FUNCTION IF EXISTS productos_stock_bajo() CASCADE;
DROP FUNCTION IF EXISTS top_productos_vendidos(DATE,DATE,INTEGER) CASCADE;
DROP FUNCTION IF EXISTS stats_ventas_por_categoria(DATE,DATE) CASCADE;
DROP FUNCTION IF EXISTS analisis_rentabilidad(DATE,DATE) CASCADE;
DROP FUNCTION IF EXISTS actualizar_precio_producto(BIGINT,DECIMAL,TEXT) CASCADE;
DROP FUNCTION IF EXISTS actualizar_timestamp() CASCADE;
DROP FUNCTION IF EXISTS calcular_bono_rp(VARCHAR) CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- =====================================================
-- PASO 1: TABLA CLIENTES
-- =====================================================

CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  apellido TEXT,
  telefono TEXT UNIQUE,
  email TEXT,
  genero TEXT CHECK (genero IN ('masculino', 'femenino', 'otro', 'no_especifica')),
  fecha_nacimiento DATE,
  foto_url TEXT,
  total_visitas INTEGER DEFAULT 0,
  visitas_consecutivas INTEGER DEFAULT 0,
  ultima_visita TIMESTAMP WITH TIME ZONE,
  primera_visita TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  consumo_total DECIMAL(10,2) DEFAULT 0,
  consumo_promedio DECIMAL(10,2) DEFAULT 0,
  ticket_mas_alto DECIMAL(10,2) DEFAULT 0,
  calificacion_promedio DECIMAL(3,2) DEFAULT 0,
  producto_favorito TEXT,
  horario_preferido TEXT,
  puntos_rewards INTEGER DEFAULT 0,
  nivel_fidelidad TEXT DEFAULT 'bronce' CHECK (nivel_fidelidad IN ('bronce', 'plata', 'oro', 'platino', 'diamante')),
  qr_wallet_id TEXT UNIQUE,
  activo BOOLEAN DEFAULT true,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 2: TABLA VISITAS
-- =====================================================

CREATE TABLE visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mesa_numero TEXT NOT NULL,
  numero_personas INTEGER DEFAULT 1,
  hora_llegada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  hora_salida TIMESTAMP WITH TIME ZONE,
  duracion_minutos INTEGER,
  total_consumo DECIMAL(10,2) DEFAULT 0,
  productos_consumidos JSONB DEFAULT '[]'::jsonb,
  hostess TEXT,
  mesero TEXT,
  calificacion_hostess DECIMAL(3,2),
  calificacion_servicio DECIMAL(3,2),
  calificacion_comida DECIMAL(3,2),
  comentarios TEXT,
  puntos_ganados INTEGER DEFAULT 0,
  recompensa_aplicada TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 3: TABLA MESAS (tabla principal del sistema)
-- =====================================================

CREATE TABLE mesas (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL,
  capacidad INTEGER NOT NULL DEFAULT 10,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'limpieza')),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT,
  numero_personas INTEGER DEFAULT 0,
  numero_hombres INTEGER DEFAULT 0,
  numero_mujeres INTEGER DEFAULT 0,
  hostess TEXT,
  mesero TEXT,
  rp TEXT,
  hora_asignacion TIMESTAMP WITH TIME ZONE,
  pedidos_data JSONB DEFAULT '[]'::jsonb,
  total_actual DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 4: TABLA MESAS_CLIENTES (alias/vista de mesas)
-- =====================================================

CREATE TABLE mesas_clientes (
  id INTEGER PRIMARY KEY,
  numero TEXT NOT NULL,
  capacidad INTEGER NOT NULL,
  estado TEXT NOT NULL DEFAULT 'disponible' CHECK (estado IN ('disponible', 'ocupada', 'reservada', 'limpieza')),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  cliente_nombre TEXT,
  numero_personas INTEGER DEFAULT 0,
  hostess TEXT,
  mesero TEXT,
  hora_asignacion TIMESTAMP WITH TIME ZONE,
  pedidos_data JSONB DEFAULT '[]'::jsonb,
  total_actual DECIMAL(10,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 5: TABLA CALIFICACIONES HOSTESS
-- =====================================================

CREATE TABLE calificaciones_hostess (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  hostess TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  horario TEXT NOT NULL,
  mesa_numero TEXT NOT NULL,
  calificacion_atencion DECIMAL(3,2),
  calificacion_rapidez DECIMAL(3,2),
  calificacion_amabilidad DECIMAL(3,2),
  calificacion_general DECIMAL(3,2),
  comentarios TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 6: TABLA TICKETS
-- =====================================================

CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE,
  numero_ticket TEXT UNIQUE NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  mesa_numero TEXT NOT NULL,
  productos JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  propina DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  metodo_pago TEXT,
  mesero TEXT NOT NULL,
  hostess TEXT,
  rp_nombre VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 7: TABLA REWARDS
-- =====================================================

CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('puntos', 'descuento', 'producto_gratis', 'upgrade', 'cumpleaños', 'racha')),
  descripcion TEXT NOT NULL,
  puntos INTEGER DEFAULT 0,
  valor_descuento DECIMAL(10,2) DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  usado BOOLEAN DEFAULT false,
  fecha_expiracion TIMESTAMP WITH TIME ZONE,
  fecha_uso TIMESTAMP WITH TIME ZONE,
  visitas_requeridas INTEGER,
  consumo_minimo DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 8: TABLA RACHAS
-- =====================================================

CREATE TABLE rachas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('fines_semana', 'semanal', 'mensual', 'especial')),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  visitas_actuales INTEGER DEFAULT 0,
  visitas_objetivo INTEGER NOT NULL,
  completada BOOLEAN DEFAULT false,
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_completada TIMESTAMP WITH TIME ZONE,
  recompensa_tipo TEXT,
  recompensa_valor DECIMAL(10,2),
  recompensa_otorgada BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 9: TABLA FILA DE ESPERA
-- =====================================================

CREATE TABLE fila_espera (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  nombre_cliente TEXT NOT NULL,
  telefono TEXT NOT NULL,
  numero_personas INTEGER NOT NULL,
  estado TEXT DEFAULT 'esperando' CHECK (estado IN ('esperando', 'notificado', 'sentado', 'cancelado')),
  posicion INTEGER,
  hora_llegada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tiempo_espera_estimado INTEGER,
  hora_notificacion TIMESTAMP WITH TIME ZONE,
  hora_asignacion TIMESTAMP WITH TIME ZONE,
  mesa_asignada TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 10: TABLA PRODUCTOS
-- =====================================================

CREATE TABLE productos (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  categoria TEXT NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  unidad TEXT NOT NULL,
  precio_compra DECIMAL(10,2) NOT NULL,
  proveedor TEXT NOT NULL,
  veces_vendido INTEGER DEFAULT 0,
  rating_promedio DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 11: TABLA MESEROS
-- =====================================================

CREATE TABLE meseros (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 12: TABLA HOSTESS
-- =====================================================

CREATE TABLE hostess (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  activo BOOLEAN DEFAULT true,
  fecha_contratacion DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PASO 13: TABLA RESERVACIONES
-- =====================================================

CREATE TABLE reservaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id),
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  numero_personas INTEGER NOT NULL,
  numero_hombres INTEGER DEFAULT 0,
  numero_mujeres INTEGER DEFAULT 0,
  rp_nombre TEXT,
  estado TEXT DEFAULT 'pendiente',
  asistio BOOLEAN DEFAULT false,
  hora_llegada TIMESTAMP,
  mesa_asignada INTEGER,
  notas TEXT,
  creado_por TEXT,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW(),
  activo BOOLEAN DEFAULT true
);

-- =====================================================
-- PASO 14: TABLA CORTESIAS Y LÍMITES RP
-- =====================================================

CREATE TABLE limites_cortesias_rp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rp_nombre TEXT NOT NULL UNIQUE,
  shots_disponibles INTEGER DEFAULT 5,
  shots_usados INTEGER DEFAULT 0,
  descuento_botella_disponible INTEGER DEFAULT 1,
  descuento_botella_usado INTEGER DEFAULT 0,
  perlas_negras_disponibles INTEGER DEFAULT 3,
  perlas_negras_usadas INTEGER DEFAULT 0,
  shots_bienvenida_disponibles INTEGER DEFAULT 10,
  shots_bienvenida_usados INTEGER DEFAULT 0,
  periodo_inicio DATE DEFAULT CURRENT_DATE,
  periodo_fin DATE,
  activo BOOLEAN DEFAULT true,
  password TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cortesias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rp_nombre TEXT NOT NULL,
  mesa_id INTEGER REFERENCES mesas(id),
  mesa_numero TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  tipo_cortesia TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad INTEGER DEFAULT 1,
  valor_descuento DECIMAL(10,2) DEFAULT 0,
  autorizado BOOLEAN DEFAULT true,
  usado BOOLEAN DEFAULT false,
  fecha_autorizacion TIMESTAMP DEFAULT NOW(),
  fecha_uso TIMESTAMP,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- PASO 15: TABLA SOCIOS PREMIUM
-- =====================================================

CREATE TABLE socios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(15) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  activo BOOLEAN DEFAULT true,
  limite_cortesias DECIMAL(10,2) DEFAULT 1500.00,
  cortesias_usadas_hoy DECIMAL(10,2) DEFAULT 0.00,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultimo_acceso TIMESTAMP,
  notas TEXT
);

CREATE TABLE cortesias_socios (
  id SERIAL PRIMARY KEY,
  socio_id INTEGER REFERENCES socios(id),
  tipo_cortesia VARCHAR(50) NOT NULL,
  mesa_id INTEGER REFERENCES mesas(id),
  cliente_id UUID REFERENCES clientes(id),
  cantidad INTEGER DEFAULT 1,
  monto DECIMAL(10,2) NOT NULL,
  fecha_autorizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  canjeado BOOLEAN DEFAULT false,
  fecha_canje TIMESTAMP,
  notas TEXT
);

-- =====================================================
-- PASO 16: FEVERSHOP Y FEVERCOINS
-- =====================================================

CREATE TABLE fevercoins_balance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_ganados INTEGER DEFAULT 0,
  total_gastados INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cliente_id)
);

CREATE TABLE fevercoins_transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  cantidad INTEGER NOT NULL,
  concepto TEXT NOT NULL,
  puntos_usados INTEGER DEFAULT 0,
  producto_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fevershop_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio_fevercoins INTEGER NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  stock INTEGER DEFAULT 0,
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  destacado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE fevershop_compras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES fevershop_productos(id) ON DELETE SET NULL,
  producto_nombre VARCHAR(255) NOT NULL,
  precio_fevercoins INTEGER NOT NULL,
  cantidad INTEGER DEFAULT 1,
  total_fevercoins INTEGER NOT NULL,
  estado VARCHAR(50) DEFAULT 'pendiente',
  canjeado BOOLEAN DEFAULT false,
  fecha_canje TIMESTAMP WITH TIME ZONE,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PASO 17: TABLA EMERGENCIAS
-- =====================================================

CREATE TABLE public.emergencias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('emergencia', 'pelea_interna', 'pelea_externa', 'fiscalizacion')),
  mensaje TEXT NOT NULL,
  reportado_por TEXT NOT NULL,
  ubicacion TEXT DEFAULT 'Entrada Principal',
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- PASO 18: ÍNDICES
-- =====================================================

CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_nivel ON clientes(nivel_fidelidad);
CREATE INDEX idx_clientes_activo ON clientes(activo);
CREATE INDEX idx_clientes_genero ON clientes(genero);
CREATE INDEX idx_clientes_calificacion ON clientes(calificacion_promedio);
CREATE INDEX idx_clientes_consumo_total ON clientes(consumo_total);

CREATE INDEX idx_visitas_cliente ON visitas(cliente_id);
CREATE INDEX idx_visitas_fecha ON visitas(fecha DESC);
CREATE INDEX idx_visitas_mesa ON visitas(mesa_numero);
CREATE INDEX idx_visitas_hostess ON visitas(hostess);

CREATE INDEX idx_mesas_estado ON mesas(estado);
CREATE INDEX idx_mesas_rp ON mesas(rp);
CREATE INDEX idx_mesas_cliente_nombre ON mesas(cliente_nombre);

CREATE INDEX idx_calificaciones_hostess ON calificaciones_hostess(hostess);
CREATE INDEX idx_calificaciones_fecha ON calificaciones_hostess(fecha DESC);

CREATE INDEX idx_tickets_cliente ON tickets(cliente_id);
CREATE INDEX idx_tickets_fecha ON tickets(fecha DESC);
CREATE INDEX idx_tickets_numero ON tickets(numero_ticket);
CREATE INDEX idx_tickets_rp_nombre ON tickets(rp_nombre);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_total ON tickets(total);

CREATE INDEX idx_rewards_cliente ON rewards(cliente_id);
CREATE INDEX idx_rachas_cliente ON rachas(cliente_id);
CREATE INDEX idx_fila_estado ON fila_espera(estado);

CREATE INDEX idx_cortesias_rp ON cortesias(rp_nombre);
CREATE INDEX idx_cortesias_fecha ON cortesias(fecha_autorizacion);
CREATE INDEX idx_socios_telefono ON socios(telefono);

CREATE INDEX idx_fevercoins_balance_cliente ON fevercoins_balance(cliente_id);
CREATE INDEX idx_fevercoins_transacciones_cliente ON fevercoins_transacciones(cliente_id);
CREATE INDEX idx_fevershop_productos_categoria ON fevershop_productos(categoria);
CREATE INDEX idx_fevershop_compras_cliente ON fevershop_compras(cliente_id);

CREATE INDEX idx_reservaciones_fecha ON reservaciones(fecha);
CREATE INDEX idx_reservaciones_estado ON reservaciones(estado);
CREATE INDEX idx_reservaciones_rp_nombre ON reservaciones(rp_nombre);

CREATE INDEX idx_emergencias_activa ON emergencias(activa);
CREATE INDEX idx_emergencias_created_at ON emergencias(created_at DESC);

-- =====================================================
-- PASO 19: FUNCIONES Y TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mesas_updated_at
  BEFORE UPDATE ON mesas FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at
  BEFORE UPDATE ON productos FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meseros_updated_at
  BEFORE UPDATE ON meseros FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION actualizar_timestamp_reservaciones()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_reservaciones
  BEFORE UPDATE ON reservaciones FOR EACH ROW
  EXECUTE FUNCTION actualizar_timestamp_reservaciones();

CREATE OR REPLACE FUNCTION actualizar_metricas_cliente()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hora_salida IS NOT NULL AND OLD.hora_salida IS NULL THEN
    UPDATE clientes SET
      total_visitas = total_visitas + 1,
      ultima_visita = NEW.fecha,
      consumo_total = consumo_total + NEW.total_consumo,
      consumo_promedio = (consumo_total + NEW.total_consumo) / (total_visitas + 1),
      ticket_mas_alto = GREATEST(ticket_mas_alto, NEW.total_consumo),
      updated_at = NOW()
    WHERE id = NEW.cliente_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_metricas
  AFTER UPDATE ON visitas FOR EACH ROW
  EXECUTE FUNCTION actualizar_metricas_cliente();

CREATE OR REPLACE FUNCTION calcular_racha_consecutiva(p_cliente_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_racha INTEGER := 0;
  v_fecha_anterior DATE;
  v_fecha_actual DATE;
BEGIN
  FOR v_fecha_actual IN
    SELECT DATE(fecha) FROM visitas WHERE cliente_id = p_cliente_id ORDER BY fecha DESC
  LOOP
    IF v_fecha_anterior IS NULL THEN
      v_racha := 1;
    ELSIF v_fecha_anterior - v_fecha_actual <= 7 THEN
      v_racha := v_racha + 1;
    ELSE
      EXIT;
    END IF;
    v_fecha_anterior := v_fecha_actual;
  END LOOP;
  RETURN v_racha;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION verificar_limite_cortesia(
  p_rp_nombre TEXT, p_tipo_cortesia TEXT, p_cantidad INTEGER DEFAULT 1
) RETURNS BOOLEAN AS $$
DECLARE v_disponibles INTEGER;
BEGIN
  SELECT
    CASE p_tipo_cortesia
      WHEN 'shots' THEN shots_disponibles - shots_usados
      WHEN 'descuento_botella' THEN descuento_botella_disponible - descuento_botella_usado
      WHEN 'perlas_negras' THEN perlas_negras_disponibles - perlas_negras_usadas
      WHEN 'shot_bienvenida' THEN shots_bienvenida_disponibles - shots_bienvenida_usados
      ELSE 0
    END INTO v_disponibles
  FROM limites_cortesias_rp WHERE rp_nombre = p_rp_nombre AND activo = true;
  IF v_disponibles IS NULL THEN RETURN false; END IF;
  RETURN v_disponibles >= p_cantidad;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_limite_cortesia()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.autorizado = true AND NEW.usado = false THEN
    UPDATE limites_cortesias_rp SET
      shots_usados = CASE WHEN NEW.tipo_cortesia = 'shots' THEN shots_usados + NEW.cantidad ELSE shots_usados END,
      descuento_botella_usado = CASE WHEN NEW.tipo_cortesia = 'descuento_botella' THEN descuento_botella_usado + 1 ELSE descuento_botella_usado END,
      perlas_negras_usadas = CASE WHEN NEW.tipo_cortesia = 'perlas_negras' THEN perlas_negras_usadas + NEW.cantidad ELSE perlas_negras_usadas END,
      shots_bienvenida_usados = CASE WHEN NEW.tipo_cortesia = 'shot_bienvenida' THEN shots_bienvenida_usados + NEW.cantidad ELSE shots_bienvenida_usados END,
      updated_at = NOW()
    WHERE rp_nombre = NEW.rp_nombre;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_limite_cortesia
  AFTER INSERT ON cortesias FOR EACH ROW
  EXECUTE FUNCTION actualizar_limite_cortesia();

CREATE OR REPLACE FUNCTION autorizar_cortesia_socio(
  p_socio_id INTEGER, p_tipo_cortesia VARCHAR, p_mesa_id INTEGER,
  p_cliente_id UUID, p_cantidad INTEGER, p_monto DECIMAL
) RETURNS JSON AS $$
DECLARE
  v_limite DECIMAL; v_usado_hoy DECIMAL; v_disponible DECIMAL; v_cortesia_id INTEGER;
BEGIN
  SELECT limite_cortesias, cortesias_usadas_hoy INTO v_limite, v_usado_hoy
  FROM socios WHERE id = p_socio_id AND activo = true;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Socio no encontrado o inactivo');
  END IF;
  v_disponible := v_limite - v_usado_hoy;
  IF p_monto > v_disponible THEN
    RETURN json_build_object('success', false, 'message', 'Monto excede el limite disponible', 'disponible', v_disponible);
  END IF;
  INSERT INTO cortesias_socios (socio_id, tipo_cortesia, mesa_id, cliente_id, cantidad, monto)
  VALUES (p_socio_id, p_tipo_cortesia, p_mesa_id, p_cliente_id, p_cantidad, p_monto)
  RETURNING id INTO v_cortesia_id;
  UPDATE socios SET cortesias_usadas_hoy = cortesias_usadas_hoy + p_monto WHERE id = p_socio_id;
  RETURN json_build_object('success', true, 'message', 'Cortesia autorizada', 'cortesia_id', v_cortesia_id, 'disponible', v_disponible - p_monto);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION resetear_cortesias_socios_diarias()
RETURNS void AS $$
BEGIN
  UPDATE socios SET cortesias_usadas_hoy = 0.00;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION canjear_puntos_por_fevercoins(p_cliente_id UUID, p_puntos INTEGER)
RETURNS JSON AS $$
DECLARE
  v_fevercoins INTEGER; v_puntos_actuales INTEGER;
BEGIN
  v_fevercoins := (p_puntos / 100) * 50;
  SELECT puntos_rewards INTO v_puntos_actuales FROM clientes WHERE id = p_cliente_id;
  IF v_puntos_actuales < p_puntos THEN
    RETURN json_build_object('success', false, 'message', 'Puntos insuficientes');
  END IF;
  UPDATE clientes SET puntos_rewards = puntos_rewards - p_puntos WHERE id = p_cliente_id;
  INSERT INTO fevercoins_balance (cliente_id, balance, total_ganados)
  VALUES (p_cliente_id, v_fevercoins, v_fevercoins)
  ON CONFLICT (cliente_id) DO UPDATE SET
    balance = fevercoins_balance.balance + v_fevercoins,
    total_ganados = fevercoins_balance.total_ganados + v_fevercoins,
    updated_at = NOW();
  INSERT INTO fevercoins_transacciones (cliente_id, tipo, cantidad, concepto, puntos_usados)
  VALUES (p_cliente_id, 'canjeado', v_fevercoins, format('Canjeados %s puntos por %s FeverCoins', p_puntos, v_fevercoins), p_puntos);
  RETURN json_build_object('success', true, 'fevercoins_obtenidos', v_fevercoins, 'puntos_usados', p_puntos);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION comprar_producto_fevershop(p_cliente_id UUID, p_producto_id UUID, p_cantidad INTEGER DEFAULT 1)
RETURNS JSON AS $$
DECLARE
  v_producto RECORD; v_balance INTEGER; v_total_coins INTEGER; v_compra_id UUID;
BEGIN
  SELECT * INTO v_producto FROM fevershop_productos WHERE id = p_producto_id AND activo = true;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'message', 'Producto no disponible'); END IF;
  v_total_coins := v_producto.precio_fevercoins * p_cantidad;
  SELECT balance INTO v_balance FROM fevercoins_balance WHERE cliente_id = p_cliente_id;
  IF v_balance IS NULL OR v_balance < v_total_coins THEN
    RETURN json_build_object('success', false, 'message', 'FeverCoins insuficientes');
  END IF;
  IF v_producto.stock < p_cantidad THEN
    RETURN json_build_object('success', false, 'message', 'Stock insuficiente');
  END IF;
  UPDATE fevercoins_balance SET balance = balance - v_total_coins, total_gastados = total_gastados + v_total_coins, updated_at = NOW() WHERE cliente_id = p_cliente_id;
  UPDATE fevershop_productos SET stock = stock - p_cantidad, updated_at = NOW() WHERE id = p_producto_id;
  INSERT INTO fevershop_compras (cliente_id, producto_id, producto_nombre, precio_fevercoins, cantidad, total_fevercoins)
  VALUES (p_cliente_id, p_producto_id, v_producto.nombre, v_producto.precio_fevercoins, p_cantidad, v_total_coins)
  RETURNING id INTO v_compra_id;
  INSERT INTO fevercoins_transacciones (cliente_id, tipo, cantidad, concepto, producto_id)
  VALUES (p_cliente_id, 'gastado', v_total_coins, format('Compra: %s x%s', v_producto.nombre, p_cantidad), p_producto_id);
  RETURN json_build_object('success', true, 'compra_id', v_compra_id, 'producto', v_producto.nombre, 'total_coins', v_total_coins, 'balance_restante', v_balance - v_total_coins);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION registrar_venta_producto(p_producto_id BIGINT, p_cantidad INTEGER)
RETURNS BOOLEAN AS $$
DECLARE v_stock_actual INTEGER;
BEGIN
  SELECT stock INTO v_stock_actual FROM productos WHERE id = p_producto_id;
  IF v_stock_actual IS NULL THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
  IF v_stock_actual > 0 AND v_stock_actual < p_cantidad THEN
    RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', v_stock_actual, p_cantidad;
  END IF;
  UPDATE productos SET
    stock = CASE WHEN stock > 0 THEN stock - p_cantidad ELSE 0 END,
    veces_vendido = veces_vendido + p_cantidad,
    updated_at = NOW()
  WHERE id = p_producto_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION reabastecer_producto(p_producto_id BIGINT, p_cantidad INTEGER, p_precio_compra DECIMAL DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE productos SET stock = stock + p_cantidad, precio_compra = COALESCE(p_precio_compra, precio_compra), updated_at = NOW() WHERE id = p_producto_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION buscar_productos(
  p_busqueda TEXT DEFAULT NULL, p_categoria TEXT DEFAULT NULL,
  p_precio_min DECIMAL DEFAULT NULL, p_precio_max DECIMAL DEFAULT NULL,
  p_solo_disponibles BOOLEAN DEFAULT FALSE
) RETURNS TABLE (id BIGINT, nombre TEXT, categoria TEXT, precio DECIMAL, stock INTEGER, unidad TEXT, disponible BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.nombre, p.categoria, p.precio, p.stock, p.unidad,
    CASE WHEN p.stock > 0 OR (p.stock = 0 AND p.unidad IN ('Coctel', 'Vaso', 'Jarra')) THEN TRUE ELSE FALSE END as disponible
  FROM productos p
  WHERE (p_busqueda IS NULL OR p.nombre ILIKE '%' || p_busqueda || '%')
    AND (p_categoria IS NULL OR p.categoria = p_categoria)
    AND (p_precio_min IS NULL OR p.precio >= p_precio_min)
    AND (p_precio_max IS NULL OR p.precio <= p_precio_max)
    AND (NOT p_solo_disponibles OR p.stock > 0 OR (p.stock = 0 AND p.unidad IN ('Coctel', 'Vaso', 'Jarra')))
  ORDER BY p.categoria, p.nombre;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION productos_stock_bajo()
RETURNS TABLE (id BIGINT, nombre TEXT, categoria TEXT, stock INTEGER, stock_minimo INTEGER, diferencia INTEGER, proveedor TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.nombre, p.categoria, p.stock, p.stock_minimo, (p.stock_minimo - p.stock) as diferencia, p.proveedor
  FROM productos p WHERE p.stock <= p.stock_minimo AND p.stock > 0 ORDER BY diferencia DESC, p.categoria;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION top_productos_vendidos(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE, p_fecha_fin DATE DEFAULT CURRENT_DATE, p_limite INTEGER DEFAULT 20
) RETURNS TABLE (producto TEXT, categoria TEXT, unidades_vendidas BIGINT, total_ventas NUMERIC, precio_promedio NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT item->>'nombre' as producto, p.categoria,
    SUM((item->>'cantidad')::INTEGER)::BIGINT as unidades_vendidas,
    SUM((item->>'precio')::NUMERIC * (item->>'cantidad')::INTEGER) as total_ventas,
    AVG((item->>'precio')::NUMERIC) as precio_promedio
  FROM tickets t, jsonb_array_elements(t.productos) as item
  LEFT JOIN productos p ON p.nombre = item->>'nombre'
  WHERE DATE(t.created_at) BETWEEN p_fecha_inicio AND p_fecha_fin
  GROUP BY item->>'nombre', p.categoria ORDER BY total_ventas DESC LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION stats_ventas_por_categoria(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE, p_fecha_fin DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (categoria TEXT, num_productos BIGINT, unidades_vendidas BIGINT, total_ventas NUMERIC, ticket_promedio NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT p.categoria, COUNT(DISTINCT item->>'nombre')::BIGINT,
    SUM((item->>'cantidad')::INTEGER)::BIGINT,
    SUM((item->>'precio')::NUMERIC * (item->>'cantidad')::INTEGER),
    AVG((item->>'precio')::NUMERIC * (item->>'cantidad')::INTEGER)
  FROM tickets t, jsonb_array_elements(t.productos) as item
  LEFT JOIN productos p ON p.nombre = item->>'nombre'
  WHERE DATE(t.created_at) BETWEEN p_fecha_inicio AND p_fecha_fin
  GROUP BY p.categoria ORDER BY total_ventas DESC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION analisis_rentabilidad(
  p_fecha_inicio DATE DEFAULT CURRENT_DATE, p_fecha_fin DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (producto TEXT, categoria TEXT, precio_venta NUMERIC, precio_compra NUMERIC, ganancia_unitaria NUMERIC, margen_porcentaje NUMERIC, unidades_vendidas BIGINT, ganancia_total NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT p.nombre, p.categoria, p.precio, p.precio_compra,
    (p.precio - p.precio_compra),
    ROUND(((p.precio - p.precio_compra) / p.precio * 100)::NUMERIC, 2),
    COALESCE(v.unidades, 0)::BIGINT,
    COALESCE((p.precio - p.precio_compra) * v.unidades, 0)
  FROM productos p
  LEFT JOIN (
    SELECT item->>'nombre' as nombre, SUM((item->>'cantidad')::INTEGER) as unidades
    FROM tickets t, jsonb_array_elements(t.productos) as item
    WHERE DATE(t.created_at) BETWEEN p_fecha_inicio AND p_fecha_fin GROUP BY item->>'nombre'
  ) v ON v.nombre = p.nombre
  WHERE p.precio_compra > 0 ORDER BY ganancia_total DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION actualizar_precio_producto(p_producto_id BIGINT, p_nuevo_precio DECIMAL, p_usuario TEXT DEFAULT 'Sistema')
RETURNS BOOLEAN AS $$
DECLARE v_precio_anterior DECIMAL;
BEGIN
  SELECT precio INTO v_precio_anterior FROM productos WHERE id = p_producto_id;
  IF v_precio_anterior IS NULL THEN RAISE EXCEPTION 'Producto no encontrado'; END IF;
  UPDATE productos SET precio = p_nuevo_precio, updated_at = NOW() WHERE id = p_producto_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calcular_bono_rp(p_rp_nombre VARCHAR)
RETURNS TABLE (rp_nombre VARCHAR, mesas_mes INTEGER, consumo_total NUMERIC, ticket_promedio NUMERIC, calificacion_promedio NUMERIC, bono_calculado NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT p_rp_nombre,
    CAST(COUNT(DISTINCT mesa_numero) AS INTEGER),
    CAST(SUM(total) AS NUMERIC),
    CAST(AVG(total) AS NUMERIC),
    CAST(4.5 AS NUMERIC),
    CAST(1000 + (COUNT(DISTINCT mesa_numero) * 50) + ((SUM(total) / 10000) * 100) + (4.5 * 200) AS NUMERIC)
  FROM tickets WHERE rp_nombre = p_rp_nombre AND created_at >= NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.emergencias FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- PASO 20: VISTAS
-- =====================================================

CREATE OR REPLACE VIEW vista_clientes_activos AS
SELECT c.*, COUNT(v.id) as total_visitas_real, MAX(v.fecha) as ultima_visita_real,
  AVG(v.total_consumo) as consumo_promedio_real, AVG(v.calificacion_servicio) as calificacion_promedio_real
FROM clientes c LEFT JOIN visitas v ON c.id = v.cliente_id WHERE c.activo = true GROUP BY c.id;

CREATE OR REPLACE VIEW vista_top_clientes AS
SELECT id, nombre, apellido, genero, nivel_fidelidad, total_visitas, consumo_total, consumo_promedio, ultima_visita
FROM clientes WHERE activo = true ORDER BY consumo_total DESC LIMIT 50;

CREATE OR REPLACE VIEW vista_metricas_genero AS
SELECT genero, COUNT(*) as total_clientes, SUM(total_visitas) as total_visitas,
  AVG(consumo_promedio) as consumo_promedio, AVG(calificacion_promedio) as calificacion_promedio
FROM clientes WHERE activo = true AND genero IS NOT NULL GROUP BY genero;

CREATE OR REPLACE VIEW vista_stats_socios AS
SELECT
  (SELECT COALESCE(SUM(total), 0) FROM tickets WHERE DATE(created_at) = CURRENT_DATE) as ventas_hoy,
  (SELECT COALESCE(SUM(total), 0) FROM tickets WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as ventas_mes,
  (SELECT COUNT(*) FROM tickets WHERE DATE(created_at) = CURRENT_DATE) as tickets_hoy,
  (SELECT COUNT(DISTINCT cliente_id) FROM mesas WHERE DATE(hora_asignacion) = CURRENT_DATE) as clientes_hoy,
  (SELECT COUNT(*) FROM mesas WHERE estado = 'ocupada') as mesas_ocupadas,
  (SELECT COUNT(*) FROM mesas) as total_mesas,
  (SELECT COALESCE(AVG(total), 0) FROM tickets WHERE DATE(created_at) = CURRENT_DATE) as ticket_promedio_hoy,
  (SELECT COALESCE(SUM(monto), 0) FROM cortesias_socios WHERE DATE(fecha_autorizacion) = CURRENT_DATE) as cortesias_hoy,
  (SELECT COUNT(*) FROM reservaciones WHERE DATE(fecha) = CURRENT_DATE) as reservaciones_hoy,
  (SELECT COALESCE(SUM(balance), 0) FROM fevercoins_balance) as fevercoins_circulacion;

CREATE OR REPLACE VIEW vista_metricas_rps AS
SELECT rp_nombre, COUNT(DISTINCT mesa_numero) as total_mesas, SUM(total) as consumo_total,
  AVG(total) as ticket_promedio, COUNT(*) as total_tickets, MIN(created_at) as primera_venta, MAX(created_at) as ultima_venta
FROM tickets WHERE rp_nombre IS NOT NULL GROUP BY rp_nombre ORDER BY consumo_total DESC;

CREATE OR REPLACE VIEW vista_conversion_rps AS
SELECT rp_nombre, COUNT(*) as total_reservas,
  COUNT(CASE WHEN estado = 'confirmada' THEN 1 END) as asistencias,
  COUNT(CASE WHEN estado = 'cancelada' THEN 1 END) as cancelaciones,
  ROUND(COUNT(CASE WHEN estado = 'confirmada' THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 2) as tasa_conversion
FROM reservaciones WHERE rp_nombre IS NOT NULL GROUP BY rp_nombre ORDER BY tasa_conversion DESC;

CREATE OR REPLACE VIEW vista_consumo_mesas AS
SELECT m.numero as mesa_numero, m.cliente_nombre, m.rp, m.estado,
  COALESCE(SUM(t.total), 0) as consumo_actual, COUNT(t.id) as tickets_generados
FROM mesas m
LEFT JOIN tickets t ON m.numero::integer = t.mesa_numero::integer AND DATE(t.created_at) = CURRENT_DATE
WHERE m.estado = 'ocupada' GROUP BY m.numero, m.cliente_nombre, m.rp, m.estado ORDER BY m.numero;

CREATE OR REPLACE VIEW vista_historial_cliente AS
SELECT t.id as ticket_id, t.cliente_id, c.nombre as cliente_nombre, t.mesa_numero, t.total,
  t.rp_nombre, t.created_at as fecha_consumo, EXTRACT(HOUR FROM t.created_at) as hora_consumo, DATE(t.created_at) as dia_consumo
FROM tickets t LEFT JOIN clientes c ON t.cliente_id = c.id ORDER BY t.created_at DESC;

CREATE OR REPLACE VIEW vista_mesas_rp_periodo AS
SELECT rp_nombre,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as mesas_semana,
  COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as mesas_mes,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN total ELSE 0 END) as consumo_semana,
  SUM(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN total ELSE 0 END) as consumo_mes
FROM tickets WHERE rp_nombre IS NOT NULL GROUP BY rp_nombre ORDER BY mesas_mes DESC;

CREATE OR REPLACE VIEW vista_productos_disponibles AS
SELECT id, nombre, categoria, precio, stock, unidad,
  CASE WHEN stock > 0 THEN TRUE WHEN stock = 0 AND unidad IN ('Coctel', 'Vaso', 'Jarra') THEN TRUE ELSE FALSE END as disponible,
  CASE WHEN stock = 0 THEN 'Sin stock' WHEN stock <= stock_minimo THEN 'Stock bajo' ELSE 'Disponible' END as estado_stock,
  veces_vendido, rating_promedio
FROM productos ORDER BY categoria, nombre;

CREATE OR REPLACE VIEW vista_resumen_inventario AS
SELECT categoria, COUNT(*) as total_productos, SUM(stock) as stock_total,
  SUM(CASE WHEN stock <= stock_minimo AND stock > 0 THEN 1 ELSE 0 END) as productos_stock_bajo,
  SUM(CASE WHEN stock = 0 AND unidad NOT IN ('Coctel', 'Vaso', 'Jarra') THEN 1 ELSE 0 END) as productos_sin_stock,
  SUM(stock * precio_compra) as valor_inventario, SUM(veces_vendido) as total_ventas
FROM productos GROUP BY categoria ORDER BY categoria;

CREATE OR REPLACE VIEW vista_fevershop_stats AS
SELECT COUNT(DISTINCT fc.cliente_id) as total_clientes_activos,
  COALESCE(SUM(fc.balance), 0) as total_fevercoins_circulacion,
  COALESCE(SUM(fc.total_ganados), 0) as total_fevercoins_emitidos,
  COALESCE(SUM(fc.total_gastados), 0) as total_fevercoins_gastados,
  COUNT(DISTINCT CASE WHEN fsc.created_at >= CURRENT_DATE THEN fsc.id END) as compras_hoy,
  COALESCE(SUM(CASE WHEN fsc.created_at >= CURRENT_DATE THEN fsc.total_fevercoins END), 0) as coins_gastados_hoy
FROM fevercoins_balance fc LEFT JOIN fevershop_compras fsc ON fc.cliente_id = fsc.cliente_id;

-- =====================================================
-- PASO 21: ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mesas_clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calificaciones_hostess ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rachas ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_espera ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE meseros ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostess ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE limites_cortesias_rp ENABLE ROW LEVEL SECURITY;
ALTER TABLE cortesias ENABLE ROW LEVEL SECURITY;
ALTER TABLE socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE cortesias_socios ENABLE ROW LEVEL SECURITY;
ALTER TABLE fevercoins_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fevercoins_transacciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE fevershop_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE fevershop_compras ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total clientes" ON clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total visitas" ON visitas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total mesas" ON mesas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total mesas_clientes" ON mesas_clientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total calificaciones" ON calificaciones_hostess FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total rewards" ON rewards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total rachas" ON rachas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total fila" ON fila_espera FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total productos" ON productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total meseros" ON meseros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total hostess" ON hostess FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total reservaciones" ON reservaciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total limites_rp" ON limites_cortesias_rp FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total cortesias" ON cortesias FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total socios" ON socios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total cortesias_socios" ON cortesias_socios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total fevercoins_balance" ON fevercoins_balance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total fevercoins_tx" ON fevercoins_transacciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total fevershop_productos" ON fevershop_productos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total fevershop_compras" ON fevershop_compras FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total emergencias" ON emergencias FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- PASO 22: DATOS INICIALES - MESAS (37 mesas)
-- =====================================================

INSERT INTO mesas (id, numero, capacidad, estado) VALUES
  (1, '1', 10, 'disponible'),
  (2, '2', 7, 'disponible'),
  (3, '3', 6, 'disponible'),
  (4, '4', 6, 'disponible'),
  (5, '5', 4, 'disponible'),
  (6, '6', 6, 'disponible'),
  (7, '7', 7, 'disponible'),
  (10, '10', 10, 'disponible'),
  (11, '11', 10, 'disponible'),
  (12, '12', 10, 'disponible'),
  (13, '13', 10, 'disponible'),
  (14, '14', 10, 'disponible'),
  (15, '15', 10, 'disponible'),
  (16, '16', 10, 'disponible'),
  (20, '20', 10, 'disponible'),
  (21, '21', 10, 'disponible'),
  (22, '22', 10, 'disponible'),
  (23, '23', 10, 'disponible'),
  (24, '24', 10, 'disponible'),
  (25, '25', 10, 'disponible'),
  (26, '26', 10, 'disponible'),
  (30, '30', 10, 'disponible'),
  (31, '31', 10, 'disponible'),
  (32, '32', 10, 'disponible'),
  (33, '33', 6, 'disponible'),
  (34, '34', 10, 'disponible'),
  (35, '35', 10, 'disponible'),
  (36, '36', 10, 'disponible'),
  (37, '37', 7, 'disponible')
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 23: DATOS INICIALES - MESEROS Y HOSTESS
-- =====================================================

INSERT INTO meseros (nombre, apellido, telefono, activo) VALUES
  ('Juan', 'Pérez', '555-0101', true),
  ('María', 'González', '555-0102', true),
  ('Carlos', 'Rodríguez', '555-0103', true),
  ('Ana', 'Martínez', '555-0104', true)
ON CONFLICT DO NOTHING;

INSERT INTO hostess (nombre, apellido, telefono, activo) VALUES
  ('Verónica', 'García', '555-0201', true),
  ('Ana', 'Martínez', '555-0202', true),
  ('Laura', 'López', '555-0203', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- PASO 24: DATOS INICIALES - SOCIOS (5 accesos)
-- =====================================================

INSERT INTO socios (nombre, telefono, password, limite_cortesias) VALUES
  ('Ashton', '5550000001', 'ashton2024', 1500.00),
  ('Agus', '5550000002', 'agus2024', 1500.00),
  ('Canales', '5550000003', 'canales2024', 1500.00),
  ('Ricardo', '5550000004', 'ricardo2024', 1500.00),
  ('Sofia', '5550000005', 'sofia2024', 1500.00)
ON CONFLICT (telefono) DO NOTHING;

-- =====================================================
-- PASO 25: DATOS INICIALES - RPs (13 RPs con credenciales)
-- =====================================================

INSERT INTO limites_cortesias_rp (rp_nombre, shots_disponibles, shots_usados, perlas_negras_disponibles, perlas_negras_usadas, descuento_botella_disponible, descuento_botella_usado, shots_bienvenida_disponibles, shots_bienvenida_usados, activo, password)
VALUES
  ('Elsa Vela', 5, 0, 3, 0, 1, 0, 10, 0, true, 'elsa2025'),
  ('Leah Vazquez', 5, 0, 3, 0, 1, 0, 10, 0, true, 'leah2025'),
  ('Emiliano Fox', 5, 0, 3, 0, 1, 0, 10, 0, true, 'emiliano2025'),
  ('Oscar Navarro', 5, 0, 3, 0, 1, 0, 10, 0, true, 'oscar2025'),
  ('Patricio García', 5, 0, 3, 0, 1, 0, 10, 0, true, 'patricio2025'),
  ('Silvana Noriega', 5, 0, 3, 0, 1, 0, 10, 0, true, 'silvana2025'),
  ('Fernanda Lira', 5, 0, 3, 0, 1, 0, 10, 0, true, 'fernanda2025'),
  ('Daniela Navarro', 5, 0, 3, 0, 1, 0, 10, 0, true, 'daniela2025'),
  ('Ximena Muñoz', 5, 0, 3, 0, 1, 0, 10, 0, true, 'ximena2025'),
  ('Milton Guerrero', 5, 0, 3, 0, 1, 0, 10, 0, true, 'milton2025'),
  ('Alejandra Urteaga', 5, 0, 3, 0, 1, 0, 10, 0, true, 'alejandra2025'),
  ('Regina Rodríguez', 5, 0, 3, 0, 1, 0, 10, 0, true, 'regina2025'),
  ('Diego Oliveros', 5, 0, 3, 0, 1, 0, 10, 0, true, 'diego2025')
ON CONFLICT (rp_nombre) DO UPDATE SET
  activo = EXCLUDED.activo, password = EXCLUDED.password;

-- =====================================================
-- PASO 26: DATOS INICIALES - FEVERSHOP PRODUCTOS
-- =====================================================

INSERT INTO fevershop_productos (nombre, descripcion, precio_fevercoins, categoria, stock, activo, destacado) VALUES
  ('Cerveza Premium', 'Cerveza artesanal de la casa', 150, 'bebidas', 100, true, true),
  ('Coctel Signature', 'Coctel especial del bartender', 200, 'bebidas', 50, true, true),
  ('Shot de Tequila', 'Shot de tequila premium', 80, 'bebidas', 200, true, false),
  ('Botella de Vino', 'Vino tinto reserva', 500, 'bebidas', 30, true, true),
  ('Refresco Premium', 'Refresco artesanal', 50, 'bebidas', 150, true, false),
  ('Hamburguesa Fever', 'Hamburguesa especial de la casa', 250, 'alimentos', 50, true, true),
  ('Alitas Picantes', 'Orden de alitas con salsa especial', 180, 'alimentos', 80, true, false),
  ('Nachos Supreme', 'Nachos con todos los toppings', 150, 'alimentos', 100, true, false),
  ('Pizza Personal', 'Pizza individual de pepperoni', 200, 'alimentos', 60, true, false),
  ('Papas Fever', 'Papas fritas con salsa especial', 100, 'alimentos', 120, true, false),
  ('Playera Fever', 'Playera oficial del club', 800, 'merchandising', 50, true, true),
  ('Gorra Fever', 'Gorra bordada con logo', 500, 'merchandising', 40, true, false),
  ('Vaso Térmico', 'Vaso térmico con logo Fever', 400, 'merchandising', 30, true, false),
  ('Llavero Fever', 'Llavero metálico premium', 150, 'merchandising', 100, true, false),
  ('Sudadera Fever', 'Sudadera con capucha', 1200, 'merchandising', 25, true, true),
  ('Mesa VIP 1 Noche', 'Mesa VIP para 4 personas', 2000, 'experiencias', 10, true, true),
  ('Meet & Greet DJ', 'Conoce al DJ de la noche', 1500, 'experiencias', 5, true, true),
  ('Botella Sparklers', 'Botella con sparklers y show', 3000, 'experiencias', 8, true, true),
  ('Entrada Fast Pass', 'Entrada sin fila por 1 mes', 1000, 'experiencias', 20, true, false),
  ('Cumpleaños VIP', 'Paquete cumpleaños con decoración', 2500, 'experiencias', 5, true, true),
  ('10% Descuento', 'Cupón 10% en tu próxima visita', 300, 'descuentos', 999, true, false),
  ('20% Descuento', 'Cupón 20% en tu próxima visita', 600, 'descuentos', 999, true, true),
  ('Entrada Gratis', 'Entrada gratis para ti y un amigo', 400, 'descuentos', 999, true, true),
  ('2x1 en Bebidas', 'Cupón 2x1 en bebidas seleccionadas', 350, 'descuentos', 999, true, false),
  ('Cover Gratis', 'Cover gratis por 1 mes', 800, 'descuentos', 999, true, true);

-- =====================================================
-- PASO 27: MENÚ COMPLETO (119 productos)
-- =====================================================

-- TEQUILA (25 productos)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Centenario Plata Copa', 'Tequila', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Centenario Plata Botella', 'Tequila', 1890.00, 50, 10, 'Botella', 945.00, 'Distribuidora de Licores'),
  ('Centenario Ultra Copa', 'Tequila', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Centenario Ultra Botella', 'Tequila', 1890.00, 50, 10, 'Botella', 945.00, 'Distribuidora de Licores'),
  ('Centenario Reposado Copa', 'Tequila', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Centenario Reposado Botella', 'Tequila', 1890.00, 50, 10, 'Botella', 945.00, 'Distribuidora de Licores'),
  ('1800 Cristalino Copa', 'Tequila', 200.00, 100, 20, 'Copa', 100.00, 'Distribuidora de Licores'),
  ('1800 Cristalino Botella', 'Tequila', 2990.00, 40, 8, 'Botella', 1495.00, 'Distribuidora de Licores'),
  ('1800 Cristalino Patona 1750ml', 'Tequila', 5990.00, 20, 5, 'Botella', 2995.00, 'Distribuidora de Licores'),
  ('Dobel Diamante Copa', 'Tequila', 240.00, 100, 20, 'Copa', 120.00, 'Distribuidora de Licores'),
  ('Dobel Diamante Botella', 'Tequila', 2290.00, 40, 8, 'Botella', 1145.00, 'Distribuidora de Licores'),
  ('Dobel Diamante 1750ml', 'Tequila', 5990.00, 20, 5, 'Botella', 2995.00, 'Distribuidora de Licores'),
  ('Dobel Blanco Copa', 'Tequila', 180.00, 100, 20, 'Copa', 90.00, 'Distribuidora de Licores'),
  ('Dobel Blanco Botella', 'Tequila', 2140.00, 40, 8, 'Botella', 1070.00, 'Distribuidora de Licores'),
  ('Don Julio 70 Copa', 'Tequila', 240.00, 100, 20, 'Copa', 120.00, 'Distribuidora de Licores'),
  ('Don Julio 70 Botella', 'Tequila', 3170.00, 30, 6, 'Botella', 1585.00, 'Distribuidora de Licores'),
  ('Don Julio Reposado Copa', 'Tequila', 200.00, 100, 20, 'Copa', 100.00, 'Distribuidora de Licores'),
  ('Don Julio Reposado Botella', 'Tequila', 2340.00, 30, 6, 'Botella', 1170.00, 'Distribuidora de Licores'),
  ('Don Julio 1942 Botella', 'Tequila', 7990.00, 15, 3, 'Botella', 3995.00, 'Distribuidora de Licores'),
  ('Herradura Plata Copa', 'Tequila', 150.00, 100, 20, 'Copa', 75.00, 'Distribuidora de Licores'),
  ('Herradura Plata Botella', 'Tequila', 2240.00, 40, 8, 'Botella', 1120.00, 'Distribuidora de Licores'),
  ('Herradura Ultra Copa', 'Tequila', 220.00, 100, 20, 'Copa', 110.00, 'Distribuidora de Licores'),
  ('Herradura Ultra Botella', 'Tequila', 2965.00, 30, 6, 'Botella', 1482.50, 'Distribuidora de Licores');

-- VODKA (10 productos)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Smirnoff Copa', 'Vodka', 100.00, 100, 20, 'Copa', 50.00, 'Distribuidora de Licores'),
  ('Smirnoff Botella', 'Vodka', 1490.00, 60, 12, 'Botella', 745.00, 'Distribuidora de Licores'),
  ('Stolichnaya Copa', 'Vodka', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Stolichnaya Botella', 'Vodka', 1840.00, 50, 10, 'Botella', 920.00, 'Distribuidora de Licores'),
  ('Smirnoff Tamarindo Copa', 'Vodka', 110.00, 100, 20, 'Copa', 55.00, 'Distribuidora de Licores'),
  ('Smirnoff Tamarindo Botella', 'Vodka', 1490.00, 50, 10, 'Botella', 745.00, 'Distribuidora de Licores'),
  ('Absolut Copa', 'Vodka', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Absolut Botella', 'Vodka', 1690.00, 50, 10, 'Botella', 845.00, 'Distribuidora de Licores'),
  ('Grey Goose Copa', 'Vodka', 190.00, 80, 15, 'Copa', 95.00, 'Distribuidora de Licores'),
  ('Grey Goose Botella', 'Vodka', 2690.00, 30, 6, 'Botella', 1345.00, 'Distribuidora de Licores');

-- MEZCAL (6 productos)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('400 Conejos Espadín Copa', 'Mezcal', 150.00, 100, 20, 'Copa', 75.00, 'Distribuidora de Licores'),
  ('400 Conejos Espadín Botella', 'Mezcal', 1940.00, 40, 8, 'Botella', 970.00, 'Distribuidora de Licores'),
  ('Unión Joven Copa', 'Mezcal', 149.00, 100, 20, 'Copa', 74.50, 'Distribuidora de Licores'),
  ('Unión Joven Botella', 'Mezcal', 1890.00, 40, 8, 'Botella', 945.00, 'Distribuidora de Licores'),
  ('Monte Lobos Tobala Copa', 'Mezcal', 180.00, 80, 15, 'Copa', 90.00, 'Distribuidora de Licores'),
  ('Monte Lobos Tobala Botella', 'Mezcal', 2490.00, 30, 6, 'Botella', 1245.00, 'Distribuidora de Licores');

-- GINEBRA (8 productos)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Tanqueray London Copa', 'Ginebra', 160.00, 100, 20, 'Copa', 80.00, 'Distribuidora de Licores'),
  ('Tanqueray London Botella', 'Ginebra', 2240.00, 40, 8, 'Botella', 1120.00, 'Distribuidora de Licores'),
  ('Tanqueray Ten Copa', 'Ginebra', 180.00, 80, 15, 'Copa', 90.00, 'Distribuidora de Licores'),
  ('Tanqueray Ten Botella', 'Ginebra', 2590.00, 30, 6, 'Botella', 1295.00, 'Distribuidora de Licores'),
  ('Beefeater Copa', 'Ginebra', 150.00, 100, 20, 'Copa', 75.00, 'Distribuidora de Licores'),
  ('Beefeater Botella', 'Ginebra', 2090.00, 40, 8, 'Botella', 1045.00, 'Distribuidora de Licores'),
  ('Bombay Copa', 'Ginebra', 150.00, 100, 20, 'Copa', 75.00, 'Distribuidora de Licores'),
  ('Bombay Botella', 'Ginebra', 1990.00, 40, 8, 'Botella', 995.00, 'Distribuidora de Licores');

-- RON (11 productos)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Bacardi Blanco Copa', 'Ron', 100.00, 100, 20, 'Copa', 50.00, 'Distribuidora de Licores'),
  ('Bacardi Blanco Botella', 'Ron', 1440.00, 60, 12, 'Botella', 720.00, 'Distribuidora de Licores'),
  ('Bacardi Blanco 1750ml', 'Ron', 2990.00, 30, 6, 'Botella', 1495.00, 'Distribuidora de Licores'),
  ('Matusalem Platino Copa', 'Ron', 100.00, 100, 20, 'Copa', 50.00, 'Distribuidora de Licores'),
  ('Matusalem Platino Botella', 'Ron', 1390.00, 50, 10, 'Botella', 695.00, 'Distribuidora de Licores'),
  ('Matusalem Clásico Copa', 'Ron', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Matusalem Clásico Botella', 'Ron', 1550.00, 50, 10, 'Botella', 775.00, 'Distribuidora de Licores'),
  ('Habana 7 Copa', 'Ron', 120.00, 100, 20, 'Copa', 60.00, 'Distribuidora de Licores'),
  ('Habana 7 Botella', 'Ron', 1940.00, 40, 8, 'Botella', 970.00, 'Distribuidora de Licores'),
  ('Zacapa 23 Copa', 'Ron', 240.00, 80, 15, 'Copa', 120.00, 'Distribuidora de Licores'),
  ('Zacapa 23 Botella', 'Ron', 2290.00, 25, 5, 'Botella', 1145.00, 'Distribuidora de Licores');

-- WHISKY (7 productos)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Red Label Copa', 'Whisky', 130.00, 100, 20, 'Copa', 65.00, 'Distribuidora de Licores'),
  ('Red Label Botella', 'Whisky', 1990.00, 50, 10, 'Botella', 995.00, 'Distribuidora de Licores'),
  ('Black Label Copa', 'Whisky', 190.00, 80, 15, 'Copa', 95.00, 'Distribuidora de Licores'),
  ('Black Label Botella', 'Whisky', 2490.00, 40, 8, 'Botella', 1245.00, 'Distribuidora de Licores'),
  ('Buchanan''s 12 Copa', 'Whisky', 190.00, 80, 15, 'Copa', 95.00, 'Distribuidora de Licores'),
  ('Buchanan''s 12 Botella', 'Whisky', 2290.00, 40, 8, 'Botella', 1145.00, 'Distribuidora de Licores'),
  ('Buchanan''s 18 Botella', 'Whisky', 5990.00, 15, 3, 'Botella', 2995.00, 'Distribuidora de Licores');

-- BRANDY (2), COGNAC (2), CHAMPAGNE (3)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Torres X Copa', 'Brandy', 130.00, 100, 20, 'Copa', 65.00, 'Distribuidora de Licores'),
  ('Torres X Botella', 'Brandy', 1990.00, 40, 8, 'Botella', 995.00, 'Distribuidora de Licores'),
  ('Martell VSOP Copa', 'Cognac', 210.00, 80, 15, 'Copa', 105.00, 'Distribuidora de Licores'),
  ('Martell VSOP Botella', 'Cognac', 3140.00, 25, 5, 'Botella', 1570.00, 'Distribuidora de Licores'),
  ('Moët Brut Botella', 'Champagne', 3990.00, 30, 6, 'Botella', 1995.00, 'Distribuidora de Licores'),
  ('Moët Ice Botella', 'Champagne', 4790.00, 25, 5, 'Botella', 2395.00, 'Distribuidora de Licores'),
  ('Dom Pérignon Luminus Botella', 'Champagne', 22290.00, 10, 2, 'Botella', 11145.00, 'Distribuidora de Licores');

-- SHOTS (4), COCTELERÍA (10)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('Perla Negra 230', 'Shots', 230.00, 200, 40, 'Shot', 115.00, 'Distribuidora de Licores'),
  ('Bufanda Azul 230', 'Shots', 230.00, 200, 40, 'Shot', 115.00, 'Distribuidora de Licores'),
  ('Revolver 350', 'Shots', 350.00, 150, 30, 'Shot', 175.00, 'Distribuidora de Licores'),
  ('Turbina 280', 'Shots', 280.00, 150, 30, 'Shot', 140.00, 'Distribuidora de Licores'),
  ('Negroni', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Margarita', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Mojito', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Fernanditos', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Hanky Panky', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('St-Germain Spritz', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Aperol Spritz', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Limoncello Spritz', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Campari Spritz', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Moscow Mule', 'Coctelería', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación');

-- CERVEZA (5), MIXOLOGÍA (9)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('XX', 'Cerveza', 80.00, 300, 60, 'Botella', 40.00, 'Cervecería Cuauhtémoc'),
  ('XX Lager', 'Cerveza', 80.00, 300, 60, 'Botella', 40.00, 'Cervecería Cuauhtémoc'),
  ('Ultra', 'Cerveza', 80.00, 300, 60, 'Botella', 40.00, 'Cervecería Cuauhtémoc'),
  ('Bohemia Cristal', 'Cerveza', 80.00, 250, 50, 'Botella', 40.00, 'Cervecería Cuauhtémoc'),
  ('Heineken', 'Cerveza', 80.00, 300, 60, 'Botella', 40.00, 'Heineken México'),
  ('Moon Milk', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Apple Balkan', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Xococol', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Agave Soul', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Harry Night', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Mezcal Mirage', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Berry Ron', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Sunrise', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación'),
  ('Café Quina', 'Mixología', 180.00, 0, 0, 'Coctel', 90.00, 'Preparación');

-- ENERGIZANTES (5), REFRESCOS (12)
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) VALUES
  ('RedBull', 'Energizantes', 90.00, 200, 40, 'Lata', 45.00, 'Red Bull México'),
  ('RedBull Sugar Free', 'Energizantes', 90.00, 150, 30, 'Lata', 45.00, 'Red Bull México'),
  ('RedBull Tropical', 'Energizantes', 90.00, 150, 30, 'Lata', 45.00, 'Red Bull México'),
  ('RedBull Sandía', 'Energizantes', 90.00, 150, 30, 'Lata', 45.00, 'Red Bull México'),
  ('Boost', 'Energizantes', 90.00, 150, 30, 'Lata', 45.00, 'Distribuidora de Bebidas'),
  ('Agua Mineral', 'Refrescos', 55.00, 300, 60, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Coca Cola', 'Refrescos', 55.00, 300, 60, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Coca Cola Sin Azúcar', 'Refrescos', 55.00, 200, 40, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Squirt', 'Refrescos', 55.00, 200, 40, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Sprite', 'Refrescos', 55.00, 200, 40, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Agua Natural', 'Refrescos', 55.00, 300, 60, 'Botella', 27.50, 'Distribuidora de Bebidas'),
  ('Mundet', 'Refrescos', 55.00, 150, 30, 'Botella', 27.50, 'Coca-Cola FEMSA'),
  ('Tónica', 'Refrescos', 55.00, 150, 30, 'Botella', 27.50, 'Distribuidora de Bebidas'),
  ('Naranjada', 'Refrescos', 50.00, 0, 0, 'Vaso', 25.00, 'Preparación'),
  ('Limonada', 'Refrescos', 50.00, 0, 0, 'Vaso', 25.00, 'Preparación'),
  ('Vaso de Jugo', 'Refrescos', 50.00, 0, 0, 'Vaso', 25.00, 'Preparación'),
  ('Jarra de Jugo', 'Refrescos', 150.00, 0, 0, 'Jarra', 75.00, 'Preparación');

-- =====================================================
-- PASO 28: ÍNDICES ADICIONALES PRODUCTOS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));
CREATE INDEX IF NOT EXISTS idx_productos_ventas ON productos(veces_vendido DESC);
CREATE INDEX IF NOT EXISTS idx_productos_categoria_precio ON productos(categoria, precio);

-- =====================================================
-- PASO 29: HABILITAR REALTIME EN EMERGENCIAS
-- =====================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.emergencias;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

SELECT 'mesas' as tabla, COUNT(*) as registros FROM mesas
UNION ALL SELECT 'productos', COUNT(*) FROM productos
UNION ALL SELECT 'socios', COUNT(*) FROM socios
UNION ALL SELECT 'limites_cortesias_rp', COUNT(*) FROM limites_cortesias_rp
UNION ALL SELECT 'fevershop_productos', COUNT(*) FROM fevershop_productos
UNION ALL SELECT 'meseros', COUNT(*) FROM meseros
UNION ALL SELECT 'hostess', COUNT(*) FROM hostess
ORDER BY tabla;

SELECT '✅ INSTALACION COMPLETA - CRM FEVER listo para usar' as resultado;
