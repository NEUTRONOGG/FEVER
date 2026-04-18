# 🔄 HACER PANEL DE RESERVACIONES IDÉNTICO A HOSTESS

## ✅ SOLUCIÓN RÁPIDA

El archivo `/app/dashboard/reservaciones/page.tsx` es muy largo (651 líneas) para reescribir aquí.

**La forma más rápida es:**

### **Opción 1: Copiar y adaptar (RECOMENDADO)**

```bash
# 1. Hacer backup
cp app/dashboard/reservaciones/page.tsx app/dashboard/reservaciones/page.tsx.old

# 2. Copiar estructura de hostess
cp app/dashboard/hostess/page.tsx app/dashboard/reservaciones/page.tsx

# 3. Editar manualmente para cambiar:
#    - Título: "Panel Hostess" → "Panel de Reservaciones"
#    - Botones específicos de reservaciones
#    - Mantener misma estructura visual
```

### **Opción 2: Usar el panel actual pero mejorado**

El panel actual ya tiene:
- ✅ Vista de mesas disponibles
- ✅ Crear reservaciones
- ✅ Confirmar asistencia

Solo necesita:
- ❌ Vista visual de mesas (grid como hostess)
- ❌ Colores por estado (verde/azul/naranja)

---

## 🎯 LO QUE DEBE TENER

```
┌─────────────────────────────────────────────────────┐
│ Panel de Reservaciones                              │
│ [Nueva Reservación] [Volver]  29 Disp | 1 Ocup     │
├─────────────────────────────────────────────────────┤
│ [Total: 30] [Disponibles: 29] [Ocupadas: 1]        │
├─────────────────────────────────────────────────────┤
│ ✅ Mesas Disponibles                                │
│ [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]          │
│ [11] [12] [13] [14] [15] [16] [17] [18] [19] [20] │
│                                                     │
│ 👥 Mesas Ocupadas                                   │
│ ┌─────────────────┐                                │
│ │   Mesa 18       │                                │
│ │ Agus Pinaya     │                                │
│ │ 6 personas      │                                │
│ │ $0.00           │                                │
│ └─────────────────┘                                │
│                                                     │
│ 📅 Mesas Reservadas                                 │
│ (No hay reservaciones)                              │
└─────────────────────────────────────────────────────┘
```

---

## 📝 CAMBIOS MANUALES NECESARIOS

Si copias de hostess, cambiar:

### **1. Título (línea ~548):**
```typescript
// ANTES:
<h1>Panel Hostess</h1>

// DESPUÉS:
<h1>Panel de Reservaciones</h1>
```

### **2. Botones del header:**
```typescript
// QUITAR:
<Button>Escanear QR</Button>
<Button>Menú Staff</Button>

// AGREGAR:
<Button onClick={() => window.location.href = '/dashboard'}>
  Volver al Dashboard
</Button>
<Button onClick={() => setDialogNuevaReservacion(true)}>
  Nueva Reservación
</Button>
```

### **3. Funcionalidad de click en mesa disponible:**
```typescript
// En lugar de abrir dialog de registro directo:
onClick={() => handleReservarMesa(mesa)}

// Función:
function handleReservarMesa(mesa) {
  setMesaSeleccionada(mesa)
  setDialogNuevaReservacion(true)
}
```

### **4. Mesas reservadas:**
```typescript
// Mostrar botón "Confirmar" en lugar de "Liberar"
<Button onClick={() => confirmarReservacion(mesa)}>
  Confirmar Llegada
</Button>
```

---

## 🚀 IMPLEMENTACIÓN PASO A PASO

### **Paso 1: Backup**
```bash
cd /Users/mac/Downloads/crm-restaurante
cp app/dashboard/reservaciones/page.tsx app/dashboard/reservaciones/page.tsx.backup
```

### **Paso 2: Copiar estructura**
```bash
cp app/dashboard/hostess/page.tsx app/dashboard/reservaciones/page.tsx
```

### **Paso 3: Editar en VS Code**

Abrir `/app/dashboard/reservaciones/page.tsx` y hacer estos cambios:

**Línea ~548 - Cambiar título:**
```typescript
<h1 className="text-3xl font-bold text-slate-50 glow-amber">
  Panel de Reservaciones
</h1>
<p className="text-slate-400 mt-1">
  Gestiona mesas y reservaciones
</p>
```

**Línea ~552-574 - Cambiar botones:**
```typescript
<div className="flex items-center gap-3">
  <Button
    onClick={() => window.location.href = '/dashboard'}
    variant="outline"
    className="border-amber-500/50 text-amber-500"
  >
    <LayoutGrid className="w-4 h-4 mr-2" />
    Dashboard
  </Button>
  <Button
    onClick={() => setDialogNuevaReservacion(true)}
    className="bg-gradient-to-r from-purple-600 to-pink-600"
  >
    <Plus className="w-4 h-4 mr-2" />
    Nueva Reservación
  </Button>
  <Badge className="bg-emerald-500/20 text-emerald-500 text-lg px-4 py-2">
    {mesasDisponibles.length} Disponibles
  </Badge>
  <Badge className="bg-blue-500/20 text-blue-500 text-lg px-4 py-2">
    {mesasOcupadas.length} Ocupadas
  </Badge>
  <Badge className="bg-amber-500/20 text-amber-500 text-lg px-4 py-2">
    {mesasReservadas.length} Reservadas
  </Badge>
</div>
```

