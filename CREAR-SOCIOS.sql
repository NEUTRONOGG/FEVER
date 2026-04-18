-- =====================================================
-- SISTEMA DE SOCIOS PREMIUM
-- =====================================================
-- Version premium de RPs con cortesias de $1500
-- y acceso a estadisticas clave del negocio
-- =====================================================

-- 1. TABLA DE SOCIOS
CREATE TABLE IF NOT EXISTS socios (
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

-- 2. TABLA DE CORTESIAS DE SOCIOS
CREATE TABLE IF NOT EXISTS cortesias_socios (
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

-- 3. INDICES PARA OPTIMIZACION
CREATE INDEX IF NOT EXISTS idx_socios_telefono ON socios(telefono);
CREATE INDEX IF NOT EXISTS idx_socios_activo ON socios(activo);
CREATE INDEX IF NOT EXISTS idx_cortesias_socios_socio ON cortesias_socios(socio_id);
CREATE INDEX IF NOT EXISTS idx_cortesias_socios_fecha ON cortesias_socios(fecha_autorizacion);
CREATE INDEX IF NOT EXISTS idx_cortesias_socios_canjeado ON cortesias_socios(canjeado);

-- 4. VISTA DE ESTADISTICAS PARA SOCIOS
DROP VIEW IF EXISTS vista_stats_socios CASCADE;
CREATE VIEW vista_stats_socios AS
SELECT 
    (SELECT COALESCE(SUM(total), 0) FROM tickets WHERE DATE(created_at) = CURRENT_DATE) as ventas_hoy,
    (SELECT COALESCE(SUM(total), 0) FROM tickets WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as ventas_mes,
    (SELECT COUNT(*) FROM tickets WHERE DATE(created_at) = CURRENT_DATE) as tickets_hoy,
    (SELECT COUNT(DISTINCT cliente_id) FROM mesas_clientes WHERE DATE(hora_asignacion) = CURRENT_DATE) as clientes_hoy,
    (SELECT COUNT(*) FROM mesas WHERE estado = 'ocupada') as mesas_ocupadas,
    (SELECT COUNT(*) FROM mesas) as total_mesas,
    (SELECT COALESCE(AVG(total), 0) FROM tickets WHERE DATE(created_at) = CURRENT_DATE) as ticket_promedio_hoy,
    (SELECT COALESCE(SUM(monto), 0) FROM cortesias_socios WHERE DATE(fecha_autorizacion) = CURRENT_DATE) as cortesias_hoy,
    (SELECT COUNT(*) FROM reservaciones WHERE DATE(fecha) = CURRENT_DATE) as reservaciones_hoy,
    (SELECT COALESCE(SUM(balance), 0) FROM fevercoins_balance) as fevercoins_circulacion;

-- 5. FUNCION PARA AUTORIZAR CORTESIA DE SOCIO
CREATE OR REPLACE FUNCTION autorizar_cortesia_socio(
    p_socio_id INTEGER,
    p_tipo_cortesia VARCHAR,
    p_mesa_id INTEGER,
    p_cliente_id UUID,
    p_cantidad INTEGER,
    p_monto DECIMAL
) RETURNS JSON AS $$
DECLARE
    v_limite DECIMAL;
    v_usado_hoy DECIMAL;
    v_disponible DECIMAL;
    v_cortesia_id INTEGER;
BEGIN
    SELECT limite_cortesias, cortesias_usadas_hoy 
    INTO v_limite, v_usado_hoy
    FROM socios 
    WHERE id = p_socio_id AND activo = true;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'message', 'Socio no encontrado o inactivo');
    END IF;
    
    v_disponible := v_limite - v_usado_hoy;
    
    IF p_monto > v_disponible THEN
        RETURN json_build_object(
            'success', false, 
            'message', 'Monto excede el limite disponible',
            'disponible', v_disponible
        );
    END IF;
    
    INSERT INTO cortesias_socios (socio_id, tipo_cortesia, mesa_id, cliente_id, cantidad, monto)
    VALUES (p_socio_id, p_tipo_cortesia, p_mesa_id, p_cliente_id, p_cantidad, p_monto)
    RETURNING id INTO v_cortesia_id;
    
    UPDATE socios 
    SET cortesias_usadas_hoy = cortesias_usadas_hoy + p_monto
    WHERE id = p_socio_id;
    
    RETURN json_build_object(
        'success', true, 
        'message', 'Cortesia autorizada exitosamente',
        'cortesia_id', v_cortesia_id,
        'disponible', v_disponible - p_monto
    );
END;
$$ LANGUAGE plpgsql;

-- 6. FUNCION PARA RESETEAR CORTESIAS DIARIAS
CREATE OR REPLACE FUNCTION resetear_cortesias_socios_diarias()
RETURNS void AS $$
BEGIN
    UPDATE socios SET cortesias_usadas_hoy = 0.00;
END;
$$ LANGUAGE plpgsql;

-- 7. INSERTAR SOCIOS (5 ACCESOS)
INSERT INTO socios (nombre, telefono, password, limite_cortesias) VALUES
('Ashton', '5550000001', 'ashton2024', 1500.00),
('Agus', '5550000002', 'agus2024', 1500.00),
('Canales', '5550000003', 'canales2024', 1500.00),
('Ricardo', '5550000004', 'ricardo2024', 1500.00),
('Sofia', '5550000005', 'sofia2024', 1500.00)
ON CONFLICT (telefono) DO NOTHING;

-- 8. COMENTARIOS
COMMENT ON TABLE socios IS 'Tabla de socios premium con acceso a cortesias de $1500';
COMMENT ON TABLE cortesias_socios IS 'Registro de cortesias autorizadas por socios';
COMMENT ON VIEW vista_stats_socios IS 'Estadisticas clave del negocio para socios';
COMMENT ON FUNCTION autorizar_cortesia_socio IS 'Autoriza una cortesia validando limites disponibles';
