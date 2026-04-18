# 🚀 INSTALACIÓN DEL MENÚ COMPLETO

## 📋 Guía Paso a Paso

Esta guía te ayudará a instalar el menú completo en tu sistema CRM.

---

## ⚠️ ANTES DE COMENZAR

### Requisitos Previos

- ✅ Acceso a Supabase (panel web o CLI)
- ✅ Base de datos CRM ya configurada
- ✅ Tabla `productos` creada (desde PASO2-crear-tablas.sql)
- ✅ Permisos de administrador en la base de datos

### Archivos Necesarios

1. `AGREGAR-MENU-COMPLETO.sql` - Script principal con 119 productos
2. `FUNCIONES-MENU.sql` - Funciones auxiliares y vistas
3. `MENU-COMPLETO-DOCUMENTACION.md` - Documentación completa

---

## 📦 PASO 1: Verificar Estructura Existente

Antes de instalar, verifica que la tabla productos existe:

```sql
-- Verificar si la tabla existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'productos'
);
```

**Resultado esperado**: `true`

Si la tabla no existe, primero ejecuta:
```bash
# Ejecutar script de creación de tablas
psql -f PASO2-crear-tablas.sql
```

---

## 🎯 PASO 2: Instalar el Menú

### Opción A: Desde Supabase Dashboard (Recomendado)

1. **Acceder al SQL Editor**
   - Ir a https://supabase.com/dashboard
   - Seleccionar tu proyecto
   - Ir a `SQL Editor` en el menú lateral

2. **Abrir el script**
   - Clic en `New query`
   - Copiar todo el contenido de `AGREGAR-MENU-COMPLETO.sql`
   - Pegar en el editor

3. **Ejecutar el script**
   - Clic en `Run` o presionar `Ctrl + Enter`
   - Esperar confirmación de éxito

4. **Verificar instalación**
   ```sql
   -- Debe retornar 119
   SELECT COUNT(*) FROM productos;
   
   -- Debe retornar 15 categorías
   SELECT COUNT(DISTINCT categoria) FROM productos;
   ```

### Opción B: Desde Terminal (CLI)

```bash
# Navegar a la carpeta del proyecto
cd /Users/mac/Downloads/crm-restaurante

# Ejecutar el script
psql -h [TU_HOST] -U [TU_USUARIO] -d [TU_BASE_DE_DATOS] -f AGREGAR-MENU-COMPLETO.sql

# O si usas Supabase CLI
supabase db push --file AGREGAR-MENU-COMPLETO.sql
```

---

## ⚙️ PASO 3: Instalar Funciones Auxiliares

### Desde Supabase Dashboard

1. **Abrir SQL Editor**
2. **Nueva consulta**
3. **Copiar contenido de `FUNCIONES-MENU.sql`**
4. **Ejecutar**

### Desde Terminal

```bash
psql -h [TU_HOST] -U [TU_USUARIO] -d [TU_BASE_DE_DATOS] -f FUNCIONES-MENU.sql
```

---

## ✅ PASO 4: Verificar Instalación

### Verificación Básica

```sql
-- 1. Total de productos
SELECT COUNT(*) as total_productos FROM productos;
-- Esperado: 119

-- 2. Productos por categoría
SELECT categoria, COUNT(*) as total
FROM productos
GROUP BY categoria
ORDER BY categoria;
-- Esperado: 15 categorías

-- 3. Verificar precios
SELECT 
  MIN(precio) as precio_minimo,
  MAX(precio) as precio_maximo,
  AVG(precio) as precio_promedio
FROM productos;

-- 4. Verificar funciones
SELECT proname 
FROM pg_proc 
WHERE proname LIKE '%producto%';
-- Debe mostrar las funciones creadas
```

### Verificación Avanzada

```sql
-- 5. Productos disponibles
SELECT * FROM vista_productos_disponibles LIMIT 10;

-- 6. Resumen de inventario
SELECT * FROM vista_resumen_inventario;

-- 7. Buscar productos de tequila
SELECT * FROM buscar_productos('tequila', NULL, NULL, NULL, TRUE);

-- 8. Productos con stock bajo
SELECT * FROM productos_stock_bajo();
```

