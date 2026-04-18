# ⚠️ ORDEN CORRECTO PARA MIGRAR A DATOS REALES

## 🎯 PROBLEMA IDENTIFICADO

Si borramos primero los datos mock, el sistema quedará vacío y puede haber errores de referencias.

## ✅ SOLUCIÓN: ORDEN CORRECTO

### **OPCIÓN A: AGREGAR PRIMERO, BORRAR DESPUÉS** (Recomendado)

```
1. AGREGAR datos reales (productos, RPs, socios)
   ↓
2. Verificar que todo funcione con datos reales
   ↓
3. BORRAR solo los datos mock específicos
   ↓
4. Sistema funcionando 100% con datos reales
```

### **OPCIÓN B: BORRAR TODO Y EMPEZAR LIMPIO**

```
1. BORRAR todos los datos (mock + todo)
   ↓
2. AGREGAR inmediatamente datos reales
   ↓
3. Verificar que todo funcione
```

---

## 🚀 OPCIÓN A: AGREGAR PRIMERO (RECOMENDADO)

### **PASO 1: Editar archivo con tus datos reales**

1. Abre: `AGREGAR-DATOS-INICIALES-REALES.sql`
2. Reemplaza:
   - Productos de ejemplo → Tus productos reales
   - RPs de ejemplo → Tus RPs reales
   - Socios de ejemplo → Tus socios reales
3. Guarda el archivo

### **PASO 2: Agregar datos reales (SIN borrar nada aún)**

1. Abre Supabase SQL Editor
2. Copia y pega: `AGREGAR-DATOS-INICIALES-REALES.sql`
3. Ejecuta (RUN)
4. ✅ Ahora tienes datos mock + datos reales

### **PASO 3: Verificar que tus datos reales funcionen**

1. Ve a tu app
2. Verifica que veas:
   - Tus productos reales en el POS
   - Tus RPs reales en los selects
   - Tus socios reales puedan hacer login

### **PASO 4: Borrar solo los datos mock específicos**

Ahora sí, borra los datos mock que ya no necesitas:

```sql
-- BORRAR PRODUCTOS MOCK (los de ejemplo)
DELETE FROM productos 
WHERE nombre IN (
    'Hamburguesa Clásica',
    'Pizza Margarita',
    'Tacos al Pastor',
    -- Agrega aquí los nombres de productos mock que quieras borrar
);

-- BORRAR RPs MOCK (los de ejemplo)
DELETE FROM limites_cortesias_rp 
WHERE rp_nombre IN (
    'Carlos Mendoza',
    'Ana García',
    'Luis Rodríguez'
    -- Solo si estos NO son tus RPs reales
);

-- BORRAR SOCIOS MOCK (los de ejemplo)
DELETE FROM socios 
WHERE telefono IN (
    '5550000001',
    '5551234567'
    -- Solo los teléfonos de prueba
);

-- BORRAR CLIENTES DE PRUEBA
DELETE FROM clientes 
WHERE telefono LIKE '555%' OR nombre LIKE '%Prueba%';

-- BORRAR TICKETS/TRANSACCIONES DE PRUEBA
DELETE FROM tickets WHERE created_at < NOW() - INTERVAL '1 day';
```

---

## 🔥 OPCIÓN B: BORRAR TODO Y EMPEZAR LIMPIO

### **PASO 1: Editar archivo con tus datos reales PRIMERO**

⚠️ **MUY IMPORTANTE:** Edita el archivo ANTES de borrar

1. Abre: `AGREGAR-DATOS-INICIALES-REALES.sql`
2. Reemplaza todos los datos de ejemplo con tus datos reales
3. Guarda el archivo
4. **NO cierres el archivo**, lo necesitarás en 2 minutos

### **PASO 2: Borrar todos los datos mock**

1. Abre Supabase SQL Editor
2. Copia y pega: `ELIMINAR-TODO-DATOS-MOCK.sql`
3. Ejecuta (RUN)
4. ✅ Sistema completamente vacío

### **PASO 3: Agregar datos reales INMEDIATAMENTE**

