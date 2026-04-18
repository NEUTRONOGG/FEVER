# ✅ SELECCIÓN DE RP EN HOSTESS

## 🎉 FUNCIONALIDAD IMPLEMENTADA

La Hostess ahora puede:
- ✅ Preguntar con qué RP tiene reservación
- ✅ Asignar RP específico si tiene reservación
- ✅ Asignar RP aleatorio si no tiene reservación

---

## 🎯 FLUJO COMPLETO

### **Caso 1: Cliente con Reservación**

```
1. Cliente llega: "Tengo reservación con Carlos RP"
2. Hostess asigna mesa
3. En formulario:
   ┌─────────────────────────────────────────┐
   │ Número de Personas: [4 ▼]              │
   │                                         │
   │ ¿Con quién tiene reservación?           │
   │ [Carlos RP ▼]                           │
   │   - Sin reservación (RP aleatorio)      │
   │   - Carlos RP                           │
   │   - Ana RP                              │
   │   - Luis RP                             │
   │                                         │
   │ ℹ️ Si no tiene reservación, se          │
   │   asignará un RP aleatorio              │
   └─────────────────────────────────────────┘
4. Selecciona: "Carlos RP"
5. Click "Asignar Mesa"
6. ✅ Mesa asignada a Carlos RP
```

### **Caso 2: Cliente sin Reservación**

```
1. Cliente llega sin reservación
2. Hostess asigna mesa
3. En formulario:
   - Deja campo RP vacío
   - O selecciona "Sin reservación"
4. Click "Asignar Mesa"
5. Sistema asigna RP aleatorio:
   - Puede ser Carlos RP
   - Puede ser Ana RP
   - Puede ser Luis RP
6. ✅ Mesa asignada a RP aleatorio
7. Mensaje: "Mesa 5 asignada a Juan Pérez (RP: Ana RP)"
```

---

## 🔧 IMPLEMENTACIÓN

### **Estado:**

```typescript
const [rpSeleccionado, setRpSeleccionado] = useState<string>("")
const [rpsDisponibles, setRpsDisponibles] = useState<any[]>([])
```

### **Cargar RPs Disponibles:**

```typescript
async function cargarRPs() {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data, error } = await supabase
      .from('limites_cortesias_rp')
      .select('rp_nombre')
      .eq('activo', true)
      .order('rp_nombre')
    
    if (error) throw error
    setRpsDisponibles(data || [])
  } catch (error) {
    console.error('Error cargando RPs:', error)
  }
}
```

### **Función RP Aleatorio:**

```typescript
function obtenerRPAleatorio() {
  if (rpsDisponibles.length === 0) return null
  const indiceAleatorio = Math.floor(Math.random() * rpsDisponibles.length)
  return rpsDisponibles[indiceAleatorio].rp_nombre
}
```

### **Asignación con RP:**

```typescript
// Determinar RP
const rpFinal = rpSeleccionado || obtenerRPAleatorio()

// Asignar mesa
await asignarMesaCliente(mesaSeleccionada.id, {
  cliente_id: clienteId || '',
  cliente_nombre: nombreCompleto,
  numero_personas: numeroPersonas,
  hostess: hostessNombre,
  mesero: undefined,
  rp: rpFinal  // ← RP asignado
} as any)

// Mensaje de confirmación
const mensajeRP = rpFinal ? ` (RP: ${rpFinal})` : ''
alert(`✅ Mesa ${mesaSeleccionada.numero} asignada a ${nombreCompleto}${mensajeRP}`)
```

---

## 🎨 INTERFAZ

### **Selector de RP:**

```jsx
<div className="space-y-2 col-span-2">
  <Label className="text-slate-300">
    ¿Con quién tiene reservación? (Opcional)
  </Label>
  <Select
    value={rpSeleccionado}
    onValueChange={setRpSeleccionado}
  >
    <SelectTrigger className="bg-slate-800/50 border-slate-700">
      <SelectValue placeholder="Sin reservación (RP aleatorio)" />
    </SelectTrigger>
    <SelectContent className="bg-slate-800 border-slate-700">
      <SelectItem value="">Sin reservación (RP aleatorio)</SelectItem>
      {rpsDisponibles.map((rp) => (
        <SelectItem key={rp.rp_nombre} value={rp.rp_nombre}>
          {rp.rp_nombre}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <p className="text-xs text-slate-500">
    Si no tiene reservación, se asignará un RP aleatorio
  </p>
</div>
```

---

## 📊 EJEMPLOS

### **Ejemplo 1: Con Reservación**

```
Input:
- Cliente: Juan Pérez
- Personas: 4
- RP: Carlos RP (seleccionado)

Output:
✅ Mesa 5 asignada a Juan Pérez (RP: Carlos RP)

Base de Datos:
mesas.rp = "Carlos RP"
```

### **Ejemplo 2: Sin Reservación**

