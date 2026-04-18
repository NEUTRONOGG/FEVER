# Integración: Sistema de Reservaciones de RPs

## Resumen de lo integrado

Se ha implementado un sistema completo de gestión de reservaciones de RPs con confirmación automática y panel de administración.

---

## 1. CONFIRMACIÓN AUTOMÁTICA (Ya existente)

### Ubicación: `/app/dashboard/hostess/page.tsx` (líneas 252-301)

Cuando la **Hostess marca una reserva como "llegada"**:

```typescript
// Actualización automática en Supabase
const { error: errorReserva } = await supabase
  .from('reservaciones')
  .update({ 
    estado: 'confirmada',        // ✅ Confirmada automáticamente
    asistio: true,               // ✅ Marca como asistió
    hora_llegada: new Date().toISOString(),  // ✅ Registra hora exacta
    mesa_asignada: parseInt(mesaSeleccionadaReserva.toString())
  })
  .eq('id', reservacionParaAsignar.id)
```

**Flujo:**
1. Hostess ve reservación pendiente
2. Hostess selecciona mesa disponible
3. Hostess confirma asistencia
4. Sistema actualiza automáticamente en Supabase:
   - Estado → `confirmada`
   - Asistió → `true`
   - Hora llegada → timestamp actual
   - Mesa asignada → número de mesa

---

## 2. RESERVACIONES DE RPs EN ASHTON (Ya existente)

### Ubicación: `/app/dashboard/socios/ashton/page.tsx` (líneas 98-123)

Ashton puede ver todas las reservaciones de la semana:

```typescript
const cargarReservasSemana = async () => {
  // Carga reservaciones del lunes al domingo
  const { data, error } = await supabase
    .from('reservaciones')
    .select('*')
    .gte('fecha', inicioSemana)
    .lte('fecha', finSemana)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })
}
```

**Características:**
- ✅ Ver todas las reservaciones de la semana
- ✅ Filtrar por RP (dropdown)
- ✅ Ver estado de cada reservación
- ✅ Ver si llegaron o no
- ✅ Ver mesa asignada
- ✅ Expandir/contraer por RP

---

## 3. PANEL DE ADMINISTRACIÓN (Nuevo)

### Ubicación: `/app/dashboard/reservaciones-rps/page.tsx`

**Ruta:** `/dashboard/reservaciones-rps`

**Acceso:** Agregado al sidebar del dashboard (línea 54 en `layout.tsx`)

### Características:

#### A. Estadísticas en tiempo real
- Total de reservaciones
- Pendientes (⏳)
- Confirmadas (✓)
- Completadas (✅)
- No asistió (✗)
- Canceladas (✗)

#### B. Filtros avanzados
- **Búsqueda por cliente** — Buscar por nombre
- **Filtro por RP** — Ver solo reservaciones de un RP específico
- **Filtro por estado** — Pendiente, Confirmada, Completada, No asistió, Cancelada

#### C. Tabla completa con columnas
| Columna | Descripción |
|---------|-------------|
| Cliente | Nombre del cliente |
| RP Asignado | Nombre del RP (badge púrpura) |
| Fecha | Fecha de la reservación |
| Hora | Hora de la reservación |
| Personas | Número de personas |
| Estado | Estado actual (badge coloreado) |
| Asistencia | ✅ Llegó / ❌ No llegó / ⏳ Pendiente |
| Mesa | Número de mesa asignada |
| Llegada | Hora exacta de llegada (si aplica) |

#### D. Sección de Notas
- Muestra todas las notas de reservaciones
- Agrupa por cliente y RP
- Útil para seguimiento especial

---

## 4. FLUJO COMPLETO

### Paso 1: Crear Reservación
- **Quién:** Hostess o RP
- **Dónde:** `/dashboard/reservaciones` o `/dashboard/rp`
- **Qué se registra:**
  - Cliente nombre
  - Fecha (automática)
  - Hora (automática)
  - Número de personas
  - RP asignado
  - Estado: `pendiente`

### Paso 2: Confirmar Asistencia (Hostess)
- **Dónde:** `/dashboard/hostess`
- **Acción:** Marcar "Llegó"
- **Actualización automática en Supabase:**
  ```
  estado: 'confirmada'
  asistio: true
  hora_llegada: <timestamp>
  mesa_asignada: <número>
  ```

### Paso 3: Ver en Ashton
- **Dónde:** `/dashboard/socios/ashton` → Pestaña "Reservas Semanales"
- **Qué ve:** Todas las reservaciones de la semana, agrupadas por RP
- **Información:** Estado, cliente, personas, mesa, hora llegada

### Paso 4: Administración
- **Dónde:** `/dashboard/reservaciones-rps`
- **Qué ve:** Todas las reservaciones con filtros avanzados
- **Análisis:** Estadísticas, confirmaciones, asistencias, notas

