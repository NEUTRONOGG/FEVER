# 🔗 INTEGRACIÓN COMPLETA: POS + CRM + SUPABASE

## 📋 Resumen

El sistema está **100% integrado** conectando:
- **Mesas con Clientes** (CRM)
- **Punto de Venta** (POS)
- **Base de Datos** (Supabase)
- **Métricas en Tiempo Real**

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO INTEGRADO                               │
└─────────────────────────────────────────────────────────────────┘

1. LLEGADA DEL CLIENTE
   ↓
   [Mesas] → Asignar mesa + cliente + hostess
   ↓
   Supabase: mesas_clientes (estado: ocupada)
   Supabase: visitas (nueva visita)

2. TOMAR ORDEN
   ↓
   [POS] → Seleccionar mesa → Agregar productos
   ↓
   Supabase: mesas_clientes.pedidos_data (actualizar)
   Supabase: mesas_clientes.total_actual (sumar)

3. CONSUMO EN TIEMPO REAL
   ↓
   [POS] → Enviar más pedidos
   ↓
   Supabase: pedidos_data (acumular)
   Supabase: total_actual (incrementar)

4. CERRAR CUENTA
   ↓
   [POS] → Cerrar cuenta
   ↓
   Supabase: tickets (crear ticket)
   Supabase: clientes.consumo_total (actualizar)
   Supabase: clientes.total_visitas (incrementar)

5. FINALIZAR SERVICIO
   ↓
   [Mesas] → Calificar hostess → Liberar mesa
   ↓
   Supabase: calificaciones_hostess (guardar)
   Supabase: visitas (finalizar)
   Supabase: clientes (actualizar métricas)
   Supabase: rachas (verificar y actualizar)
   Supabase: rewards (otorgar automáticos)
   Supabase: mesas_clientes (liberar)

6. MÉTRICAS ACTUALIZADAS
   ↓
   [Dashboard] → Ver métricas en tiempo real
   [Estadísticas] → Análisis completo
   [Reportes] → Rachas, género, hostess
```

---

## 📱 PÁGINAS DEL SISTEMA

### 1. Dashboard (`/dashboard`)
**Función:** Vista general del negocio
**Datos de Supabase:**
- `obtenerClientesActivos()` → Clientes últimos 30 días
- `obtenerVisitasHoy()` → Visitas del día
- `obtenerTopClientes()` → Top 5 por consumo
- `calcularTicketPromedio()` → Promedio de tickets
- `obtenerClientesConRachas()` → Clientes con rachas activas

**Actualización:** Cada 30 segundos

---

### 2. Clientes (`/dashboard/clientes`)
**Función:** Gestión completa de clientes
**Datos de Supabase:**
- `obtenerClientes()` → Lista completa
- `buscarClientePorTelefono()` → Búsqueda rápida
- `crearCliente()` → Registro nuevo
- `actualizarCliente()` → Editar información

**Información guardada:**
- Datos personales (nombre, teléfono, email, género)
- Métricas (visitas, consumo, ticket promedio)
- Fidelidad (nivel, puntos, QR Wallet)
- Rachas activas

---

### 3. Mesas (`/dashboard/mesas-clientes`)
**Función:** Asignar clientes a mesas
**Datos de Supabase:**
- `obtenerMesas()` → Estado de todas las mesas
- `asignarMesaCliente()` → Asignar cliente + hostess
- `crearVisita()` → Registrar nueva visita
- `crearCalificacionHostess()` → Guardar calificación
- `liberarMesa()` → Finalizar servicio

**Flujo:**
```
1. Click en mesa disponible
2. Buscar cliente (o registrar nuevo)
3. Seleccionar hostess (obligatorio)
4. Seleccionar mesero (opcional)
5. Ingresar número de personas
6. Asignar → Crea visita en Supabase
```

**Al finalizar:**
```
1. Click en mesa ocupada
2. Calificar hostess (atención, rapidez, amabilidad)
3. Sistema automáticamente:
   - Guarda calificación
   - Finaliza visita
   - Actualiza métricas del cliente
   - Verifica rachas
   - Otorga rewards automáticos
   - Libera la mesa
