-- Habilita Supabase Realtime para la tabla mesas
-- Necesario para que el Mapa 3D del panel Hostess se actualice al instante
-- (sin esto sigue funcionando, pero se refresca cada 5 segundos).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'mesas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mesas;
  END IF;
END $$;

-- Verificar
SELECT schemaname, tablename FROM pg_publication_tables
WHERE pubname = 'supabase_realtime' AND tablename = 'mesas';
