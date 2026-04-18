# 📊 SISTEMA DE PEDIDOS EN TIEMPO REAL

## ✅ LO QUE YA FUNCIONA

El sistema ya está guardando pedidos en Supabase:

```typescript
// Cuando el mesero agrega productos:
await actualizarPedidosMesa(mesaSeleccionada.id, nuevosPedidos, nuevoTotal)

// Se guarda en:
mesas.pedidos_data = [
  { producto: "Hamburguesa", precio: 15, cantidad: 2 },
  { producto: "Pizza", precio: 18, cantidad: 1 }
]
mesas.total_actual = 48
```

---

## 🎯 LO QUE VOY A AGREGAR

### **1. Panel de Mesero - Desglose Mejorado**
```
┌─────────────────────────────────────────────────────┐
│ Mesa 18 - Agus Pinaya                               │
├─────────────────────────────────────────────────────┤
│ PEDIDO ACTUAL:                                      │
│                                                     │
│ Hamburguesa Clásica x2          $30.00             │
│ Pizza Margarita x1              $18.00             │
│ ─────────────────────────────────────────          │
│ Subtotal:                       $48.00             │
│ ─────────────────────────────────────────          │
│                                                     │
│ [+ Agregar Productos]  [Cerrar Cuenta]             │
└─────────────────────────────────────────────────────┘
```

### **2. Panel de Admin - Monitor en Tiempo Real**
```
/dashboard/monitor-pedidos

┌─────────────────────────────────────────────────────┐
│ 📊 Monitor de Pedidos en Tiempo Real                │
├─────────────────────────────────────────────────────┤
│ Mesa 18 - Agus Pinaya                    $65.00    │
│ ├─ Hamburguesa Clásica x2                          │
│ ├─ Pizza Margarita x1                              │
│ ├─ Cerveza Corona x3                               │
│ └─ Mesero: Staff                                   │
│                                                     │
│ Mesa 5 - Juan Pérez                      $120.00   │
│ ├─ Whisky Premium x2                               │
│ ├─ Vodka x1                                        │
│ └─ Mesero: Carlos                                  │
│                                                     │
│ Mesa 12 - María García                   $85.00    │
│ ├─ Tequila x1                                      │
│ ├─ Cerveza x2                                      │
│ └─ Mesero: Ana                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 ARCHIVOS A CREAR/MODIFICAR

### **1. app/dashboard/monitor-pedidos/page.tsx** (NUEVO)
Panel de administrador para ver todos los pedidos en tiempo real

### **2. app/dashboard/mesero/page.tsx** (MODIFICAR)
Mejorar visualización del desglose del pedido actual

### **3. app/dashboard/layout.tsx** (MODIFICAR)
Agregar "Monitor Pedidos" al menú de navegación

---

## 🗄️ ESTRUCTURA EN SUPABASE

### **Tabla `mesas`:**
```sql
CREATE TABLE mesas (
  id SERIAL PRIMARY KEY,
  numero INTEGER,
  cliente_nombre TEXT,
  estado TEXT,
  
  -- PEDIDOS EN TIEMPO REAL
  pedidos_data JSONB,  -- Array de productos
  total_actual DECIMAL(10,2),
  
  -- Personal
  mesero TEXT,
  hostess TEXT,
  rp TEXT,
  
  -- Timestamps
  hora_asignacion TIMESTAMP,
  updated_at TIMESTAMP
);
```

### **Ejemplo de `pedidos_data`:**
```json
[
  {
    "id": 1,
    "producto": "Hamburguesa Clásica",
    "precio": 15,
    "cantidad": 2
  },
  {
    "id": 5,
    "producto": "Pizza Margarita",
    "precio": 18,
    "cantidad": 1
  },
  {
    "id": 12,
    "producto": "Cerveza Corona",
    "precio": 8,
    "cantidad": 3
  }
]
```

---

## 🔄 FLUJO EN TIEMPO REAL

```
1. Mesero selecciona mesa
   ↓
2. Agrega productos al pedido
   ↓
3. Click "Enviar Pedido"
   ↓
4. Se guarda en mesas.pedidos_data
   ↓
5. Admin ve actualización INMEDIATA en monitor
   ↓
6. Mesero puede seguir agregando productos
   ↓
7. Admin ve cambios en tiempo real
   ↓
8. Mesero cierra cuenta
   ↓
9. Se crea ticket en historial
   ↓
10. Mesa se libera
```

---

## 📊 COMPONENTES DEL SISTEMA

### **A. Panel de Mesero**
```typescript
// Mostrar desglose del pedido actual
<Card>
  <CardHeader>
    <CardTitle>Pedido Actual - Mesa {mesa.numero}</CardTitle>
  </CardHeader>
  <CardContent>
    {mesa.pedidos_data?.map(item => (
      <div key={item.id}>
        <span>{item.producto} x{item.cantidad}</span>
        <span>${(item.precio * item.cantidad).toFixed(2)}</span>
      </div>
    ))}
    <Separator />
    <div>
      <strong>Total: ${mesa.total_actual}</strong>
    </div>
  </CardContent>
</Card>
```

### **B. Monitor de Admin**
```typescript
// Ver todas las mesas con pedidos
const mesasConPedidos = mesas.filter(m => 
  m.estado === 'ocupada' && 
  m.pedidos_data && 
  m.pedidos_data.length > 0
)

{mesasConPedidos.map(mesa => (
  <Card key={mesa.id}>
    <CardHeader>
      <CardTitle>
        Mesa {mesa.numero} - {mesa.cliente_nombre}
      </CardTitle>
      <Badge>${mesa.total_actual}</Badge>
    </CardHeader>
    <CardContent>
      {mesa.pedidos_data.map(item => (
        <div>
          {item.producto} x{item.cantidad} - ${item.precio * item.cantidad}
        </div>
      ))}
      <p className="text-sm text-slate-400">
        Mesero: {mesa.mesero}
      </p>
    </CardContent>
  </Card>
))}
```

---

## 🚀 IMPLEMENTACIÓN

### **Paso 1: Crear Monitor de Pedidos**
Crear `/app/dashboard/monitor-pedidos/page.tsx`

### **Paso 2: Mejorar Panel de Mesero**
Agregar sección de desglose visible

### **Paso 3: Agregar al Menú**
Agregar "Monitor Pedidos" en layout

### **Paso 4: Actualización en Tiempo Real**
```typescript
useEffect(() => {
  cargarMesas()
  const interval = setInterval(cargarMesas, 3000) // Cada 3 segundos
  return () => clearInterval(interval)
}, [])
```

---

## ✅ BENEFICIOS

```
✅ Admin ve qué está pidiendo cada mesa
✅ Actualización cada 3 segundos
✅ Desglose completo de productos
✅ Total en tiempo real
✅ Identificar mesero responsable
✅ Monitorear consumo por mesa
✅ Detectar mesas con alto consumo
✅ Mejor control de inventario
```

---

## 📱 VISTA MÓVIL

El monitor será responsive:
```
Desktop: 3 columnas de mesas
Tablet: 2 columnas
Móvil: 1 columna (scroll vertical)
```

---

## 🎯 PRÓXIMOS PASOS

1. ¿Quieres que cree el panel de monitor ahora?
2. ¿Quieres que mejore la vista del mesero primero?
3. ¿O ambos al mismo tiempo?

---

**Confirma y procedo a implementar.** 📊✅🚀
