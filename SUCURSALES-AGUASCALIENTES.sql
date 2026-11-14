-- =====================================================================
-- FEVER MULTI-SUCURSAL: León + Aguascalientes
-- Ejecutar completo en Supabase → SQL Editor. Se puede correr varias veces.
--
-- Cómo funciona:
--   * Cada fila operativa lleva sucursal_id ('leon' | 'ags').
--   * La app manda la cabecera x-sucursal con la sucursal que se está viendo
--     ('leon', 'ags' o 'todas' para el acumulado) y la base filtra sola.
--   * Lo que se crea toma la sucursal de esa cabecera. En "todas" solo se consulta.
--   * Sin cabecera (apps viejas, agente) se trabaja en León, como hasta hoy.
--   * Clientes, rewards, productos y socios siguen siendo compartidos.
-- =====================================================================

-- ---------- 1. Catálogo de sucursales ----------
CREATE TABLE IF NOT EXISTS public.sucursales (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  ciudad TEXT,
  activa BOOLEAN NOT NULL DEFAULT true,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO public.sucursales (id, nombre, ciudad) VALUES
  ('leon', 'FEVER León', 'León, Gto.'),
  ('ags',  'FEVER Aguascalientes', 'Aguascalientes, Ags.')
ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS fever_leer_sucursales ON public.sucursales;
CREATE POLICY fever_leer_sucursales ON public.sucursales FOR SELECT TO anon, authenticated USING (true);
GRANT SELECT ON public.sucursales TO anon, authenticated;

-- ---------- 2. Sucursal de cada petición ----------
-- 'leon' | 'ags' | 'todas'. Sin contexto de API (SQL Editor, tiempo real) = 'todas'.
CREATE OR REPLACE FUNCTION public.fever_sucursal_vista() RETURNS TEXT
LANGUAGE plpgsql STABLE AS $$
DECLARE
  h TEXT := current_setting('request.headers', true);
  s TEXT;
BEGIN
  IF h IS NULL OR h = '' THEN RETURN 'todas'; END IF;
  s := lower(coalesce(h::json->>'x-sucursal', ''));
  IF s = '' THEN RETURN 'leon'; END IF;
  RETURN s;
END $$;

-- Sucursal para filas nuevas: la de la petición; en "todas" no se permite crear.
CREATE OR REPLACE FUNCTION public.fever_sucursal_nueva() RETURNS TEXT
LANGUAGE plpgsql STABLE AS $$
DECLARE v TEXT := public.fever_sucursal_vista();
BEGIN
  IF v <> 'todas' THEN RETURN v; END IF;
  IF coalesce(current_setting('request.headers', true), '') = '' THEN RETURN 'leon'; END IF;
  RETURN NULL;
END $$;

-- ---------- 3. Utilidades de migración ----------
-- Cambia el tipo de una columna aunque haya vistas que dependan de ella
CREATE OR REPLACE FUNCTION public.fever_cambiar_tipo(p_tabla TEXT, p_columna TEXT, p_tipo TEXT) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  r RECORD;
  nombres TEXT[] := '{}';
  definiciones TEXT[] := '{}';
  i INT;
BEGIN
  IF to_regclass('public.' || p_tabla) IS NULL THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = p_tabla AND column_name = p_columna) THEN RETURN; END IF;
  FOR r IN
    SELECT DISTINCT v.relname AS nombre, pg_get_viewdef(v.oid) AS def
    FROM pg_depend d
    JOIN pg_rewrite w ON d.objid = w.oid
    JOIN pg_class v ON w.ev_class = v.oid
    JOIN pg_class t ON d.refobjid = t.oid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = d.refobjsubid
    WHERE t.relname = p_tabla AND a.attname = p_columna AND v.relname <> p_tabla AND v.relkind = 'v'
  LOOP
    nombres := nombres || r.nombre;
    definiciones := definiciones || r.def;
  END LOOP;
  FOR i IN 1 .. coalesce(array_length(nombres, 1), 0) LOOP
    EXECUTE format('DROP VIEW IF EXISTS public.%I', nombres[i]);
  END LOOP;
  EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE %s', p_tabla, p_columna, p_tipo);
  FOR i IN 1 .. coalesce(array_length(nombres, 1), 0) LOOP
    EXECUTE format('CREATE VIEW public.%I AS %s', nombres[i], definiciones[i]);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', nombres[i]);
  END LOOP;
