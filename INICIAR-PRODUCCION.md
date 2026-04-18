# 🚀 INICIAR SISTEMA EN PRODUCCIÓN

## ✅ CHECKLIST PRE-PRODUCCIÓN

### **PASO 1: Limpiar Data de Prueba**

```sql
-- Ejecutar en Supabase SQL Editor:
-- Archivo: LIMPIAR-TODO.sql

TRUNCATE TABLE tickets CASCADE;
TRUNCATE TABLE visitas CASCADE;
TRUNCATE TABLE clientes CASCADE;

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
  total_actual = 0,
  notas = NULL;
```

**Resultado esperado:**
```
✅ Clientes: 0
✅ Visitas: 0
✅ Tickets: 0
✅ Mesas disponibles: 12
✅ Mesas ocupadas: 0
```

---

### **PASO 2: Verificar Sistema**

```sql
-- Ejecutar en Supabase SQL Editor:
-- Archivo: VERIFICAR-SISTEMA.sql

SELECT 
  (SELECT COUNT(*) FROM mesas WHERE estado = 'disponible') as mesas_disponibles,
  (SELECT COUNT(*) FROM clientes) as clientes,
  (SELECT COUNT(*) FROM visitas) as visitas,
  (SELECT COUNT(*) FROM tickets) as tickets;
```

**Debe mostrar:**
```
mesas_disponibles: 12
clientes: 0
visitas: 0
tickets: 0
```

---

### **PASO 3: Verificar Conexión Supabase**

```bash
# En el proyecto, verificar archivo .env.local
cat .env.local
```

**Debe contener:**
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

---

### **PASO 4: Iniciar Sistema**

```bash
# En la terminal:
cd /Users/mac/Downloads/crm-restaurante
npm run dev
```

**Debe mostrar:**
```
✓ Ready in 1185ms
- Local: http://localhost:3000
```

---

## 🎯 FLUJO DE PRUEBA REAL

### **TEST 1: Primer Cliente Real**

```
1. Abrir: http://localhost:3000
2. Login → Seleccionar "Hostess"
3. Panel Hostess → Click en Mesa 1
4. Llenar datos del primer cliente:
   - Nombre: [Cliente Real]
   - Teléfono: [Teléfono Real]
   - Email: [Email Real]
   - Personas: [Número Real]
5. Click "Asignar Mesa"
```

**Verificar:**
```
✅ Cliente creado en Supabase
✅ Mesa 1 aparece en "Mesas Ocupadas"
✅ Estado: ocupada
```

---

### **TEST 2: POS - Tomar Pedido**

```
1. Abrir nueva pestaña: http://localhost:3000
2. Login → Seleccionar "POS"
3. Ver Mesa 1 con el cliente
4. Click "Agregar Productos"
5. Agregar productos reales
6. Click "Agregar a Mesa"
```

**Verificar:**
```
✅ Productos aparecen en Mesa 1
✅ Total se actualiza
✅ Visible en POS
```

---

### **TEST 3: Mesero - Ver Pedido**

```
1. Abrir nueva pestaña: http://localhost:3000
2. Login → Seleccionar "Mesero"
3. Ver Mesa 1 con pedidos
4. Verificar que se ven los productos
```

**Verificar:**
```
✅ Mesa 1 visible en Mesero
✅ Productos visibles
✅ Total correcto
```

---

### **TEST 4: Hostess - Cerrar Cuenta**

```
1. Volver a pestaña Hostess
2. Click en Mesa 1 (ocupada)
3. Dialog "Finalizar Servicio"
4. Calificar servicio
5. Click "Finalizar y Liberar Mesa"
```

**Verificar:**
```
✅ Mesa 1 vuelve a "disponible"
✅ Ticket creado en Supabase
✅ Visita registrada
✅ Cliente actualizado (1 visita)
```

---

### **TEST 5: CRM - Ver Cliente**

```
1. Abrir: http://localhost:3000/dashboard/clientes
2. Buscar el cliente
```

**Verificar:**
```
✅ Cliente aparece en lista
✅ Total visitas: 1
✅ Consumo total: [monto correcto]
✅ Nivel: Bronce
```

---

## 🔄 SINCRONIZACIÓN EN TIEMPO REAL

### **Test de Sincronización:**