```

---

### 4. POS (`/dashboard/pos`) ⭐ NUEVO
**Función:** Registrar consumos en tiempo real
**Datos de Supabase:**
- `obtenerMesas()` → Solo mesas ocupadas con clientes
- `actualizarPedidosMesa()` → Agregar productos
- `crearTicket()` → Cerrar cuenta

**Características:**
- **Panel Izquierdo:** Mesas ocupadas con clientes
- **Panel Central:** Catálogo de productos
- **Panel Derecho:** Pedido actual

**Flujo de Pedido:**
```
1. Seleccionar mesa ocupada
2. Buscar productos (por categoría o nombre)
3. Agregar al pedido
4. Ajustar cantidades
5. Enviar pedido → Actualiza mesa en Supabase
```

**Flujo de Cierre:**
```
1. Click "Cerrar Cuenta"
2. Confirmar total
3. Sistema crea ticket en Supabase
4. Actualiza consumo del cliente
5. Mesa lista para finalizar servicio
```

**Integración con CRM:**
- Cada pedido se vincula al cliente de la mesa
- El consumo se acumula en tiempo real
- Al cerrar cuenta, se actualiza el perfil del cliente
- Las métricas se reflejan inmediatamente en Dashboard

---

### 5. Estadísticas (`/dashboard/estadisticas`)
**Función:** Análisis completo de clientes
**Datos de Supabase:**
- `obtenerMetricasGenero()` → Distribución por género
- Todas las métricas calculadas en tiempo real

**Métricas mostradas:**
- Total clientes, activos, nuevos
- Consumo total y ticket promedio
- Distribución por género
- Niveles de fidelidad
- Top productos por género
- Horarios preferidos
- Rachas activas

---

### 6. Reportes (`/dashboard/reportes-clientes`)
**Función:** Reportes personalizados
**Tabs:**
- Rachas (consecutivas y fines de semana)
- Por Género (comparativas)
- Fidelización (niveles)
- Hostess (calificaciones por horario)
- Visitas (patrones)

---

### 7. Rewards (`/dashboard/rewards`)
**Función:** Sistema de recompensas
**Datos de Supabase:**
- `crearReward()` → Crear reward manual
- `obtenerRewardsActivos()` → Rewards disponibles
- `usarReward()` → Canjear reward

**Rewards Automáticos:**
- Se otorgan al finalizar servicio
- Basados en rachas y nivel de fidelidad
- Se pueden canjear en próxima visita

---

## 🗄️ TABLAS DE SUPABASE Y SU USO

### 1. `clientes`
**Actualizada por:**
- Mesas (al registrar nuevo cliente)
- POS (al cerrar cuenta → consumo_total)
- Mesas (al finalizar → total_visitas, última_visita)

**Campos clave:**
- `consumo_total` → Suma de todos los tickets
- `total_visitas` → Contador de visitas
- `visitas_consecutivas` → Para rachas
- `nivel_fidelidad` → Bronce → Diamante
- `puntos_rewards` → Acumulados

---

### 2. `visitas`
**Creada por:** Mesas (al asignar cliente)
**Actualizada por:** Mesas (al finalizar servicio)

**Campos clave:**
- `cliente_id` → Vincula con cliente
- `mesa_numero` → Mesa asignada
- `hostess` → Hostess que atendió
- `mesero` → Mesero asignado
- `total_consumo` → Total de la visita
- `productos_consumidos` → Array de productos
- `calificacion_hostess` → Calificación dada

---

### 3. `mesas_clientes`
**Actualizada por:**
- Mesas (al asignar/liberar)
- POS (al agregar pedidos)

**Campos clave:**
- `estado` → disponible, ocupada, reservada, limpieza
- `cliente_id` → Cliente asignado
- `cliente_nombre` → Nombre visible
- `hostess` → Hostess asignada
- `mesero` → Mesero asignado
- `pedidos_data` → Array de pedidos (JSON)
- `total_actual` → Total acumulado

**Flujo de datos:**
```
Asignar → estado: ocupada, cliente_id, hostess
POS → pedidos_data: [...productos], total_actual: suma
Liberar → estado: disponible, limpiar datos
```

---

### 4. `calificaciones_hostess`
**Creada por:** Mesas (al finalizar servicio)

**Campos clave:**
- `hostess` → Nombre de la hostess
- `horario` → desayuno, comida, cena, tarde
- `mesa_numero` → Mesa atendida
- `calificacion_atencion` → 1-5
- `calificacion_rapidez` → 1-5
- `calificacion_amabilidad` → 1-5
- `calificacion_general` → Promedio

**Uso:**
- Reportes de desempeño por hostess
- Análisis por horario
- Identificar mejores prácticas

---

### 5. `tickets`
**Creada por:** POS (al cerrar cuenta)

**Campos clave:**
- `cliente_id` → Cliente que consumió
- `numero_ticket` → Generado automáticamente
- `productos` → Array de productos (JSON)
- `total` → Total del ticket
- `mesero` → Quien atendió
- `hostess` → Quien recibió

**Uso:**
- Historial de consumo por cliente
- Cálculo de ticket promedio
- Análisis de productos más vendidos

---

### 6. `rewards`
**Creada por:**
- Sistema (automático al completar racha)
- Manual (desde página de rewards)

**Campos clave:**
- `cliente_id` → Cliente beneficiado
- `tipo` → puntos, descuento, producto_gratis, etc.
- `activo` → true/false
- `usado` → true/false
- `fecha_expiracion` → Vigencia

**Uso:**
- Fidelización de clientes
- Incentivos por rachas
- Descuentos especiales

---

### 7. `rachas`
**Actualizada por:** Sistema (al finalizar visita)

**Campos clave:**
- `cliente_id` → Cliente
- `tipo` → fines_semana, semanal, mensual
- `visitas_actuales` → Contador
- `visitas_objetivo` → Meta
- `completada` → true/false

**Uso:**
- Seguimiento de logros
- Otorgar rewards automáticos
- Gamificación

---

### 8. `fila_espera`
**Creada por:** Mesas (cuando no hay disponibles)

**Campos clave:**
- `cliente_id` → Cliente en espera
- `numero_personas` → Personas en grupo
- `estado` → esperando, notificado, sentado
- `posicion` → Lugar en la fila

**Uso:**
- Gestión de waitlist
- Notificaciones
- Asignación automática

---

## 🔄 SINCRONIZACIÓN EN TIEMPO REAL

### Eventos del Sistema:

```javascript
// Evento: Mesa actualizada
window.dispatchEvent(new Event('mesa-actualizada'))

