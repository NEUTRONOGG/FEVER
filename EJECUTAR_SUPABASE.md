# 🚀 Activar Supabase - Paso a Paso

## ⚠️ IMPORTANTE
Actualmente el sistema usa **localStorage**. Para que las ventas aparezcan en el Dashboard, necesitas ejecutar el schema SQL en Supabase.

---

## 📋 Pasos para Activar Supabase

### Paso 1: Acceder a Supabase (1 minuto)

1. **Abre tu navegador** en: https://supabase.com/dashboard

2. **Inicia sesión** con tu cuenta

3. **Selecciona tu proyecto**: `raaxzhyhasvrmeekcydp`
   - Si no lo ves, búscalo en la lista de proyectos

---

### Paso 2: Abrir SQL Editor (30 segundos)

1. En el menú lateral izquierdo, busca **"SQL Editor"**

2. Click en **"SQL Editor"**

3. Click en el botón **"New query"** o **"Nueva consulta"**

---

### Paso 3: Copiar el Schema SQL (1 minuto)

1. **Abre el archivo** `supabase-schema.sql` en tu editor de código

2. **Selecciona TODO el contenido** (Ctrl+A o Cmd+A)

3. **Copia** el contenido (Ctrl+C o Cmd+C)

---

### Paso 4: Ejecutar el Schema (1 minuto)

1. **Pega** el contenido en el SQL Editor de Supabase

2. **Click en el botón "Run"** o **"Ejecutar"** (esquina inferior derecha)

3. **Espera** a que termine (debería tomar 5-10 segundos)

4. **Verifica** que aparezca un mensaje de éxito

---

### Paso 5: Verificar las Tablas (30 segundos)

1. En el menú lateral, ve a **"Table Editor"**

2. **Deberías ver 3 tablas:**
   - ✅ `productos` (12 productos)
   - ✅ `ventas` (vacía)
   - ✅ `mesas` (12 mesas)

3. **Click en "productos"** para verificar que hay datos

---

## ✅ Verificación Rápida

Después de ejecutar el schema, verifica:

```bash
# En tu terminal, ejecuta:
node test-supabase.js
```

Deberías ver:
```
✅ Conexión exitosa a Supabase!
✅ La tabla "productos" existe
✅ Hay 12 productos en la base de datos
```

---

## 🔄 Después de Ejecutar el Schema

### El sistema ahora:

1. **Guardará las ventas en Supabase** (no en localStorage)
2. **Mostrará las ventas en el Dashboard** inmediatamente
3. **Actualizará el inventario en la base de datos**
4. **Sincronizará entre múltiples dispositivos**

### Para probar:

1. **Recarga la página** del sistema (F5)
2. **Haz una venta** como Mesero
3. **Ve al Dashboard** como Administrador
4. **Verifica** que la venta aparece en "Ventas"

---

## 🐛 Si Algo Sale Mal

### Error: "relation does not exist"
**Solución:** El schema no se ejecutó correctamente
- Verifica que copiaste TODO el contenido de `supabase-schema.sql`
- Ejecuta el script completo de nuevo

### Error: "permission denied"
**Solución:** Problema con las políticas RLS
- El schema incluye las políticas necesarias
- Ejecuta el script completo de nuevo

### Las ventas no aparecen
**Solución:** 
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Si ves "Supabase no disponible", verifica la conexión

---

## 📊 Contenido del Schema SQL

El script crea:

### Tablas
- `productos`: Catálogo de productos con stock
- `ventas`: Registro de ventas con consumo individual
- `mesas`: Estado en tiempo real de las mesas

### Datos Iniciales
- 12 productos (comida y bebidas)
- 12 mesas (capacidad 2-8 personas)

### Índices
- Para mejorar el rendimiento de búsquedas

### Políticas RLS
- Permisos para leer/escribir datos

---

## ⚡ Modo Híbrido (Actual)

El sistema está configurado en **modo híbrido**:

1. **Intenta usar Supabase** primero
2. **Si falla, usa localStorage** como respaldo

Esto significa:
- ✅ El sistema funciona aunque Supabase no esté configurado
- ✅ Una vez configures Supabase, usará la base de datos
- ✅ No pierdes funcionalidad mientras configuras

---

## 🎯 Próximo Paso

**EJECUTA EL SCHEMA SQL EN SUPABASE AHORA**

1. Ve a https://supabase.com/dashboard
2. SQL Editor
3. Pega el contenido de `supabase-schema.sql`
4. Click en Run
5. ¡Listo!

---

**Tiempo total: ~5 minutos**

Una vez hecho esto, todas las ventas se guardarán en Supabase y aparecerán en el Dashboard.
