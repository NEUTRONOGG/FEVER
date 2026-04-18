# ✅ NOMBRE DE CLIENTE ARREGLADO - HISTORIAL DE CONSUMOS

## 🔍 PROBLEMA RESUELTO

**Antes:** Mostraba "Cliente General" en lugar del nombre real

**Ahora:** Muestra el nombre del cliente que consumió

---

## 🔧 QUÉ SE ARREGLÓ

### **Función `liberarMesa` actualizada:**

**ANTES:**
```typescript
export async function liberarMesa(mesaId: number) {
  // Solo limpiaba la mesa
  const { error } = await supabase
    .from('mesas')
    .update({
      estado: 'disponible',
      cliente_nombre: null,
      // ...
    })
}
```

**AHORA:**
```typescript
export async function liberarMesa(mesaId: number) {
  // 1. Obtener datos de la mesa ANTES de limpiar
  const { data: mesaData } = await supabase
    .from('mesas')
    .select('*')
    .eq('id', mesaId)
    .single()
  
  // 2. Si tiene cliente, crear ticket
  if (mesaData && mesaData.cliente_nombre && mesaData.total_actual > 0) {
    await supabase
      .from('tickets')
      .insert({
        cliente_id: mesaData.cliente_id,
        cliente_nombre: mesaData.cliente_nombre,  // ✅ NOMBRE REAL
        mesa_numero: mesaData.numero,
        items: productosTexto,
        total: mesaData.total_actual,
        mesero: mesaData.mesero,
        metodo_pago: 'Efectivo'
      })
  }
  
  // 3. Limpiar la mesa
  await supabase.from('mesas').update({ cliente_nombre: null, ... })
}
```

---

## 🎯 CÓMO FUNCIONA AHORA

### **Flujo completo:**

```
1. Cliente "Juan Pérez" está en Mesa 5
   ├─ cliente_nombre: "Juan Pérez"
   ├─ total_actual: $2,500
   └─ pedidos_data: [...]

2. Hostess/Mesero libera la mesa
   ↓
3. Sistema ejecuta liberarMesa(5)
   ↓
4. ANTES de limpiar, obtiene datos:
   ├─ cliente_nombre: "Juan Pérez" ✅
   ├─ total_actual: $2,500
   └─ pedidos_data: [...]
   ↓
5. Crea ticket en Supabase:
   INSERT INTO tickets (
     cliente_nombre: "Juan Pérez",  ✅
     mesa_numero: 5,
     items: "Whisky x2, Vodka x1",
     total: 2500
   )
   ↓
6. Limpia la mesa:
   UPDATE mesas SET cliente_nombre = NULL
   ↓
7. Ticket guardado con nombre real ✅
```

---

## 📊 AHORA VERÁS

### **En Historial de Consumos:**

```
┌─────────────────────────────────────────────────────┐
│ Juan Pérez - Mesa 5                    ✅           │
│ 📅 13/10/2025  🕐 21:30  👤 Carlos  💵 Efectivo     │
│ 🍽️  Whisky Premium x2, Vodka x1, Botana x3         │
│ $2,500                                              │
│                                                     │
│ María García - Mesa 12                 ✅           │
│ 📅 13/10/2025  🕐 20:15  👤 Ana  💳 Tarjeta         │
│ 🍽️  Tequila x1, Cerveza x2, Alitas x1              │
│ $1,800                                              │
└─────────────────────────────────────────────────────┘
```

**Ya NO más "Cliente General"** ❌

---

## 🧪 PROBAR

### **1. Asignar mesa a un cliente:**

```
1. Ir a /dashboard/hostess
2. Asignar Mesa 5 a "Juan Pérez"
3. Agregar consumo (opcional)
```

### **2. Liberar la mesa:**

```
1. Click "Liberar Mesa"
2. Sistema crea ticket automáticamente
3. Guarda nombre "Juan Pérez" ✅
```

### **3. Ver historial:**

```
1. Ir a /dashboard/historial-consumos
2. ✅ Ver "Juan Pérez" en lugar de "Cliente General"
3. ✅ Ver productos consumidos
4. ✅ Ver total pagado
```

---

## 🔍 VERIFICAR EN SUPABASE

### **Ver tickets creados:**

```sql
SELECT 
  cliente_nombre,
  mesa_numero,
  items,
  total,
  created_at
FROM tickets
ORDER BY created_at DESC
LIMIT 10;
```

**Deberías ver:**
```
cliente_nombre  | mesa_numero | items                    | total
----------------|-------------|--------------------------|-------
Juan Pérez      | 5           | Whisky x2, Vodka x1      | 2500
María García    | 12          | Tequila x1, Cerveza x2   | 1800
```

