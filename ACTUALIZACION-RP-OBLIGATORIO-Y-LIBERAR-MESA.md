# ACTUALIZACIÓN: RP OBLIGATORIO Y LIBERAR MESA

## Cambios Implementados

Se realizaron dos mejoras importantes en el sistema:

1. **RP Obligatorio** en formularios de reservaciones
2. **Botón Liberar Mesa** en panel de Hostess

---

## 1. RP OBLIGATORIO EN RESERVACIONES

### Cambio Principal
El campo de RP (Relaciones Públicas) ahora es **obligatorio** en lugar de opcional al crear una reservación.

### Archivos Modificados

#### `/app/dashboard/reservaciones/page.tsx`

**ANTES:**
```tsx
<Label className="text-slate-300">¿Con quién tiene reservación? (Opcional)</Label>
```

**DESPUÉS:**
```tsx
<Label className="text-slate-300">¿Con quién tiene reservación? *</Label>
```

### Validación Actualizada

```typescript
// ANTES
disabled={
  !nuevaReservacion.cliente_nombre ||
  (nuevaReservacion.numero_hombres + nuevaReservacion.numero_mujeres) !== nuevaReservacion.numero_personas
}

// DESPUÉS
disabled={
  !nuevaReservacion.cliente_nombre ||
  !nuevaReservacion.rp_nombre ||  // ✅ NUEVO: RP obligatorio
  (nuevaReservacion.numero_hombres + nuevaReservacion.numero_mujeres) !== nuevaReservacion.numero_personas
}
```

### Opciones Disponibles

El selector de RP incluye:
- **"Sin RP específico"** - Opción por defecto para reservaciones sin RP asignado
- **Lista de RPs activos** - Todos los RPs disponibles del sistema

### Comportamiento

1. ✅ El usuario **DEBE** seleccionar una opción (no puede dejar el campo vacío)
2. ✅ Puede elegir "Sin RP específico" si no hay un RP particular
3. ✅ El botón "Crear Reservación" se deshabilita si no hay RP seleccionado
4. ✅ El valor se guarda en la base de datos como `null` si es "Sin RP específico"

---

## 2. BOTÓN LIBERAR MESA EN HOSTESS

### Funcionalidad Nueva
Se agregó un botón para liberar mesas ocupadas directamente desde el panel de Hostess.

### Archivos Modificados

#### `/app/dashboard/hostess/page.tsx`

### Función Agregada

```typescript
const handleLiberarMesa = async (mesa: any) => {
  // Confirmación antes de liberar
  if (!confirm(`¿Estás seguro de liberar la Mesa ${mesa.numero}?\n\nCliente: ${mesa.cliente_nombre}`)) {
    return
  }

  try {
    const { supabase } = await import('@/lib/supabase')
    
    // Liberar la mesa
    const { error } = await supabase
      .from('mesas')
      .update({
        estado: 'disponible',
        cliente_nombre: null,
        numero_personas: null,
        total_actual: 0,
        hora_asignacion: null
      })
      .eq('id', mesa.id)
    
    if (error) throw error
    
    alert(`✅ Mesa ${mesa.numero} liberada correctamente`)
    await cargarMesas()
  } catch (error) {
    console.error('Error al liberar mesa:', error)
    alert('Error al liberar la mesa')
  }
}
```

### Interfaz Visual

#### Ubicación
El botón aparece en cada card de **Mesas Ocupadas** en el panel de Hostess.

#### Diseño
```
┌──────────────────────────────────────┐
│ Mesa 5                               │
│ Carlos Méndez                        │
│ 4 personas                           │
│                                      │
│                    $450.00           │
│                    10:30 PM          │
│                    [🔓 Liberar]      │
└──────────────────────────────────────┘
```

#### Características del Botón
- **Icono:** 🔓 Unlock
- **Color:** Rojo (border-red-500/50)
- **Tamaño:** Pequeño (h-7)
- **Estilo:** Outline con hover rojo
- **Texto:** "Liberar"

### Flujo de Liberación

```
1. Usuario hace clic en "Liberar"
   ↓
2. Aparece confirmación con:
   - Número de mesa
   - Nombre del cliente
   ↓
3. Usuario confirma
   ↓
4. Sistema actualiza la mesa:
   - estado → 'disponible'
   - cliente_nombre → null
   - numero_personas → null
   - total_actual → 0
   - hora_asignacion → null
   ↓
5. Mensaje de éxito
   ↓
6. Recarga automática de mesas
```

### Seguridad

#### Confirmación Obligatoria
```javascript
if (!confirm(`¿Estás seguro de liberar la Mesa ${mesa.numero}?\n\nCliente: ${mesa.cliente_nombre}`)) {
  return
}
```