---

## 5. ESTRUCTURA DE DATOS EN SUPABASE

### Tabla: `reservaciones`

```sql
CREATE TABLE reservaciones (
  id UUID PRIMARY KEY,
  cliente_nombre VARCHAR(255),
  cliente_telefono VARCHAR(20),
  fecha DATE,
  hora TIME,
  numero_personas INTEGER,
  rp_nombre VARCHAR(255),           -- RP asignado
  estado VARCHAR(50),                -- pendiente, confirmada, completada, no_asistio, cancelada
  asistio BOOLEAN,                   -- true si llegó
  hora_llegada TIMESTAMP,            -- timestamp de llegada (auto)
  mesa_asignada INTEGER,             -- número de mesa
  notas TEXT,
  creado_por VARCHAR(255),
  creado_en TIMESTAMP
);
```

---

## 6. CONFIRMACIÓN AUTOMÁTICA - DETALLES TÉCNICOS

### Cuándo se confirma automáticamente:
✅ Cuando la **Hostess marca "Llegó"** en `/dashboard/hostess`

### Qué se actualiza:
1. `estado` → `'confirmada'`
2. `asistio` → `true`
3. `hora_llegada` → timestamp actual (ISO 8601)
4. `mesa_asignada` → número de mesa

### Dónde se refleja:
- ✅ En Ashton → Pestaña "Reservas Semanales" (estado = confirmada)
- ✅ En Admin → `/dashboard/reservaciones-rps` (badge azul "✓ Confirmada")
- ✅ En Supabase → Tabla `reservaciones` actualizada en tiempo real

---

## 7. ACCESO Y PERMISOS

| Rol | Acceso | Funciones |
|-----|--------|-----------|
| **Hostess** | `/dashboard/hostess` | Crear, confirmar asistencia, marcar no llegó |
| **RP** | `/dashboard/rp` | Crear reservaciones propias |
| **Ashton** | `/dashboard/socios/ashton` | Ver todas las reservaciones de RPs |
| **Admin** | `/dashboard/reservaciones-rps` | Ver, filtrar, analizar todas las reservaciones |

---

## 8. CÓMO USAR EL PANEL DE ADMINISTRACIÓN

### Acceso:
1. Ir a Dashboard Admin
2. Sidebar → "Reservaciones RPs"
3. URL: `/dashboard/reservaciones-rps`

### Filtrar:
- **Por RP:** Dropdown "Filtrar por RP"
- **Por Estado:** Dropdown "Filtrar por estado"
- **Por Cliente:** Buscador "Buscar cliente"

### Analizar:
- Ver estadísticas en tiempo real (6 cards)
- Identificar reservaciones no confirmadas
- Seguimiento de asistencias
- Revisar notas especiales

### Actualización:
- Se actualiza automáticamente cada 15 segundos
- Refleja cambios en tiempo real desde Hostess

---

## 9. VERIFICACIÓN

Para verificar que todo funciona:

1. **Crear reservación:**
   - Ir a `/dashboard/hostess`
   - Crear nueva reservación con RP

2. **Confirmar asistencia:**
   - Marcar "Llegó"
   - Seleccionar mesa
   - Confirmar

3. **Ver en Ashton:**
   - Ir a `/dashboard/socios/ashton`
   - Pestaña "Reservas Semanales"
   - Debe mostrar estado = "confirmada"

4. **Ver en Admin:**
   - Ir a `/dashboard/reservaciones-rps`
   - Debe mostrar la reservación con badge azul "✓ Confirmada"
   - Estadísticas deben actualizarse

---

## 10. RESUMEN DE INTEGRACIÓN

| Componente | Estado | Ubicación |
|-----------|--------|-----------|
| Confirmación automática | ✅ Implementado | `/app/dashboard/hostess/page.tsx` |
| Reservaciones en Ashton | ✅ Implementado | `/app/dashboard/socios/ashton/page.tsx` |
| Panel de administración | ✅ Nuevo | `/app/dashboard/reservaciones-rps/page.tsx` |
| Sidebar link | ✅ Agregado | `/app/dashboard/layout.tsx` (línea 54) |
| Filtros avanzados | ✅ Implementados | Panel admin |
| Estadísticas en tiempo real | ✅ Implementadas | Panel admin |
| Actualización automática | ✅ Cada 15 segundos | Panel admin |

---

## 11. PRÓXIMOS PASOS (Opcional)

- [ ] Exportar reportes de reservaciones a CSV
- [ ] Notificaciones en tiempo real para no-shows
- [ ] Historial de cambios de estado
- [ ] Análisis de patrones de asistencia por RP
- [ ] Integración con SMS para confirmaciones