⏱️ **Hazlo rápido para que el sistema no esté vacío mucho tiempo**

1. En Supabase SQL Editor, New query
2. Copia y pega: `AGREGAR-DATOS-INICIALES-REALES.sql` (el que editaste)
3. Ejecuta (RUN)
4. ✅ Sistema con datos reales

### **PASO 4: Verificar**

1. Recarga tu app
2. Verifica que todo funcione

---

## 🎯 ¿CUÁL OPCIÓN ELEGIR?

### **Elige OPCIÓN A si:**
- ✅ Quieres migrar gradualmente
- ✅ Quieres probar primero que tus datos funcionen
- ✅ No quieres riesgo de que el sistema esté vacío
- ✅ Tienes el sistema en producción

### **Elige OPCIÓN B si:**
- ✅ Quieres empezar completamente limpio
- ✅ Estás seguro de tus datos reales
- ✅ El sistema NO está en producción aún
- ✅ Prefieres un reset total

---

## 📋 MI RECOMENDACIÓN

**Usa OPCIÓN A** porque:

1. ✅ Más seguro
2. ✅ Puedes verificar que tus datos funcionen antes de borrar
3. ✅ No hay tiempo muerto sin datos
4. ✅ Puedes comparar datos mock vs reales
5. ✅ Puedes borrar mock poco a poco

---

## 🔧 SCRIPT MEJORADO: AGREGAR SIN DUPLICAR

Voy a actualizar el script para que use `ON CONFLICT` correctamente:

```sql
-- PRODUCTOS: Inserta solo si NO existe
INSERT INTO productos (nombre, categoria, precio, stock, stock_minimo, unidad, precio_compra, proveedor) 
VALUES
    ('Don Julio 70', 'Tequila', 450.00, 10, 3, 'botella', 300.00, 'Licores Premium')
ON CONFLICT (nombre) DO NOTHING;
-- Si ya existe un producto con ese nombre, no hace nada

-- RPs: Inserta solo si NO existe
INSERT INTO limites_cortesias_rp (rp_nombre, shots_disponibles, ...)
VALUES
    ('Nombre RP Real', 0, 0, 0, 5, true)
ON CONFLICT (rp_nombre) DO NOTHING;
-- Si ya existe un RP con ese nombre, no hace nada

-- SOCIOS: Inserta solo si NO existe
INSERT INTO socios (nombre, telefono, password, limite_cortesias)
VALUES
    ('Nombre Socio Real', '5551111111', 'socio2024', 1500)
ON CONFLICT (telefono) DO NOTHING;
-- Si ya existe un socio con ese teléfono, no hace nada
```

---

## ✅ PASOS FINALES RECOMENDADOS

### **1. Editar archivo de datos reales**
```bash
Abre: AGREGAR-DATOS-INICIALES-REALES.sql
Edita con tus datos
Guarda
```

### **2. Agregar datos reales (conviven con mock)**
```bash
Ejecuta: AGREGAR-DATOS-INICIALES-REALES.sql en Supabase
```

### **3. Verificar que funcionen**
```bash
Abre tu app
Verifica productos, RPs, socios
```

### **4. Borrar datos mock específicos**
```sql
-- Solo borra los que identificaste como mock
DELETE FROM productos WHERE nombre = 'Producto Mock';
DELETE FROM limites_cortesias_rp WHERE rp_nombre = 'RP Mock';
DELETE FROM socios WHERE telefono = '5550000001';
```

### **5. Limpiar transacciones viejas**
```sql
DELETE FROM tickets WHERE created_at < NOW() - INTERVAL '7 days';
DELETE FROM visitas WHERE fecha < NOW() - INTERVAL '7 days';
```

---

## 🎉 RESULTADO FINAL

```
✅ Productos reales cargados
✅ RPs reales funcionando
✅ Socios reales con acceso
✅ Datos mock eliminados
✅ Sistema 100% con datos reales
✅ Sin tiempo muerto
✅ Sin errores de referencias
```

---

**¿Cuál opción prefieres? Te ayudo con la que elijas** 🚀