```
Input:
- Cliente: María López
- Personas: 2
- RP: (vacío)

Sistema:
- RPs disponibles: [Carlos RP, Ana RP, Luis RP]
- Aleatorio: Math.random() → Ana RP

Output:
✅ Mesa 8 asignada a María López (RP: Ana RP)

Base de Datos:
mesas.rp = "Ana RP"
```

### **Ejemplo 3: Cliente Existente**

```
Input:
- Cliente encontrado: Pedro Gómez
- Personas: 6
- RP: Luis RP (seleccionado)

Output:
✅ Mesa 12 asignada a Pedro Gómez (RP: Luis RP)

Base de Datos:
mesas.rp = "Luis RP"
```

---

## 🔄 INTEGRACIÓN

### **Con Panel RP:**

```
1. Hostess asigna mesa con RP: "Carlos RP"
2. Mesa queda registrada con rp = "Carlos RP"
3. Carlos RP inicia sesión
4. Sistema filtra mesas:
   WHERE rp = "Carlos RP" AND estado = "ocupada"
5. Carlos RP ve su mesa asignada
6. Puede autorizar cortesías
```

---

## ✨ CARACTERÍSTICAS

### **Selector:**

```
✅ Campo opcional
✅ Placeholder claro
✅ Opción "Sin reservación"
✅ Lista de RPs activos
✅ Ordenados alfabéticamente
✅ Texto de ayuda
```

### **Asignación:**

```
✅ Si tiene reservación → RP específico
✅ Si no tiene → RP aleatorio
✅ Mensaje de confirmación con RP
✅ Guardado en base de datos
✅ Visible para el RP asignado
```

### **Validación:**

```
✅ Campo opcional (no bloquea)
✅ Valor vacío = aleatorio
✅ RPs solo activos
✅ Carga automática al iniciar
```

---

## 📋 UBICACIONES

### **Campo agregado en:**

```
1. Formulario de nuevo cliente
   - Después de "Número de Personas"
   - Antes de botones

2. Formulario de cliente existente
   - Después de "Número de Personas"
   - Antes de "Asignar Mesa Directo"
```

---

## 🎯 VENTAJAS

### **Para Hostess:**

```
✅ Pregunta clara al cliente
✅ Fácil de usar
✅ No bloquea si no sabe
✅ Sistema asigna automáticamente
```

### **Para RP:**

```
✅ Ve sus mesas asignadas
✅ Clientes con reservación
✅ Clientes aleatorios
✅ Control de cortesías
```

### **Para Cliente:**

```
✅ Atención personalizada
✅ RP conoce su reservación
✅ Mejor experiencia
```

---

## 🔍 LÓGICA DE ASIGNACIÓN

### **Algoritmo:**

```typescript
// 1. Verificar si hay RP seleccionado
if (rpSeleccionado) {
  rpFinal = rpSeleccionado  // Usar el seleccionado
} else {
  // 2. Obtener RP aleatorio
  if (rpsDisponibles.length > 0) {
    const indice = Math.floor(Math.random() * rpsDisponibles.length)
    rpFinal = rpsDisponibles[indice].rp_nombre
  } else {
    rpFinal = null  // Sin RPs disponibles
  }
}

// 3. Asignar mesa con RP
await asignarMesaCliente(mesa.id, {
  ...datos,
  rp: rpFinal
})
```

---

## 📊 DISTRIBUCIÓN ALEATORIA

### **Ejemplo con 3 RPs:**

```
RPs disponibles: [Carlos RP, Ana RP, Luis RP]

Asignaciones sin reservación (100 clientes):
- Carlos RP: ~33 clientes
- Ana RP: ~33 clientes
- Luis RP: ~34 clientes

Distribución equitativa automática
```

---

## ✅ RESUMEN

```
╔════════════════════════════════════════════════════╗
║   ✅ SELECTOR DE RP AGREGADO                       ║
║   ✅ PREGUNTA AL CLIENTE                           ║
║   ✅ RP ESPECÍFICO O ALEATORIO                     ║
║   ✅ GUARDADO EN BASE DE DATOS                     ║
║   ✅ INTEGRADO CON PANEL RP                        ║
║   ✅ MENSAJES DE CONFIRMACIÓN                      ║
║                                                    ║
║   ESTADO: 100% FUNCIONAL                           ║
╚════════════════════════════════════════════════════╝
```

---

## 🚀 PROBAR

```
1. npm run dev
2. Login como Hostess
3. Asignar mesa
4. Ver campo: "¿Con quién tiene reservación?"
5. Opciones:
   - Sin reservación (RP aleatorio)
   - Carlos RP
   - Ana RP
   - Luis RP
6. Seleccionar o dejar vacío
7. Asignar mesa
8. Ver mensaje con RP asignado
```

---

**¡Hostess ahora puede preguntar por reservación y asignar RP específico o aleatorio!** 🎯✅🚀
