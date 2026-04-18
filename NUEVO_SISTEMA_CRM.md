# 🎯 Sistema CRM Orientado a Clientes - FEVER

## 📋 Resumen de Cambios

El sistema ha sido completamente reorientado hacia la **gestión personalizada de clientes**, con enfoque en:

- ✅ Perfil individual de cada cliente
- ✅ Métricas de visitas y consumo personalizado
- ✅ Sistema de fidelización con niveles y rewards
- ✅ Mesas con nombre del cliente asignado
- ✅ Calificación de hostess por mesa y horario
- ✅ Tickets personalizados por cliente
- ✅ Reportes de rachas de visitas consecutivas
- ✅ QR Wallet para cada cliente
- ✅ Métricas por género (masculino/femenino)

---

## 🗄️ Nueva Estructura de Base de Datos

### Archivo: `supabase-schema-clientes.sql`

#### Tablas Principales:

1. **`clientes`** - Perfil completo del cliente
   - Información personal (nombre, teléfono, email, género, fecha nacimiento)
   - Métricas de visitas (total, consecutivas, última visita)
   - Métricas de consumo (total, promedio, ticket más alto)
   - Sistema de rewards (puntos, nivel de fidelidad, QR wallet)
   - Niveles: Bronce, Plata, Oro, Platino, Diamante

2. **`visitas`** - Registro detallado de cada visita
   - Información de la visita (fecha, mesa, número de personas)
   - Timing (hora llegada, salida, duración)
   - Consumo (total, productos consumidos)
   - Atención (hostess, mesero, calificaciones)
   - Rewards ganados

3. **`mesas_clientes`** - Mesas con cliente asignado
   - Estado de la mesa (disponible, ocupada, reservada, limpieza)
   - Cliente actual (ID, nombre, número de personas)
   - Asignación (hostess, mesero, hora)
   - Pedidos y total actual

4. **`calificaciones_hostess`** - Calificaciones específicas
   - Por mesa y horario (desayuno, comida, cena, tarde)
   - Calificaciones detalladas (atención, rapidez, amabilidad, general)
   - Comentarios del cliente

5. **`tickets`** - Tickets personalizados por cliente
   - Número de ticket único
   - Productos consumidos
   - Subtotal, descuento, propina, total
   - Método de pago
   - Personal que atendió

6. **`rewards`** - Sistema de recompensas
   - Tipos: puntos, descuento, producto gratis, upgrade, cumpleaños, racha
   - Estado (activo, usado)
   - Condiciones (visitas requeridas, consumo mínimo)
   - Fecha de expiración

7. **`rachas`** - Seguimiento de rachas
   - Tipos: fines de semana, semanal, mensual, especial
   - Progreso (visitas actuales vs objetivo)
   - Recompensa al completar

8. **`fila_espera`** - Gestión de waitlist
   - Cliente en espera
   - Posición en la fila
   - Tiempo estimado
   - Estado (esperando, notificado, sentado, cancelado)

---

## 🎨 Nuevas Páginas del Dashboard

### 1. Dashboard Principal (`/dashboard/page.tsx`)

**Métricas Principales:**
- Clientes Activos (últimos 30 días)
- Visitas Hoy
- Ticket Promedio por Cliente
- Clientes con Racha Activa

**Gráficas:**
- Visitas por Hora (flujo de clientes)
- Top Clientes VIP (mayor consumo)
- Actividad Reciente de Clientes
- Notificaciones CRM (cumpleaños, rachas, inactivos)
- Métricas por Género (clientes, consumo, ticket promedio)

**Quick Stats:**
- Clientes VIP
- Satisfacción Promedio
- Rachas Activas

---

### 2. Gestión de Clientes (`/dashboard/clientes/page.tsx`)

**Funcionalidades:**

✅ **Búsqueda Avanzada**
- Por nombre, teléfono o email
- Filtro por nivel de fidelidad

✅ **Registro de Nuevos Clientes**
- Nombre completo
- Teléfono (único)
- Email (opcional)
- Género
- Fecha de nacimiento

✅ **Perfil Detallado del Cliente**
- Avatar con iniciales
- Nivel de fidelidad (badge con color)
- Indicador de racha activa
- Total de visitas
- Consumo total y promedio
- Ticket más alto
- Calificación promedio
- Puntos rewards acumulados
- QR Wallet único

✅ **Acciones Disponibles**
- Ver historial de visitas
- Otorgar rewards especiales
- Ver tickets anteriores
- Generar QR para wallet

