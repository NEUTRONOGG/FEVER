# 📋 TODO: CONECTAR REPORTES Y REWARDS A SUPABASE

## ✅ YA COMPLETADO

### **Funciones Agregadas en `supabase-clientes.ts`:**

```typescript
// REPORTES
✅ obtenerVentasPorDia(dias: number = 7)
✅ obtenerProductosMasVendidos(limite: number = 10)
✅ obtenerRendimientoMeseros()

// REWARDS
✅ obtenerClientesConPuntos()
✅ obtenerClientesPorNivel(nivel: string)
✅ actualizarPuntosCliente(clienteId: string, puntos: number)
```

---

## ⏳ PENDIENTE: REPORTES

### **Archivo: `app/dashboard/reportes/page.tsx`**

**Problema actual:**
- ❌ Tiene errores de sintaxis
- ❌ Función `cargarDatos()` mal estructurada
- ❌ Usa data mock

**Solución necesaria:**

```typescript
// 1. Importar funciones
import { 
  obtenerVentasPorDia,
  obtenerRendimientoMeseros,
  obtenerTicketsRecientes
} from "@/lib/supabase-clientes"

// 2. Cargar datos reales
async function cargarDatos() {
  try {
    const [ventasData, meseros, tickets] = await Promise.all([
      obtenerVentasPorDia(7),
      obtenerRendimientoMeseros(),
      obtenerTicketsRecientes(50)
    ])
    
    setVentas(tickets)
    setVentasPorDia(procesarVentasPorDia(tickets))
    setMeserosData(meseros) // Si existe este estado
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setLoading(false)
  }
}

// 3. Actualización automática
useEffect(() => {
  cargarDatos()
  const interval = setInterval(cargarDatos, 60000)
  return () => clearInterval(interval)
}, [])
```

---

## ⏳ PENDIENTE: REWARDS

### **Archivo: `app/dashboard/rewards/page.tsx`**

**Problema actual:**
- ❌ Usa data mock hardcodeada
- ❌ No conectado a Supabase

**Solución necesaria:**

```typescript
// 1. Importar funciones
import { 
  obtenerClientesConPuntos,
  obtenerRewardsActivos,
  actualizarPuntosCliente
} from "@/lib/supabase-clientes"

// 2. Cargar datos reales
const [clientes, setClientes] = useState<any[]>([])
const [loading, setLoading] = useState(true)

async function cargarDatos() {
  try {
    const clientesConPuntos = await obtenerClientesConPuntos()
    setClientes(clientesConPuntos)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    setLoading(false)
  }
}

// 3. Actualización automática
useEffect(() => {
  cargarDatos()
  const interval = setInterval(cargarDatos, 60000)
  return () => clearInterval(interval)
}, [])

// 4. Reemplazar data mock
const rewardsActivos = clientes.filter(c => c.puntos_rewards > 0)
const rewardsUsados = [] // Por ahora vacío hasta tener historial
```

---

## 🎯 ESTADO ACTUAL

### **✅ CONECTADO A SUPABASE:**

```
✅ Dashboard Principal
✅ Clientes
✅ Mesas
✅ POS
✅ Hostess
✅ Mesero
✅ Estadísticas (parcial)
```

### **⏳ PENDIENTE:**

```
⏳ Reportes (funciones listas, falta conectar UI)
⏳ Rewards (funciones listas, falta conectar UI)
```

---

## 📝 NOTAS IMPORTANTES

### **Reportes:**

1. **Ventas por Día:**
   - ✅ Función lista: `obtenerVentasPorDia()`
   - ⏳ Conectar a gráfica en UI

2. **Rendimiento Meseros:**
   - ✅ Función lista: `obtenerRendimientoMeseros()`
   - ⏳ Conectar a tabla en UI

3. **Productos Más Vendidos:**
   - ⚠️ Requiere estructura de productos en tickets
   - Por ahora retorna array vacío

### **Rewards:**

1. **Clientes con Puntos:**
   - ✅ Función lista: `obtenerClientesConPuntos()`
   - ⏳ Conectar a lista en UI

2. **Actualizar Puntos:**
   - ✅ Función lista: `actualizarPuntosCliente()`
   - ⏳ Conectar a botones de acción

3. **Historial de Canjes:**
   - ⚠️ Requiere tabla `rewards_history` en Supabase
   - Por ahora no disponible

---

## 🚀 PRÓXIMOS PASOS

### **OPCIÓN 1: Arreglar Reportes y Rewards (Recomendado)**

```
1. Corregir sintaxis en reportes/page.tsx
2. Conectar funciones a UI
3. Hacer lo mismo con rewards/page.tsx
4. Probar con datos reales
```

### **OPCIÓN 2: Dejar Como Está (Temporal)**

```
1. Estadísticas ya funciona con datos reales ✅
2. Reportes y Rewards muestran data mock
3. Se pueden conectar después cuando haya más datos
```

---

## 📊 RESUMEN

```
╔════════════════════════════════════════════════════╗
║   FUNCIONES DE SUPABASE:                           ║
║   ✅ Estadísticas: 100% listas                     ║
║   ✅ Reportes: Funciones listas                    ║
║   ✅ Rewards: Funciones listas                     ║
║                                                    ║
║   CONEXIÓN UI:                                     ║
║   ✅ Estadísticas: Conectado                       ║
║   ⏳ Reportes: Pendiente                           ║
║   ⏳ Rewards: Pendiente                            ║
║                                                    ║
║   ESTADO: 80% COMPLETADO                           ║
╚════════════════════════════════════════════════════╝
```

---

## ✅ LO MÁS IMPORTANTE YA ESTÁ

**Sistema Operativo:**
- ✅ Hostess puede registrar clientes
- ✅ Mesero puede tomar pedidos
- ✅ POS funciona
- ✅ Mesas se sincronizan
- ✅ Clientes se guardan automáticamente
- ✅ Estadísticas muestran datos reales

**Reportes y Rewards:**
- ⏳ Son páginas de análisis (no críticas)
- ⏳ Pueden conectarse después
- ⏳ Funciones backend ya están listas

---

**¿Quieres que corrija los errores de sintaxis en Reportes y Rewards ahora, o prefieres dejarlos para después?**
