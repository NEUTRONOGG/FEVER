# 📊 DÓNDE VER CONSUMOS DE CLIENTES Y MESAS

## 🎯 RESUMEN RÁPIDO

```
📍 Consumo por Cliente    → /dashboard/clientes
📍 Consumo por Mesa       → /dashboard/mesas-consumo (NUEVA)
📍 Consumo General        → /dashboard
📍 Consumo en Tiempo Real → /dashboard/mesero
📍 Consumo VIP            → /dashboard/rp
📍 Reportes Detallados    → /dashboard/reportes
```

---

## 1️⃣ CONSUMO POR CLIENTE

### **Ruta:** `/dashboard/clientes`

### **Qué ves:**
```
┌─────────────────────────────────────┐
│  Carlos Méndez                      │
│  +52 555 123 4567                   │
│  ─────────────────────────────────  │
│  💰 Consumo Total: $3,450.00        │
│  📊 Consumo Promedio: $123.00       │
│  🎫 Total Visitas: 28               │
│  📅 Última Visita: 2025-10-09       │
│  🏆 Nivel: Platino                  │
│  ⭐ Puntos: 850                     │
└─────────────────────────────────────┘
```

### **Características:**
- ✅ Lista de TODOS los clientes
- ✅ Consumo total histórico
- ✅ Consumo promedio por visita
- ✅ Filtros por nivel de fidelidad
- ✅ Búsqueda por nombre/teléfono
- ✅ Actualización cada 5 segundos

---

## 2️⃣ CONSUMO POR MESA (NUEVA PÁGINA)

### **Ruta:** `/dashboard/mesas-consumo`

### **Qué ves:**
```
┌─────────────────────────────────────┐
│  Mesa 5 - OCUPADA 🔴                │
│  ─────────────────────────────────  │
│  👤 Cliente: Juan Pérez             │
│  👥 Personas: 4                     │
│  👨‍🍳 Mesero: Carlos                 │
│  🕐 Entrada: 20:30                  │
│  ─────────────────────────────────  │
│  💰 Consumo: $450.00                │
│  ─────────────────────────────────  │
│  Productos:                         │
│  • 2x Hamburguesa - $30.00          │
│  • 4x Cerveza - $80.00              │
│  • 1x Pizza - $120.00               │
│  +5 productos más                   │
└─────────────────────────────────────┘
```

### **Características:**
- ✅ Todas las mesas (disponibles, ocupadas, reservadas)
- ✅ Consumo actual de cada mesa
- ✅ Lista de productos pedidos
- ✅ Info del cliente (aunque no esté registrado)
- ✅ Tiempo en la mesa
- ✅ Hostess y mesero asignado
- ✅ Actualización en tiempo real (5 seg)

---

## 3️⃣ DASHBOARD GENERAL (ADMINISTRADOR)

### **Ruta:** `/dashboard`
### **Contraseña:** `4DM1N2025!`

### **Qué ves:**
```
┌─────────────────────────────────────┐
│  ESTADÍSTICAS GENERALES             │
│  ─────────────────────────────────  │
│  💰 Ventas Hoy: $12,450.00          │
│  🎫 Ticket Promedio: $234.00        │
│  👥 Clientes Activos: 156           │
│  📊 Mesas Ocupadas: 8/12            │
│  ─────────────────────────────────  │
│  TOP CLIENTES:                      │
│  1. Carlos Méndez - $3,450          │
│  2. Ana García - $2,980             │
│  3. Roberto Silva - $2,750          │
│  ─────────────────────────────────  │
│  GRÁFICAS:                          │
│  • Ventas por día                   │
│  • Consumo por género               │
│  • Productos más vendidos           │
└─────────────────────────────────────┘
```

---

## 4️⃣ PANEL DE MESERO

### **Ruta:** `/dashboard/mesero`

### **Qué ves:**
```
┌─────────────────────────────────────┐
│  MIS MESAS ACTIVAS                  │
│  ─────────────────────────────────  │
│  Mesa 3 - Juan Pérez                │
│  💰 $250.00 | 4 personas            │
│  [Ver Pedidos] [Cerrar Cuenta]      │
│  ─────────────────────────────────  │
│  Mesa 7 - María López               │
│  💰 $180.00 | 2 personas            │
│  [Ver Pedidos] [Cerrar Cuenta]      │
└─────────────────────────────────────┘
```

### **Características:**
- ✅ Solo mesas ocupadas
- ✅ Consumo en tiempo real
- ✅ Agregar productos
- ✅ Cerrar cuenta
- ✅ Ver detalle de pedidos

---

## 5️⃣ PANEL DE RELACIONES PÚBLICAS (RP)

### **Ruta:** `/dashboard/rp`