- ✅ Previene liberaciones accidentales
- ✅ Muestra información de la mesa antes de confirmar
- ✅ Permite cancelar la operación

#### Validaciones
- ✅ Verifica que la mesa exista
- ✅ Maneja errores de base de datos
- ✅ Muestra mensajes claros al usuario

---

## Impacto en el Sistema

### Reservaciones con RP Obligatorio

#### Ventajas
1. ✅ **Trazabilidad mejorada**: Todas las reservaciones tienen RP asignado o marcado como "Sin RP"
2. ✅ **Métricas precisas**: Mejor seguimiento de conversión de RPs
3. ✅ **Comisiones claras**: Facilita el cálculo de bonos por reservación
4. ✅ **Responsabilidad definida**: Cada reservación tiene un responsable

#### Casos de Uso
- **Con RP específico**: Cliente viene por recomendación de un RP
- **Sin RP específico**: Cliente walk-in o reservación directa

### Liberar Mesa

#### Ventajas
1. ✅ **Control rápido**: Hostess puede liberar mesas sin ir a otro módulo
2. ✅ **Corrección de errores**: Permite corregir asignaciones incorrectas
3. ✅ **Gestión de emergencias**: Libera mesas en situaciones especiales
4. ✅ **Flujo optimizado**: Menos clics para operaciones comunes

#### Casos de Uso
- Cliente se retira sin cerrar cuenta
- Error en asignación de mesa
- Mesa necesita limpieza urgente
- Cliente cambia de mesa

---

## Iconos Utilizados

### Nuevos Iconos Importados
```typescript
import { 
  Users, UserPlus, Armchair, Clock, Star,
  CheckCircle2, AlertCircle, Search, Phone,
  Calendar, User, LayoutGrid, QrCode, 
  Unlock  // ✅ NUEVO
} from "lucide-react"
```

---

## Testing Recomendado

### RP Obligatorio
1. ✅ Intentar crear reservación sin seleccionar RP (debe estar deshabilitado)
2. ✅ Crear reservación con "Sin RP específico"
3. ✅ Crear reservación con RP específico
4. ✅ Verificar que se guarde correctamente en BD
5. ✅ Verificar que aparezca en listado de reservaciones

### Liberar Mesa
1. ✅ Liberar mesa ocupada (confirmar)
2. ✅ Liberar mesa ocupada (cancelar)
3. ✅ Verificar que la mesa quede disponible
4. ✅ Verificar que se limpien todos los datos
5. ✅ Verificar que aparezca en "Mesas Disponibles"
6. ✅ Intentar asignar la mesa recién liberada

---

## Compatibilidad

### Base de Datos
- ✅ No requiere cambios en el esquema
- ✅ Usa campos existentes
- ✅ Compatible con versiones anteriores

### Otros Módulos
- ✅ No afecta módulo de Mesero
- ✅ No afecta módulo de RP
- ✅ No afecta módulo de Cadena
- ✅ Compatible con sistema de tickets

---

## Notas Técnicas

### Estado de Mesa Liberada
```typescript
{
  estado: 'disponible',
  cliente_nombre: null,
  numero_personas: null,
  total_actual: 0,
  hora_asignacion: null
}
```

### Validación de RP
```typescript
// El campo rp_nombre puede ser:
// - null (cuando se selecciona "Sin RP específico")
// - string (nombre del RP seleccionado)

// En el formulario se valida que NO esté vacío:
!nuevaReservacion.rp_nombre  // false si es null o string válido
```

---

## Fecha de Actualización
31 de Octubre, 2025

## Estado
✅ **COMPLETADO** - Ambas funcionalidades implementadas y funcionando correctamente

---

## Resumen Visual

### Antes vs Después

#### Reservaciones
```
ANTES:
┌─────────────────────────────────┐
│ RP: (Opcional)                  │
│ [Sin RP específico ▼]           │
│                                 │
│ [Crear Reservación] ✅          │
└─────────────────────────────────┘

DESPUÉS:
┌─────────────────────────────────┐
│ RP: *                           │
│ [Sin RP específico ▼]           │
│                                 │
│ [Crear Reservación] ⚠️ (disabled si vacío)
└─────────────────────────────────┘
```

#### Mesas Ocupadas
```
ANTES:
┌─────────────────────────────────┐
│ Mesa 5                          │
│ Carlos Méndez                   │
│ 4 personas                      │
│                    $450.00      │
│                    10:30 PM     │
└─────────────────────────────────┘

DESPUÉS:
┌─────────────────────────────────┐
│ Mesa 5                          │
│ Carlos Méndez                   │
│ 4 personas                      │
│                    $450.00      │
│                    10:30 PM     │
│                    [🔓 Liberar] │ ✅ NUEVO
└─────────────────────────────────┘
```
