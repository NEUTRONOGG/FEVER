# Fix: Error en Script SQL Biométrico

## ❌ Error Original
```
ERROR: 42703: column "telefono" does not exist
LINE 90: telefono,
```

## 🔍 Causa del Error

La tabla `limites_cortesias_rp` tiene la siguiente estructura:

```sql
CREATE TABLE limites_cortesias_rp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  -- UUID, no INTEGER
  rp_nombre TEXT NOT NULL UNIQUE,
  shots_disponibles INTEGER DEFAULT 5,
  shots_usados INTEGER DEFAULT 0,
  -- ... otros campos de cortesías
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
  -- NO tiene columna "telefono"
);
```

El script SQL original intentaba:
1. Usar `INTEGER` para `p_rp_id` (debería ser `UUID`)
2. Consultar columna `telefono` que no existe

## ✅ Correcciones Aplicadas

### 1. Tipo de ID Corregido
**Antes:**
```sql
CREATE OR REPLACE FUNCTION registrar_biometric_rp(
  p_rp_id INTEGER,  -- ❌ Incorrecto
  p_credential JSONB
)
```

**Después:**
```sql
CREATE OR REPLACE FUNCTION registrar_biometric_rp(
  p_rp_id UUID,  -- ✅ Correcto
  p_credential JSONB
)
```

### 2. Columna Telefono Eliminada
**Antes:**
```sql
SELECT 
  id,
  rp_nombre,
  telefono,  -- ❌ No existe
  biometric_enabled,
  biometric_registered_at
FROM limites_cortesias_rp
```

**Después:**
```sql
SELECT 
  id,
  rp_nombre,
  biometric_enabled,
  biometric_registered_at
FROM limites_cortesias_rp
```

### 3. Componente BiometricAuth Actualizado
Se agregó el campo `biometric_registered_at` en el update:

```typescript
const { error: dbError } = await supabase
  .from('limites_cortesias_rp')
  .update({ 
    biometric_credential: credentialData,
    biometric_enabled: true,
    biometric_registered_at: new Date().toISOString()  // ✅ Agregado
  })
  .eq('id', rpId)
```

## 📋 Archivos Corregidos

1. **AGREGAR-BIOMETRIC-RPS.sql**
   - Función `registrar_biometric_rp()` - UUID en lugar de INTEGER
   - Función `desactivar_biometric_rp()` - UUID en lugar de INTEGER
   - Consultas de verificación - Eliminada columna telefono

2. **components/BiometricAuth.tsx**
   - Agregado campo `biometric_registered_at` en update
   - Tipo `rpId` ya era string (compatible con UUID)

## 🚀 Cómo Ejecutar Ahora

### Opción 1: Ejecutar Script Completo
```bash
# En Supabase SQL Editor
# Copiar y pegar todo el contenido de AGREGAR-BIOMETRIC-RPS.sql
```

### Opción 2: Ejecutar por Partes
```sql
-- 1. Agregar columnas
ALTER TABLE limites_cortesias_rp 
ADD COLUMN IF NOT EXISTS biometric_credential JSONB,
ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biometric_registered_at TIMESTAMP WITH TIME ZONE;

-- 2. Crear índice
CREATE INDEX IF NOT EXISTS idx_rp_biometric_enabled 
ON limites_cortesias_rp(biometric_enabled) 
WHERE biometric_enabled = TRUE;

-- 3. Crear funciones (copiar del script)
-- ...
```

## ✅ Verificación

Después de ejecutar el script, verificar:

```sql
-- 1. Verificar que las columnas existen
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'limites_cortesias_rp' 
  AND column_name LIKE 'biometric%';

-- Resultado esperado:
-- biometric_credential    | jsonb
-- biometric_enabled       | boolean
-- biometric_registered_at | timestamp with time zone

-- 2. Verificar RPs existentes
SELECT 
  id,
  rp_nombre,
  biometric_enabled,
  biometric_registered_at
FROM limites_cortesias_rp
WHERE activo = TRUE
ORDER BY rp_nombre;

-- 3. Probar función de registro
SELECT registrar_biometric_rp(
  'uuid-del-rp'::UUID,
  '{"test": "data"}'::JSONB
);
```

## 📝 Notas Importantes

### Estructura de ID
- La tabla usa **UUID** generado automáticamente
- El componente React recibe el ID como **string**
- Supabase convierte automáticamente string → UUID

### Ejemplo de ID
```typescript
// En el componente
rpId = "550e8400-e29b-41d4-a716-446655440000" // string

// En SQL
id = '550e8400-e29b-41d4-a716-446655440000'::UUID
```

### Campos de la Tabla
```sql
-- Campos existentes (no modificar)
id UUID
rp_nombre TEXT
shots_disponibles INTEGER
shots_usados INTEGER
descuento_botella_disponible INTEGER
descuento_botella_usado INTEGER
perlas_negras_disponibles INTEGER
perlas_negras_usadas INTEGER
shots_bienvenida_disponibles INTEGER
shots_bienvenida_usados INTEGER
periodo_inicio DATE
periodo_fin DATE
activo BOOLEAN
created_at TIMESTAMP
updated_at TIMESTAMP
password TEXT  -- Agregado en otro script

-- Campos nuevos (biométricos)
biometric_credential JSONB
biometric_enabled BOOLEAN
biometric_registered_at TIMESTAMP WITH TIME ZONE
```

## 🎯 Próximos Pasos

1. ✅ Ejecutar script SQL corregido
2. ✅ Verificar que las columnas se crearon
3. ✅ Probar registro de Face ID en iPhone
4. ✅ Verificar que se guarda en BD
5. ✅ Probar login con Face ID

---

**Estado:** ✅ Corregido  
**Fecha:** Octubre 2025  
**Versión Script:** 1.1
