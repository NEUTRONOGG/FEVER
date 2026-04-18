# 🔐 ACCESOS Y CONTRASEÑAS DEL SISTEMA

## 👥 USUARIOS Y CONTRASEÑAS

### **RPs (Relaciones Públicas)**

```
╔════════════════════════════════════════════════════╗
║   CARLOS RP                                        ║
║   Usuario: Carlos RP                               ║
║   Contraseña: carlos123                            ║
║   Acceso: /dashboard/rp-login                      ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║   ANA RP                                           ║
║   Usuario: Ana RP                                  ║
║   Contraseña: ana123                               ║
║   Acceso: /dashboard/rp-login                      ║
╚════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════╗
║   LUIS RP                                          ║
║   Usuario: Luis RP                                 ║
║   Contraseña: luis123                              ║
║   Acceso: /dashboard/rp-login                      ║
╚════════════════════════════════════════════════════╝
```

### **Admin**

```
╔════════════════════════════════════════════════════╗
║   ADMINISTRADOR                                    ║
║   Usuario: admin                                   ║
║   Contraseña: (configurada en /login)              ║
║   Acceso: /login                                   ║
╚════════════════════════════════════════════════════╝
```

### **Hostess**

```
╔════════════════════════════════════════════════════╗
║   HOSTESS                                          ║
║   Usuario: hostess                                 ║
║   Contraseña: (configurada en /login)              ║
║   Acceso: /login                                   ║
╚════════════════════════════════════════════════════╝
```

---

## 🎯 ACCESOS POR ROL

### **ADMIN (Administrador)**

```
✅ Dashboard Principal
✅ Reservaciones (crear/gestionar)
✅ Clientes (ver/editar/crear)
✅ Mesas (ver estado)
✅ POS (punto de venta)
✅ Estadísticas
✅ Reportes
✅ Rewards
✅ Gestión RPs (crear/editar RPs)
```

**Menú de navegación:**
```
📊 Dashboard
📅 Reservaciones        ← NUEVO
👥 Clientes
🪑 Mesas
💰 POS
📈 Estadísticas
📊 Reportes
🎁 Rewards
👤 Gestión RPs
```

---

### **HOSTESS**

```
✅ Panel Hostess (asignar mesas walk-in)
✅ Reservaciones (crear/gestionar)
✅ Ver mesas disponibles/ocupadas
✅ Asignar clientes a mesas
✅ Finalizar servicio
✅ Calificar clientes
```

**Accesos:**
```
/dashboard/hostess         → Panel principal
/dashboard/reservaciones   → Gestionar reservaciones ← NUEVO
```

---

### **RP (Relaciones Públicas)**

```
✅ Panel RP (ver sus mesas asignadas)
✅ Reservaciones (crear/gestionar)
✅ Autorizar cortesías
✅ Ver límites de cortesías
✅ Ver historial de cortesías
```

**Accesos:**
```
/dashboard/rp-login        → Login de RP
/dashboard/rp              → Panel RP
/dashboard/reservaciones   → Gestionar reservaciones ← NUEVO
```

**Cortesías disponibles por RP:**
```
🥃 Shots: 10 disponibles
🍾 Descuento Botella (10%): 5 disponibles
⚫ Perlas Negras: 3 disponibles
🥂 Shots de Bienvenida: 5 disponibles
```

---

### **MESERO**

```
✅ Panel Mesero
✅ Ver mesas asignadas
✅ Tomar pedidos
✅ Enviar a cocina
✅ Calificar servicio
```

**Accesos:**
```
/dashboard/mesero          → Panel mesero
```

---

### **CADENA**

```
✅ Panel Cadena
✅ Ver estado de mesas
✅ Gestionar pedidos
✅ Coordinar servicio
```

**Accesos:**
```
/dashboard/cadena          → Panel cadena
```

---

## 🔄 FLUJO DE LOGIN

### **Admin/Hostess/Mesero/Cadena:**

```
1. Ir a: http://localhost:3000/login
2. Ingresar usuario y contraseña
3. Click "Iniciar Sesión"
4. ✅ Redirige a su panel correspondiente
```

### **RP:**

```
1. Ir a: http://localhost:3000/dashboard/rp-login
2. Seleccionar RP de la lista
3. Ingresar contraseña
4. Click "Iniciar Sesión"
5. ✅ Redirige a /dashboard/rp
6. ✅ Sesión válida por 3 horas
```