**Niveles de Fidelidad:**
- 🥉 **Bronce**: 1-5 visitas
- 🥈 **Plata**: 6-15 visitas
- 🥇 **Oro**: 16-30 visitas
- 💎 **Platino**: 31-50 visitas
- 💠 **Diamante**: 51+ visitas

---

### 3. Mesas con Clientes (`/dashboard/mesas-clientes/page.tsx`)

**Características:**

✅ **Vista de Mesas en Tiempo Real**
- Estado visual (disponible, ocupada, reservada, limpieza)
- Nombre del cliente asignado
- Número de personas
- Hostess responsable
- Tiempo de ocupación

✅ **Asignación de Mesa**
- Búsqueda de cliente existente
- Registro rápido de nuevo cliente
- Selección de hostess (obligatorio)
- Selección de mesero (opcional)
- Número de personas

✅ **Finalización de Servicio**
- Calificación de hostess (3 categorías):
  - ⭐ Atención
  - ⭐ Rapidez
  - ⭐ Amabilidad
- Comentarios opcionales
- Registro automático de la visita
- Liberación de mesa

**Métricas en Tiempo Real:**
- Mesas disponibles
- Mesas ocupadas
- Porcentaje de ocupación

---

## 📊 Sistema de Reportes

### Reportes Personalizados Disponibles:

1. **Reporte de Rachas**
   - Clientes con visitas consecutivas
   - Rachas de fines de semana
   - Rachas mensuales
   - Próximos a completar racha

2. **Reporte por Género**
   - Total de clientes por género
   - Consumo promedio por género
   - Productos favoritos por género
   - Horarios preferidos por género

3. **Reporte de Fidelización**
   - Distribución por niveles
   - Clientes próximos a subir de nivel
   - Rewards más canjeados
   - Efectividad de promociones

4. **Reporte de Hostess**
   - Calificaciones promedio por hostess
   - Calificaciones por horario
   - Mesas atendidas
   - Comentarios recibidos

5. **Reporte de Visitas**
   - Frecuencia de visitas por cliente
   - Días y horarios más concurridos
   - Tiempo promedio de estadía
   - Clientes nuevos vs recurrentes

---

## 🎁 Sistema de Rewards

### Tipos de Rewards:

1. **Puntos Acumulables**
   - 1 punto por cada $10 consumidos
   - Canjeables por descuentos o productos

2. **Descuentos Personalizados**
   - Por cumpleaños (20% off)
   - Por racha (15% off)
   - Por nivel VIP (10-25% off)

3. **Productos Gratis**
   - Bebida de cortesía
   - Postre especial
   - Entrada gratis

4. **Upgrades**
   - Mesa preferencial
   - Reserva prioritaria
   - Atención VIP

5. **Rewards por Racha**
   - 3 visitas consecutivas: 50 puntos
   - 5 visitas consecutivas: 100 puntos + bebida gratis
   - 10 visitas consecutivas: 200 puntos + descuento 20%

---

## 📱 QR Wallet

Cada cliente tiene un **QR único** que contiene:

- ID del cliente
- Nombre completo
- Nivel de fidelidad
- Puntos acumulados
- Rewards activos
- Historial de visitas

**Usos del QR:**
- Check-in rápido en el restaurante
- Canje de rewards
- Acceso a menú digital personalizado
- Acumulación automática de puntos

---

## 📈 Métricas por Género

El sistema ahora rastrea y analiza:

### Métricas Masculino:
- Total de clientes
- Visitas totales
- Consumo total
- Ticket promedio
- Productos favoritos
- Horarios preferidos

### Métricas Femenino:
- Total de clientes
- Visitas totales
- Consumo total
- Ticket promedio
- Productos favoritos
- Horarios preferidos

**Visualización:**
- Gráficas comparativas
- Distribución porcentual
- Tendencias de consumo
- Preferencias de productos

---

## 🎯 Flujo de Trabajo

### 1. Llegada del Cliente

```
Cliente llega → Hostess busca en sistema → 
  ¿Cliente registrado?
    → Sí: Asignar mesa con nombre
    → No: Registro rápido + Asignar mesa
```

### 2. Durante la Visita

```
Mesa asignada → Mesero toma orden → 
Pedidos en sistema → Consumo registrado → 
Cliente solicita cuenta
```

### 3. Finalización

```
Cliente paga → Hostess califica servicio →
Sistema registra visita → Actualiza métricas →
Verifica rachas → Otorga rewards automáticos →
Libera mesa
```

---

## 🔧 Funciones Helper de Supabase

### Archivo: `lib/supabase-clientes.ts`