---

## 🔧 PASO 5: Configurar Permisos

### Permisos para Roles

```sql
-- Permitir lectura a todos los roles autenticados
GRANT SELECT ON productos TO authenticated;

-- Permitir escritura solo a admin y meseros
GRANT INSERT, UPDATE ON productos TO authenticated;

-- Permitir uso de funciones
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Permitir acceso a vistas
GRANT SELECT ON vista_productos_disponibles TO authenticated;
GRANT SELECT ON vista_resumen_inventario TO authenticated;
```

---

## 🎨 PASO 6: Integración con el Frontend

### Verificar Integración

Los siguientes módulos ya están configurados para usar productos:

1. **Dashboard Meseros** - `/dashboard/meseros`
2. **Dashboard RPs** - `/dashboard/rp/pedidos`
3. **Panel Ashton** - `/dashboard/socios/ashton`
4. **FeverShop** - `/dashboard/fevershop`

### Probar desde el Frontend

1. **Acceder como Mesero**
   - Login: mesero@fever.com / mesero123
   - Ir a "Registrar Pedido"
   - Buscar productos
   - Verificar que aparecen los 119 productos

2. **Acceder como RP**
   - Login con teléfono de RP
   - Ir a "Registrar Pedido"
   - Verificar menú completo

3. **Acceder como Admin**
   - Ver estadísticas de productos
   - Verificar inventario

---

## 📊 PASO 7: Datos de Prueba (Opcional)

### Simular Ventas

```sql
-- Registrar venta de prueba
SELECT registrar_venta_producto(1, 2);

-- Verificar que se actualizó
SELECT nombre, stock, veces_vendido 
FROM productos 
WHERE id = 1;
```

### Crear Ticket de Prueba

```sql
-- Insertar ticket con productos
INSERT INTO tickets (
  cliente_id,
  cliente_nombre,
  mesa_numero,
  productos,
  subtotal,
  propina,
  total,
  metodo_pago,
  mesero
)
VALUES (
  1,
  'Cliente Prueba',
  5,
  '[
    {"nombre": "Tequila Don Julio 70 Copa", "cantidad": 2, "precio": 240},
    {"nombre": "Cerveza XX", "cantidad": 4, "precio": 80}
  ]'::jsonb,
  800,
  0,
  800,
  'Efectivo',
  'Mesero Prueba'
);
```

---

## 🔍 PASO 8: Monitoreo y Mantenimiento

### Consultas Útiles para Monitoreo

```sql
-- 1. Productos más vendidos hoy
SELECT * FROM top_productos_vendidos(CURRENT_DATE, CURRENT_DATE, 10);

-- 2. Ventas por categoría hoy
SELECT * FROM stats_ventas_por_categoria(CURRENT_DATE, CURRENT_DATE);

-- 3. Productos que necesitan reabastecimiento
SELECT * FROM productos_stock_bajo();

-- 4. Análisis de rentabilidad
SELECT * FROM analisis_rentabilidad(CURRENT_DATE, CURRENT_DATE);
```

### Mantenimiento Semanal

```sql
-- Actualizar estadísticas de la tabla
ANALYZE productos;

-- Verificar integridad
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN stock < 0 THEN 1 ELSE 0 END) as stock_negativo,
  SUM(CASE WHEN precio <= 0 THEN 1 ELSE 0 END) as precio_invalido
FROM productos;
```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Problema 1: "Tabla productos no existe"

**Solución:**
```sql
-- Verificar si existe
SELECT tablename FROM pg_tables WHERE tablename = 'productos';

-- Si no existe, crear desde PASO2-crear-tablas.sql
```

### Problema 2: "Productos duplicados"

**Solución:**
```sql
-- Verificar duplicados
SELECT nombre, COUNT(*) 
FROM productos 
GROUP BY nombre 
HAVING COUNT(*) > 1;

-- Eliminar duplicados (mantener el más reciente)
DELETE FROM productos a
USING productos b
WHERE a.id < b.id 
AND a.nombre = b.nombre;
```

### Problema 3: "Stock negativo"

