# 🧪 Guía de Pruebas del Sistema

## 🎯 Cómo Probar el Sistema Completo

### Preparación
1. Abre tu navegador en `http://localhost:3000`
2. Abre **3 pestañas/ventanas** diferentes:
   - **Pestaña 1**: Login como Mesero → POS
   - **Pestaña 2**: Login como Administrador → Dashboard Mesas
   - **Pestaña 3**: Login como Administrador → Dashboard Ventas

---

## 📋 Prueba 1: Flujo Completo de Venta

### Paso 1: Tomar Pedido (Pestaña 1 - POS)
1. ✅ Click en botón verde "Mesero/POS"
2. ✅ Selecciona **Mesa 3**
3. ✅ Click en "Agregar" cliente
4. ✅ Escribe "Juan" → Click "Agregar"
5. ✅ Repite para "María" y "Pedro"
6. ✅ **Verifica**: 3 clientes con colores diferentes

### Paso 2: Asignar Productos (Pestaña 1 - POS)
1. ✅ Click en el cliente "Juan"
2. ✅ Se abre diálogo de productos
3. ✅ Click en "Cerveza Corona" (2 veces)
4. ✅ Click en "Hamburguesa Clásica" (1 vez)
5. ✅ Cierra el diálogo
6. ✅ **Verifica**: Juan muestra "3 productos" y su total

7. ✅ Click en el cliente "María"
8. ✅ Click en "Mojito" (1 vez)
9. ✅ Click en "Ensalada César" (1 vez)
10. ✅ **Verifica**: María muestra "2 productos" y su total

11. ✅ Click en el cliente "Pedro"
12. ✅ Click en "Cerveza Corona" (3 veces)
13. ✅ Click en "Pizza Margarita" (1 vez)
14. ✅ **Verifica**: Pedro muestra "4 productos" y su total

### Paso 3: Verificar en Dashboard Mesas (Pestaña 2)
1. ✅ Ve a la pestaña del Dashboard
2. ✅ Navega a "Mesas"
3. ✅ **Verifica**: Mesa 3 aparece como "Ocupada" (azul)
4. ✅ Click en Mesa 3
5. ✅ **Verifica**: 
   - Muestra 3 clientes (Juan, María, Pedro)
   - Muestra todos los pedidos
   - Muestra el total correcto

### Paso 4: Cerrar Mesa (Pestaña 1 - POS)
1. ✅ Vuelve a la pestaña del POS
2. ✅ Click en "Ver Cuenta"
3. ✅ **Verifica**: 
   - Muestra cada cliente con su consumo
   - Muestra total individual
   - Muestra total de la mesa
4. ✅ Click en "Cerrar Mesa y Registrar Venta"
5. ✅ **Verifica**: Vuelve a la selección de mesas

### Paso 5: Verificar Venta Registrada (Pestaña 3)
1. ✅ Ve a la pestaña de Dashboard
2. ✅ Navega a "Ventas"
3. ✅ **Verifica**: 
   - Aparece la nueva venta de Mesa 3
   - Muestra mesero, fecha, total
   - Muestra 3 clientes
4. ✅ Click en la venta
5. ✅ **Verifica**:
   - Detalle completo de cada cliente
   - Productos de cada persona
   - Totales individuales correctos

### Paso 6: Verificar Inventario Actualizado
1. ✅ En Dashboard, navega a "Inventario"
2. ✅ Busca "Cerveza Corona"
3. ✅ **Verifica**: Stock se redujo en 5 unidades (2 de Juan + 3 de Pedro)
4. ✅ Busca "Hamburguesa Clásica"
5. ✅ **Verifica**: Stock se redujo en 1 unidad
6. ✅ Busca "Mojito"
7. ✅ **Verifica**: Stock se redujo en 1 unidad

### Paso 7: Verificar Mesa Liberada (Pestaña 2)
1. ✅ Vuelve a "Mesas"
2. ✅ **Verifica**: Mesa 3 aparece como "Disponible" (verde)

---

## 📋 Prueba 2: Actualización de Inventario

