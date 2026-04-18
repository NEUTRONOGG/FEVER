# 🎁 CONFIGURACIÓN DE CORTESÍAS

## 📋 LÍMITES ESTABLECIDOS PARA RPs

### **Cortesías Disponibles por RP (Diarias):**

| Tipo de Cortesía | Cantidad | Campo en BD |
|------------------|----------|-------------|
| **Covers** | **5** | `shots_bienvenida_disponibles` |
| **Perlas Negras** | **0** | `perlas_negras_disponibles` |
| **Shots** | **0** | `shots_disponibles` |
| **Botellas Sembradas** | **0** | `descuento_botella_disponible` |

---

## 🔄 CÓMO FUNCIONAN LAS CORTESÍAS

### **1. Covers (Shots de Bienvenida)**
- **Cantidad:** 5 por día por RP
- **Uso:** El RP puede autorizar hasta 5 covers diarios
- **Reset:** Automático cada día a las 00:00
- **Ubicación:** Dashboard RP → Autorizar Cortesía → "Shots Bienvenida"

### **2. Perlas Negras**
- **Cantidad:** 0 (Deshabilitado)
- **Nota:** Si quieres habilitarlo en el futuro, solo cambia el valor en la BD

### **3. Shots**
- **Cantidad:** 0 (Deshabilitado)
- **Nota:** Si quieres habilitarlo en el futuro, solo cambia el valor en la BD

### **4. Botellas Sembradas (Descuento)**
- **Cantidad:** 0 (Deshabilitado)
- **Nota:** Si quieres habilitarlo en el futuro, solo cambia el valor en la BD

---

## 📊 DÓNDE SE CONTROLAN

### **En la Base de Datos:**
Tabla: `limites_cortesias_rp`

```sql
-- Ver límites actuales de todos los RPs:
SELECT 
    rp_nombre,
    shots_bienvenida_disponibles as covers_disponibles,
    shots_bienvenida_usados as covers_usados,
    (shots_bienvenida_disponibles - shots_bienvenida_usados) as covers_restantes,
    perlas_negras_disponibles,
    shots_disponibles,
    descuento_botella_disponible,
    activo
FROM limites_cortesias_rp
WHERE activo = true;
```

### **En la Aplicación:**
- **Dashboard RP:** `/dashboard/rp`
  - Muestra cortesías disponibles y usadas
  - Permite autorizar cortesías
  - Muestra historial de cortesías del día

- **Dashboard Admin:** `/dashboard`
  - Puede ver todas las cortesías autorizadas
  - Puede modificar límites si es necesario

---

## 🔧 CÓMO MODIFICAR LÍMITES

### **Opción 1: Para TODOS los RPs**
```sql
-- Cambiar límites para todos los RPs:
UPDATE limites_cortesias_rp SET
    shots_bienvenida_disponibles = 5,  -- Covers
    perlas_negras_disponibles = 0,     -- Perlas
    shots_disponibles = 0,              -- Shots
    descuento_botella_disponible = 0    -- Botellas
WHERE activo = true;
```

### **Opción 2: Para UN RP específico**
```sql
-- Cambiar límites para un RP específico:
UPDATE limites_cortesias_rp SET
    shots_bienvenida_disponibles = 10  -- Ejemplo: darle 10 covers
WHERE rp_nombre = 'Carlos Mendoza';
```

### **Opción 3: Habilitar Perlas/Shots/Botellas**
```sql
-- Ejemplo: Habilitar 3 perlas negras para todos:
UPDATE limites_cortesias_rp SET
    perlas_negras_disponibles = 3
WHERE activo = true;
```

---

## 📅 RESET MANUAL (NO AUTOMÁTICO)

⚠️ **IMPORTANTE:** Las cortesías NO se resetean automáticamente.

### **Cómo funciona:**
1. **Los RPs gastan sus cortesías** durante el día/semana
2. **Cuando se acaban**, no pueden autorizar más
3. **El ADMIN decide** cuándo reponerlas manualmente
4. **El ADMIN ejecuta** el script de reset cuando lo considere necesario

### **NO hay reset automático a medianoche**
- Las cortesías se mantienen hasta que el admin las reponga
- Esto da control total al admin sobre el uso de cortesías
- Permite gestionar mejor el inventario y costos

---

## 🎯 EJEMPLO DE USO

### **Inicio (Admin asigna cortesías):**
```
RP: Carlos Mendoza
Covers disponibles: 5
Covers usados: 0
Covers restantes: 5
```

