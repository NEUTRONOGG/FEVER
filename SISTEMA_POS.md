# Sistema CRM/POS para Restaurante FEVER

## 🎯 Descripción

Sistema completo de gestión para restaurante con dos perfiles de usuario:
- **Administrador/Gerente**: Acceso completo al CRM
- **Mesero**: Acceso al sistema POS para ventas

## ✨ Características Principales

### 👨‍💼 Perfil Administrador
- **Dashboard**: Vista general de métricas y KPIs
- **Gestión de Mesas**: Control de estado y ocupación
- **Ventas**: Historial completo con consumo individual por cliente
- **Inventario**: Control de stock con alertas automáticas
- **Reportes**: Análisis de ventas y rendimiento
- **Menú QR**: Generación de códigos QR para mesas

### 👨‍🍳 Perfil Mesero (POS)
- **Selección de Mesa**: Interfaz rápida para elegir mesa
- **Registro de Clientes**: Agregar clientes individuales a cada mesa
- **Toma de Pedidos**: Asignar productos a clientes específicos
- **Consumo Individual**: Seguimiento de lo que consume cada persona
- **Cálculo Automático**: Total por cliente y total de mesa
- **Cierre de Venta**: Registro automático en el sistema

## 🔑 Características Clave

### Consumo Individual por Cliente
- Cada cliente en la mesa tiene su propio perfil identificado por color
- Los productos se asignan específicamente a cada cliente
- Se puede ver el consumo y total de cada persona
- Facilita la división de cuentas

### Integración Automática
- Las ventas del POS se registran automáticamente
- El inventario se actualiza al cerrar cada venta
- Los datos están disponibles inmediatamente para el administrador

### Gestión de Inventario
- Stock en tiempo real
- Alertas de productos bajos
- Descuento automático al realizar ventas
- Historial de movimientos

## 🚀 Uso del Sistema

### Login
1. Acceder a `http://localhost:3000`
2. Usar credenciales:
   - **Gerente**: `gerente@fever.com` / cualquier contraseña
   - **Mesero**: `mesero@fever.com` / cualquier contraseña

### Flujo de Trabajo - Mesero

1. **Seleccionar Mesa**
   - Elegir el número de mesa desde la pantalla principal

2. **Agregar Clientes**
   - Registrar nombre de cada cliente en la mesa
   - Cada cliente recibe un color identificador

3. **Tomar Pedidos**
   - Seleccionar cliente
   - Agregar productos del menú
   - Los productos se asignan al cliente seleccionado

4. **Modificar Cantidades**
   - Aumentar o disminuir cantidades
   - Eliminar productos si es necesario

5. **Ver Cuenta**
   - Revisar consumo individual de cada cliente
   - Ver total de la mesa

6. **Cerrar Mesa**
   - Registrar la venta
   - Actualizar inventario automáticamente
   - Liberar la mesa

### Flujo de Trabajo - Administrador

1. **Ver Ventas**
   - Acceder a la sección "Ventas"
   - Ver historial completo de ventas
   - Filtrar por mesa, mesero o cliente

2. **Detalle de Venta**
   - Click en cualquier venta para ver detalles
   - Ver consumo individual de cada cliente
   - Ver productos específicos por persona

3. **Gestión de Inventario**
   - Monitorear stock en tiempo real
   - Ver productos con stock bajo
   - Registrar entradas y salidas

## 📊 Datos Almacenados

El sistema utiliza `localStorage` para almacenar:
- **productos**: Catálogo de productos con stock actualizado
- **ventas**: Historial de todas las ventas realizadas
- **mesa_[numero]**: Estado actual de cada mesa activa

## 🎨 Interfaz

- **Diseño Moderno**: UI oscura con acentos en ámbar/dorado
- **Responsive**: Funciona en desktop, tablet y móvil
- **Intuitiva**: Flujo de trabajo optimizado para rapidez
- **Visual**: Identificación por colores para clientes

## 🔄 Sincronización

Actualmente el sistema funciona con datos locales. Para producción se recomienda:
- Implementar backend con base de datos (Supabase, Firebase, etc.)
- Sincronización en tiempo real entre dispositivos
- Backup automático de datos
- Autenticación real de usuarios

## 📝 Notas Técnicas

- **Framework**: Next.js 14 con App Router
- **UI**: shadcn/ui + Tailwind CSS
- **Iconos**: Lucide React
- **Tipado**: TypeScript
- **Estado**: React Hooks + localStorage

## 🎯 Casos de Uso

### Ejemplo 1: Mesa con 4 Amigos
1. Mesero selecciona Mesa 5
2. Agrega 4 clientes: Juan, María, Pedro, Ana
3. Toma pedidos:
   - Juan: 2 Cervezas, 1 Hamburguesa
   - María: 1 Mojito, 1 Ensalada
   - Pedro: 3 Cervezas, 1 Pizza
   - Ana: 1 Margarita, 1 Hamburguesa
4. Al finalizar, cada uno puede ver su consumo individual
5. Total de mesa: suma de todos los consumos

### Ejemplo 2: Cena de Negocios
1. Mesa 3 con 6 personas
2. Algunos piden entrada, plato fuerte y postre
3. Otros solo bebidas
4. El sistema mantiene registro exacto de quién pidió qué
5. Facilita la división de cuenta al final

## 🚧 Próximas Mejoras

- [ ] Propinas por cliente
- [ ] División de cuenta (dividir items entre clientes)
- [ ] Impresión de tickets
- [ ] Notificaciones a cocina
- [ ] Estadísticas por mesero
- [ ] Productos favoritos por cliente
- [ ] Historial de clientes frecuentes