// Evento: Venta registrada
window.dispatchEvent(new Event('venta-registrada'))

// Evento: Cliente actualizado
window.dispatchEvent(new Event('cliente-actualizado'))
```

### Páginas que escuchan eventos:

**Dashboard:**
- Actualiza cada 30 segundos
- Escucha eventos de nuevas ventas

**Mesas:**
- Actualiza cada 5 segundos
- Escucha eventos de mesa-actualizada

**POS:**
- Actualiza cada 10 segundos
- Escucha eventos de venta-registrada

---

## 📊 MÉTRICAS CALCULADAS

### En el Cliente:
```typescript
// Al cerrar cuenta
consumo_total += ticket.total
total_visitas += 1
consumo_promedio = consumo_total / total_visitas
ultima_visita = NOW()

// Si es ticket más alto
if (ticket.total > ticket_mas_alto) {
  ticket_mas_alto = ticket.total
}

// Verificar rachas
if (visita_consecutiva) {
  visitas_consecutivas += 1
} else {
  visitas_consecutivas = 1
}

// Actualizar nivel de fidelidad
if (total_visitas >= 50) nivel = 'diamante'
else if (total_visitas >= 30) nivel = 'platino'
else if (total_visitas >= 15) nivel = 'oro'
else if (total_visitas >= 5) nivel = 'plata'
else nivel = 'bronce'
```

### En el Dashboard:
```typescript
// Clientes activos
clientes.filter(c => c.ultima_visita >= hace_30_dias)

// Ticket promedio
tickets.reduce((sum, t) => sum + t.total, 0) / tickets.length

// Top clientes
clientes.sort((a, b) => b.consumo_total - a.consumo_total).slice(0, 5)
```

---

## 🎯 VENTAJAS DE LA INTEGRACIÓN

### 1. **Datos Centralizados**
- Todo en Supabase
- Sin duplicación de datos
- Consistencia garantizada

### 2. **Tiempo Real**
- Métricas actualizadas instantáneamente
- Dashboard refleja estado actual
- Mesas sincronizadas con POS

### 3. **Trazabilidad Completa**
- Cada consumo vinculado a un cliente
- Historial completo de visitas
- Calificaciones por hostess y horario

### 4. **Automatización**
- Rewards automáticos por rachas
- Actualización de métricas
- Cálculo de niveles de fidelidad

### 5. **Análisis Profundo**
- Consumo por género
- Productos favoritos por género
- Horarios preferidos
- Desempeño de hostess

---

## 🚀 FLUJO DE TRABAJO COMPLETO

### Escenario: Cliente llega al restaurante

```
PASO 1: RECEPCIÓN
├─ Hostess abre: /dashboard/mesas-clientes
├─ Busca cliente por teléfono: +52 555 123 4567
├─ Cliente encontrado: Carlos Méndez
├─ Selecciona mesa disponible: Mesa 5
├─ Asigna hostess: María González
├─ Asigna mesero: Pedro López
├─ Número de personas: 4
└─ Click "Asignar Mesa"
    ↓
    Supabase:
    - mesas_clientes: estado → ocupada, cliente_id, hostess, mesero
    - visitas: nueva visita con hora_llegada

