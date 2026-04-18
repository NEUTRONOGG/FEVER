-- =====================================================
-- CONFIGURAR TODOS LOS RPs EN EL SISTEMA
-- =====================================================
-- Agrega o actualiza los límites de cortesías para todos los RPs
-- =====================================================

-- Lista de RPs (13 principales + 2 de prueba):
-- SANTI CAST - SC
-- GRECIA CAST - GC
-- LEAH VAZQUEZ - LV
-- ALEJANDRO VARGAS - AV
-- BRIANNA - BV
-- FER LIRA - FL
-- DANI TRUJILLO - DT
-- PATO GARCIA - PG
-- OSCAR NAVARRO - ON
-- DIEGO OLIVEROS - DO
-- ELSA VELA - EV
-- ALEJANDRA URTEAGA - AU
-- REGINA ARANDA - RA
-- ASHTON BARBA - ASHTON (Prueba)
-- NEUTRON - NEUTRON (Prueba)

-- =====================================================
-- INSERTAR O ACTUALIZAR RPs
-- =====================================================

-- Usar INSERT ... ON CONFLICT para crear o actualizar
-- Nota: rp_nombre ahora guarda el NOMBRE COMPLETO (las abreviaturas están en comentarios)
INSERT INTO limites_cortesias_rp (
  rp_nombre,
  shots_disponibles,
  shots_usados,
  descuento_botella_disponible,
  descuento_botella_usado,
  perlas_negras_disponibles,
  perlas_negras_usadas,
  shots_bienvenida_disponibles,
  shots_bienvenida_usados,
  bufandas_rosa_disponibles,
  bufandas_rosa_usadas,
  activo
) VALUES
  ('SANTI CAST', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),        -- SC
  ('GRECIA CAST', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),       -- GC
  ('LEAH VAZQUEZ', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),      -- LV
  ('ALEJANDRO VARGAS', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),  -- AV
  ('BRIANNA', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),           -- BV
  ('FER LIRA', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),          -- FL
  ('DANI TRUJILLO', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),     -- DT
  ('PATO GARCIA', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),       -- PG
  ('OSCAR NAVARRO', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),     -- ON
  ('DIEGO OLIVEROS', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),    -- DO
  ('ELSA VELA', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),         -- EV
  ('ALEJANDRA URTEAGA', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true), -- AU
  ('REGINA ARANDA', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),     -- RA
  ('ASHTON BARBA', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true),      -- ASHTON (Prueba)
  ('NEUTRON', 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true)            -- NEUTRON (Prueba)
ON CONFLICT (rp_nombre) 
DO UPDATE SET
  shots_disponibles = 0,
  shots_usados = 0,
  descuento_botella_disponible = 0,
  descuento_botella_usado = 0,
  perlas_negras_disponibles = 0,
  perlas_negras_usadas = 0,
  shots_bienvenida_disponibles = 0,
  shots_bienvenida_usados = 0,
  bufandas_rosa_disponibles = 0,
  bufandas_rosa_usadas = 0,
  activo = true,
  updated_at = NOW();

SELECT '✅ Todos los RPs han sido configurados' as mensaje;

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Mostrar todos los RPs configurados
SELECT 
  rp_nombre as "RP",
  shots_disponibles as "Shots",
  perlas_negras_disponibles as "Perlas",
  descuento_botella_disponible as "Botellas",
  shots_bienvenida_disponibles as "Shots Bien.",
  bufandas_rosa_disponibles as "Bufandas",
  activo as "Activo",
  created_at as "Creado"
FROM limites_cortesias_rp
ORDER BY rp_nombre;

-- Contar total de RPs
SELECT COUNT(*) as total_rps FROM limites_cortesias_rp WHERE activo = true;

SELECT '🎯 Sistema configurado con 15 RPs (13 principales + 2 de prueba)' as resultado;
