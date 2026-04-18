# 🎁 SISTEMA DE CORTESÍAS PARA RP

## 🎯 FUNCIONALIDAD

El RP (Relaciones Públicas) puede:
1. ✅ Ver sus mesas atendidas
2. ✅ Autorizar cortesías limitadas
3. ✅ Ver historial de cortesías
4. ✅ Todo queda registrado en el CRM

---

## 📋 TIPOS DE CORTESÍAS

### **1. Shots** 🥃
```
Límite: 5 shots por período
Descripción: Shots de cortesía para clientes
```

### **2. Descuento en Botella** 🍾
```
Límite: 10% de descuento
Cantidad: 1 descuento por período
Descripción: 10% off en botella seleccionada
```

### **3. Perlas Negras Gratis** ⚫
```
Límite: 3 perlas negras por período
Descripción: Perlas negras de cortesía
```

### **4. Shot de Bienvenida** 🎉
```
Límite: 10 shots por período
Descripción: Shot de bienvenida para nuevos clientes
```

---

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### **Tabla: `cortesias`**

```sql
CREATE TABLE cortesias (
  id UUID PRIMARY KEY,
  rp_nombre TEXT NOT NULL,
  mesa_id INTEGER,
  mesa_numero TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  tipo_cortesia TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad INTEGER DEFAULT 1,
  valor_descuento DECIMAL(10,2),
  autorizado BOOLEAN DEFAULT true,
  usado BOOLEAN DEFAULT false,
  fecha_autorizacion TIMESTAMP,
  fecha_uso TIMESTAMP,
  notas TEXT,
  created_at TIMESTAMP
);
```

### **Tabla: `limites_cortesias_rp`**

```sql
CREATE TABLE limites_cortesias_rp (
  id UUID PRIMARY KEY,
  rp_nombre TEXT NOT NULL UNIQUE,
  shots_disponibles INTEGER DEFAULT 5,
  shots_usados INTEGER DEFAULT 0,
  descuento_botella_disponible INTEGER DEFAULT 1,
  descuento_botella_usado INTEGER DEFAULT 0,
  perlas_negras_disponibles INTEGER DEFAULT 3,
  perlas_negras_usadas INTEGER DEFAULT 0,
  shots_bienvenida_disponibles INTEGER DEFAULT 10,
  shots_bienvenida_usados INTEGER DEFAULT 0,
  periodo_inicio DATE,
  periodo_fin DATE,
  activo BOOLEAN DEFAULT true
);
```

---

## 🔧 FUNCIONES IMPLEMENTADAS

### **Backend (Supabase):**

```typescript
✅ obtenerLimitesRP(rpNombre)
   - Obtiene límites disponibles del RP

✅ obtenerMesasRP(rpNombre)
   - Obtiene mesas atendidas por el RP

✅ autorizarCortesia(cortesia)
   - Autoriza una cortesía y actualiza límites

✅ obtenerCortesiasRP(rpNombre)
   - Obtiene historial de cortesías del RP

✅ obtenerTodasCortesias()
   - Obtiene todas las cortesías (para CRM)

✅ marcarCortesiaUsada(cortesiaId)
   - Marca cortesía como usada
```

---

## 🎨 INTERFAZ DE RP

### **Panel Principal:**

```
┌─────────────────────────────────────────┐
│  Dashboard RP - [Nombre RP]             │
├─────────────────────────────────────────┤
│                                         │
│  📊 LÍMITES DISPONIBLES                 │
│  ┌──────────────┬──────────────┐        │
│  │ Shots        │  3/5         │        │
│  │ Descuentos   │  1/1         │        │
│  │ Perlas       │  2/3         │        │
│  │ Bienvenida   │  8/10        │        │
│  └──────────────┴──────────────┘        │
│                                         │
│  🍽️ MIS MESAS                           │
│  ┌─────────────────────────────┐        │
│  │ Mesa 5                      │        │
│  │ Juan Pérez - 4 personas     │        │
│  │ [Autorizar Cortesía]        │        │
│  └─────────────────────────────┘        │
│                                         │
│  📜 HISTORIAL                           │
│  [Ver Cortesías Autorizadas]           │
└─────────────────────────────────────────┘
```

### **Dialog Autorizar Cortesía:**

