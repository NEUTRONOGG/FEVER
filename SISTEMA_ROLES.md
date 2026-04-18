# 🎭 SISTEMA DE ROLES - Documentación Completa

## ✅ IMPLEMENTACIÓN COMPLETADA

Se ha creado un sistema completo de roles con accesos específicos para cada tipo de usuario del restaurante.

---

## 🎯 SELECTOR DE ROL

**Ruta:** `/dashboard/selector-rol`

Al iniciar sesión, los usuarios son dirigidos a un selector visual donde eligen su rol:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SELECCIONA TU ROL                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [👥 Hostess]  [🍽️ Mesero]  [🛡️ Cadena]  [✨ RP]              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 👥 1. HOSTESS - Primer Contacto

**Ruta:** `/dashboard/hostess`

### Función Principal:
**Primer contacto con el cliente**. Registra datos importantes y asigna mesas.

### Características:

#### 📊 Dashboard
- Total de mesas
- Mesas disponibles
- Mesas ocupadas
- Porcentaje de ocupación

#### 🟢 Mesas Disponibles
- Vista en grid de todas las mesas libres
- Click para asignar cliente
- Capacidad visible

#### 🔴 Mesas Ocupadas
- Lista de mesas con clientes
- Nombre del cliente visible
- Total de consumo actual
- Tiempo de ocupación
- Click para finalizar servicio

### Flujo de Registro de Cliente:

```
1. BUSCAR CLIENTE
   ├─ Ingresar teléfono
   ├─ Si existe: Cargar datos
   └─ Si no existe: Registro nuevo

2. DATOS REQUERIDOS (Dictados por Hostess)
   ├─ Nombre * (obligatorio)
   ├─ Apellido
   ├─ Teléfono * (obligatorio)
   ├─ Edad * (obligatorio)
   ├─ Género * (obligatorio - Masculino/Femenino/Otro)
   ├─ Email (opcional)
   └─ Número de personas *

3. ASIGNAR MESA
   ├─ Seleccionar mesa disponible
   ├─ Hostess automáticamente asignada
   ├─ Mesero opcional
   └─ Sistema crea visita en Supabase

4. INFORMACIÓN MAPEADA A:
   ├─ CRM (perfil del cliente)
   ├─ Sistema de mesas (mesa ocupada)
   ├─ Mesero (puede ver la mesa)
   ├─ RP (puede ver consumo)
   └─ Dashboard admin (métricas)
```

### Flujo de Finalización:

```
1. CLICK EN MESA OCUPADA
   ↓
2. CALIFICAR SERVICIO
   ├─ Atención (1-5 ⭐)
   ├─ Rapidez (1-5 ⭐)
   ├─ Amabilidad (1-5 ⭐)
   └─ Comentarios (opcional)
   ↓
3. SISTEMA AUTOMÁTICAMENTE:
   ├─ Guarda calificación por horario
   ├─ Finaliza visita
   ├─ Actualiza métricas del cliente
   ├─ Verifica rachas
   ├─ Otorga rewards automáticos
   └─ Libera la mesa
```

### Integración:
- ✅ Conectado a Supabase
- ✅ Crea clientes en CRM
- ✅ Asigna mesas en tiempo real
- ✅ Calificaciones por horario
- ✅ Datos mapeados a todo el sistema

---

## 🍽️ 2. MESERO - Servicio de Mesas

**Ruta:** `/dashboard/mesero`

### Función Principal:
**Tomar órdenes y gestionar servicio**. Interfaz ágil tipo POS.

### Características:

#### 📊 Dashboard
- Mesas activas
- Total en mesas
- Pedido actual

#### Panel Izquierdo: MIS MESAS
- Solo mesas ocupadas con clientes
- Nombre del cliente
- Número de personas
- Total actual
- Items registrados
- Click para seleccionar

#### Panel Central: PRODUCTOS
- Búsqueda rápida
- Filtro por categoría
- Click para agregar al pedido
- Precio visible

#### Panel Derecho: PEDIDO ACTUAL
- Items seleccionados
- Ajustar cantidades (+/-)
- Eliminar items
- Total en tiempo real
- Botón "Enviar Pedido"

### Flujo de Trabajo:

```
1. SELECCIONAR MESA
   ├─ Ver mesas asignadas
   └─ Click en mesa

2. AGREGAR PRODUCTOS
   ├─ Buscar o filtrar
   ├─ Click en producto
   ├─ Ajustar cantidad
   └─ Repetir

3. ENVIAR PEDIDO
   ├─ Click "Enviar Pedido"
   ├─ Pedido se suma al total de la mesa
   ├─ Se actualiza en Supabase
   └─ Visible para RP y Admin

4. REPETIR PROCESO
   └─ Puede agregar más pedidos a la misma mesa
```

