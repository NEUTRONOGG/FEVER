-- ============================================
-- TABLA DE EMERGENCIAS EN TIEMPO REAL
-- ============================================
-- Esta tabla almacena las emergencias reportadas por el personal de Cadena
-- y permite notificaciones en tiempo real a todos los usuarios conectados

-- 1. Crear la tabla de emergencias
CREATE TABLE IF NOT EXISTS public.emergencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('emergencia', 'pelea_interna', 'pelea_externa', 'fiscalizacion')),
    mensaje TEXT NOT NULL,
    reportado_por TEXT NOT NULL,
    ubicacion TEXT DEFAULT 'Entrada Principal',
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_emergencias_activa ON public.emergencias(activa);
CREATE INDEX IF NOT EXISTS idx_emergencias_created_at ON public.emergencias(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergencias_tipo ON public.emergencias(tipo);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.emergencias ENABLE ROW LEVEL SECURITY;

-- 4. Crear políticas de acceso
-- Permitir a todos los usuarios autenticados leer emergencias activas
CREATE POLICY "Todos pueden ver emergencias activas"
    ON public.emergencias
    FOR SELECT
    USING (true);

-- Permitir a todos los usuarios autenticados insertar emergencias
CREATE POLICY "Todos pueden crear emergencias"
    ON public.emergencias
    FOR INSERT
    WITH CHECK (true);

-- Permitir a todos los usuarios autenticados actualizar emergencias
CREATE POLICY "Todos pueden actualizar emergencias"
    ON public.emergencias
    FOR UPDATE
    USING (true);

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.emergencias;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.emergencias
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Habilitar Realtime para la tabla (IMPORTANTE)
-- Esto permite que los cambios se transmitan en tiempo real a todos los clientes conectados
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergencias;

-- 8. Insertar una emergencia de prueba (opcional)
INSERT INTO public.emergencias (tipo, mensaje, reportado_por, ubicacion, activa)
VALUES ('pelea_interna', '🚨 PELEA INTERNA REPORTADA - PRUEBA', 'Sistema', 'Entrada Principal', true);

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ejecuta esta consulta para verificar que la tabla se creó correctamente:
SELECT * FROM public.emergencias ORDER BY created_at DESC LIMIT 5;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Asegúrate de habilitar Realtime en el dashboard de Supabase:
--    - Ve a Database > Replication
--    - Habilita Realtime para la tabla 'emergencias'
--
-- 2. Los tipos de emergencia disponibles son:
--    - 'emergencia': Emergencia general
--    - 'pelea_interna': Pelea dentro del local
--    - 'pelea_externa': Pelea fuera del local
--    - 'fiscalizacion': Inspección de autoridades
--
-- 3. El campo 'activa' se usa para marcar si la emergencia ya fue vista/resuelta
--
-- 4. Las notificaciones se envían automáticamente a todos los usuarios conectados
--    cuando se inserta una nueva emergencia con activa=true
