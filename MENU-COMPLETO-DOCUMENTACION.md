# 📋 MENÚ COMPLETO - DOCUMENTACIÓN

## 🎯 Descripción General

Este documento describe la implementación completa del menú del restaurante en el sistema CRM, incluyendo todos los productos de bebidas y sus precios.

---

## 📊 Estadísticas del Menú

### Resumen por Categorías

| Categoría | Productos | Copas/Individuales | Botellas |
|-----------|-----------|-------------------|----------|
| 🥃 Tequila | 25 | 13 | 12 |
| 🍸 Vodka | 10 | 5 | 5 |
| 🌵 Mezcal | 6 | 3 | 3 |
| 🍹 Ginebra | 8 | 4 | 4 |
| 🥃 Ron | 11 | 6 | 5 |
| 🥃 Whisky | 7 | 3 | 4 |
| 🍷 Brandy | 2 | 1 | 1 |
| 🍾 Cognac | 2 | 1 | 1 |
| 🍾 Champagne | 3 | 0 | 3 |
| 🥃 Shots | 4 | 4 | 0 |
| 🍹 Coctelería | 10 | 10 | 0 |
| 🍺 Cerveza | 5 | 5 | 0 |
| 🍸 Mixología | 9 | 9 | 0 |
| ⚡ Energizantes | 5 | 5 | 0 |
| 🥤 Refrescos | 12 | 12 | 0 |
| **TOTAL** | **119** | **81** | **38** |

---

## 💰 Rangos de Precios

### Por Categoría

#### Tequila
- **Copas**: $120 - $240
- **Botellas**: $1,890 - $7,990
- **Producto más caro**: Don Julio 1942 Botella ($7,990)

#### Vodka
- **Copas**: $100 - $190
- **Botellas**: $1,490 - $2,690
- **Producto más caro**: Grey Goose Botella ($2,690)

#### Mezcal
- **Copas**: $149 - $180
- **Botellas**: $1,890 - $2,490

#### Ginebra
- **Copas**: $150 - $180
- **Botellas**: $1,990 - $2,590

#### Ron
- **Copas**: $100 - $240
- **Botellas**: $1,390 - $2,990

#### Whisky
- **Copas**: $130 - $190
- **Botellas**: $1,990 - $5,990
- **Producto más caro**: Buchanan's 18 Botella ($5,990)

#### Champagne
- **Botellas**: $3,990 - $22,290
- **Producto más caro**: Dom Pérignon Luminus ($22,290)

#### Shots
- **Precio**: $230 - $350

#### Coctelería y Mixología
- **Precio estándar**: $180

#### Cerveza
- **Precio estándar**: $80

#### Energizantes
- **Precio estándar**: $90

#### Refrescos
- **Precio**: $50 - $150

---

## 🔧 Instalación

### Paso 1: Ejecutar el Script SQL

```bash
# Conectar a Supabase y ejecutar el script
psql -h [TU_HOST] -U [TU_USUARIO] -d [TU_BASE_DE_DATOS] -f AGREGAR-MENU-COMPLETO.sql
```

O desde el panel de Supabase:
1. Ir a **SQL Editor**
2. Copiar el contenido de `AGREGAR-MENU-COMPLETO.sql`
3. Ejecutar el script

### Paso 2: Verificar la Instalación

```sql
-- Ver total de productos
SELECT COUNT(*) FROM productos;
-- Resultado esperado: 119 productos

-- Ver productos por categoría
SELECT categoria, COUNT(*) as total
FROM productos
GROUP BY categoria
ORDER BY categoria;
```

---

## 📱 Integración con el Sistema

### Módulos que Usan el Menú

#### 1. **Dashboard de Meseros** (`/dashboard/meseros`)
- Registro de pedidos por mesa
- Búsqueda de productos
- Carrito de compras
- Cálculo de consumo en tiempo real

#### 2. **Dashboard de RPs** (`/dashboard/rp/pedidos`)
- Registro de pedidos para sus mesas asignadas
- Menú completo con búsqueda
- Seguimiento de consumo por cliente

#### 3. **Panel de Ashton (Socio)** (`/dashboard/socios/ashton`)
- Control de pedidos de todas las mesas
- Vista completa del menú
- Registro de consumos

#### 4. **FeverShop** (`/dashboard/fevershop`)
- Productos canjeables con FeverCoins
- Catálogo de bebidas y experiencias

#### 5. **Historial de Consumos** (`/dashboard/historial-consumos`)
- Detalle de productos vendidos
- Reportes por categoría
- Análisis de ventas

#### 6. **Dashboard Admin** (`/dashboard`)
- Estadísticas de ventas por producto
- Productos más vendidos
- Análisis de consumo