### Integración:
- ✅ Ve solo sus mesas asignadas
- ✅ Actualiza consumo en tiempo real
- ✅ Pedidos acumulados en mesa
- ✅ Sincronizado con POS y CRM

---

## 🛡️ 3. CADENA - Control de Acceso

**Ruta:** `/dashboard/cadena`

### Función Principal:
**Control de acceso y seguridad**. Gestión de flujo de personas y emergencias.

### Características:

#### 📊 Dashboard
- Personas dentro (contador en tiempo real)
- Capacidad (porcentaje)
- Disponible (espacios libres)
- Alertas activas

#### Barra de Capacidad
- Visual del % de ocupación
- Verde: < 75%
- Amarillo: 75-90%
- Rojo: > 90%

#### 3 Botones Principales:

**1. 🟢 REGISTRAR ENTRADA**
- Ingresar cantidad de personas
- Actualiza contador
- Alerta si se acerca a capacidad máxima

**2. 🔵 REGISTRAR SALIDA**
- Ingresar cantidad de personas
- Reduce contador
- Actualiza disponibilidad

**3. 🔴 BOTÓN DE EMERGENCIA**
- Tipo: Pelea o Emergencia General
- Descripción opcional
- Notifica equipo de seguridad
- Crea alerta visible
- Animación de pulso

### Registro de Flujo:
- Historial de entradas/salidas
- Hora de cada registro
- Cantidad de personas
- Tipo (entrada/salida)

### Sistema de Alertas:
- Alertas de capacidad (automáticas)
- Alertas de emergencia (manuales)
- Alertas de peleas (manuales)
- Estado: Activa/Resuelta
- Botón para resolver

### Datos Extras:
- Conteo de personas en tiempo real
- Flujo de entrada/salida
- Horarios pico
- Alertas históricas

### Integración:
- ✅ Datos guardados en localStorage
- ✅ Alertas visibles en tiempo real
- ✅ Historial de eventos
- ✅ Botón de emergencia funcional

---

## ✨ 4. RP (Relaciones Públicas) - Clientes VIP

**Ruta:** `/dashboard/rp`

### Función Principal:
**Gestión de experiencia premium**. Registro de clientes potenciales y beneficios.

### Características:

#### 📊 Dashboard
- Mesas activas
- Consumo total
- Ticket promedio
- Clientes VIP (consumo > $500)

#### Vista de Mesas:
- Todas las mesas ocupadas
- Nombre del cliente
- Número de personas
- Hostess asignada
- **Consumo actual visible**
- **Items registrados**
- Estrella dorada si es VIP (> $500)

### Funciones Principales:

#### 1. 📋 VER CONSUMO DE MESAS
```
Por cada mesa se muestra:
├─ Mesa número
├─ Nombre del cliente
├─ Número de personas
├─ Hostess
├─ Consumo actual ($)
├─ Cantidad de items
└─ Indicador VIP si aplica
```

#### 2. 👤 REGISTRAR CLIENTES POTENCIALES
```
Formulario completo:
├─ Nombre * (obligatorio)
├─ Apellido
├─ Teléfono * (obligatorio)
├─ Email
├─ Edad
├─ Género
└─ Notas/Intereses (importante para seguimiento)

Ejemplo de notas:
"Cliente interesado en eventos VIP, prefiere whisky, 
cumpleaños en diciembre, amigo de [nombre]"

Al registrar:
├─ Se crea en CRM
├─ Nota incluye "Registrado por RP [nombre]"
├─ Amplia cartera de clientes
└─ Disponible para futuras campañas
```

#### 3. 🎁 OTORGAR BENEFICIOS
```
Tipos de beneficios:
├─ Shots Cortesía
├─ Bebida Gratis
├─ Descuento %
└─ Botella Cortesía

Proceso:
1. Seleccionar mesa
2. Elegir tipo de beneficio
3. Ingresar cantidad/porcentaje
4. Descripción opcional
5. Otorgar

Beneficio se registra:
├─ En perfil del cliente (rewards)
├─ Puede canjearse
├─ Visible en sistema
└─ Trackeable para métricas
```

#### 4. 📊 ESTADÍSTICAS
```
Visible en tiempo real:
├─ Consumo por mesa
├─ Ticket promedio
├─ Clientes VIP identificados
└─ Total de mesas activas
```

