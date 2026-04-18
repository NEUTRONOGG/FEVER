# 🔍 DIAGNÓSTICO: CONFIRMAR RESERVA

## 🎯 PROBLEMA REPORTADO

**Síntoma:**
```
1. Tienes reserva: Mesa 5 - María González
2. Click "Confirmar"
3. Click "Confirmar y Activar Mesa"
4. ❌ Mesa sigue en "Mesas Reservadas"
5. ❌ NO aparece en "Mesas Ocupadas"
```

**Comportamiento esperado:**
```
1. Tienes reserva: Mesa 5 - María González
2. Click "Confirmar"
3. Click "Confirmar y Activar Mesa"
4. ✅ Mesa DESAPARECE de "Mesas Reservadas"
5. ✅ Mesa APARECE en "Mesas Ocupadas"
```

---

## 🔧 PASOS DE DIAGNÓSTICO

### **PASO 1: Abrir Consola del Navegador**

```
1. En Chrome/Firefox: F12 o Click derecho → Inspeccionar
2. Ve a la pestaña "Console"
3. Deja la consola abierta
```

### **PASO 2: Confirmar Reserva**

```
1. Panel Hostess
2. Click "Confirmar" en la reserva
3. Click "Confirmar y Activar Mesa"
4. Observa la consola
```

### **PASO 3: Verificar Logs**

**Deberías ver en la consola:**

```javascript
// Log 1: Antes de confirmar
Confirmando reserva: {
  mesaId: 5,
  cliente_id: "uuid-del-cliente",
  cliente_nombre: "María González",
  estado_actual: "reservada"
}

// Log 2: Después de confirmar
Resultado de asignación: {
  id: 5,
  numero: "5",
  estado: "ocupada",  // ✅ Debe ser "ocupada"
  cliente_nombre: "María González",
  numero_personas: 4,
  hostess: "Staff"
}
```

---

## 🔍 POSIBLES CAUSAS

### **Causa 1: Error en Supabase**

**Síntoma en consola:**
```javascript
Error al asignar mesa: {
  message: "...",
  code: "..."
}
```

**Solución:**
```
1. Verificar permisos RLS en Supabase
2. Verificar que la tabla 'mesas' existe
3. Verificar que el usuario tiene permisos
```

### **Causa 2: cliente_id vacío**

**Síntoma en consola:**
```javascript
Confirmando reserva: {
  cliente_id: "",  // ❌ Vacío
  ...
}
```

**Solución:**
```
La reserva debe tener un cliente_id válido.
Si está vacío, necesitamos crear el cliente primero.
```

### **Causa 3: Mesa no se actualiza**

**Síntoma en consola:**
```javascript
Resultado de asignación: null  // ❌ null
```

**Solución:**
```
La función asignarMesaCliente() no está funcionando.
Verificar permisos en Supabase.
```

### **Causa 4: No recarga mesas**

**Síntoma:**
```
Los logs se ven bien, pero la UI no se actualiza
```

**Solución:**
```
Problema con cargarMesas() o actualización de estado.
```

---

## ✅ VERIFICACIÓN EN SUPABASE

### **Opción 1: Verificar en Supabase Dashboard**

```
1. Ve a: https://supabase.com
2. Abre tu proyecto
3. Ve a: Table Editor → mesas
4. Busca la Mesa 5
5. Verifica el campo 'estado'
```

**Debe mostrar:**
```
id: 5
numero: "5"
estado: "ocupada"  ✅ (NO "reservada")
cliente_nombre: "María González"
numero_personas: 4
```

### **Opción 2: Query SQL**

```sql
-- Ejecutar en SQL Editor de Supabase:
SELECT 
  id,
  numero,
  estado,
  cliente_nombre,
  numero_personas,
  hostess,
  hora_entrada
FROM mesas
WHERE numero = '5';
```

**Resultado esperado:**
```
estado: "ocupada"  ✅
```

---

## 🔧 SOLUCIONES SEGÚN DIAGNÓSTICO

### **Si cliente_id está vacío:**

```typescript
// Necesitamos buscar o crear el cliente primero
const cliente = await buscarClientePorTelefono(telefono)
if (!cliente) {
  // Crear cliente
  const nuevoCliente = await crearCliente({...})
  cliente_id = nuevoCliente.id
}
```

### **Si hay error de permisos:**

```sql
-- Ejecutar en Supabase SQL Editor:
DROP POLICY IF EXISTS "Permitir todo en mesas" ON mesas;
CREATE POLICY "Permitir todo en mesas" 
ON mesas FOR ALL 
USING (true) 
WITH CHECK (true);
```