### Paso 1: Registrar Entrada de Stock
1. ✅ En Dashboard, ve a "Inventario"
2. ✅ Busca "Cerveza Corona"
3. ✅ Click en el botón "+" (Plus)
4. ✅ Selecciona "Entrada"
5. ✅ Cantidad: 24
6. ✅ Motivo: "Compra a proveedor"
7. ✅ Click "Registrar Movimiento"
8. ✅ **Verifica**: Stock aumentó en 24 unidades

### Paso 2: Verificar en POS
1. ✅ Ve a la pestaña del POS
2. ✅ Selecciona cualquier mesa
3. ✅ Agrega un cliente
4. ✅ Click en el cliente para ver productos
5. ✅ Busca "Cerveza Corona"
6. ✅ **Verifica**: Muestra el stock actualizado

---

## 📋 Prueba 3: Múltiples Mesas Simultáneas

### Paso 1: Mesa 1
1. ✅ En POS, selecciona Mesa 1
2. ✅ Agrega cliente "Ana"
3. ✅ Asigna 2 productos
4. ✅ **NO cierres la mesa**

### Paso 2: Cambiar a Mesa 2
1. ✅ Click en "← Cambiar Mesa"
2. ✅ Selecciona Mesa 2
3. ✅ Agrega cliente "Luis"
4. ✅ Asigna 3 productos
5. ✅ **NO cierres la mesa**

### Paso 3: Verificar en Dashboard
1. ✅ Ve a Dashboard → Mesas
2. ✅ **Verifica**: 
   - Mesa 1 aparece Ocupada
   - Mesa 2 aparece Ocupada
   - Ambas muestran sus totales

### Paso 4: Volver a Mesa 1
1. ✅ En POS, click "← Cambiar Mesa"
2. ✅ Selecciona Mesa 1
3. ✅ **Verifica**: 
   - Cliente "Ana" sigue ahí
   - Productos se mantienen
   - Total es correcto

---

## 📋 Prueba 4: Modificar Cantidades

### Paso 1: Agregar Producto
1. ✅ En POS, en cualquier mesa con cliente
2. ✅ Agrega "Cerveza Corona" (1 vez)
3. ✅ **Verifica**: Muestra "1x Cerveza Corona"

### Paso 2: Aumentar Cantidad
1. ✅ Click en el botón "+" junto al producto
2. ✅ **Verifica**: Cambia a "2x Cerveza Corona"
3. ✅ **Verifica**: Total se actualiza

### Paso 3: Disminuir Cantidad
1. ✅ Click en el botón "-" junto al producto
2. ✅ **Verifica**: Vuelve a "1x Cerveza Corona"
3. ✅ Click en "-" otra vez
4. ✅ **Verifica**: El producto desaparece

---

## 📋 Prueba 5: Eliminar Cliente

### Paso 1: Crear Cliente
1. ✅ En POS, agrega cliente "Test"
2. ✅ Asigna 2 productos
3. ✅ **Verifica**: Cliente aparece con productos

### Paso 2: Eliminar Cliente
1. ✅ Click en el botón de basura (🗑️) del cliente
2. ✅ **Verifica**: 
   - Cliente desaparece
   - Sus productos también desaparecen
   - Total de mesa se actualiza

---

## 📋 Prueba 6: Búsqueda y Filtros

### En Ventas
1. ✅ Ve a Dashboard → Ventas
2. ✅ En el buscador, escribe un nombre de cliente
3. ✅ **Verifica**: Filtra ventas que incluyen ese cliente
4. ✅ Escribe un número de mesa
5. ✅ **Verifica**: Filtra ventas de esa mesa

### En Inventario
1. ✅ Ve a Dashboard → Inventario
2. ✅ En el buscador, escribe "Cerveza"
3. ✅ **Verifica**: Muestra solo productos con "Cerveza"
4. ✅ En el filtro de categoría, selecciona "Bebidas"
5. ✅ **Verifica**: Muestra solo bebidas

---

## 📋 Prueba 7: Sincronización en Tiempo Real

### Preparación
1. ✅ Abre 2 ventanas del navegador lado a lado
2. ✅ Ventana 1: POS
3. ✅ Ventana 2: Dashboard → Mesas