---

## 📝 FORMATEO DE PRODUCTOS

### **Si hay pedidos en la mesa:**

```javascript
// pedidos_data = [
//   { nombre: "Whisky Premium", cantidad: 2 },
//   { nombre: "Vodka", cantidad: 1 },
//   { nombre: "Botana", cantidad: 3 }
// ]

productosTexto = "Whisky Premium x2, Vodka x1, Botana x3"
```

### **Si NO hay pedidos:**

```javascript
productosTexto = "Consumo registrado"
```

---

## 🔄 ACTUALIZACIÓN AUTOMÁTICA

### **Cada vez que liberas una mesa:**

```
✅ Ticket se crea automáticamente
✅ Nombre del cliente se guarda
✅ Productos se formatean
✅ Total se registra
✅ Aparece en historial inmediatamente
```

---

## 🎯 CASOS DE USO

### **Caso 1: Mesa con cliente y consumo**

```
Mesa 5:
- cliente_nombre: "Juan Pérez"
- total_actual: $2,500
- pedidos_data: [Whisky, Vodka]

Al liberar:
✅ Crea ticket con "Juan Pérez"
✅ Guarda productos
✅ Guarda total
```

### **Caso 2: Mesa sin consumo**

```
Mesa 5:
- cliente_nombre: "Juan Pérez"
- total_actual: $0

Al liberar:
❌ NO crea ticket (total = 0)
✅ Solo limpia la mesa
```

### **Caso 3: Mesa sin cliente**

```
Mesa 5:
- cliente_nombre: null
- total_actual: $0

Al liberar:
❌ NO crea ticket (sin cliente)
✅ Solo limpia la mesa
```

---

## 📊 LOGS EN CONSOLA

### **Cuando se crea ticket:**

```
✅ Ticket creado para: Juan Pérez
```

### **Si hay error:**

```
⚠️ Error al crear ticket: [mensaje de error]
```

**Nota:** Aunque falle crear el ticket, la mesa se libera igual.

---

## 🗄️ ESTRUCTURA COMPLETA

### **Tabla `mesas`:**
```sql
CREATE TABLE mesas (
  id SERIAL PRIMARY KEY,
  numero INTEGER,
  cliente_id UUID,
  cliente_nombre TEXT,        -- ✅ Se guarda aquí primero
  total_actual DECIMAL(10,2),
  pedidos_data JSONB,
  mesero TEXT,
  estado TEXT
);
```

### **Tabla `tickets`:**
```sql
CREATE TABLE tickets (
  id UUID PRIMARY KEY,
  cliente_id UUID,
  cliente_nombre TEXT,        -- ✅ Se copia aquí al liberar
  mesa_numero INTEGER,
  items TEXT,
  total DECIMAL(10,2),
  mesero TEXT,
  metodo_pago TEXT,
  created_at TIMESTAMP
);
```

---

## ✅ RESUMEN

```
╔════════════════════════════════════════════════════╗
║   ANTES:                                           ║
║   ❌ Mostraba "Cliente General"                    ║
║   ❌ No guardaba nombre real                       ║
║   ❌ Tickets sin información de cliente            ║
║                                                    ║
║   AHORA:                                           ║
║   ✅ Muestra nombre real del cliente               ║
║   ✅ Guarda automáticamente al liberar mesa        ║
║   ✅ Tickets con información completa              ║
║                                                    ║
║   FLUJO:                                           ║
║   1. Cliente en mesa → nombre guardado             ║
║   2. Liberar mesa → crear ticket                   ║
║   3. Ticket guarda nombre real                     ║
║   4. Historial muestra nombre correcto             ║
╚════════════════════════════════════════════════════╝
```

---

## 🚀 PRÓXIMOS PASOS

### **1. Probar ahora:**
```
1. Asignar mesa a un cliente
2. Liberar la mesa
3. Ver historial de consumos
4. ✅ Verificar que aparece el nombre real
```

### **2. Si tienes tickets viejos con "Cliente General":**
```sql
-- Borrar tickets de prueba
DELETE FROM tickets 
WHERE cliente_nombre = 'Cliente General';
```

### **3. Crear nuevos tickets:**
```
Asigna y libera mesas con clientes reales
Los nuevos tickets tendrán nombres correctos ✅
```

---

**¡Nombre de cliente arreglado! Ahora verás nombres reales.** ✅📊🚀

**Prueba asignando y liberando una mesa con un cliente.**