```
1. Abrir 3 pestañas:
   - Pestaña 1: Hostess
   - Pestaña 2: Mesero
   - Pestaña 3: POS

2. En Hostess: Asignar Mesa 2
   ↓
   Esperar 5 segundos
   ↓
   ✅ Mesa 2 debe aparecer en Mesero
   ✅ Mesa 2 debe aparecer en POS

3. En POS: Agregar productos a Mesa 2
   ↓
   Esperar 5 segundos
   ↓
   ✅ Productos deben aparecer en Mesero
   ✅ Total debe actualizarse en Hostess

4. En Hostess: Liberar Mesa 2
   ↓
   Esperar 5 segundos
   ↓
   ✅ Mesa 2 debe desaparecer de Mesero
   ✅ Mesa 2 debe desaparecer de POS
   ✅ Mesa 2 debe volver a "disponible"
```

---

## 📊 VERIFICACIÓN EN SUPABASE

### **Después de las pruebas, verificar en Supabase:**

```sql
-- 1. Ver clientes creados
SELECT 
  nombre,
  telefono,
  total_visitas,
  consumo_total,
  nivel_fidelidad
FROM clientes
ORDER BY created_at DESC;

-- 2. Ver visitas registradas
SELECT 
  v.id,
  c.nombre as cliente,
  v.mesa_numero,
  v.numero_personas,
  v.hostess,
  v.mesero,
  v.hora_entrada,
  v.hora_salida,
  v.estado
FROM visitas v
JOIN clientes c ON v.cliente_id = c.id
ORDER BY v.created_at DESC;

-- 3. Ver tickets generados
SELECT 
  t.numero_ticket,
  c.nombre as cliente,
  t.mesa_numero,
  t.total,
  t.metodo_pago,
  t.created_at
FROM tickets t
LEFT JOIN clientes c ON t.cliente_id = c.id
ORDER BY t.created_at DESC;

-- 4. Ver estado actual de mesas
SELECT 
  numero,
  estado,
  cliente_nombre,
  numero_personas,
  total_actual,
  hostess,
  mesero
FROM mesas
ORDER BY CAST(numero AS INTEGER);
```

---

## 🎯 CONFIGURACIÓN FINAL

### **Variables de Entorno:**

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### **Permisos RLS en Supabase:**

```sql
-- Verificar que las políticas están activas:
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('clientes', 'mesas', 'visitas', 'tickets');

-- Debe mostrar:
-- clientes | Permitir todo en clientes
-- mesas | Permitir todo en mesas
-- visitas | Permitir todo en visitas
-- tickets | Permitir todo en tickets
```

---

## ✅ CHECKLIST FINAL

```
□ Data de prueba eliminada
□ Todas las mesas disponibles
□ Supabase conectado
□ .env.local configurado
□ Sistema corriendo en localhost:3000
□ Hostess funcional
□ Mesero funcional
□ POS funcional
□ CRM funcional
□ Sincronización en tiempo real
□ Clientes se crean automáticamente
□ Tickets se generan correctamente
□ Visitas se registran
□ Mesas se liberan correctamente
```

---

## 🚨 PROBLEMAS COMUNES

### **Problema 1: "No se conecta a Supabase"**

```bash
# Verificar .env.local
cat .env.local

# Reiniciar servidor
npm run dev
```

### **Problema 2: "Mesas no se actualizan"**

```bash
# Limpiar caché
rm -rf .next
npm run dev
```

### **Problema 3: "Error de permisos RLS"**

```sql
-- Ejecutar en Supabase:
DROP POLICY IF EXISTS "Permitir todo en mesas" ON mesas;
CREATE POLICY "Permitir todo en mesas" 
ON mesas FOR ALL 
USING (true) 
WITH CHECK (true);
```

---

## 📁 ARCHIVOS IMPORTANTES

```
✅ LIMPIAR-TODO.sql
   - Script para limpiar data

✅ VERIFICAR-SISTEMA.sql
   - Script para verificar estado

✅ INICIAR-PRODUCCION.md
   - Este archivo (guía completa)

✅ .env.local
   - Configuración de Supabase
```

---

## 🎉 SISTEMA LISTO

```
╔════════════════════════════════════════════════════╗
║   ✅ DATA DE PRUEBA ELIMINADA                      ║
║   ✅ SISTEMA LIMPIO Y LISTO                        ║
║   ✅ CONECTADO A SUPABASE                          ║
║   ✅ SINCRONIZACIÓN EN TIEMPO REAL                 ║
║   ✅ TODOS LOS ROLES FUNCIONALES                   ║
║   ✅ CRM Y POS INTEGRADOS                          ║
║                                                    ║
║        🚀 LISTO PARA PRODUCCIÓN 🚀                 ║
╚════════════════════════════════════════════════════╝
```

---

**¡Sistema completamente limpio y listo para clientes reales!** ✅🎉