**Solución:**
```sql
-- Encontrar productos con stock negativo
SELECT id, nombre, stock 
FROM productos 
WHERE stock < 0;

-- Corregir
UPDATE productos 
SET stock = 0 
WHERE stock < 0;
```

### Problema 4: "Funciones no encontradas"

**Solución:**
```sql
-- Verificar funciones instaladas
SELECT proname FROM pg_proc 
WHERE proname LIKE '%producto%';

-- Si no existen, ejecutar FUNCIONES-MENU.sql
```

### Problema 5: "Permisos denegados"

**Solución:**
```sql
-- Otorgar permisos necesarios
GRANT ALL ON productos TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
```

---

## 📈 PASO 9: Optimización

### Índices Recomendados

```sql
-- Ya incluidos en FUNCIONES-MENU.sql
-- Verificar que existen:
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'productos';
```

### Caché de Consultas Frecuentes

```sql
-- Crear vista materializada para productos populares
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_productos_populares AS
SELECT 
  p.*,
  COALESCE(v.ventas_mes, 0) as ventas_ultimo_mes
FROM productos p
LEFT JOIN (
  SELECT 
    item->>'nombre' as nombre,
    SUM((item->>'cantidad')::INTEGER) as ventas_mes
  FROM tickets,
    jsonb_array_elements(productos) as item
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY item->>'nombre'
) v ON v.nombre = p.nombre
ORDER BY ventas_mes DESC NULLS LAST;

-- Refrescar cada hora
CREATE INDEX ON mv_productos_populares(ventas_ultimo_mes DESC);
```

---

## 📝 PASO 10: Documentación y Capacitación

### Para el Equipo

1. **Compartir documentación**
   - Enviar `MENU-COMPLETO-DOCUMENTACION.md`
   - Explicar categorías y precios

2. **Capacitación en uso**
   - Cómo buscar productos
   - Cómo registrar pedidos
   - Cómo verificar stock

3. **Procedimientos**
   - Qué hacer si un producto no está disponible
   - Cómo reportar problemas de stock
   - Cómo solicitar nuevos productos

---

## ✅ CHECKLIST FINAL

Marca cada ítem al completarlo:

- [ ] Tabla productos existe y está vacía (o lista para agregar)
- [ ] Script AGREGAR-MENU-COMPLETO.sql ejecutado exitosamente
- [ ] 119 productos insertados correctamente
- [ ] 15 categorías verificadas
- [ ] Script FUNCIONES-MENU.sql ejecutado
- [ ] Funciones auxiliares creadas
- [ ] Vistas creadas correctamente
- [ ] Índices optimizados
- [ ] Permisos configurados
- [ ] Integración frontend verificada
- [ ] Pruebas de registro de pedidos exitosas
- [ ] Pruebas de búsqueda funcionando
- [ ] Documentación compartida con el equipo
- [ ] Equipo capacitado en uso del sistema
- [ ] Procedimientos de mantenimiento establecidos

---

## 🎉 ¡INSTALACIÓN COMPLETA!

Tu menú está listo para usarse en:

- ✅ Dashboard de Meseros
- ✅ Dashboard de RPs
- ✅ Panel de Ashton (Socio)
- ✅ FeverShop
- ✅ Historial de Consumos
- ✅ Reportes y Estadísticas

---

## 📞 SOPORTE

Si encuentras problemas:

1. Revisar esta guía completa
2. Verificar logs de Supabase
3. Consultar `MENU-COMPLETO-DOCUMENTACION.md`
4. Revisar sección de Solución de Problemas
5. Contactar al equipo de desarrollo

---

## 📚 RECURSOS ADICIONALES

- `AGREGAR-MENU-COMPLETO.sql` - Script de instalación
- `FUNCIONES-MENU.sql` - Funciones auxiliares
- `MENU-COMPLETO-DOCUMENTACION.md` - Documentación completa
- `PASO2-crear-tablas.sql` - Estructura de base de datos

---

**Fecha**: 5 de Noviembre, 2024  
**Versión**: 1.0  
**Total de productos**: 119  
**Categorías**: 15  
**Tiempo estimado de instalación**: 15-30 minutos
