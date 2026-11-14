-- =====================================================
-- RESERVACIONES: niños y niñas OPCIONALES
-- Corrige el error "columna numero_ninas no encontrada" al crear reservaciones.
-- Algo en la base (un disparador) lee numero_ninos / numero_ninas, pero las
-- columnas no existían. Se crean opcionales con 0 por defecto: nadie tiene que
-- capturarlas. Se puede correr varias veces sin problema.
-- Ejecutar en Supabase → SQL Editor
-- =====================================================

ALTER TABLE public.reservaciones ADD COLUMN IF NOT EXISTS numero_ninos INTEGER DEFAULT 0;
ALTER TABLE public.reservaciones ADD COLUMN IF NOT EXISTS numero_ninas INTEGER DEFAULT 0;

-- Opcionales de verdad: sin obligatorio y con 0 cuando no se mandan
ALTER TABLE public.reservaciones ALTER COLUMN numero_ninos DROP NOT NULL;
ALTER TABLE public.reservaciones ALTER COLUMN numero_ninas DROP NOT NULL;
ALTER TABLE public.reservaciones ALTER COLUMN numero_ninos SET DEFAULT 0;
ALTER TABLE public.reservaciones ALTER COLUMN numero_ninas SET DEFAULT 0;

UPDATE public.reservaciones
SET numero_ninos = COALESCE(numero_ninos, 0),
    numero_ninas = COALESCE(numero_ninas, 0)
WHERE numero_ninos IS NULL OR numero_ninas IS NULL;

-- Que la API de Supabase vea las columnas nuevas de inmediato
NOTIFY pgrst, 'reload schema';

-- Diagnóstico: disparadores de la tabla reservaciones (el que pedía numero_ninas aparece aquí)
SELECT t.tgname AS disparador, p.proname AS funcion
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE t.tgrelid = 'public.reservaciones'::regclass AND NOT t.tgisinternal;