---

## 🎨 Características de la Implementación

### 1. **Estructura de Datos**

```typescript
interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  stock: number;
  stock_minimo: number;
  unidad: string;
  precio_compra: number;
  proveedor: string;
  veces_vendido: number;
  rating_promedio: number;
  created_at: string;
  updated_at: string;
}
```

### 2. **Categorías Principales**

```typescript
const CATEGORIAS = [
  'Tequila',
  'Vodka',
  'Mezcal',
  'Ginebra',
  'Ron',
  'Whisky',
  'Brandy',
  'Cognac',
  'Champagne',
  'Shots',
  'Coctelería',
  'Cerveza',
  'Mixología',
  'Energizantes',
  'Refrescos'
];
```

### 3. **Unidades de Medida**

- **Copa**: Servicio individual de licor
- **Botella**: Botella completa
- **Shot**: Trago corto
- **Coctel**: Bebida preparada
- **Vaso**: Bebida individual
- **Lata**: Energizante o refresco en lata
- **Jarra**: Servicio para compartir

---

## 🔍 Consultas Útiles

### Buscar Productos por Categoría

```sql
SELECT nombre, precio, unidad
FROM productos
WHERE categoria = 'Tequila'
ORDER BY precio DESC;
```

### Productos Más Caros

```sql
SELECT nombre, categoria, precio, unidad
FROM productos
ORDER BY precio DESC
LIMIT 10;
```

### Productos por Rango de Precio

```sql
SELECT nombre, categoria, precio
FROM productos
WHERE precio BETWEEN 100 AND 200
ORDER BY precio;
```

### Stock Bajo

```sql
SELECT nombre, categoria, stock, stock_minimo
FROM productos
WHERE stock <= stock_minimo
ORDER BY stock;
```

### Productos Más Vendidos

```sql
SELECT nombre, categoria, veces_vendido, precio
FROM productos
ORDER BY veces_vendido DESC
LIMIT 20;
```

---

## 📈 Gestión de Inventario

### Control de Stock

El sistema incluye:
- **Stock actual**: Cantidad disponible
- **Stock mínimo**: Nivel de reorden
- **Alertas automáticas**: Cuando stock <= stock_minimo

### Actualización de Stock

```sql
-- Al registrar una venta
UPDATE productos
SET 
  stock = stock - [cantidad_vendida],
  veces_vendido = veces_vendido + 1
WHERE id = [producto_id];
```

### Reabastecimiento

```sql
-- Al recibir inventario
UPDATE productos
SET stock = stock + [cantidad_recibida]
WHERE id = [producto_id];
```

---

## 💡 Mejores Prácticas

### 1. **Búsqueda de Productos**

```typescript
// Búsqueda por nombre (case-insensitive)
const { data } = await supabase
  .from('productos')
  .select('*')
  .ilike('nombre', `%${busqueda}%`)
  .order('nombre');

// Filtrar por categoría
const { data } = await supabase
  .from('productos')
  .select('*')
  .eq('categoria', categoria)
  .order('precio');
```

### 2. **Registro de Ventas**

```typescript
// Al registrar un pedido
const productos = [
  { id: 1, nombre: 'Tequila Don Julio 70 Copa', cantidad: 2, precio: 240 },
  { id: 45, nombre: 'Cerveza XX', cantidad: 4, precio: 80 }
];

// Actualizar stock y ventas
for (const producto of productos) {
  await supabase.rpc('registrar_venta_producto', {
    producto_id: producto.id,
    cantidad: producto.cantidad
  });
}
```

### 3. **Validación de Stock**

```typescript
// Antes de registrar venta
const { data: producto } = await supabase
  .from('productos')
  .select('stock')
  .eq('id', producto_id)
  .single();

if (producto.stock < cantidad) {
  alert('Stock insuficiente');
  return;
}
```

---

## 🎯 Casos de Uso

### Caso 1: Mesero Registra Pedido

1. Cliente pide: 2 copas de Don Julio 70 + 4 cervezas XX
2. Mesero busca productos en el sistema
3. Agrega al carrito: 
   - Don Julio 70 Copa x2 = $480
   - Cerveza XX x4 = $320
4. Total: $800
5. Sistema actualiza:
   - Stock de Don Julio 70 Copa: -2
   - Stock de Cerveza XX: -4
   - Veces vendido: +1 cada uno
   - Consumo de la mesa: +$800

### Caso 2: RP Consulta Menú

1. RP accede a `/dashboard/rp/pedidos`
2. Ve menú completo organizado por categorías
3. Puede buscar productos específicos
4. Ve precios actualizados en tiempo real
5. Recomienda productos a clientes