**Línea ~655 - Cambiar acción de click en mesa disponible:**
```typescript
onClick={() => {
  setMesaSeleccionada(mesa)
  setDialogNuevaReservacion(true)
}}
```

**Línea ~745-754 - Cambiar botón de mesa reservada:**
```typescript
<Button
  size="sm"
  onClick={() => {
    setMesaSeleccionada(mesa)
    setDialogConfirmarAsistencia(true)
  }}
  className="bg-emerald-600 hover:bg-emerald-700"
>
  <UserCheck className="w-4 h-4 mr-1" />
  Confirmar Llegada
</Button>
```

### **Paso 4: Agregar dialog de nueva reservación**

Al final del archivo, antes del último `</div>`, agregar:

```typescript
{/* Dialog Nueva Reservación */}
<Dialog open={dialogNuevaReservacion} onOpenChange={setDialogNuevaReservacion}>
  <DialogContent className="bg-slate-900 border-slate-800 max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-slate-50">
        Nueva Reservación - Mesa {mesaSeleccionada?.numero}
      </DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Nombre *</Label>
          <Input
            value={nuevaReservacion.cliente_nombre}
            onChange={(e) => setNuevaReservacion({...nuevaReservacion, cliente_nombre: e.target.value})}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Teléfono *</Label>
          <Input
            value={nuevaReservacion.cliente_telefono}
            onChange={(e) => setNuevaReservacion({...nuevaReservacion, cliente_telefono: e.target.value})}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-300">Fecha *</Label>
          <Input
            type="date"
            value={nuevaReservacion.fecha}
            onChange={(e) => setNuevaReservacion({...nuevaReservacion, fecha: e.target.value})}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Hora *</Label>
          <Input
            type="time"
            value={nuevaReservacion.hora}
            onChange={(e) => setNuevaReservacion({...nuevaReservacion, hora: e.target.value})}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-300">Personas *</Label>
          <Input
            type="number"
            value={nuevaReservacion.numero_personas}
            onChange={(e) => setNuevaReservacion({...nuevaReservacion, numero_personas: parseInt(e.target.value)})}
            className="bg-slate-800/50 border-slate-700"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setDialogNuevaReservacion(false)}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCrearReservacion}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
        >
          Crear Reservación
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### **Paso 5: Agregar estados necesarios**

Al inicio del componente, después de los otros `useState`:

```typescript
const [dialogNuevaReservacion, setDialogNuevaReservacion] = useState(false)
const [nuevaReservacion, setNuevaReservacion] = useState({
  cliente_nombre: "",
  cliente_telefono: "",
  fecha: "",
  hora: "",
  numero_personas: 2
})
```

### **Paso 6: Agregar función para crear reservación**

```typescript
async function handleCrearReservacion() {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { reservarMesa } = await import('@/lib/supabase-clientes')
    
    if (!mesaSeleccionada) return
    
    // Reservar mesa
    await reservarMesa(mesaSeleccionada.id, {
      cliente_nombre: nuevaReservacion.cliente_nombre,
      numero_personas: nuevaReservacion.numero_personas,
      telefono: nuevaReservacion.cliente_telefono,
      hora_reserva: `${nuevaReservacion.fecha}T${nuevaReservacion.hora}`
    })
    
    // Crear en tabla reservaciones
    await supabase.from('reservaciones').insert({
      cliente_nombre: nuevaReservacion.cliente_nombre,
      cliente_telefono: nuevaReservacion.cliente_telefono,
      fecha: nuevaReservacion.fecha,
      hora: nuevaReservacion.hora,
      numero_personas: nuevaReservacion.numero_personas,
      mesa_asignada: mesaSeleccionada.numero,
      estado: 'pendiente'
    })
    
    alert(`✅ Reservación creada para ${nuevaReservacion.cliente_nombre}`)
    setDialogNuevaReservacion(false)
    cargarMesas()
  } catch (error) {
    console.error('Error:', error)
    alert('Error al crear reservación')
  }
}
```

---

## ✅ RESULTADO FINAL

Después de estos cambios, tendrás:

```
✅ Vista idéntica a hostess
✅ Grid de mesas visuales
✅ Colores por estado
✅ Click en mesa disponible → crear reservación
✅ Click en mesa reservada → confirmar llegada
✅ Stats arriba
✅ Mismo diseño y UX
```

---

## 🔄 ALTERNATIVA MÁS SIMPLE

Si no quieres copiar todo el archivo, puedo:

1. Crear un archivo nuevo con la estructura completa
2. Tú lo copias y reemplazas el actual
3. Listo

**¿Quieres que cree el archivo completo listo para copiar?**

---

**Confirma qué opción prefieres y procedo.** 🔄✅🚀
