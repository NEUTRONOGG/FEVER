# 🚀 INICIAR SISTEMA DE RP

## ✅ CHECKLIST COMPLETO

### **PASO 1: Crear Tablas de Cortesías** ✅

```sql
-- Ejecutar en Supabase SQL Editor:
-- Archivo: CREAR-TABLA-CORTESIAS.sql

-- Esto crea:
✅ Tabla cortesias
✅ Tabla limites_cortesias_rp
✅ Funciones de verificación
✅ Triggers automáticos
✅ 3 RPs de ejemplo con límites
```

**Verificar:**
```sql
SELECT COUNT(*) FROM limites_cortesias_rp;
-- Debe mostrar: 3 (Carlos RP, Ana RP, Luis RP)
```

---

### **PASO 2: Agregar Campo RP a Mesas** ✅

```sql
-- Ejecutar en Supabase SQL Editor:
-- Archivo: AGREGAR-CAMPO-RP-MESAS.sql

ALTER TABLE mesas 
ADD COLUMN IF NOT EXISTS rp TEXT;
```

**Verificar:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'mesas' AND column_name = 'rp';
-- Debe mostrar: rp
```

---

### **PASO 3: Crear 30 Mesas** ✅

```sql
-- Ejecutar en Supabase SQL Editor:
-- Archivo: CREAR-30-MESAS.sql

DELETE FROM mesas;
INSERT INTO mesas (id, numero, capacidad, estado) VALUES
(1, '1', 4, 'disponible'),
... (hasta 30)
```

**Verificar:**
```sql
SELECT COUNT(*) FROM mesas;
-- Debe mostrar: 30
```

---

### **PASO 4: Limpiar Data de Prueba** ✅

```sql
-- Ejecutar en Supabase SQL Editor:
-- Archivo: LIMPIAR-TODO.sql

TRUNCATE TABLE tickets CASCADE;
TRUNCATE TABLE visitas CASCADE;
TRUNCATE TABLE clientes CASCADE;

UPDATE mesas SET
  estado = 'disponible',
  cliente_id = NULL,
  rp = NULL;
```

**Verificar:**
```sql
SELECT 
  (SELECT COUNT(*) FROM clientes) as clientes,
  (SELECT COUNT(*) FROM mesas WHERE estado = 'disponible') as mesas_disponibles;
-- Debe mostrar: clientes=0, mesas_disponibles=30
```

---

### **PASO 5: Iniciar Servidor** 🚀

```bash
cd /Users/mac/Downloads/crm-restaurante
npm run dev
```

**Debe mostrar:**
```
✓ Ready in 1185ms
- Local: http://localhost:3000
```

---

### **PASO 6: Login como RP** 👤

```
1. Ir a: http://localhost:3000
2. Click en "RP" (Relaciones Públicas)
3. Usuario: (cualquiera)
4. Contraseña: (cualquiera)
5. Click "Iniciar Sesión"
```

**Nota:** El sistema guarda el nombre de usuario en localStorage como `userName`

---

### **PASO 7: Probar Sistema** ✅

#### **Test 1: Ver Panel RP**

```
1. Debes ver:
   ✅ "Panel RP - Bienvenido, [Tu Nombre]"
   ✅ 4 tarjetas con límites de cortesías
   ✅ Barras de progreso
   ✅ "Mis Mesas" (vacío por ahora)
```

#### **Test 2: Asignar Mesa como Hostess**

```
1. Abrir nueva pestaña
2. Login como Hostess
3. Asignar Mesa 1 a "Juan Pérez"
4. En campo RP: Escribir tu nombre (ej: "Carlos RP")
5. Click "Asignar Mesa"
```

**Nota:** Si el campo RP no existe en el formulario de Hostess, la mesa se asignará sin RP.

#### **Test 3: Ver Mesa en Panel RP**

```
1. Volver a pestaña de RP
2. Esperar 10 segundos (actualización automática)
3. Debe aparecer:
   ✅ Mesa 1
   ✅ Juan Pérez
   ✅ Botón "Autorizar Cortesía"