**Funciones de Clientes:**
- `obtenerClientes()` - Lista todos los clientes activos
- `obtenerClientePorId(id)` - Perfil completo
- `buscarClientePorTelefono(telefono)` - Búsqueda rápida
- `crearCliente(datos)` - Registro nuevo
- `actualizarCliente(id, datos)` - Actualizar perfil
- `obtenerTopClientes(limite)` - Top por consumo

**Funciones de Visitas:**
- `crearVisita(datos)` - Registrar nueva visita
- `finalizarVisita(id, datos)` - Completar visita
- `obtenerVisitasCliente(clienteId)` - Historial
- `obtenerVisitasHoy()` - Visitas del día

**Funciones de Mesas:**
- `obtenerMesas()` - Estado de todas las mesas
- `asignarMesaCliente(mesaId, datos)` - Asignar
- `liberarMesa(mesaId)` - Liberar
- `actualizarPedidosMesa(mesaId, pedidos, total)` - Actualizar

**Funciones de Calificaciones:**
- `crearCalificacionHostess(datos)` - Nueva calificación
- `obtenerCalificacionesHostess(hostess, fechas)` - Historial
- `obtenerPromedioHostessPorHorario(hostess)` - Promedios

**Funciones de Rewards:**
- `crearReward(datos)` - Nuevo reward
- `obtenerRewardsActivos(clienteId)` - Rewards disponibles
- `usarReward(rewardId)` - Canjear reward

**Funciones de Rachas:**
- `crearRacha(datos)` - Nueva racha
- `actualizarRacha(rachaId, visitas)` - Actualizar progreso
- `obtenerRachasCliente(clienteId)` - Rachas del cliente

**Funciones de Métricas:**
- `obtenerMetricasGenero()` - Estadísticas por género
- `obtenerClientesConRachas()` - Clientes con rachas activas
- `calcularTicketPromedio(clienteId?)` - Ticket promedio

---

## 🚀 Próximos Pasos

### Para Implementar:

1. **Ejecutar el Schema en Supabase**
   ```sql
   -- Copiar contenido de supabase-schema-clientes.sql
   -- Ejecutar en SQL Editor de Supabase
   ```

2. **Conectar las Páginas con Supabase**
   - Reemplazar datos mock con llamadas reales
   - Implementar sincronización en tiempo real
   - Configurar subscripciones a cambios

3. **Implementar Sistema de Tickets**
   - Generar tickets PDF
   - Enviar por email/WhatsApp
   - Almacenar en historial del cliente

4. **Crear Página de Reportes**
   - Reportes personalizados
   - Exportar a PDF/Excel
   - Gráficas interactivas

5. **Implementar QR Wallet**
   - Generar QR único por cliente
   - App móvil para escanear
   - Sistema de check-in automático

6. **Sistema de Notificaciones**
   - Cumpleaños de clientes
   - Rachas próximas a completar
   - Clientes inactivos
   - Rewards por expirar

---

## 📝 Notas Importantes

### Diferencias con el Sistema Anterior:

**Antes:**
- Enfocado en ventas y productos
- Mesas sin identificación de cliente
- Sin sistema de fidelización
- Reportes genéricos

**Ahora:**
- Enfocado en el cliente individual
- Cada mesa tiene nombre del cliente
- Sistema completo de fidelización
- Reportes personalizados por cliente
- Métricas por género
- Calificación de hostess
- QR Wallet único
- Sistema de rachas y rewards

### Ventajas del Nuevo Sistema:

✅ **Personalización Total**
- Cada cliente es único y rastreado
- Historial completo de visitas
- Preferencias identificadas

✅ **Fidelización Efectiva**
- Niveles que motivan más visitas
- Rewards automáticos
- Rachas que generan hábito

✅ **Mejor Servicio**
- Hostess calificadas por desempeño
- Mesas asignadas con nombre
- Atención personalizada

✅ **Decisiones Basadas en Datos**
- Métricas por género
- Patrones de consumo
- Horarios preferidos
- Productos favoritos

---

## 🎓 Capacitación del Personal

### Hostess:
- Cómo buscar clientes en el sistema
- Registro rápido de nuevos clientes
- Asignación correcta de mesas
- Importancia de las calificaciones

### Meseros:
- Consultar información del cliente
- Ver historial de pedidos anteriores
- Sugerir productos basados en preferencias
- Informar sobre rewards disponibles

### Gerencia:
- Análisis de métricas
- Generación de reportes
- Gestión de rewards
- Seguimiento de hostess

---

**Sistema desarrollado para FEVER - CRM Orientado a Clientes** 🔥