### Caso 3: Admin Revisa Inventario

1. Admin accede a dashboard
2. Ve productos con stock bajo
3. Genera orden de compra
4. Actualiza stock al recibir mercancía
5. Sistema recalcula disponibilidad

---

## 🔐 Permisos y Seguridad

### Roles y Accesos

| Rol | Ver Menú | Registrar Venta | Modificar Precios | Gestionar Stock |
|-----|----------|----------------|-------------------|-----------------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Mesero | ✅ | ✅ | ❌ | ❌ |
| RP | ✅ | ✅ | ❌ | ❌ |
| Hostess | ✅ | ❌ | ❌ | ❌ |
| Cadena | ✅ | ❌ | ❌ | ❌ |
| Socio | ✅ | ✅ | ❌ | ❌ |

---

## 📊 Reportes Disponibles

### 1. Ventas por Categoría

```sql
SELECT 
  p.categoria,
  COUNT(DISTINCT t.id) as num_tickets,
  SUM((item->>'cantidad')::int) as unidades_vendidas,
  SUM((item->>'precio')::numeric * (item->>'cantidad')::int) as total_ventas
FROM tickets t,
  jsonb_array_elements(t.productos) as item
JOIN productos p ON p.nombre = item->>'nombre'
WHERE DATE(t.created_at) = CURRENT_DATE
GROUP BY p.categoria
ORDER BY total_ventas DESC;
```

### 2. Top 10 Productos del Día

```sql
SELECT 
  item->>'nombre' as producto,
  SUM((item->>'cantidad')::int) as unidades,
  SUM((item->>'precio')::numeric * (item->>'cantidad')::int) as total
FROM tickets,
  jsonb_array_elements(productos) as item
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY item->>'nombre'
ORDER BY total DESC
LIMIT 10;
```

### 3. Análisis de Rentabilidad

```sql
SELECT 
  nombre,
  categoria,
  precio as precio_venta,
  precio_compra,
  (precio - precio_compra) as ganancia_unitaria,
  ((precio - precio_compra) / precio * 100) as margen_porcentaje,
  veces_vendido,
  ((precio - precio_compra) * veces_vendido) as ganancia_total
FROM productos
WHERE veces_vendido > 0
ORDER BY ganancia_total DESC;
```

---

## 🚀 Próximas Mejoras

### Funcionalidades Planeadas

1. **Sistema de Promociones**
   - 2x1 en cervezas
   - Happy hour con descuentos
   - Combos especiales

2. **Gestión de Proveedores**
   - Catálogo de proveedores
   - Historial de compras
   - Comparación de precios

3. **Análisis Predictivo**
   - Predicción de demanda
   - Sugerencias de reorden
   - Optimización de inventario

4. **Menú Digital para Clientes**
   - QR code en mesas
   - Pedidos desde móvil
   - Recomendaciones personalizadas

5. **Sistema de Calificaciones**
   - Clientes califican productos
   - Rating promedio visible
   - Productos destacados

---

## 📞 Soporte

Para dudas o problemas con el menú:

1. Verificar que el script SQL se ejecutó correctamente
2. Revisar logs de Supabase
3. Consultar esta documentación
4. Contactar al equipo de desarrollo

---

## 📝 Notas Importantes

### Precios de Compra

Los precios de compra están calculados al **50% del precio de venta**. Ajustar según costos reales del proveedor.

### Stock Inicial

El stock inicial es **estimado**:
- Licores populares: 100-300 unidades
- Licores premium: 30-80 unidades  
- Licores ultra premium: 10-25 unidades
- Cocteles/Preparados: 0 (se preparan al momento)

### Actualización de Precios

Para actualizar precios:

```sql
UPDATE productos
SET precio = [nuevo_precio]
WHERE nombre = '[nombre_producto]';
```

### Agregar Nuevos Productos

```sql
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor)
VALUES ('[nombre]', '[categoria]', [precio], [stock], [stock_min], '[unidad]', [precio_compra], '[proveedor]');
```

---

## ✅ Checklist de Implementación

- [x] Script SQL creado con 119 productos
- [x] Categorías organizadas (15 categorías)
- [x] Precios configurados según menú
- [x] Stock inicial estimado
- [x] Proveedores asignados
- [x] Índices optimizados
- [ ] Ejecutar script en Supabase
- [ ] Verificar productos en dashboard
- [ ] Probar registro de pedidos
- [ ] Validar cálculos de consumo
- [ ] Capacitar al equipo

---

**Fecha de creación**: 5 de Noviembre, 2024  
**Versión**: 1.0  
**Total de productos**: 119  
**Categorías**: 15