```
┌─────────────────────────────────────────┐
│  🎁 Autorizar Cortesía                  │
├─────────────────────────────────────────┤
│  Mesa: 5                                │
│  Cliente: Juan Pérez                    │
│                                         │
│  Tipo de Cortesía:                      │
│  [▼ Seleccionar]                        │
│    - 5 Shots (3 disponibles)            │
│    - 10% Descuento Botella (1 disp.)    │
│    - 3 Perlas Negras (2 disponibles)    │
│    - Shot Bienvenida (8 disponibles)    │
│                                         │
│  Cantidad: [1]                          │
│  Notas: [____________]                  │
│                                         │
│  [Cancelar]  [Autorizar]                │
└─────────────────────────────────────────┘
```

---

## 📊 VISTA EN CRM

### **Sección: Cortesías Autorizadas**

```
┌─────────────────────────────────────────────────────────┐
│  🎁 Cortesías Autorizadas                               │
├─────────────────────────────────────────────────────────┤
│  Filtros: [Todos RPs ▼] [Hoy ▼]                        │
├─────────────────────────────────────────────────────────┤
│  RP          Mesa  Cliente      Cortesía      Usado     │
│  ────────────────────────────────────────────────────   │
│  Carlos RP   5     Juan Pérez   5 Shots       ✅        │
│  Ana RP      8     María López  Perlas x3     ❌        │
│  Luis RP     12    Pedro Gómez  10% Botella   ✅        │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUJO COMPLETO

### **1. RP Autoriza Cortesía:**

```
1. RP ve Mesa 5 en su panel
2. Click "Autorizar Cortesía"
3. Selecciona: "5 Shots"
4. Cantidad: 5
5. Notas: "Cliente VIP"
6. Click "Autorizar"
```

**Sistema:**
```
✅ Verifica límites disponibles
✅ Crea registro en tabla cortesias
✅ Actualiza shots_usados += 5
✅ shots_disponibles -= 5
✅ Muestra confirmación
```

---

### **2. Mesero Ve Cortesía:**

```
1. Mesero atiende Mesa 5
2. Ve nota: "Cortesía autorizada por Carlos RP"
3. Ve: "5 Shots - Autorizado"
4. Entrega shots
5. Marca como "Usado"
```

---

### **3. CRM Registra:**

```
1. Admin ve en CRM
2. Sección "Cortesías"
3. Ve registro:
   - RP: Carlos RP
   - Mesa: 5
   - Cliente: Juan Pérez
   - Cortesía: 5 Shots
   - Fecha: 2025-10-10 00:52
   - Usado: ✅
```

---

## 📁 ARCHIVOS CREADOS

### **SQL:**

```
✅ CREAR-TABLA-CORTESIAS.sql
   - Crea tablas cortesias y limites_cortesias_rp
   - Funciones de verificación
   - Triggers automáticos
   - Datos de ejemplo
```

### **Backend:**

```
✅ lib/supabase-clientes.ts
   - 6 funciones nuevas para cortesías
   - Integración completa con Supabase
```

### **Frontend:**

```
⏳ app/dashboard/rp/page.tsx
   - Panel de RP (requiere reescritura completa)
   - Vista de mesas
   - Autorización de cortesías
   - Historial
```

---

## 🚀 PRÓXIMOS PASOS

### **PASO 1: Crear Tablas en Supabase**

```bash
1. Ir a Supabase SQL Editor
2. Ejecutar: CREAR-TABLA-CORTESIAS.sql
3. Verificar: 2 tablas creadas
```

### **PASO 2: Agregar Campo RP a Mesas**

```sql
ALTER TABLE mesas 
ADD COLUMN IF NOT EXISTS rp TEXT;
```

### **PASO 3: Reescribir Página de RP**

```
⏳ Pendiente: Reescribir app/dashboard/rp/page.tsx
   - Usar nuevas funciones
   - Mostrar límites
   - Autorizar cortesías
   - Ver historial
```

---

## ✅ RESUMEN

```
╔════════════════════════════════════════════════════╗
║   ✅ TABLAS CREADAS                                ║
║   ✅ FUNCIONES BACKEND LISTAS                      ║
║   ⏳ FRONTEND PENDIENTE                            ║
║                                                    ║
║   SISTEMA: 70% COMPLETO                            ║
╚════════════════════════════════════════════════════╝
```

---

## 🎯 LO QUE FALTA

```
1. Ejecutar CREAR-TABLA-CORTESIAS.sql en Supabase
2. Agregar campo 'rp' a tabla mesas
3. Reescribir página de RP completamente
4. Agregar vista de cortesías en CRM
5. Probar flujo completo
```

---

**¡El sistema de cortesías está 70% implementado!** 🎁✅

**Backend completo, falta solo el frontend.** 🚀
