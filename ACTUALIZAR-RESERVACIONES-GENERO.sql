-- ============================================
-- ACTUALIZAR TABLA RESERVACIONES
-- Agregar campos para cantidad de hombres y mujeres
-- ============================================

-- 1. Agregar columnas para número de hombres y mujeres
ALTER TABLE public.reservaciones 
ADD COLUMN IF NOT EXISTS numero_hombres INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS numero_mujeres INTEGER DEFAULT 0;

-- 2. Agregar comentarios a las columnas
COMMENT ON COLUMN public.reservaciones.numero_hombres IS 'Cantidad de hombres en la reservación';
COMMENT ON COLUMN public.reservaciones.numero_mujeres IS 'Cantidad de mujeres en la reservación';

-- 3. Opcional: Eliminar la columna de teléfono si ya no se usa
-- DESCOMENTAR LA SIGUIENTE LÍNEA SI QUIERES ELIMINAR EL CAMPO TELÉFONO:
-- ALTER TABLE public.reservaciones DROP COLUMN IF EXISTS cliente_telefono;

-- 4. Verificar la estructura actualizada
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'reservaciones' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Actualizar reservaciones existentes (opcional)
-- Si tienes reservaciones antiguas y quieres distribuir las personas:
-- UPDATE public.reservaciones 
-- SET 
--     numero_hombres = FLOOR(numero_personas / 2),
--     numero_mujeres = CEIL(numero_personas / 2)
-- WHERE numero_hombres = 0 AND numero_mujeres = 0;

-- ============================================
-- VERIFICACIÓN
-- ============================================
-- Ver las últimas reservaciones con los nuevos campos:
SELECT 
    id,
    cliente_nombre,
    fecha,
    hora,
    numero_personas,
    numero_hombres,
    numero_mujeres,
    rp_nombre,
    estado,
    created_at
FROM public.reservaciones 
ORDER BY created_at DESC 
LIMIT 10;

-- ============================================
-- NOTAS
-- ============================================
-- 1. Las columnas se crean con valor por defecto 0
-- 2. El campo cliente_telefono se mantiene en la tabla pero ya no se usa en los formularios de RPs y Hostess
-- 3. Los valores pueden ser 0 si no se especifican al crear la reservación
-- 4. La suma de numero_hombres + numero_mujeres puede ser diferente a numero_personas
--    (por ejemplo, si hay niños o no se especifica el género)