END $$;

-- Cambia "único en toda la tabla" por "único dentro de cada sucursal"
CREATE OR REPLACE FUNCTION public.fever_unico_por_sucursal(p_tabla TEXT, p_columna TEXT) RETURNS VOID
LANGUAGE plpgsql AS $$
DECLARE
  r RECORD;
  col SMALLINT;
BEGIN
  IF to_regclass('public.' || p_tabla) IS NULL THEN RETURN; END IF;
  SELECT attnum INTO col FROM pg_attribute WHERE attrelid = ('public.' || p_tabla)::regclass AND attname = p_columna;
  IF col IS NULL THEN RETURN; END IF;
  FOR r IN SELECT conname FROM pg_constraint
           WHERE conrelid = ('public.' || p_tabla)::regclass AND contype = 'u' AND conkey = ARRAY[col]
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', p_tabla, r.conname);
  END LOOP;
  FOR r IN SELECT i.relname FROM pg_index x JOIN pg_class i ON i.oid = x.indexrelid
           WHERE x.indrelid = ('public.' || p_tabla)::regclass AND x.indisunique AND NOT x.indisprimary
             AND x.indkey::TEXT = col::TEXT
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', r.relname);
  END LOOP;
  EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS %I ON public.%I (sucursal_id, %I)',
                 p_tabla || '_' || p_columna || '_por_sucursal', p_tabla, p_columna);
END $$;

