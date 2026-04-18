# 🍽️ SISTEMA ASHTON Y PEDIDOS RP

Sistema completo de gestión de pedidos para Ashton (Socio) y RPs con integración al menú existente.

---

## 📋 CARACTERÍSTICAS IMPLEMENTADAS

### 1. ASHTON - CONTROL DE PEDIDOS (Socio Exclusivo)

**Acceso**: Solo disponible para el Socio Principal (Ashton)

#### Funcionalidades
- **Vista de Todas las Mesas**: Grid visual con estado en tiempo real
- **Información Completa por Mesa**:
  - Estado (Disponible/Ocupada)
  - Nombre del cliente
  - RP asignado (con icono 👑)
  - Consumo actual acumulado
  - Hostess y mesero asignados

#### Registro de Pedidos
- **Selección de Mesa**: Solo mesas ocupadas pueden recibir pedidos
- **Menú Completo**: Todos los productos disponibles organizados por categoría
- **Búsqueda de Productos**: Filtro en tiempo real
- **Carrito de Pedido**:
  - Agregar/quitar productos
  - Ajustar cantidades con +/-
  - Ver total en tiempo real
  - Precio por unidad y total por producto

#### Características Técnicas
- Actualización automática cada 10 segundos
- Validación de mesa ocupada antes de registrar
- Registro automático con nombre "Ashton" como mesero
- Integración con tabla `tickets`
- Cálculo automático de consumo por mesa

---

### 2. RPs - REGISTRAR PEDIDOS DE SU MESA

**Acceso**: Todos los RPs desde su dashboard

#### Funcionalidades
- **Botón "Registrar Pedido"**: Nuevo botón verde en el header del dashboard
- **Validación Automática**: Solo puede registrar si tiene mesa asignada
- **Vista de Su Mesa**:
  - Número de mesa
  - Cliente asignado
  - Información del RP

#### Interfaz de Pedidos
- **Menú Completo**: Igual que Ashton, con todos los productos
- **Búsqueda y Filtros**: Por nombre de producto
- **Carrito Personal**:
  - Agregar productos con un clic
  - Ajustar cantidades
  - Ver total acumulado
  - Eliminar productos

#### Características Técnicas
- Verifica que el RP tenga mesa ocupada
- Registra pedido con el nombre del RP como mesero
- Mensaje de error si no tiene mesa asignada
- Redirección automática al dashboard después de registrar

---

## 🗂️ ESTRUCTURA DE ARCHIVOS

### Archivos Creados

1. **`/app/dashboard/socios/ashton/page.tsx`**
   - Dashboard completo de Ashton
   - Vista de todas las mesas
   - Sistema de registro de pedidos

2. **`/app/dashboard/rp/pedidos/page.tsx`**
   - Interfaz de pedidos para RPs
   - Validación de mesa asignada
   - Carrito de compras completo

3. **`SISTEMA-ASHTON-Y-RP-PEDIDOS.md`**
   - Documentación completa del sistema

### Archivos Modificados

1. **`/app/dashboard/socios/page.tsx`**
   - Agregado botón "Ashton - Pedidos" (solo para Socio Principal)
   - Icono: 🍴 Utensils
   - Color: Verde esmeralda

2. **`/app/dashboard/rp/page.tsx`**
   - Agregado botón "Registrar Pedido"
   - Cambiado "Menú" a "Ver Menú"
   - Icono: 🍴 Utensils
   - Color: Verde esmeralda

---

## 🎨 DISEÑO Y UX

### Ashton Dashboard
- **Colores**: Gradiente púrpura/rosa (consistente con Socios)
- **Grid de Mesas**: 6 columnas en desktop, responsive
- **Estados Visuales**:
  - Verde: Mesa disponible
  - Rojo: Mesa ocupada
  - Gris: Otros estados
- **Información RP**: Destacada en amarillo dorado con corona 👑

### RP Pedidos
- **Colores**: Gradiente púrpura/rosa (consistente con RP)
- **Layout**: 2 columnas (Menú | Carrito)
- **Responsive**: Se adapta a móvil y tablet
- **Feedback Visual**: Mensajes de éxito/error con iconos

---

## 🔄 FLUJO DE TRABAJO

### Ashton - Registrar Pedido
1. Socio Principal accede al dashboard
2. Clic en "Ashton - Pedidos"
3. Ve todas las mesas con su información
4. Selecciona una mesa ocupada
5. Busca y agrega productos al carrito
6. Ajusta cantidades si es necesario
7. Revisa el total
8. Clic en "Registrar Pedido"
9. Confirmación visual
10. Pedido registrado en sistema

### RP - Registrar Pedido
1. RP inicia sesión en su dashboard
2. Clic en "Registrar Pedido"
3. Sistema valida que tenga mesa asignada
4. Ve el menú completo
5. Busca y agrega productos
6. Ajusta cantidades
7. Revisa el total
8. Clic en "Registrar Pedido"
9. Confirmación de éxito
10. Regresa al dashboard

---

## 📊 INTEGRACIÓN CON BASE DE DATOS

