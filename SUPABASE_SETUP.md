# 🚀 Configuración de Supabase para FEVER CRM/POS

## ✅ Credenciales Configuradas

Las credenciales de Supabase ya están integradas en el sistema:
- **URL**: `https://raaxzhyhasvrmeekcydp.supabase.co`
- **Anon Key**: Configurada en `/lib/supabase.ts`

## 📋 Pasos para Activar Supabase

### 1. Acceder a Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto: `raaxzhyhasvrmeekcydp`

### 2. Crear las Tablas
1. En el panel de Supabase, ve a **SQL Editor**
2. Copia todo el contenido del archivo `supabase-schema.sql`
3. Pégalo en el editor SQL
4. Click en **Run** para ejecutar el script

Esto creará:
- ✅ Tabla `productos` con inventario inicial
- ✅ Tabla `ventas` para registrar ventas
- ✅ Tabla `mesas` para estado en tiempo real
- ✅ Índices para mejor rendimiento
- ✅ Políticas de seguridad (RLS)

### 3. Verificar las Tablas
1. Ve a **Table Editor** en Supabase
2. Deberías ver 3 tablas:
   - `productos` (12 productos iniciales)
   - `ventas` (vacía)
   - `mesas` (12 mesas disponibles)

## 🔄 Migración de Datos Locales a Supabase

El sistema actualmente usa `localStorage`. Para migrar a Supabase:

### Opción A: Migración Automática (Recomendada)
El sistema puede funcionar en modo híbrido:
- Usa Supabase cuando esté disponible
- Fallback a localStorage si hay problemas de conexión

### Opción B: Solo Supabase
Para usar únicamente Supabase, actualiza los archivos:
- `/app/pos/page.tsx` - Usar funciones de `supabase-helpers.ts`
- `/app/dashboard/ventas/page.tsx` - Cargar ventas desde Supabase
- `/app/dashboard/inventario/page.tsx` - Sincronizar con Supabase

## 🎯 Ventajas de Usar Supabase

### ✅ Sincronización en Tiempo Real
- Múltiples meseros pueden trabajar simultáneamente
- Los cambios se reflejan instantáneamente
- El administrador ve las ventas en tiempo real

### ✅ Persistencia de Datos
- Los datos no se pierden al cerrar el navegador
- Backup automático en la nube
- Acceso desde cualquier dispositivo

### ✅ Escalabilidad
- Soporta múltiples usuarios concurrentes
- Base de datos PostgreSQL robusta
- API REST automática

## 🔧 Integración Paso a Paso

### 1. Actualizar POS para Usar Supabase

Modifica `/app/pos/page.tsx`:

```typescript
import { getProductosFromDB, guardarMesaDB, registrarVentaDB, limpiarMesaDB } from '@/lib/supabase-helpers'

// Al cargar productos
useEffect(() => {
  async function cargarProductos() {
    const productos = await getProductosFromDB()
    setProductos(productos)
  }
  cargarProductos()
}, [])

// Al guardar mesa
const mesaActualizada = { ...mesaActual, clientes: [...] }
await guardarMesaDB(mesaActualizada)

// Al cerrar mesa
await registrarVentaDB(venta)
await limpiarMesaDB(mesaActual.numero)
```

### 2. Actualizar Ventas para Usar Supabase

Modifica `/app/dashboard/ventas/page.tsx`:

```typescript
import { getVentasFromDB } from '@/lib/supabase-helpers'

useEffect(() => {
  async function cargarVentas() {
    const ventas = await getVentasFromDB()
    setVentas(ventas)
  }
  cargarVentas()
}, [])
```

### 3. Actualizar Inventario para Usar Supabase

Modifica `/app/dashboard/inventario/page.tsx`:

```typescript
import { getProductosFromDB, actualizarStockDB } from '@/lib/supabase-helpers'

useEffect(() => {
  async function cargarProductos() {
    const productos = await getProductosFromDB()
    setProductos(productos)
  }
  cargarProductos()
}, [])
```

## 🔐 Seguridad

### Row Level Security (RLS)
Las políticas actuales permiten acceso completo para desarrollo.

Para producción, actualiza las políticas en Supabase:

```sql
-- Solo meseros pueden insertar ventas
CREATE POLICY "Meseros pueden insertar ventas" ON ventas
  FOR INSERT WITH CHECK (auth.role() = 'mesero');

-- Solo gerentes pueden ver todas las ventas
CREATE POLICY "Gerentes pueden ver ventas" ON ventas
  FOR SELECT USING (auth.role() = 'gerente');
```

## 📊 Monitoreo

En Supabase puedes:
1. Ver logs de consultas en **Logs**
2. Monitorear uso en **Usage**
3. Configurar alertas en **Settings**

## 🚀 Estado Actual

- ✅ Supabase configurado
- ✅ Schema SQL listo
- ✅ Funciones helper creadas
- ⏳ Pendiente: Ejecutar schema en Supabase
- ⏳ Pendiente: Actualizar componentes para usar Supabase

## 📝 Próximos Pasos

1. **Ejecutar el schema SQL** en Supabase
2. **Probar la conexión** desde el sistema
3. **Migrar componentes** uno por uno
4. **Probar sincronización** en tiempo real
5. **Configurar autenticación** real de usuarios

## 💡 Modo Híbrido (Recomendado para Empezar)

Puedes mantener ambos sistemas:
- **localStorage**: Para desarrollo y pruebas offline
- **Supabase**: Para producción y sincronización

El sistema detectará automáticamente cuál usar.

---

**¿Necesitas ayuda?** Revisa la documentación de Supabase: https://supabase.com/docs