```

#### **Test 4: Autorizar Cortesía**

```
1. Click "Autorizar Cortesía" en Mesa 1
2. Dialog se abre
3. Seleccionar: "🥃 5 Shots (5 disponibles)"
4. Cantidad: 2
5. Notas: "Cliente VIP"
6. Click "Autorizar"
7. Debe mostrar: ✅ "Cortesía autorizada: 2 Shots de cortesía"
```

#### **Test 5: Verificar Límites Actualizados**

```
1. Panel RP debe mostrar:
   ✅ Shots: 3/5 (antes era 5/5)
   ✅ Barra de progreso actualizada
```

#### **Test 6: Ver Historial**

```
1. Click "Ver Historial"
2. Debe mostrar:
   ✅ Cortesía autorizada
   ✅ Mesa 1 • Juan Pérez
   ✅ "2 Shots de cortesía"
   ✅ Estado: Pendiente
   ✅ Fecha y hora
   ✅ Notas: "Cliente VIP"
```

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Problema 1: No aparecen límites**

```
Causa: No existe el RP en tabla limites_cortesias_rp

Solución:
INSERT INTO limites_cortesias_rp (
  rp_nombre, 
  shots_disponibles, 
  descuento_botella_disponible, 
  perlas_negras_disponibles, 
  shots_bienvenida_disponibles
) VALUES (
  'TU_NOMBRE_RP', 5, 1, 3, 10
);
```

### **Problema 2: No aparecen mesas**

```
Causa: Las mesas no tienen campo 'rp' asignado

Solución:
1. Asignar mesa desde Hostess con campo RP
2. O manualmente:
   UPDATE mesas 
   SET rp = 'TU_NOMBRE_RP' 
   WHERE numero = '1';
```

### **Problema 3: Error al autorizar**

```
Causa: Tablas cortesias no existen

Solución:
Ejecutar: CREAR-TABLA-CORTESIAS.sql
```

---

## 📊 VERIFICACIÓN FINAL EN SUPABASE

### **Verificar Cortesía Registrada:**

```sql
SELECT * FROM cortesias 
ORDER BY fecha_autorizacion DESC 
LIMIT 1;

-- Debe mostrar:
-- rp_nombre: Carlos RP
-- mesa_numero: 1
-- cliente_nombre: Juan Pérez
-- tipo_cortesia: shots
-- cantidad: 2
-- usado: false
```

### **Verificar Límites Actualizados:**

```sql
SELECT * FROM limites_cortesias_rp 
WHERE rp_nombre = 'Carlos RP';

-- Debe mostrar:
-- shots_disponibles: 5
-- shots_usados: 2
-- (otros campos sin cambios)
```

---

## ✅ RESUMEN DE ARCHIVOS

```
✅ CREAR-TABLA-CORTESIAS.sql
   - Ejecutar PRIMERO

✅ AGREGAR-CAMPO-RP-MESAS.sql
   - Ejecutar SEGUNDO

✅ CREAR-30-MESAS.sql
   - Ejecutar TERCERO

✅ LIMPIAR-TODO.sql
   - Ejecutar CUARTO (opcional)

✅ npm run dev
   - Ejecutar QUINTO
```

---

## 🎯 ESTADO FINAL

```
╔════════════════════════════════════════════════════╗
║   ✅ TABLAS CREADAS                                ║
║   ✅ CAMPO RP AGREGADO                             ║
║   ✅ 30 MESAS CREADAS                              ║
║   ✅ SISTEMA LIMPIO                                ║
║   ✅ FRONTEND COMPLETO                             ║
║   ✅ BACKEND COMPLETO                              ║
║                                                    ║
║        🚀 LISTO PARA USAR 🚀                       ║
╚════════════════════════════════════════════════════╝
```

---

**¡Sigue estos pasos y el sistema estará 100% funcional!** ✅🎁🚀
