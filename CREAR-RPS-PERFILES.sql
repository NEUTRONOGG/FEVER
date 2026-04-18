-- Script para crear perfiles de RPs en el sistema
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- CREAR PERFILES DE RPs
-- ============================================

-- Insertar RPs en la tabla limites_cortesias_rp
INSERT INTO limites_cortesias_rp (
  rp_nombre, 
  shots_disponibles, 
  shots_usados,
  perlas_negras_disponibles, 
  perlas_negras_usadas,
  descuento_botella_disponible, 
  descuento_botella_usado,
  shots_bienvenida_disponibles,
  shots_bienvenida_usados,
  activo, 
  password
)
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
  activo = EXCLUDED.activo,
  password = EXCLUDED.password,
  shots_disponibles = EXCLUDED.shots_disponibles,
  perlas_negras_disponibles = EXCLUDED.perlas_negras_disponibles,
  descuento_botella_disponible = EXCLUDED.descuento_botella_disponible,
  shots_bienvenida_disponibles = EXCLUDED.shots_bienvenida_disponibles;

-- ============================================
-- VERIFICAR CREACIÓN
-- ============================================

-- Ver todos los RPs creados
SELECT 
  rp_nombre,
  password,
  shots_disponibles,
  perlas_negras_disponibles,
  descuento_botella_disponible,
  shots_bienvenida_disponibles,
  activo
FROM limites_cortesias_rp
ORDER BY rp_nombre;

-- ============================================
-- RESUMEN DE CREDENCIALES
-- ============================================

DO $$ 
BEGIN
  RAISE NOTICE '✅ RPs creados exitosamente';
  RAISE NOTICE '';
  RAISE NOTICE '📋 CREDENCIALES DE ACCESO:';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '1.  Elsa Vela       → elsa2025';
  RAISE NOTICE '2.  Leah Vazquez    → leah2025';
  RAISE NOTICE '3.  Emiliano Fox    → emiliano2025';
  RAISE NOTICE '4.  Oscar Navarro   → oscar2025';
  RAISE NOTICE '5.  Patricio García → patricio2025';
  RAISE NOTICE '6.  Silvana Noriega → silvana2025';
  RAISE NOTICE '7.  Fernanda Lira   → fernanda2025';
  RAISE NOTICE '8.  Daniela Navarro → daniela2025';
  RAISE NOTICE '9.  Ximena Muñoz    → ximena2025';
  RAISE NOTICE '10. Milton Guerrero → milton2025';
  RAISE NOTICE '11. Alejandra Urteaga → alejandra2025';
  RAISE NOTICE '12. Regina Rodríguez → regina2025';
  RAISE NOTICE '13. Diego Oliveros  → diego2025';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 LÍMITES POR DEFECTO:';
  RAISE NOTICE '   • Shots Regulares: 5 por período';
  RAISE NOTICE '   • Perlas Negras: 3 por período';
  RAISE NOTICE '   • Descuento Botella: 1 por período';
  RAISE NOTICE '   • Shots Bienvenida: 10 por período';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 URL de acceso: fevermx.site/dashboard/rp-login';
END $$;

-- ============================================
-- OPCIONAL: RESETEAR CONTRASEÑAS
-- ============================================

-- Si necesitas cambiar alguna contraseña, usa:
-- UPDATE limites_cortesias_rp 
-- SET password = 'nueva_contraseña' 
-- WHERE rp_nombre = 'Nombre del RP';