PASO 2: TOMAR ORDEN
├─ Mesero abre: /dashboard/pos
├─ Selecciona: Mesa 5 - Carlos Méndez
├─ Agrega productos:
│  ├─ 2x Cerveza Corona ($45 c/u)
│  ├─ 1x Hamburguesa Premium ($120)
│  └─ 1x Alitas Picantes ($95)
├─ Total pedido: $305
└─ Click "Enviar Pedido"
    ↓
    Supabase:
    - mesas_clientes.pedidos_data: [...productos]
    - mesas_clientes.total_actual: $305

PASO 3: SEGUNDA ORDEN
├─ Cliente pide más
├─ Mesero agrega:
│  ├─ 2x Cerveza Corona ($45 c/u)
│  └─ 1x Postre ($65)
├─ Total nuevo pedido: $155
└─ Click "Enviar Pedido"
    ↓
    Supabase:
    - mesas_clientes.pedidos_data: [...productos anteriores, ...nuevos]
    - mesas_clientes.total_actual: $460

PASO 4: CERRAR CUENTA
├─ Cliente solicita cuenta
├─ Mesero en POS: Click "Cerrar Cuenta"
├─ Confirma total: $460
└─ Click "Confirmar Pago"
    ↓
    Supabase:
    - tickets: nuevo ticket con todos los productos
    - clientes.consumo_total: += $460
    - clientes.ticket_mas_alto: actualizar si aplica

PASO 5: FINALIZAR SERVICIO
├─ Hostess en Mesas: Click en Mesa 5
├─ Click "Finalizar Servicio"
├─ Califica hostess:
│  ├─ Atención: 5 estrellas
│  ├─ Rapidez: 5 estrellas
│  └─ Amabilidad: 5 estrellas
├─ Comentarios: "Excelente servicio"
└─ Click "Guardar y Liberar Mesa"
    ↓
    Supabase:
    - calificaciones_hostess: nueva calificación
    - visitas: hora_salida, total_consumo: $460
    - clientes.total_visitas: += 1
    - clientes.ultima_visita: NOW()
    - clientes.visitas_consecutivas: verificar y actualizar
    - rachas: verificar si completó alguna
    - rewards: otorgar automáticos si aplica
    - mesas_clientes: estado → disponible, limpiar datos

PASO 6: MÉTRICAS ACTUALIZADAS
├─ Dashboard muestra:
│  ├─ Clientes activos: actualizado
│  ├─ Visitas hoy: +1
│  ├─ Ticket promedio: recalculado
│  └─ Top clientes: Carlos Méndez actualizado
├─ Estadísticas muestra:
│  ├─ Consumo por género: actualizado
│  └─ Top productos: actualizados
└─ Reportes muestra:
    ├─ Rachas: si Carlos completó racha
    └─ Hostess: calificación de María actualizada
```

---

## ✅ CHECKLIST DE INTEGRACIÓN

- [x] Mesas conectadas con Supabase
- [x] POS conectado con Supabase
- [x] Clientes vinculados a mesas
- [x] Pedidos registrados en tiempo real
- [x] Tickets creados al cerrar cuenta
- [x] Calificaciones de hostess guardadas
- [x] Métricas de clientes actualizadas
- [x] Rachas verificadas automáticamente
- [x] Rewards otorgados automáticamente
- [x] Dashboard con datos en tiempo real
- [x] Estadísticas calculadas correctamente
- [x] Reportes con información completa

---

## 🎉 RESULTADO FINAL

El sistema está **100% integrado** con:

✅ **Mesas** → Asignan clientes y hostess
✅ **POS** → Registra consumos en tiempo real
✅ **Supabase** → Almacena todo centralizado
✅ **Dashboard** → Muestra métricas actualizadas
✅ **Estadísticas** → Análisis completo
✅ **Reportes** → Información detallada
✅ **Rewards** → Sistema automático

**Todo conectado, todo en tiempo real, todo en Supabase.** 🚀