---

## 📋 SISTEMA DE RESERVACIONES

### **¿Quién puede crear reservaciones?**

```
✅ Admin
✅ Hostess
✅ RP
```

### **¿Cómo crear una reservación?**

```
1. Ir a: /dashboard/reservaciones
2. Click "Nueva Reservación"
3. Llenar formulario:
   ┌─────────────────────────────────────────┐
   │ Nombre: Juan Pérez                      │
   │ Teléfono: +52 555 123 4567              │
   │ Fecha: 2025-10-15                       │
   │ Hora: 21:00                             │
   │ Personas: 4                             │
   │ RP: Carlos RP (opcional)                │
   │ Notas: Mesa cerca de la pista           │
   └─────────────────────────────────────────┘
4. Click "Crear Reservación"
5. ✅ Reservación guardada (SIN asignar mesa)
```

### **¿Cómo confirmar asistencia?**

```
1. Cliente llega al restaurante
2. En /dashboard/reservaciones
3. Buscar reservación del cliente
4. Click botón "Llegó"
5. Seleccionar mesa disponible
6. Click "Confirmar y Asignar Mesa"
7. ✅ Mesa asignada
8. ✅ Cliente puede empezar a consumir
```

---

## 🗺️ MAPA DE RUTAS

### **Públicas (sin login):**
```
/                          → Redirige a /login
/login                     → Login general
/dashboard/selector-rol    → Selector de rol
/dashboard/rp-login        → Login específico de RPs
```

### **Admin:**
```
/dashboard                 → Dashboard principal
/dashboard/reservaciones   → Gestionar reservaciones
/dashboard/clientes        → Gestión de clientes
/dashboard/mesas-clientes  → Estado de mesas
/dashboard/pos             → Punto de venta
/dashboard/estadisticas    → Estadísticas
/dashboard/reportes-clientes → Reportes
/dashboard/rewards         → Sistema de rewards
/dashboard/gestion-rp      → Gestión de RPs
```

### **Hostess:**
```
/dashboard/hostess         → Panel principal
/dashboard/reservaciones   → Gestionar reservaciones
```

### **RP:**
```
/dashboard/rp              → Panel RP
/dashboard/reservaciones   → Gestionar reservaciones
```

### **Mesero:**
```
/dashboard/mesero          → Panel mesero
```

### **Cadena:**
```
/dashboard/cadena          → Panel cadena
```

---

## 🔐 CAMBIAR CONTRASEÑAS

### **Cambiar contraseña de RP:**

```sql
-- En Supabase SQL Editor:
UPDATE limites_cortesias_rp
SET password = 'nueva_contraseña'
WHERE rp_nombre = 'Carlos RP';
```

### **Ejemplo:**

```sql
-- Cambiar contraseña de Carlos RP a "carlos456"
UPDATE limites_cortesias_rp
SET password = 'carlos456'
WHERE rp_nombre = 'Carlos RP';

-- Verificar cambio
SELECT rp_nombre, password 
FROM limites_cortesias_rp 
WHERE rp_nombre = 'Carlos RP';
```

---

## 📊 VERIFICAR ACCESOS

### **Ver todos los RPs activos:**

```sql
SELECT 
  rp_nombre as "RP",
  password as "Contraseña",
  activo as "Activo",
  shots_disponibles as "Shots",
  descuento_botella_disponible as "Desc. Botella",
  perlas_negras_disponibles as "Perlas Negras"
FROM limites_cortesias_rp
WHERE activo = true
ORDER BY rp_nombre;
```

---

## ✅ RESUMEN RÁPIDO

```
╔════════════════════════════════════════════════════╗
║   CONTRASEÑAS RPs:                                 ║
║   • Carlos RP: carlos123                           ║
║   • Ana RP: ana123                                 ║
║   • Luis RP: luis123                               ║
║                                                    ║
║   LOGIN RPs:                                       ║
║   http://localhost:3000/dashboard/rp-login         ║
║                                                    ║
║   RESERVACIONES:                                   ║
║   http://localhost:3000/dashboard/reservaciones    ║
║   (Acceso: Admin, Hostess, RP)                     ║
║                                                    ║
║   MENÚ ACTUALIZADO:                                ║
║   ✅ "Reservaciones" agregado al sidebar           ║
╚════════════════════════════════════════════════════╝
```

---

**¡Sistema completo con accesos y contraseñas!** 🔐✅🚀