### Tablas Utilizadas

#### `mesas`
- Información básica de mesas
- Estado actual
- Número de mesa

#### `mesas_clientes`
- Relación mesa-cliente
- RP asignado (`rp_nombre`)
- Hostess y mesero
- Hora de asignación

#### `clientes`
- Información del cliente
- Nombre y datos de contacto

#### `productos`
- Catálogo completo
- Precios y categorías
- Disponibilidad

#### `tickets`
- Registro de pedidos
- Productos en formato JSONB
- Totales y subtotales
- Mesero (Ashton o nombre del RP)

---

## 🔐 CONTROL DE ACCESO

### Ashton
- **Restricción**: Solo Socio Principal
- **Validación**: `socio.nombre === 'Socio Principal' || socio.telefono === '5550000001'`
- **Acceso**: Desde dashboard de socios

### RPs
- **Restricción**: Solo RPs con sesión activa
- **Validación**: `localStorage.getItem('rpNombre')`
- **Requisito**: Debe tener mesa asignada y ocupada
- **Acceso**: Desde dashboard de RP

---

## 📱 RESPONSIVE DESIGN

### Desktop (>1024px)
- Grid de 6 columnas para mesas (Ashton)
- 2 columnas para menú y carrito
- Todos los elementos visibles

### Tablet (768px - 1024px)
- Grid de 4 columnas para mesas
- 2 columnas para menú y carrito
- Botones adaptados

### Móvil (<768px)
- Grid de 2 columnas para mesas
- 1 columna para menú y carrito (stack)
- Botones full-width
- ScrollArea optimizado

---

## ⚡ CARACTERÍSTICAS TÉCNICAS

### Actualización en Tiempo Real
- **Ashton**: Refresco cada 10 segundos
- **Consumo por Mesa**: Calculado dinámicamente
- **Estado de Mesas**: Sincronizado con base de datos

### Validaciones
- Mesa debe estar ocupada para registrar pedido
- RP debe tener mesa asignada
- Productos deben estar disponibles
- Cantidades deben ser mayores a 0

### Optimizaciones
- Queries optimizados con joins
- Carga asíncrona de datos
- Filtrado en cliente para búsqueda
- Agrupación por categorías

---

## 🎯 CASOS DE USO

### Caso 1: Ashton Registra Pedido VIP
1. Cliente VIP llega con RP "Carlos"
2. Hostess asigna Mesa 5
3. Ashton ve Mesa 5 con RP "Carlos RP" 👑
4. Registra pedido de botella premium
5. Ticket se crea con mesero "Ashton"
6. Consumo se suma al total de la mesa

### Caso 2: RP Registra Pedido de Su Mesa
1. RP "Ana" tiene Mesa 3 asignada
2. Cliente pide shots y comida
3. Ana entra a "Registrar Pedido"
4. Selecciona productos del menú
5. Registra pedido
6. Ticket se crea con mesero "Ana RP"
7. Puede autorizar cortesías después

### Caso 3: RP Sin Mesa Asignada
1. RP "Luis" no tiene mesa activa
2. Intenta acceder a "Registrar Pedido"
3. Sistema muestra mensaje: "No tienes mesa asignada"
4. Botón para volver al dashboard
5. Debe esperar a tener mesa asignada

---

## 🚀 PRÓXIMAS MEJORAS

- [ ] Notificación a cocina/barra al registrar pedido
- [ ] Historial de pedidos por RP
- [ ] Estadísticas de productos más pedidos
- [ ] Integración con impresora de tickets
- [ ] Modificar pedidos antes de enviar
- [ ] Agregar notas especiales a productos
- [ ] Sistema de favoritos para RPs
- [ ] Pedidos recurrentes (guardar combinaciones)

---

## 📝 NOTAS IMPORTANTES

1. **Ashton es exclusivo**: Solo el Socio Principal tiene acceso
2. **RPs necesitan mesa**: No pueden registrar sin mesa asignada
3. **Menú compartido**: Ambos usan el mismo catálogo de productos
4. **Tickets separados**: Cada pedido genera un ticket independiente
5. **Mesero identificado**: Se registra quién hizo el pedido (Ashton o RP)

---

## 🔗 NAVEGACIÓN

### Desde Dashboard de Socios
```
Dashboard Socios → Botón "Ashton - Pedidos" → Ashton Dashboard
```

### Desde Dashboard de RP
```
Dashboard RP → Botón "Registrar Pedido" → Interfaz de Pedidos
```

### Volver
```
Ashton Dashboard → Botón "Volver" → Dashboard Socios
RP Pedidos → Botón "Volver" → Dashboard RP
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Crear página de Ashton
- [x] Implementar vista de mesas con info de RP
- [x] Sistema de registro de pedidos (Ashton)
- [x] Crear página de pedidos para RPs
- [x] Validación de mesa asignada
- [x] Integrar menú existente
- [x] Agregar botones en dashboards
- [x] Diseño responsive
- [x] Mensajes de confirmación
- [x] Documentación completa

---

*Sistema implementado el 30 de octubre de 2025*
*Versión 1.0*
