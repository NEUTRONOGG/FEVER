-- ============================================
-- CONSULTAR CONTRASEÑAS DE RPs
-- ============================================

SELECT 
  rp_nombre as "RP",
  password as "Contraseña",
  activo as "Activo",
  shots_disponibles as "Shots",
  descuento_botella_disponible as "Desc. Botella",
  perlas_negras_disponibles as "Perlas Negras"
FROM limites_cortesias_rp
WHERE activo = true
ORDER BY rp_nombre;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- RP           | Contraseña | Activo | Shots | Desc. Botella | Perlas Negras
-- -------------|------------|--------|-------|---------------|---------------
-- Carlos RP    | carlos123  | true   | 10    | 5             | 3
-- Ana RP       | ana123     | true   | 10    | 5             | 3
-- Luis RP      | luis123    | true   | 10    | 5             | 3