### **Si la mesa no se actualiza:**

```typescript
// Verificar que la función retorna datos
const resultado = await asignarMesaCliente(...)
console.log('Resultado:', resultado)

if (!resultado) {
  console.error('La función no retornó datos')
}
```

---

## 📋 CHECKLIST DE VERIFICACIÓN

```
□ Consola del navegador abierta
□ Ver log: "Confirmando reserva"
□ Ver log: "Resultado de asignación"
□ Verificar que resultado NO es null
□ Verificar que estado es "ocupada"
□ Verificar en Supabase Dashboard
□ Verificar que mesa desaparece de "Reservadas"
□ Verificar que mesa aparece en "Ocupadas"
```

---

## 🎯 PRUEBA MANUAL

### **Test 1: Crear Reserva**

```
1. Panel Hostess
2. Click "Nueva Reservación"
3. Llenar datos:
   - Nombre: Test User
   - Teléfono: +52 555 999 9999
   - Personas: 4
4. Seleccionar Mesa 5
5. Click "Confirmar Reservación"
```

**Verificar:**
```
✅ Mesa 5 aparece en "Mesas Reservadas"
✅ Estado: reservada
✅ Nombre: Test User
```

### **Test 2: Confirmar Reserva**

```
1. Click "Confirmar" en Mesa 5
2. Dialog se abre
3. Muestra: Test User, 4 personas
4. Click "Confirmar y Activar Mesa"
```

**Verificar en consola:**
```javascript
Confirmando reserva: {
  mesaId: 5,
  cliente_id: "...",
  cliente_nombre: "Test User",
  estado_actual: "reservada"
}

Resultado de asignación: {
  id: 5,
  estado: "ocupada",  // ✅ Debe ser "ocupada"
  ...
}
```

**Verificar en UI:**
```
❌ Mesa 5 NO debe estar en "Mesas Reservadas"
✅ Mesa 5 DEBE estar en "Mesas Ocupadas"
```

---

## 🚨 SI NADA FUNCIONA

### **Reiniciar desde cero:**

```sql
-- 1. Limpiar todas las mesas
UPDATE mesas SET
  estado = 'disponible',
  cliente_id = NULL,
  cliente_nombre = NULL,
  numero_personas = NULL,
  hostess = NULL,
  mesero = NULL,
  hora_entrada = NULL,
  hora_salida = NULL,
  pedidos_data = '[]'::jsonb,
  total_actual = 0;

-- 2. Verificar
SELECT numero, estado FROM mesas ORDER BY id;
```

### **Crear reserva manualmente:**

```sql
-- Crear reserva en Mesa 5
UPDATE mesas SET
  estado = 'reservada',
  cliente_nombre = 'Test Manual',
  numero_personas = 4,
  hora_entrada = NOW()
WHERE numero = '5';

-- Verificar
SELECT * FROM mesas WHERE numero = '5';
```

### **Confirmar manualmente:**

```sql
-- Cambiar a ocupada
UPDATE mesas SET
  estado = 'ocupada',
  hostess = 'Staff'
WHERE numero = '5';

-- Verificar
SELECT * FROM mesas WHERE numero = '5';
```

---

## 📁 ARCHIVOS RELEVANTES

```
✅ app/dashboard/hostess/page.tsx
   - Línea 1230-1265: Función confirmar reserva
   - Agregados console.log para diagnóstico

✅ lib/supabase-clientes.ts
   - Línea 381-407: asignarMesaCliente()
   - Actualiza tabla 'mesas'
   - Cambia estado a 'ocupada'

✅ DIAGNOSTICO-CONFIRMAR-RESERVA.md
   - Este archivo
```

---

## 🎉 RESULTADO ESPERADO

```
╔════════════════════════════════════════════════════╗
║   ANTES DE CONFIRMAR:                              ║
║   Mesas Reservadas: [Mesa 5 - María González]     ║
║   Mesas Ocupadas: []                               ║
║                                                    ║
║   DESPUÉS DE CONFIRMAR:                            ║
║   Mesas Reservadas: []                             ║
║   Mesas Ocupadas: [Mesa 5 - María González]       ║
║                                                    ║
║        ✅ RESERVA SE CONVIERTE EN OCUPADA ✅       ║
╚════════════════════════════════════════════════════╝
```

---

**Por favor, ejecuta los pasos de diagnóstico y comparte los logs de la consola.** 🔍