-- ---------- 4. sucursal_id + filtro automático en las tablas operativas ----------
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'mesas', 'reservaciones', 'visitas', 'tickets', 'ventas', 'limites_cortesias_rp',
    'cortesias', 'meseros', 'hostess', 'emergencias', 'fila_espera',
    'calificaciones_hostess', 'calificaciones_clientes', 'encuestas', 'mesas_clientes'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      RAISE NOTICE 'Tabla % no existe, se omite', t;
      CONTINUE;
    END IF;

    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS sucursal_id TEXT', t);
    -- Todo lo que ya existe es de León
    EXECUTE format('UPDATE public.%I SET sucursal_id = ''leon'' WHERE sucursal_id IS NULL', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN sucursal_id SET DEFAULT public.fever_sucursal_nueva()', t);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN sucursal_id SET NOT NULL', t);
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = t || '_sucursal_fk') THEN
      EXECUTE format('ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(id)', t, t || '_sucursal_fk');
    END IF;
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (sucursal_id)', 'idx_' || t || '_sucursal', t);

    -- Mismo acceso que hoy (abierto para la app) + filtro obligatorio por sucursal
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = t AND policyname = 'fever_acceso_app') THEN
      EXECUTE format('CREATE POLICY fever_acceso_app ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t);
    END IF;
    EXECUTE format('DROP POLICY IF EXISTS fever_por_sucursal ON public.%I', t);
    EXECUTE format(
      'CREATE POLICY fever_por_sucursal ON public.%I AS RESTRICTIVE FOR ALL TO anon, authenticated
         USING (public.fever_sucursal_vista() = ''todas'' OR sucursal_id = public.fever_sucursal_vista())
         WITH CHECK (public.fever_sucursal_vista() = ''todas'' OR sucursal_id = public.fever_sucursal_vista())', t);
  END LOOP;
END $$;

-- ---------- 5. Unicidad por sucursal ----------
SELECT public.fever_unico_por_sucursal('mesas', 'numero');
SELECT public.fever_unico_por_sucursal('limites_cortesias_rp', 'rp_nombre');
SELECT public.fever_unico_por_sucursal('limites_cortesias_rp', 'abreviatura');

-- Abreviaturas de hasta 4 letras (Aguascalientes usa APE, JPM)
SELECT public.fever_cambiar_tipo('limites_cortesias_rp', 'abreviatura', 'VARCHAR(4)');
SELECT public.fever_cambiar_tipo('reservaciones', 'rp_abreviatura', 'VARCHAR(4)');

-- ---------- 6. Mesas de Aguascalientes (mismo plano que León) ----------
INSERT INTO public.mesas (numero, capacidad, estado, sucursal_id)
SELECT numero, capacidad, 'disponible', 'ags'
FROM public.mesas
WHERE sucursal_id = 'leon'
ON CONFLICT (sucursal_id, numero) DO NOTHING;

-- ---------- 7. RPs de Aguascalientes ----------
-- Mismos límites de cortesías que León. Contraseña: iniciales en minúscula + "ags2026".
INSERT INTO public.limites_cortesias_rp (
  rp_nombre, abreviatura, password, activo, sucursal_id,
  shots_disponibles, shots_usados, shots_bienvenida_disponibles, shots_bienvenida_usados,
  perlas_negras_disponibles, perlas_negras_usadas, descuento_botella_disponible, descuento_botella_usado,
  periodo_inicio, abreviatura_asignada_por, fecha_abreviatura_asignada
)
SELECT v.nombre, v.abreviatura, lower(v.abreviatura) || 'ags2026', true, 'ags',
       5, 0, 10, 0, 3, 0, 1, 0,
       current_date, 'Alta sucursal Aguascalientes', now()
FROM (VALUES
  ('Diego Pérez', 'DP'), ('Grecia Alvarez', 'GA'), ('Dana Diaz', 'DD'), ('Alex Montoya', 'AM'),
  ('Armando Guel', 'AG'), ('Diana Márquez', 'DM'), ('Montse Curiel', 'MC'), ('Ana Paola Espinosa', 'APE'),
  ('Diego Silva', 'DS'), ('Isabella de Luna', 'ID'), ('Natalia Ru', 'NR'), ('Alessandro Cahue', 'AC'),
  ('Santiago Silva', 'SS'), ('Charlie Hernández', 'CH'), ('Paloma López', 'PL'), ('Aglaé Ramírez', 'AR'),
  ('Juan Pablo Mozo', 'JPM'), ('Mónica Gaytán', 'MG'), ('Rosendo Castañeda', 'RC')
) AS v(nombre, abreviatura)
ON CONFLICT (sucursal_id, rp_nombre) DO NOTHING;

-- ---------- 8. Las vistas respetan la sucursal de quien consulta ----------
DO $$
DECLARE v TEXT;
BEGIN
  FOREACH v IN ARRAY ARRAY[
    'vista_stats_socios', 'vista_metricas_rps', 'vista_mesas_rp_periodo', 'vista_fevershop_stats',
    'vista_cortesias_notificar', 'vista_conversion_rps', 'vista_reservaciones_rp',
    'vista_rendimiento_por_abreviatura', 'vista_distribucion_reservaciones'
  ] LOOP
    IF to_regclass('public.' || v) IS NOT NULL THEN
      EXECUTE format('ALTER VIEW public.%I SET (security_invoker = on)', v);
    END IF;
  END LOOP;
END $$;

-- ---------- 9. Que la API vea los cambios de inmediato ----------
NOTIFY pgrst, 'reload schema';

-- ---------- 10. Verificación ----------
SELECT 'mesas' AS tabla, sucursal_id, count(*) FROM public.mesas GROUP BY sucursal_id
UNION ALL
SELECT 'rps', sucursal_id, count(*) FROM public.limites_cortesias_rp GROUP BY sucursal_id
UNION ALL
SELECT 'reservaciones', sucursal_id, count(*) FROM public.reservaciones GROUP BY sucursal_id
ORDER BY tabla, sucursal_id;
