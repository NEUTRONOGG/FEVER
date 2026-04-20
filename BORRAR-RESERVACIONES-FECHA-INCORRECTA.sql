-- Borra las reservaciones importadas con fecha incorrecta (18 abr 2026)
-- Ejecuta esto en Supabase > SQL Editor ANTES de re-importar con el parser corregido

DELETE FROM reservaciones
WHERE fecha = '2026-04-18'
  AND creado_por IS NULL  -- las importadas por IA no tienen creado_por
  AND estado = 'pendiente';

-- Si quieres ver cuántas hay antes de borrar, ejecuta primero:
-- SELECT COUNT(*), rp_nombre FROM reservaciones WHERE fecha = '2026-04-18' GROUP BY rp_nombre;