### Integración:
- ✅ Ve consumo en tiempo real
- ✅ Registra clientes en CRM
- ✅ Otorga rewards
- ✅ Amplia cartera de clientes
- ✅ Seguimiento de clientes potenciales

---

## 🔄 FLUJO COMPLETO INTEGRADO

### Escenario: Cliente VIP llega al restaurante

```
1. LLEGADA (Hostess)
   ├─ Busca por teléfono: +52 555 123 4567
   ├─ Encuentra: Juan Pérez (Nivel Oro, 15 visitas)
   ├─ Asigna: Mesa 8, 4 personas
   └─ Sistema: Crea visita, marca mesa ocupada
   
   MAPEADO A:
   ├─ CRM: Nueva visita registrada
   ├─ Mesero: Ve Mesa 8 - Juan Pérez
   ├─ RP: Ve Mesa 8 con consumo $0
   └─ Admin: Métricas actualizadas

2. PRIMERA ORDEN (Mesero)
   ├─ Selecciona: Mesa 8 - Juan Pérez
   ├─ Agrega: 4 Cervezas, 2 Hamburguesas
   ├─ Total: $380
   └─ Envía pedido
   
   MAPEADO A:
   ├─ Mesa: Total actual $380
   ├─ RP: Ve consumo $380
   ├─ Admin: Dashboard actualizado
   └─ Supabase: pedidos_data actualizado

3. RP IDENTIFICA VIP (RP)
   ├─ Ve Mesa 8: $380 de consumo
   ├─ Cliente conocido (Nivel Oro)
   ├─ Decide otorgar beneficio
   └─ Otorga: 4 Shots Cortesía
   
   MAPEADO A:
   ├─ Cliente: Reward activo
   ├─ Mesero: Puede ver reward
   └─ CRM: Historial de rewards

4. SEGUNDA ORDEN (Mesero)
   ├─ Cliente pide más
   ├─ Agrega: 4 Cervezas, 1 Postre
   ├─ Total nuevo: $245
   ├─ Total acumulado: $625
   └─ Envía pedido
   
   MAPEADO A:
   ├─ Mesa: Total actual $625
   ├─ RP: Ve consumo $625 (VIP ⭐)
   └─ Admin: Métricas actualizadas

5. REGISTRO NUEVO AMIGO (RP)
   ├─ Juan trae amigo nuevo
   ├─ RP registra: Carlos López
   ├─ Teléfono: +52 555 987 6543
   ├─ Notas: "Amigo de Juan Pérez, interesado en eventos"
   └─ Registra en CRM
   
   MAPEADO A:
   ├─ CRM: Nuevo cliente potencial
   ├─ Nota: "Registrado por RP María"
   └─ Disponible para futuras campañas

6. CONTROL DE ACCESO (Cadena)
   ├─ Llega grupo de 8 personas
   ├─ Registra entrada: +8
   ├─ Personas dentro: 145
   ├─ Capacidad: 72.5%
   └─ Todo normal
   
   MAPEADO A:
   ├─ Dashboard Cadena: Actualizado
   └─ Historial de flujo

7. FINALIZAR SERVICIO (Hostess)
   ├─ Mesa 8 solicita cuenta
   ├─ Hostess finaliza servicio
   ├─ Califica: Atención 5⭐, Rapidez 5⭐, Amabilidad 5⭐
   └─ Libera mesa
   
   SISTEMA AUTOMÁTICAMENTE:
   ├─ Guarda calificación
   ├─ Finaliza visita
   ├─ Juan: 16 visitas, $4,125 total
   ├─ Verifica racha: 3 consecutivas
   ├─ Otorga reward: 50 puntos
   └─ Libera Mesa 8
   
   MAPEADO A:
   ├─ CRM: Métricas actualizadas
   ├─ Hostess: Mesa disponible
   ├─ Mesero: Mesa liberada
   ├─ RP: Mesa desaparece de lista
   ├─ Admin: Dashboard actualizado
   └─ Cadena: Puede registrar salida
```

---

## 🎯 VENTAJAS DEL SISTEMA DE ROLES

### ✅ Especialización
- Cada rol tiene su interfaz optimizada
- Funciones específicas para cada puesto
- Flujo de trabajo ágil

### ✅ Seguridad
- Acceso limitado por rol
- Cada usuario ve solo lo necesario
- Trazabilidad de acciones