### Prueba
1. ✅ En Ventana 1 (POS): Selecciona Mesa 5
2. ✅ En Ventana 2 (Dashboard): Observa Mesa 5
3. ✅ En Ventana 1: Agrega un cliente
4. ✅ **Verifica en Ventana 2**: Mesa 5 cambia a "Ocupada" (espera máx 5 seg)
5. ✅ En Ventana 1: Agrega productos
6. ✅ En Ventana 2: Click en Mesa 5
7. ✅ **Verifica**: Muestra los productos agregados
8. ✅ En Ventana 1: Cierra la mesa
9. ✅ **Verifica en Ventana 2**: Mesa 5 vuelve a "Disponible" (espera máx 5 seg)

---

## 📋 Prueba 8: Persistencia de Datos

### Paso 1: Crear Datos
1. ✅ En POS, crea una mesa con clientes y productos
2. ✅ **NO cierres la mesa**

### Paso 2: Recargar Página
1. ✅ Presiona F5 o recarga la página
2. ✅ Login como Mesero nuevamente
3. ✅ Selecciona la misma mesa
4. ✅ **Verifica**: 
   - Clientes siguen ahí
   - Productos se mantienen
   - Total es correcto

---

## ✅ Checklist de Funcionalidades

### POS (Mesero)
- [ ] Seleccionar mesa
- [ ] Agregar cliente
- [ ] Eliminar cliente
- [ ] Agregar producto a cliente
- [ ] Aumentar cantidad de producto
- [ ] Disminuir cantidad de producto
- [ ] Ver cuenta completa
- [ ] Cerrar mesa y registrar venta
- [ ] Cambiar entre mesas
- [ ] Datos persisten al recargar

### Dashboard - Mesas
- [ ] Ver todas las mesas
- [ ] Identificar mesas ocupadas/disponibles
- [ ] Ver detalles de mesa
- [ ] Ver clientes de la mesa
- [ ] Ver pedidos de la mesa
- [ ] Liberar mesa manualmente
- [ ] Actualización automática (5 seg)
- [ ] Botón de actualización manual

### Dashboard - Inventario
- [ ] Ver todos los productos
- [ ] Buscar productos
- [ ] Filtrar por categoría
- [ ] Ver alertas de stock bajo
- [ ] Registrar entrada de stock
- [ ] Registrar salida de stock
- [ ] Stock se actualiza con ventas
- [ ] Ver historial de movimientos

### Dashboard - Ventas
- [ ] Ver todas las ventas
- [ ] Buscar ventas
- [ ] Filtrar por mesa/mesero/cliente
- [ ] Ver detalle de venta
- [ ] Ver consumo individual por cliente
- [ ] Ver productos de cada cliente
- [ ] Actualización automática (10 seg)
- [ ] Nuevas ventas aparecen automáticamente

---

## 🎯 Resultados Esperados

Al completar todas las pruebas, deberías verificar:

✅ **Integración POS ↔ Mesas**: Los cambios en POS se reflejan en Mesas
✅ **Integración POS ↔ Ventas**: Las ventas cerradas aparecen en Ventas
✅ **Integración POS ↔ Inventario**: El stock se actualiza con cada venta
✅ **Sincronización en tiempo real**: Múltiples ventanas se actualizan
✅ **Persistencia**: Los datos se mantienen al recargar
✅ **Todos los botones funcionan**: No hay botones sin implementar

---

## 🐛 Problemas Comunes

### Si no ves actualizaciones en tiempo real:
1. Espera 5-10 segundos (auto-refresh)
2. Click en botón "Actualizar" si existe
3. Recarga la página (F5)

### Si los datos no persisten:
1. Verifica que localStorage esté habilitado
2. No uses modo incógnito
3. Verifica la consola del navegador (F12)

### Si el stock no se actualiza:
1. Verifica que la venta se haya cerrado correctamente
2. Ve a Inventario y busca el producto
3. Recarga la página de Inventario

---

## ✅ Sistema Aprobado

Si todas las pruebas pasan, el sistema está:
- ✅ 100% Funcional
- ✅ 100% Integrado
- ✅ Listo para Producción

**¡Felicidades! El sistema está completamente operativo.** 🎉