### **Qué ves:**
```
┌─────────────────────────────────────┐
│  MESAS CON MAYOR CONSUMO            │
│  ─────────────────────────────────  │
│  Mesa 10 - VIP                      │
│  💰 $1,250.00 | 6 personas          │
│  🏆 Cliente Diamante                │
│  ─────────────────────────────────  │
│  Mesa 5 - Premium                   │
│  💰 $890.00 | 4 personas            │
│  🏆 Cliente Platino                 │
└─────────────────────────────────────┘
```

### **Características:**
- ✅ Enfoque en clientes VIP
- ✅ Consumo alto
- ✅ Otorgar beneficios
- ✅ Estadísticas de clientes premium

---

## 6️⃣ REPORTES DETALLADOS

### **Ruta:** `/dashboard/reportes`

### **Qué ves:**
```
┌─────────────────────────────────────┐
│  REPORTES DE VENTAS                 │
│  ─────────────────────────────────  │
│  📅 Período: Última semana          │
│  💰 Total Ventas: $45,600.00        │
│  🎫 Tickets: 195                    │
│  📊 Promedio: $234.00               │
│  ─────────────────────────────────  │
│  TOP PRODUCTOS:                     │
│  1. Hamburguesa - 145 vendidas      │
│  2. Cerveza - 320 vendidas          │
│  3. Pizza - 89 vendidas             │
│  ─────────────────────────────────  │
│  EXPORTAR:                          │
│  [PDF] [Excel] [CSV]                │
└─────────────────────────────────────┘
```

---

## 🎯 ACCESO RÁPIDO

### **Para ver consumo de UN cliente específico:**
```
1. Ve a: /dashboard/clientes
2. Busca por nombre o teléfono
3. Click en el cliente
4. Verás todo su historial
```

### **Para ver consumo de UNA mesa específica:**
```
1. Ve a: /dashboard/mesas-consumo
2. Busca la mesa por número
3. Verás consumo actual y productos
```

### **Para ver consumo TOTAL del día:**
```
1. Ve a: /dashboard
2. Ingresa contraseña: 4DM1N2025!
3. Verás estadísticas generales
```

---

## 📱 ACTUALIZACIÓN EN TIEMPO REAL

Todas las páginas se actualizan automáticamente cada **5 segundos**:

```
✅ /dashboard/clientes        → 5 seg
✅ /dashboard/mesas-consumo   → 5 seg
✅ /dashboard                 → 5 seg
✅ /dashboard/mesero          → 5 seg
✅ /dashboard/rp              → 5 seg
```

---

## 🔍 BÚSQUEDA Y FILTROS

### **En Clientes:**
- 🔍 Buscar por nombre
- 🔍 Buscar por teléfono
- 🔍 Buscar por email
- 🎯 Filtrar por nivel (Bronce, Plata, Oro, Platino, Diamante)

### **En Mesas:**
- 🎯 Ordenadas por consumo (mayor a menor)
- 🎯 Filtrar por estado (Disponible, Ocupada, Reservada)
- 🎯 Ver solo mesas con consumo

---

## 📊 EJEMPLO DE USO

### **Escenario 1: "¿Cuánto ha consumido Juan Pérez?"**
```
1. Ve a: /dashboard/clientes
2. Busca: "Juan Pérez"
3. Verás: Consumo total, promedio, visitas
```

### **Escenario 2: "¿Cuánto lleva la Mesa 5?"**
```
1. Ve a: /dashboard/mesas-consumo
2. Busca: Mesa 5
3. Verás: Consumo actual, productos, tiempo
```

### **Escenario 3: "¿Cuánto vendimos hoy?"**
```
1. Ve a: /dashboard
2. Ingresa contraseña
3. Verás: Total del día, ticket promedio
```

---

## ✅ NUEVA PÁGINA CREADA

### **`/dashboard/mesas-consumo`**

Esta página muestra:
- ✅ **TODAS las mesas** (12 mesas)
- ✅ **Consumo actual** de cada mesa ocupada
- ✅ **Productos pedidos** en cada mesa
- ✅ **Info del cliente** (aunque no esté registrado)
- ✅ **Mesas disponibles** (sin consumo)
- ✅ **Mesas reservadas** (con info de reserva)
- ✅ **Actualización en tiempo real** (5 segundos)

---

## 🚀 CÓMO ACCEDER

```
http://localhost:3001/dashboard/mesas-consumo
```

O desde el selector de rol:
```
1. Login
2. Selector de Rol
3. Click "Acceso Administrador"
4. Contraseña: 4DM1N2025!
5. Navega a "Mesas Consumo"
```

---

**¡Ahora tienes 6 formas diferentes de ver consumos!** 📊✅