### ✅ Eficiencia
- Hostess: Registro rápido de clientes
- Mesero: POS ágil para pedidos
- Cadena: Control de acceso simple
- RP: Gestión VIP enfocada

### ✅ Integración Total
- Todos los datos mapeados
- Sincronización en tiempo real
- Un solo sistema, múltiples vistas

### ✅ Trazabilidad
- Quién registró al cliente
- Quién tomó la orden
- Quién otorgó beneficios
- Quién calificó el servicio

---

## 📱 ACCESO AL SISTEMA

### Flujo de Login:

```
1. LOGIN
   ├─ Ingresar credenciales
   └─ Sistema identifica rol

2. REDIRECCIÓN
   ├─ Si es Gerente → Dashboard Admin
   └─ Si es Staff → Selector de Rol

3. SELECTOR DE ROL
   ├─ Hostess → /dashboard/hostess
   ├─ Mesero → /dashboard/mesero
   ├─ Cadena → /dashboard/cadena
   └─ RP → /dashboard/rp

4. CAMBIAR DE ROL
   └─ Regresar al selector cuando sea necesario
```

---

## 🗄️ DATOS MAPEADOS

### Tabla de Mapeo:

| Dato | Hostess | Mesero | Cadena | RP | Admin |
|------|---------|--------|--------|-----|-------|
| **Nombre del cliente** | ✅ Registra | ✅ Ve | ❌ | ✅ Ve | ✅ Ve |
| **Edad del cliente** | ✅ Registra | ❌ | ❌ | ✅ Registra | ✅ Ve |
| **Género del cliente** | ✅ Registra | ❌ | ❌ | ✅ Registra | ✅ Ve |
| **Mesa asignada** | ✅ Asigna | ✅ Ve | ❌ | ✅ Ve | ✅ Ve |
| **Consumo actual** | ✅ Ve | ✅ Actualiza | ❌ | ✅ Ve | ✅ Ve |
| **Pedidos** | ❌ | ✅ Registra | ❌ | ✅ Ve items | ✅ Ve |
| **Calificación hostess** | ✅ Recibe | ❌ | ❌ | ❌ | ✅ Ve |
| **Personas dentro** | ❌ | ❌ | ✅ Controla | ❌ | ✅ Ve |
| **Emergencias** | ❌ | ❌ | ✅ Reporta | ❌ | ✅ Ve |
| **Beneficios/Rewards** | ❌ | ❌ | ❌ | ✅ Otorga | ✅ Ve |
| **Clientes potenciales** | ✅ Registra | ❌ | ❌ | ✅ Registra | ✅ Ve |

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Páginas Creadas:
- [x] `/dashboard/selector-rol` - Selector visual de roles
- [x] `/dashboard/hostess` - Panel Hostess
- [x] `/dashboard/mesero` - Panel Mesero
- [x] `/dashboard/cadena` - Panel Cadena
- [x] `/dashboard/rp` - Panel RP

### Funcionalidades:
- [x] Hostess registra clientes con todos los datos
- [x] Hostess asigna mesas
- [x] Hostess califica servicio
- [x] Mesero ve solo sus mesas
- [x] Mesero registra pedidos ágil
- [x] Cadena controla flujo de personas
- [x] Cadena botón de emergencia
- [x] RP ve consumo de mesas
- [x] RP registra clientes potenciales
- [x] RP otorga beneficios
- [x] Todos los datos mapeados
- [x] Integración con Supabase

---

## 🎉 RESULTADO FINAL

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║         ✅ SISTEMA DE ROLES 100% FUNCIONAL                        ║
║                                                                   ║
║  🎭 4 ROLES IMPLEMENTADOS:                                       ║
║     • Hostess - Primer contacto y registro                       ║
║     • Mesero - Servicio ágil de mesas                            ║
║     • Cadena - Control de acceso y seguridad                     ║
║     • RP - Gestión VIP y clientes potenciales                    ║
║                                                                   ║
║  🔗 INTEGRACIÓN COMPLETA:                                        ║
║     • Todos los datos mapeados entre roles                       ║
║     • Sincronización en tiempo real                              ║
║     • Un sistema, múltiples vistas especializadas                ║
║                                                                   ║
║  📊 HOSTESS DICTA DATOS:                                         ║
║     • Nombre, edad, género, teléfono                             ║
║     • Mesa seleccionada                                          ║
║     • Todo mapeado a CRM y sistema                               ║
║                                                                   ║
║              🚀 LISTO PARA USAR 🚀                                ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
```

**¡Tu sistema de roles está completamente implementado y funcional!** 🎉