### **Durante la operación:**
```
Lunes 12:00 - Autoriza 2 covers para Mesa 7
Covers restantes: 3

Lunes 15:00 - Autoriza 1 cover para Mesa 12
Covers restantes: 2

Martes 20:00 - Autoriza 2 covers para Mesa 5
Covers restantes: 0

Miércoles 21:00 - Intenta autorizar 1 cover más
❌ ERROR: No hay covers disponibles
RP debe esperar a que admin reponga
```

### **Admin decide reponer (Manual):**
```
Jueves - Admin ejecuta script de reset
Covers disponibles: 5
Covers usados: 0
Covers restantes: 5
✅ RP puede volver a autorizar cortesías
```

---

## 🔍 VERIFICAR CORTESÍAS EN TIEMPO REAL

### **Ver cortesías de hoy:**
```sql
SELECT 
    rp_nombre,
    tipo_cortesia,
    mesa_numero,
    cliente_nombre,
    cantidad,
    canjeado,
    fecha_autorizacion
FROM cortesias_autorizadas
WHERE DATE(fecha_autorizacion) = CURRENT_DATE
ORDER BY fecha_autorizacion DESC;
```

### **Ver resumen por RP:**
```sql
SELECT 
    rp_nombre,
    COUNT(*) as total_cortesias,
    SUM(CASE WHEN tipo_cortesia = 'Shots Bienvenida' THEN cantidad ELSE 0 END) as covers_usados,
    SUM(CASE WHEN canjeado THEN 1 ELSE 0 END) as canjeadas,
    SUM(CASE WHEN NOT canjeado THEN 1 ELSE 0 END) as pendientes
FROM cortesias_autorizadas
WHERE DATE(fecha_autorizacion) = CURRENT_DATE
GROUP BY rp_nombre;
```

---

## ⚙️ CONFIGURACIÓN ACTUAL

```
✅ Covers: 5 por día por RP
❌ Perlas Negras: Deshabilitado (0)
❌ Shots: Deshabilitado (0)
❌ Botellas Sembradas: Deshabilitado (0)
```

---

## 📝 NOTAS IMPORTANTES

1. **Los límites son POR RP**
   - Cada RP tiene sus propios 5 covers
   - No se comparten entre RPs

2. **Reset MANUAL por el Admin**
   - El admin decide cuándo reponer las cortesías
   - Puede ser semanal, quincenal, o cuando lo considere necesario
   - Ejecuta el script: `ADMIN-REPONER-CORTESIAS.sql`

3. **Historial permanente**
   - Todas las cortesías quedan registradas
   - Puedes ver el historial completo en cualquier momento
   - Útil para auditorías y control

4. **Control total del Admin**
   - Puede reponer cortesías de todos los RPs o solo de uno
   - Puede aumentar/disminuir límites cuando quiera
   - Puede dar cortesías extra a RPs específicos

---

## 👨‍💼 CÓMO EL ADMIN REPONE CORTESÍAS

### **Paso a Paso:**

1. **Abrir Supabase SQL Editor**
2. **Abrir el archivo:** `ADMIN-REPONER-CORTESIAS.sql`
3. **Elegir una opción:**

#### **Opción A: Reponer para TODOS los RPs**
```sql
-- Copia y ejecuta esto:
UPDATE limites_cortesias_rp SET
    shots_bienvenida_usados = 0,
    ultima_actualizacion = NOW()
WHERE activo = true;
```

#### **Opción B: Reponer para UN RP específico**
```sql
-- Cambia el nombre del RP:
UPDATE limites_cortesias_rp SET
    shots_bienvenida_usados = 0,
    ultima_actualizacion = NOW()
WHERE rp_nombre = 'Carlos Mendoza' AND activo = true;
```

#### **Opción C: Darle MÁS cortesías a todos**
```sql
-- Ejemplo: Aumentar de 5 a 10 covers:
UPDATE limites_cortesias_rp SET
    shots_bienvenida_disponibles = 10,
    shots_bienvenida_usados = 0,
    ultima_actualizacion = NOW()
WHERE activo = true;
```

### **Frecuencia Recomendada:**
- 📅 **Semanal:** Cada lunes reponer cortesías
- 📅 **Quincenal:** Cada 1 y 15 del mes
- 📅 **Según necesidad:** Cuando los RPs lo soliciten

---

## 🚀 PRÓXIMOS PASOS

Si en el futuro quieres:
- **Aumentar covers:** Cambia `shots_bienvenida_disponibles`
- **Habilitar perlas:** Cambia `perlas_negras_disponibles` a un número > 0
- **Habilitar shots:** Cambia `shots_disponibles` a un número > 0
- **Habilitar botellas:** Cambia `descuento_botella_disponible` a un número > 0

Solo ejecuta un UPDATE en Supabase y listo! ✨
