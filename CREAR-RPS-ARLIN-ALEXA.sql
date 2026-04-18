-- Crear perfiles de RP: Arlin y Alexa
-- Estructura real de la tabla limites_cortesias_rp

INSERT INTO limites_cortesias_rp (
  rp_nombre,
  password,
  shots_disponibles,
  shots_usados,
  descuento_botella_disponible,
  descuento_botella_usado,
  perlas_negras_disponibles,
  perlas_negras_usadas,
  shots_bienvenida_disponibles,
  shots_bienvenida_usados,
  periodo_inicio,
  periodo_fin,
  activo
) VALUES 
  (
    'Arlin', 
    'arlin2024',
    0, 0, 0, 0, 0, 0, 0, 0,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    true
  ),
  (
    'Alexa', 
    'alexa2024',
    0, 0, 0, 0, 0, 0, 0, 0,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    true
  )
ON CONFLICT (rp_nombre) DO UPDATE SET
  password = EXCLUDED.password,
  updated_at = NOW();

-- Verificar inserción
SELECT rp_nombre, password, activo, created_at 
FROM limites_cortesias_rp 
WHERE rp_nombre IN ('Arlin', 'Alexa');
